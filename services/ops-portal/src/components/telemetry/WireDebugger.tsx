import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Copy,
  Check,
  Code2,
  Database,
  Bell,
  Cpu,
  Info,
} from 'lucide-react';
import { StepRunRecord } from '../../types';

interface WireDebuggerProps {
  stepId: string;
  step?: StepRunRecord;
  logs?: string;
  isFailed?: boolean;
}

interface ParsedWireData {
  hasWireCall: boolean;
  stepType: string;
  connector?: string;
  method?: string;
  url?: string;
  reqHeaders?: string;
  reqCookies?: string;
  reqBody?: string;
  status?: string;
  latency?: string;
  respHeaders?: string;
  respBody?: string;
  errorDetail?: string;
  internalInfo?: {
    engine?: string;
    expression?: string;
    table?: string;
    channel?: string;
    summary?: string;
    rawLines?: string[];
  };
}

export const WireDebugger: React.FC<WireDebuggerProps> = ({
  stepId,
  step,
  logs = '',
  isFailed = false,
}) => {
  const [copiedReq, setCopiedReq] = useState(false);
  const [copiedRes, setCopiedRes] = useState(false);

  // Parse wire telemetry dynamically from real execution logs for this step
  const wireData: ParsedWireData = useMemo(() => {
    if (!stepId) {
      return {
        hasWireCall: false,
        stepType: 'call',
        errorDetail: step?.error?.message,
      };
    }

    const logLines = (logs || '').split('\n');

    // 1. Identify target operation for this step
    let targetOp = '';
    const startLine = logLines.find(
      (l) => (l.includes(`id=${stepId} `) || l.includes(`id=${stepId}]`)) &&
        (l.includes('[STEP: START]') || l.includes('[STEP:START]'))
    );
    if (startLine) {
      const opMatch = startLine.match(/"operation":\s*"([^"]+)"/);
      if (opMatch) targetOp = opMatch[1];
    }
    if (!targetOp) {
      const knownOps: Record<string, string> = {
        fetch_item_master: 'retrieveItem',
        fetch_target_stock: 'TargetStockSearchList',
        fetch_item_details: 'retrieveItemInfoDetail',
        fetch_po_interlocks: 'retrieveItemPoStatusList',
        get_wip_entity: 'retrieveWipEntity',
        get_wo_master: 'WoMasterRetInit',
        get_status_history: 'statusHistory',
      };
      targetOp = knownOps[stepId] || '';
    }

    // 2. Locate step slice in log
    let inStep = false;
    const stepLines: string[] = [];

    for (let i = 0; i < logLines.length; i++) {
      const line = logLines[i];
      if (line.includes(`id=${stepId}`) && (line.includes('[STEP: START]') || line.includes('[STEP:START]'))) {
        inStep = true;
      }
      if (inStep) {
        stepLines.push(line);
        if (
          (line.includes(`id=${stepId}`) || line.includes(`step_id='${stepId}'`)) &&
          (line.includes('[STEP: DONE]') ||
            line.includes('[STEP: FAILED]') ||
            line.includes('[STEP:DONE]') ||
            line.includes('[STEP:FAILED]'))
        ) {
          inStep = false;
        }
      }
    }

    // Fallback: If not bounded by STEP: START, search lines that mention stepId or relevant WIRE lines
    const activeLines = stepLines.length > 0 ? stepLines : logLines.filter((l) => l.includes(stepId));

    // Determine Step Type
    let stepType = 'call';
    let internalInfo: ParsedWireData['internalInfo'] = undefined;

    if (startLine) {
      const typeMatch = startLine.match(/type=(\w+)/);
      if (typeMatch) stepType = typeMatch[1];
    } else if (stepId.includes('transform') || stepId.includes('normalize') || stepId.includes('evaluate')) {
      stepType = 'transform';
    } else if (stepId.includes('join')) {
      stepType = 'join';
    } else if (stepId.includes('db') || stepId.includes('upsert') || stepId.includes('save')) {
      stepType = 'db_upsert';
    } else if (stepId.includes('notify') || stepId.includes('alert') || stepId.includes('slack')) {
      stepType = 'notify';
    }

    // 3. Locate WIRE REQ (search in activeLines first, then search whole logLines with targetOp)
    let connector = 'ems';
    let method = 'POST';
    let url = '';
    let reqHeaders = '';
    let reqCookies = '';
    let reqBody = '';

    const linesToSearch = activeLines.length > 0 ? activeLines : logLines;
    let reqIndex = -1;

    // Search with targetOp priority
    if (targetOp) {
      reqIndex = logLines.findIndex((l) => l.includes('[WIRE: REQ]') && l.includes(targetOp));
    }
    if (reqIndex === -1) {
      reqIndex = linesToSearch.findIndex((l) => l.includes('[WIRE: REQ]') || l.includes('[WIRE:REQ]'));
    }

    const sourceLinesForReq = reqIndex !== -1 && linesToSearch === activeLines ? logLines : linesToSearch;
    if (reqIndex !== -1) {
      const reqLine = sourceLinesForReq[reqIndex];
      const connMatch = reqLine.match(/connector=(\w+)/);
      if (connMatch) connector = connMatch[1];

      const methodMatch = reqLine.match(/\s+(POST|GET|PUT|DELETE)\s+(https?:\/\/\S+)/);
      if (methodMatch) {
        method = methodMatch[1];
        url = methodMatch[2];
      }

      const headersMatch = reqLine.match(/headers=(\{.*?\})/);
      if (headersMatch) reqHeaders = headersMatch[1];

      const cookiesMatch = reqLine.match(/cookies=(\{.*?\})/);
      if (cookiesMatch) reqCookies = cookiesMatch[1];

      const bodyMatch = reqLine.match(/body=(.*)/);
      const reqBodyParts: string[] = [];
      if (bodyMatch && bodyMatch[1]) {
        reqBodyParts.push(bodyMatch[1]);
      }
      for (let j = reqIndex + 1; j < sourceLinesForReq.length; j++) {
        if (/^\[\d{4}-\d{2}-\d{2}/.test(sourceLinesForReq[j])) break;
        reqBodyParts.push(sourceLinesForReq[j]);
      }
      reqBody = reqBodyParts.join('\n').trim();
    }

    // 4. Locate WIRE RESP corresponding to targetOp
    let status = '';
    let latency = '';
    let respHeaders = '';
    let respBody = '';
    let respIndex = -1;

    if (targetOp) {
      const respOpIdx = logLines.findIndex((l) => l.includes('[RESP]') && l.includes(targetOp));
      if (respOpIdx !== -1) {
        for (let k = respOpIdx - 1; k >= 0; k--) {
          if (logLines[k].includes('[WIRE: RESP]')) {
            respIndex = k;
            break;
          }
        }
      }
    }
    if (respIndex === -1 && reqIndex !== -1) {
      for (let k = reqIndex + 1; k < logLines.length; k++) {
        if (logLines[k].includes('[WIRE: RESP]')) {
          respIndex = k;
          break;
        }
      }
    }
    if (respIndex === -1) {
      respIndex = linesToSearch.findIndex(
        (l) => l.includes('[WIRE: RESP]') || l.includes('[WIRE:RESP]') || l.includes('[RESP]')
      );
    }

    if (respIndex !== -1) {
      const respLine = logLines[respIndex];
      const statusMatch = respLine.match(/status=(\w+|\d+)/);
      if (statusMatch) status = statusMatch[1];

      const latMatch = respLine.match(/latency=(\S+)/);
      if (latMatch) latency = latMatch[1];

      const headersMatch = respLine.match(/headers=(\{.*?\})/);
      if (headersMatch) respHeaders = headersMatch[1];

      const bodyMatch = respLine.match(/body=(.*)/);
      const respBodyParts: string[] = [];
      if (bodyMatch && bodyMatch[1]) {
        respBodyParts.push(bodyMatch[1]);
      }
      for (let k = respIndex + 1; k < logLines.length; k++) {
        if (/^\[\d{4}-\d{2}-\d{2}/.test(logLines[k])) break;
        respBodyParts.push(logLines[k]);
      }
      respBody = respBodyParts.join('\n').trim();
    }

    // Check error details
    let errorDetail = step?.error?.message;
    if (!errorDetail) {
      const errLine = activeLines.find((l) => l.includes('[ERROR]') || l.includes('error='));
      if (errLine) {
        const errMatch = errLine.match(/error=(.*)/);
        errorDetail = errMatch ? errMatch[1] : errLine;
      }
    }

    // Internal operation info (for non-wire steps)
    if (stepType === 'transform') {
      const tfLine = activeLines.find((l) => l.includes('[TRANSFORM]'));
      if (tfLine) {
        const exprMatch = tfLine.match(/expr="(.*?)"/);
        internalInfo = {
          engine: 'jmespath',
          expression: exprMatch ? exprMatch[1] : 'JMESPath Transform Expression',
          summary: activeLines.find((l) => l.includes('[STEP: DONE]')) || 'Transform executed',
        };
      }
    } else if (stepType === 'join') {
      const joinLine = activeLines.find((l) => l.includes('[JOIN]'));
      if (joinLine) {
        internalInfo = {
          summary: joinLine,
        };
      }
    } else if (stepType === 'db_upsert') {
      const dbLine = activeLines.find((l) => l.includes('[DB_UPSERT]'));
      if (dbLine) {
        internalInfo = {
          summary: dbLine,
        };
      }
    } else if (stepType === 'notify') {
      const notLine = activeLines.find((l) => l.includes('[NOTIFY]'));
      if (notLine) {
        internalInfo = {
          summary: notLine,
        };
      }
    }

    const hasWireCall = Boolean(url || reqBody || respBody);

    return {
      hasWireCall,
      stepType,
      connector,
      method,
      url,
      reqHeaders,
      reqCookies,
      reqBody,
      status: status || (step?.status === 'success' ? '200' : isFailed ? '500' : '200'),
      latency: latency || (step?.latency_ms ? `${step.latency_ms}ms` : '--'),
      respHeaders,
      respBody,
      errorDetail,
      internalInfo,
    };
  }, [stepId, step, logs, isFailed]);

  const copyText = (text: string, isReq: boolean) => {
    navigator.clipboard.writeText(text);
    if (isReq) {
      setCopiedReq(true);
      setTimeout(() => setCopiedReq(false), 2000);
    } else {
      setCopiedRes(true);
      setTimeout(() => setCopiedRes(false), 2000);
    }
  };

  // 1. If step is an internal engine processing step (transform, join, db_upsert, notify)
  if (!wireData.hasWireCall && wireData.stepType !== 'call') {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {wireData.stepType === 'transform' ? (
              <Code2 className="w-4 h-4 text-purple-400" />
            ) : wireData.stepType === 'db_upsert' ? (
              <Database className="w-4 h-4 text-emerald-400" />
            ) : wireData.stepType === 'notify' ? (
              <Bell className="w-4 h-4 text-amber-400" />
            ) : (
              <Cpu className="w-4 h-4 text-blue-400" />
            )}
            <span className="font-bold text-slate-100 text-sm">
              Internal Step Execution: <span className="font-mono text-blue-400">{stepId}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
              {wireData.stepType}
            </span>
            <span className="font-mono text-slate-400">
              {step?.latency_ms !== undefined ? `${step.latency_ms} ms` : '--'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-lg p-3.5 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>This is an in-memory workflow execution step. No external HTTP/Wire network calls were dispatched.</span>
          </div>

          {wireData.internalInfo?.expression && (
            <div className="mt-2">
              <span className="text-[11px] text-slate-400 font-mono">Engine: {wireData.internalInfo.engine}</span>
              <pre className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-purple-300 text-[11px] overflow-x-auto mt-1">
                {wireData.internalInfo.expression}
              </pre>
            </div>
          )}

          {wireData.internalInfo?.summary && (
            <div className="mt-2 text-slate-300 font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
              {wireData.internalInfo.summary}
            </div>
          )}
        </div>

        {step?.error && (
          <div className="bg-red-950/40 border border-red-800/60 rounded-lg p-3 text-xs text-red-300 font-mono">
            Error: {typeof step.error === 'object' ? JSON.stringify(step.error, null, 2) : String(step.error)}
          </div>
        )}
      </div>
    );
  }

  // 2. If it is a wire call, render full telemetry
  const isCallFailed = isFailed || wireData.status?.startsWith('4') || wireData.status?.startsWith('5') || Boolean(wireData.errorDetail);

  return (
    <div className="space-y-4">
      {/* Diagnostics Alert Banner (if error occurred) */}
      {isCallFailed && wireData.errorDetail && (
        <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-red-300">
              Execution Error on Step [{stepId}]:
            </span>
            <p className="text-red-200/90 mt-1 font-mono break-all text-[11px] bg-red-950/80 p-2 rounded border border-red-900/50">
              {wireData.errorDetail}
            </p>
          </div>
        </div>
      )}

      {/* Wire Request & Response Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Request Column */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
              <span className="font-bold text-blue-400 flex items-center gap-1.5 font-mono">
                <ArrowUpRight className="w-3.5 h-3.5" />
                [WIRE: REQ] Outbound Request ({stepId})
              </span>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono text-[10px] font-bold">
                  {wireData.method || 'POST'}
                </span>
                {wireData.reqBody && (
                  <button
                    onClick={() => copyText(wireData.reqBody || '', true)}
                    className="text-slate-400 hover:text-slate-200 text-xs"
                    title="Copy request payload"
                  >
                    {copiedReq ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2 text-xs font-mono text-slate-300 break-all space-y-1">
              <div>
                <span className="text-slate-400">Endpoint:</span>{' '}
                <span className="text-slate-200">{wireData.url || '(Internal connector call)'}</span>
              </div>
              {wireData.reqHeaders && (
                <div className="text-[11px] text-slate-400">
                  Headers: <span className="text-slate-300">{wireData.reqHeaders}</span>
                </div>
              )}
              {wireData.reqCookies && wireData.reqCookies !== '{}' && (
                <div className="text-[11px] text-slate-400">
                  Cookies: <span className="text-slate-300">{wireData.reqCookies}</span>
                </div>
              )}
            </div>

            <div className="mt-3">
              <div className="text-[11px] font-mono text-slate-400 mb-1">Request Payload Body:</div>
              <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto custom-scrollbar max-h-60">
                {wireData.reqBody || '(No outbound request body captured)'}
              </pre>
            </div>
          </div>
        </div>

        {/* 2. Response Column */}
        <div
          className={`bg-slate-950 border rounded-xl p-4 flex flex-col justify-between ${
            isCallFailed ? 'border-red-900/60' : 'border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
              <span
                className={`font-bold flex items-center gap-1.5 font-mono ${
                  isCallFailed ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                [WIRE: RESP] Server Response
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    isCallFailed ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  HTTP {wireData.status || (isCallFailed ? '500' : '200')}
                </span>
                {wireData.respBody && (
                  <button
                    onClick={() => copyText(wireData.respBody || '', false)}
                    className="text-slate-400 hover:text-slate-200 text-xs"
                    title="Copy response payload"
                  >
                    {copiedRes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2 text-xs font-mono text-slate-300 space-y-1">
              <div>
                <span className="text-slate-400">Latency:</span>{' '}
                <span className="text-amber-400 font-bold">{wireData.latency}</span>
                {wireData.respBody && (
                  <>
                    <span className="text-slate-700 mx-2">•</span>
                    <span className="text-slate-400">Bytes:</span> {wireData.respBody.length} B
                  </>
                )}
              </div>
              {wireData.respHeaders && (
                <div className="text-[11px] text-slate-400 break-all">
                  Headers: <span className="text-slate-300">{wireData.respHeaders}</span>
                </div>
              )}
            </div>

            <div className="mt-3">
              <div className="text-[11px] font-mono text-slate-400 mb-1">Response Payload:</div>
              <pre
                className={`p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono overflow-x-auto custom-scrollbar max-h-60 ${
                  isCallFailed ? 'text-red-300' : 'text-blue-300'
                }`}
              >
                {wireData.respBody || '(No response payload captured in log stream)'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
