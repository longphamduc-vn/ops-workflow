import React, { useState, useMemo } from 'react';
import {
  Code2,
  Database,
  Server,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Terminal,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import { StepRunRecord } from '../../types';

interface StepDetailInspectorProps {
  stepId: string;
  step?: StepRunRecord;
  logs?: string;
  isFailed?: boolean;
}

export const StepDetailInspector: React.FC<StepDetailInspectorProps> = ({
  stepId,
  step,
  logs = '',
}) => {
  const [copiedOutputs, setCopiedOutputs] = useState(false);
  const [copiedParams, setCopiedParams] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);

  // Extract step-specific logs and execution parameters
  const { stepLogs, stepParams, stepType } = useMemo(() => {
    if (!logs || !stepId) {
      return { stepLogs: [], stepParams: null, stepType: 'call' };
    }

    const logLines = logs.split('\n');
    const matchedLines: string[] = [];
    let inStep = false;
    let params: any = null;
    let type = 'call';

    for (let i = 0; i < logLines.length; i++) {
      const line = logLines[i];

      // Step Start Detection
      if (line.includes(`id=${stepId}`) && (line.includes('[STEP: START]') || line.includes('[STEP:START]'))) {
        inStep = true;
        const typeMatch = line.match(/type=(\w+)/);
        if (typeMatch) type = typeMatch[1];

        const paramMatch = line.match(/with_params=(.*)$/);
        if (paramMatch) {
          try {
            params = JSON.parse(paramMatch[1]);
          } catch (_) {
            params = paramMatch[1];
          }
        }
      }

      if (inStep) {
        matchedLines.push(line);

        // Step Finish Detection
        if (
          (line.includes(`id=${stepId}`) || line.includes(`step_id='${stepId}'`)) &&
          (line.includes('[STEP: DONE]') ||
            line.includes('[STEP: FAILED]') ||
            line.includes('[STEP:DONE]') ||
            line.includes('[STEP:FAILED]') ||
            line.includes('[STEP: SKIPPED]') ||
            line.includes('[STEP:SKIPPED]'))
        ) {
          inStep = false;
        }
      }
    }

    // Fallback: search lines mentioning stepId
    const finalLines =
      matchedLines.length > 0 ? matchedLines : logLines.filter((l) => l.includes(stepId));

    if (type === 'call') {
      if (stepId.includes('transform') || stepId.includes('normalize') || stepId.includes('evaluate')) {
        type = 'transform';
      } else if (stepId.includes('join')) {
        type = 'join';
      } else if (stepId.includes('db') || stepId.includes('upsert') || stepId.includes('save')) {
        type = 'db_upsert';
      } else if (stepId.includes('notify') || stepId.includes('alert') || stepId.includes('slack')) {
        type = 'notify';
      }
    }

    return {
      stepLogs: finalLines,
      stepParams: params,
      stepType: type,
    };
  }, [stepId, logs]);

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  if (!step) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
        Select a step from the execution DAG flowchart above to inspect detailed runtime outputs, configuration parameters, and telemetry.
      </div>
    );
  }

  const isSuccess = step.status === 'success';
  const isFailedStep = step.status === 'failed';
  const isSkipped = step.status === 'skipped';
  const isRunning = step.status === 'running';

  return (
    <div className="space-y-4">
      {/* 1. Step Overview Summary Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {isFailedStep && <XCircle className="w-5 h-5 text-red-400" />}
            {isSkipped && <Clock className="w-5 h-5 text-slate-500" />}
            {isRunning && <Clock className="w-5 h-5 text-blue-400 animate-spin" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100 font-mono">{step.step_id}</span>
              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold uppercase bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {stepType}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  isSuccess
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : isFailedStep
                    ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                    : isSkipped
                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}
              >
                {step.status.toUpperCase()}
              </span>
            </div>

            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
              <span>
                Latency: <strong className="text-amber-400 font-mono">{step.latency_ms} ms</strong>
              </span>
              <span className="text-slate-700">•</span>
              <span>
                Attempts: <strong className="text-slate-200 font-mono">{step.attempt || 1}</strong>
              </span>
              {step.completed_at && (
                <>
                  <span className="text-slate-700">•</span>
                  <span>Completed: {new Date(step.completed_at).toLocaleTimeString('en-US')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Type Icon */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {stepType === 'transform' && <Code2 className="w-4 h-4 text-purple-400" />}
          {stepType === 'db_upsert' && <Database className="w-4 h-4 text-emerald-400" />}
          {stepType === 'notify' && <Bell className="w-4 h-4 text-amber-400" />}
          {stepType === 'call' && <Server className="w-4 h-4 text-blue-400" />}
          <span className="font-mono text-slate-300">{stepType.toUpperCase()} STEP</span>
        </div>
      </div>

      {/* 2. Error Banner if Failed */}
      {isFailedStep && step.error && (
        <div className="bg-red-950/40 border border-red-800/80 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs w-full">
            <span className="font-bold text-red-300">Execution Error Diagnostic:</span>
            <pre className="mt-1.5 p-3 bg-red-950/80 border border-red-900/50 rounded-lg font-mono text-[11px] text-red-200 overflow-x-auto whitespace-pre-wrap break-all">
              {typeof step.error === 'object' ? JSON.stringify(step.error, null, 2) : String(step.error)}
            </pre>
          </div>
        </div>
      )}

      {/* 3. Split Grid: Step Outputs & Step Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Step Outputs Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Step Execution Outputs
              </span>
              <div className="flex items-center gap-2">
                {step.outputs && (
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono text-[10px] font-bold">
                    {Array.isArray(step.outputs)
                      ? `${step.outputs.length} rows`
                      : typeof step.outputs === 'object'
                      ? `${Object.keys(step.outputs).length} keys`
                      : 'Result'}
                  </span>
                )}
                {step.outputs && (
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(step.outputs, null, 2), setCopiedOutputs)}
                    className="text-slate-400 hover:text-slate-200 text-xs"
                    title="Copy step outputs JSON"
                  >
                    {copiedOutputs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2.5">
              {step.outputs ? (
                <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto custom-scrollbar max-h-80 whitespace-pre-wrap">
                  {JSON.stringify(step.outputs, null, 2)}
                </pre>
              ) : (
                <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-800/80 text-center text-slate-500 text-xs font-sans">
                  {isSkipped
                    ? 'Step was skipped; no output produced.'
                    : isFailedStep
                    ? 'Step failed before generating outputs.'
                    : 'No direct JSON output recorded for this step.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step Input Parameters & Binding */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
              <span className="font-bold text-blue-400 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                Step Parameters & Configuration
              </span>
              {stepParams && (
                <button
                  onClick={() =>
                    copyToClipboard(
                      typeof stepParams === 'string' ? stepParams : JSON.stringify(stepParams, null, 2),
                      setCopiedParams
                    )
                  }
                  className="text-slate-400 hover:text-slate-200 text-xs"
                  title="Copy step parameters"
                >
                  {copiedParams ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            <div className="mt-2.5">
              {stepParams ? (
                <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-blue-300 overflow-x-auto custom-scrollbar max-h-80 whitespace-pre-wrap">
                  {typeof stepParams === 'string' ? stepParams : JSON.stringify(stepParams, null, 2)}
                </pre>
              ) : (
                <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-800/80 text-center text-slate-500 text-xs font-sans">
                  Parameter bindings extracted from workflow definition.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filtered Step Log Stream */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5 font-mono">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            Filtered Log Stream for [{step.step_id}] ({stepLogs.length} lines)
          </span>
          {stepLogs.length > 0 && (
            <button
              onClick={() => copyToClipboard(stepLogs.join('\n'), setCopiedLogs)}
              className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
              title="Copy step log lines"
            >
              {copiedLogs ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Copy</span>
            </button>
          )}
        </div>

        {stepLogs.length > 0 ? (
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px] max-h-60 overflow-y-auto custom-scrollbar space-y-1">
            {stepLogs.map((l, idx) => {
              const isErr = l.includes('[ERROR]') || l.includes('FAILED');
              const isWarn = l.includes('[WARN]');
              const isDone = l.includes('[STEP: DONE]') || l.includes('[STEP:DONE]');
              return (
                <div
                  key={idx}
                  className={`leading-relaxed whitespace-pre-wrap ${
                    isErr
                      ? 'text-red-400 bg-red-950/20 px-1 rounded'
                      : isWarn
                      ? 'text-amber-300'
                      : isDone
                      ? 'text-emerald-400 font-semibold'
                      : 'text-slate-300'
                  }`}
                >
                  {l}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-slate-500 text-xs">
            No specific log entries filtered for step [{step.step_id}].
          </div>
        )}
      </div>
    </div>
  );
};

