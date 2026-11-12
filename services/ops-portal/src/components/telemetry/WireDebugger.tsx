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
  Sparkles,
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
  isReqSynthesized?: boolean;
  status?: string;
  latency?: string;
  respHeaders?: string;
  respBody?: string;
  isRespSynthesized?: boolean;
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

/**
 * Format raw unindented XML into clean, properly indented multi-line XML.
 */
function formatXml(xml: string): string {
  if (!xml || !xml.includes('<')) return xml;
  // If already cleanly formatted with indentation, preserve it
  if (xml.includes('\n  <')) return xml.trim();

  let formatted = '';
  let indent = 0;
  const pad = (n: number) => '  '.repeat(n);
  const cleanXml = xml.replace(/>\s*</g, '><').trim();
  const tokens = cleanXml.split(/(<[^>]+>)/g).filter(Boolean);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      if (!formatted.endsWith('\n') && !formatted.endsWith('>')) {
        formatted += token + '\n';
      } else {
        formatted += (formatted.endsWith('\n') ? '' : '\n') + pad(indent) + token + '\n';
      }
    } else if (token.startsWith('<') && token.endsWith('/>')) {
      formatted += (formatted.endsWith('\n') ? '' : '\n') + pad(indent) + token + '\n';
    } else if (token.startsWith('<?') || token.startsWith('<!')) {
      formatted += token + '\n';
    } else if (token.startsWith('<')) {
      // Check if next token is text and the one after is matching closing tag: <Col id="x">value</Col>
      const tagNameMatch = token.match(/^<([a-zA-Z0-9_:]+)/);
      const tagName = tagNameMatch ? tagNameMatch[1] : '';
      if (
        i + 2 < tokens.length &&
        !tokens[i + 1].startsWith('<') &&
        tokens[i + 2] === `</${tagName}>`
      ) {
        formatted += (formatted.endsWith('\n') ? '' : '\n') + pad(indent) + token + tokens[i + 1] + tokens[i + 2] + '\n';
        i += 2;
      } else {
        formatted += (formatted.endsWith('\n') ? '' : '\n') + pad(indent) + token + '\n';
        indent++;
      }
    } else {
      formatted += token;
    }
  }
  return formatted.trim();
}

/**
 * Synthesize Nexacro XML request from step params and in_datasets when raw wire log is not captured.
 */
function synthesizeRequestXml(params?: any, inDatasets?: any): string {
  if (!params && !inDatasets) return '';
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<Root xmlns="http://www.nexacroplatform.com/platform/dataset">\n';

  if (params && typeof params === 'object') {
    xml += '  <Parameters>\n';
    for (const [key, val] of Object.entries(params)) {
      const v = val !== null && val !== undefined ? String(val) : '';
      xml += `    <Parameter id="${key}" type="string">${v}</Parameter>\n`;
    }
    xml += '  </Parameters>\n';
  }

  if (inDatasets && typeof inDatasets === 'object') {
    for (const [dsId, rawRows] of Object.entries(inDatasets)) {
      const rowList = Array.isArray(rawRows) ? rawRows : [rawRows];
      const expandedRows: any[] = [];
      for (const r of rowList) {
        if (!r || typeof r !== 'object') continue;
        let listCol = '';
        let listItems: any[] = [];
        for (const [k, v] of Object.entries(r)) {
          if (Array.isArray(v)) {
            listCol = k;
            listItems = (v as any[]).flat(Infinity);
            break;
          } else if (typeof v === 'string' && v.trim().startsWith('[') && v.trim().endsWith(']')) {
            try {
              const parsed = JSON.parse(v.replace(/'/g, '"'));
              if (Array.isArray(parsed)) {
                listCol = k;
                listItems = parsed.flat(Infinity);
                break;
              }
            } catch (_) {}
          }
        }
        if (listCol && listItems.length > 0) {
          for (const item of listItems) {
            expandedRows.push({ ...r, [listCol]: item });
          }
        } else {
          expandedRows.push(r);
        }
      }

      const cols = expandedRows.length > 0 && typeof expandedRows[0] === 'object' ? Object.keys(expandedRows[0]) : [];
      xml += `  <Dataset id="${dsId}">\n`;
      if (cols.length > 0) {
        xml += '    <ColumnInfo>\n';
        for (const col of cols) {
          xml += `      <Column id="${col}" type="STRING" size="256" />\n`;
        }
        xml += '    </ColumnInfo>\n';
        xml += '    <Rows>\n';
        for (const row of expandedRows) {
          xml += '      <Row>\n';
          for (const col of cols) {
            const v = (row as any)[col] !== null && (row as any)[col] !== undefined ? String((row as any)[col]) : '';
            xml += `        <Col id="${col}">${v}</Col>\n`;
          }
          xml += '      </Row>\n';
        }
        xml += '    </Rows>\n';
      }
      xml += '  </Dataset>\n';
    }
  }

  xml += '</Root>';
  return xml;
}

/**
 * Synthesize Nexacro XML response from step outputs when raw wire log is not captured.
 */
function synthesizeResponseXml(outputs?: any, defaultDatasetId = 'ds_List'): string {
  if (!outputs) return '';
  const data = outputs.data !== undefined ? outputs.data : outputs;
  if (!data || typeof data !== 'object') return '';

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<Root xmlns="http://www.nexacroplatform.com/platform/dataset">\n';
  xml += '  <Parameters>\n';
  xml += '    <Parameter id="errorCode" type="string">1</Parameter>\n';
  xml += '    <Parameter id="errorMsg" type="string" />\n';
  xml += '  </Parameters>\n';

  let hasDataset = false;
  for (const [key, val] of Object.entries(data)) {
    if (Array.isArray(val)) {
      hasDataset = true;
      const rowList = val;
      const cols = rowList.length > 0 && typeof rowList[0] === 'object' && rowList[0] !== null ? Object.keys(rowList[0]) : [];
      xml += `  <Dataset id="${key}">\n`;
      if (cols.length > 0) {
        xml += '    <ColumnInfo>\n';
        for (const col of cols) {
          xml += `      <Column id="${col}" type="STRING" size="256" />\n`;
        }
        xml += '    </ColumnInfo>\n';
        xml += '    <Rows>\n';
        for (const row of rowList) {
          xml += '      <Row>\n';
          for (const col of cols) {
            const v = (row as any)[col] !== null && (row as any)[col] !== undefined ? String((row as any)[col]) : '';
            xml += `        <Col id="${col}">${v}</Col>\n`;
          }
          xml += '      </Row>\n';
        }
        xml += '    </Rows>\n';
      } else {
        xml += '    <ColumnInfo />\n';
        xml += '    <Rows />\n';
      }
      xml += '  </Dataset>\n';
    }
  }

  if (!hasDataset) {
    xml += `  <Dataset id="${defaultDatasetId}">\n`;
    xml += '    <ColumnInfo />\n';
    xml += '    <Rows />\n';
    xml += '  </Dataset>\n';
  }

  xml += '</Root>';
  return xml;
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

    // 1. Identify target operation and step parameters
    const knownOps: Record<string, string> = {
      fetch_item_master: '/emscom/popupNav/retrieveItem.lgdn',
      fetch_target_stock: '/emsspareparts/sp302/sp330Nav/TargetStockSearchList.lgdn',
      fetch_item_details: '/emsspareparts/sp102/sp135Nav/retrieveItemInfoDetail.lgdn',
      fetch_po_interlocks: '/emscom/popupNav/retrieveItemPoStatusList.lgdn',
      get_wip_entity: '/emsquality/qc100/qc110Nav/retrieveWipEntity.lgdn',
      get_wo_master: '/emsquality/qc100/qc110Nav/WoMasterRetInit.lgdn',
      get_status_history: '/emsquality/qc100/qc110Nav/statusHistory.lgdn',
    };

    let targetOp = '';
    let stepType = 'call';
    let stepParams: any = null;

    const startLine = logLines.find(
      (l) => (l.includes(`id=${stepId} `) || l.includes(`id=${stepId}]`)) &&
        (l.includes('[STEP: START]') || l.includes('[STEP:START]'))
    );

    if (startLine) {
      const opMatch = startLine.match(/"operation":\s*"([^"]+)"/);
      if (opMatch) targetOp = opMatch[1];
      const typeMatch = startLine.match(/type=(\w+)/);
      if (typeMatch) stepType = typeMatch[1];
      const paramMatch = startLine.match(/with_params=(.*)$/);
      if (paramMatch) {
        try {
          stepParams = JSON.parse(paramMatch[1]);
        } catch (_) {}
      }
    }

    if (!targetOp) {
      targetOp = knownOps[stepId] || '';
    }

    // Determine Step Type if not inferred from start line
    if (stepType === 'call') {
      if (stepId.includes('transform') || stepId.includes('normalize') || stepId.includes('evaluate')) {
        stepType = 'transform';
      } else if (stepId.includes('join')) {
        stepType = 'join';
      } else if (stepId.includes('db') || stepId.includes('upsert') || stepId.includes('save')) {
        stepType = 'db_upsert';
      } else if (stepId.includes('notify') || stepId.includes('alert') || stepId.includes('slack')) {
        stepType = 'notify';
      }
    }

    const opKeyword = targetOp.split('/').filter(Boolean).pop() || targetOp;

    // 2. Locate WIRE REQ line in logLines
    let reqIndex = -1;
    if (targetOp) {
      // First priority: Match WIRE: REQ with full targetOp or keyword
      reqIndex = logLines.findIndex(
        (l) => l.includes('[WIRE: REQ]') && (l.includes(targetOp) || (opKeyword && l.includes(opKeyword)))
      );
      // Second priority: Look for [CALL] mentioning targetOp, then take following [WIRE: REQ]
      if (reqIndex === -1) {
        const callIdx = logLines.findIndex(
          (l) => l.includes('[CALL]') && (l.includes(targetOp) || (opKeyword && l.includes(opKeyword)))
        );
        if (callIdx !== -1) {
          for (let i = callIdx + 1; i < Math.min(callIdx + 10, logLines.length); i++) {
            if (logLines[i].includes('[WIRE: REQ]')) {
              reqIndex = i;
              break;
            }
          }
        }
      }
    }

    // Third priority: fallback search by stepId
    if (reqIndex === -1) {
      reqIndex = logLines.findIndex(
        (l) => (l.includes('[WIRE: REQ]') || l.includes('[WIRE:REQ]')) && l.includes(stepId)
      );
    }

    let connector = 'ems';
    let method = 'POST';
    let url = targetOp ? `http://localhost:9000${targetOp}` : '';
    let reqHeaders = '{"Content-Type": "text/xml; charset=UTF-8"}';
    let reqCookies = '{}';
    let reqBody = '';
    let isReqSynthesized = false;

    if (reqIndex !== -1) {
      const reqLine = logLines[reqIndex];
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
      for (let j = reqIndex + 1; j < logLines.length; j++) {
        if (/^\[\d{4}-\d{2}-\d{2}/.test(logLines[j])) break;
        reqBodyParts.push(logLines[j]);
      }
      reqBody = reqBodyParts.join('\n').trim();
    }

    // Fallback if reqBody was not captured in logs: synthesize from stepParams
    if (!reqBody && stepParams) {
      reqBody = synthesizeRequestXml(stepParams.params, stepParams.in_datasets);
      if (reqBody) isReqSynthesized = true;
    }

    // Prettify XML
    if (reqBody) {
      reqBody = formatXml(reqBody);
    }

    // 3. Locate WIRE RESP line in logLines
    let status = step?.status === 'success' ? '200' : isFailed ? '500' : '200';
    let latency = step?.latency_ms !== undefined ? `${step.latency_ms}ms` : '';
    let respHeaders = '{"content-type": "application/xml; charset=utf-8"}';
    let respBody = '';
    let isRespSynthesized = false;
    let respIndex = -1;

    if (targetOp) {
      // First priority: [WIRE: RESP] containing op or opKeyword
      respIndex = logLines.findIndex(
        (l) => l.includes('[WIRE: RESP]') && (l.includes(targetOp) || (opKeyword && l.includes(opKeyword)))
      );
      // Second priority: find [RESP] line containing op, take [WIRE: RESP] immediately before it
      if (respIndex === -1) {
        const respOpIdx = logLines.findIndex(
          (l) => l.includes('[RESP]') && (l.includes(targetOp) || (opKeyword && l.includes(opKeyword)))
        );
        if (respOpIdx !== -1) {
          for (let k = respOpIdx - 1; k >= Math.max(0, respOpIdx - 15); k--) {
            if (logLines[k].includes('[WIRE: RESP]')) {
              respIndex = k;
              break;
            }
          }
        }
      }
    }

    // Third priority: scan forwards from reqIndex for the matching response
    if (respIndex === -1 && reqIndex !== -1) {
      for (let k = reqIndex + 1; k < Math.min(reqIndex + 15, logLines.length); k++) {
        if (logLines[k].includes('[WIRE: RESP]')) {
          respIndex = k;
          break;
        }
      }
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

    // Fallback if respBody was not captured: synthesize from step.outputs
    if (!respBody && step?.outputs) {
      respBody = synthesizeResponseXml(step.outputs);
      if (respBody) isRespSynthesized = true;
    }

    // Prettify XML
    if (respBody) {
      respBody = formatXml(respBody);
    }

    // Check error details
    let errorDetail = step?.error?.message;
    if (!errorDetail) {
      const errLine = logLines.find(
        (l) => (l.includes(`id=${stepId}`) || (targetOp && l.includes(targetOp))) &&
          (l.includes('[ERROR]') || l.includes('status=500') || l.includes('error='))
      );
      if (errLine) {
        const errMatch = errLine.match(/error=(.*)/);
        errorDetail = errMatch ? errMatch[1] : errLine;
      }
    }

    // Internal operation info (for non-wire steps)
    let internalInfo: ParsedWireData['internalInfo'] = undefined;
    const activeStepLines = logLines.filter((l) => l.includes(stepId));

    if (stepType === 'transform') {
      const tfLine = activeStepLines.find((l) => l.includes('[TRANSFORM]'));
      if (tfLine) {
        const exprMatch = tfLine.match(/expr="(.*?)"/);
        internalInfo = {
          engine: 'jmespath',
          expression: exprMatch ? exprMatch[1] : 'JMESPath Transform Expression',
          summary: activeStepLines.find((l) => l.includes('[STEP: DONE]')) || 'Transform executed',
        };
      }
    } else if (stepType === 'join') {
      const joinLine = activeStepLines.find((l) => l.includes('[JOIN]'));
      if (joinLine) {
        internalInfo = { summary: joinLine };
      }
    } else if (stepType === 'db_upsert') {
      const dbLine = activeStepLines.find((l) => l.includes('[DB_UPSERT]'));
      if (dbLine) {
        internalInfo = { summary: dbLine };
      }
    } else if (stepType === 'notify') {
      const notLine = activeStepLines.find((l) => l.includes('[NOTIFY]'));
      if (notLine) {
        internalInfo = { summary: notLine };
      }
    }

    const hasWireCall = Boolean(url || reqBody || respBody || targetOp);

    return {
      hasWireCall,
      stepType,
      connector,
      method,
      url: url || (targetOp ? `http://localhost:9000${targetOp}` : ''),
      reqHeaders,
      reqCookies,
      reqBody,
      isReqSynthesized,
      status: status || (step?.status === 'success' ? '200' : isFailed ? '500' : '200'),
      latency: latency || (step?.latency_ms !== undefined ? `${step.latency_ms}ms` : '--'),
      respHeaders,
      respBody,
      isRespSynthesized,
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
              <pre className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-purple-300 text-[11px] overflow-x-auto mt-1 custom-scrollbar">
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
                {wireData.isReqSynthesized && (
                  <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono text-[10px] flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Dataset Params
                  </span>
                )}
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono text-[10px] font-bold">
                  {wireData.method || 'POST'}
                </span>
                {wireData.reqBody && (
                  <button
                    onClick={() => copyText(wireData.reqBody || '', true)}
                    className="text-slate-400 hover:text-slate-200 text-xs transition"
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
                <span className="text-cyan-300 font-semibold">{wireData.url || '(Internal connector call)'}</span>
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
              <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                <span>Request Payload Body (Nexacro XML):</span>
                {wireData.reqBody && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    {wireData.reqBody.length} characters
                  </span>
                )}
              </div>
              <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto custom-scrollbar max-h-72 leading-relaxed">
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
                {wireData.isRespSynthesized && (
                  <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono text-[10px] flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Dataset Outputs
                  </span>
                )}
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
                    className="text-slate-400 hover:text-slate-200 text-xs transition"
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
                    <span className="text-slate-400">Length:</span> {wireData.respBody.length} characters
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
              <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                <span>Response Payload (Nexacro XML Dataset):</span>
                {wireData.respBody && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    {wireData.respBody.length} characters
                  </span>
                )}
              </div>
              <pre
                className={`p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono overflow-x-auto custom-scrollbar max-h-72 leading-relaxed ${
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
