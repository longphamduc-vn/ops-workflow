import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCcw,
  Bolt,
  Terminal,
  Code2,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Layers,
} from 'lucide-react';
import { RunRecord, StepRunRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { DagVisualizer } from '../components/dag/DagVisualizer';
import { WireDebugger } from '../components/telemetry/WireDebugger';
import { LogConsole } from '../components/telemetry/LogConsole';
import { StepDetailInspector } from '../components/telemetry/StepDetailInspector';

interface RunInspectorViewProps {
  run: RunRecord;
  runs?: RunRecord[];
  onSelectRun?: (runId: string) => void;
  steps: StepRunRecord[];
  logs: string;
  onOpenReplay: () => void;
  onClearLogs?: () => Promise<void> | void;
}

export const RunInspectorView: React.FC<RunInspectorViewProps> = ({
  run,
  runs = [],
  onSelectRun,
  steps,
  logs,
  onOpenReplay,
  onClearLogs,
}) => {
  const [selectedStepId, setSelectedStepId] = useState<string>(
    steps.find((s) => s.status === 'failed')?.step_id || steps[0]?.step_id || ''
  );
  const [activeTab, setActiveTab] = useState<'step_details' | 'wire' | 'logs' | 'context' | 'retries'>('step_details');
  const [isConfirmingClearHeader, setIsConfirmingClearHeader] = useState<boolean>(false);
  const [isClearingHeader, setIsClearingHeader] = useState<boolean>(false);

  // Automatically switch selected step ONLY when active run ID changes (prevents snap-back on polling)
  const prevRunIdRef = useRef<string>(run.run_id);
  useEffect(() => {
    if (prevRunIdRef.current !== run.run_id) {
      prevRunIdRef.current = run.run_id;
      if (steps.length > 0) {
        const failed = steps.find((s) => s.status === 'failed');
        setSelectedStepId(failed ? failed.step_id : steps[0].step_id);
      }
    } else if (!selectedStepId && steps.length > 0) {
      const failed = steps.find((s) => s.status === 'failed');
      setSelectedStepId(failed ? failed.step_id : steps[0].step_id);
    }
  }, [run.run_id, steps, selectedStepId]);

  const selectedStep = steps.find((s) => s.step_id === selectedStepId);
  const isFailed = selectedStep?.status === 'failed' || run.status === 'failed';

  // Compute real execution duration
  const durationMs =
    run.started_at && run.completed_at
      ? Math.max(0, new Date(run.completed_at).getTime() - new Date(run.started_at).getTime())
      : null;

  // Determine trigger type dynamically
  const triggerType = run.inputs?._trigger || (run.workflow_name?.includes('sync') || run.workflow_name?.includes('lookup') ? 'cron' : 'api');

  return (
    <div className="space-y-4">
      {/* Run Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            {run.status === 'failed' ? (
              <XCircle className="w-6 h-6 text-red-400" />
            ) : run.status === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <Clock className="w-6 h-6 text-blue-400 animate-spin" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-slate-100 font-mono">{run.run_id}</span>
              <StatusBadge status={run.status} />
              <span className="text-xs text-slate-400 font-mono">
                wf: <strong className="text-blue-300">{run.workflow_name}</strong>
              </span>

              {runs && runs.length > 1 && onSelectRun && (
                <div className="ml-2 flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-500 font-sans">Switch Run:</span>
                  <select
                    value={run.run_id}
                    onChange={(e) => onSelectRun(e.target.value)}
                    className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none cursor-pointer max-w-[280px] truncate"
                  >
                    {runs.map((r) => (
                      <option key={r.run_id} value={r.run_id} className="bg-slate-900 text-slate-200">
                        {r.run_id} — {r.workflow_name} ({r.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span>Started: {run.started_at ? new Date(run.started_at).toLocaleTimeString('en-US') : '--'}</span>
              <span className="text-slate-700">•</span>
              <span>
                Trigger: <code className="bg-slate-800 px-1 py-0.2 rounded font-mono text-slate-300">{triggerType}</code>
              </span>
              <span className="text-slate-700">•</span>
              <span>
                Duration:{' '}
                <span className="text-amber-400 font-mono font-bold">
                  {durationMs !== null ? `${durationMs.toLocaleString()} ms` : '--'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onClearLogs && (
            isConfirmingClearHeader ? (
              <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-800 px-2.5 py-1 rounded-lg">
                <span className="text-xs text-red-300 font-medium">Clear logs for this run?</span>
                <button
                  onClick={async () => {
                    setIsClearingHeader(true);
                    try {
                      await onClearLogs();
                    } finally {
                      setIsClearingHeader(false);
                      setIsConfirmingClearHeader(false);
                    }
                  }}
                  disabled={isClearingHeader}
                  className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold transition"
                >
                  {isClearingHeader ? 'Clearing...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setIsConfirmingClearHeader(false)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirmingClearHeader(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                title="Clear execution log for this run"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                Clear Logs
              </button>
            )
          )}

          <button
            onClick={onOpenReplay}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Replay from Failed Step (Resume)
          </button>
        </div>
      </div>

      {/* Visual DAG Diagram */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-200">
              Interactive Execution DAG Flow
            </h3>
            <span className="text-[11px] text-slate-400">
              (Click on any step to inspect Wire Telemetry and runtime payload)
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Inspecting Step: <span className="text-blue-400 font-bold">{selectedStepId}</span>
          </div>
        </div>

        <DagVisualizer
          steps={steps}
          selectedStepId={selectedStepId}
          onSelectStep={(id) => setSelectedStepId(id)}
        />
      </div>

      {/* Telemetry & Debugging Split Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Navigation Tabs */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('step_details')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'step_details'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Step Details & Outputs
            </button>

            <button
              onClick={() => setActiveTab('wire')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'wire'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bolt className="w-3.5 h-3.5 text-amber-400" />
              Wire Telemetry (Nexacro XML)
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'logs'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Console Log Stream
            </button>

            <button
              onClick={() => setActiveTab('context')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'context'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Run Global Inputs/Outputs
            </button>

            <button
              onClick={() => setActiveTab('retries')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'retries'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Step Execution & Retries ({selectedStep?.attempt ?? 1} attempt{selectedStep?.attempt !== 1 ? 's' : ''})
            </button>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Selected: <span className="text-slate-200 font-bold">{selectedStepId || '--'}</span>
          </span>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'step_details' && (
            <StepDetailInspector
              stepId={selectedStepId}
              step={selectedStep}
              logs={logs}
              isFailed={isFailed}
            />
          )}

          {activeTab === 'wire' && (
            <WireDebugger
              stepId={selectedStepId}
              step={selectedStep}
              logs={logs}
              isFailed={isFailed}
            />
          )}

          {activeTab === 'logs' && (
            <LogConsole logs={logs} runId={run.run_id} onClearLogs={onClearLogs} />
          )}

          {activeTab === 'context' && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="text-slate-300 font-sans font-semibold mb-1">
                  Run Input Parameters (Inputs Context):
                </div>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-blue-300 overflow-x-auto">
                  {JSON.stringify(run.inputs, null, 2)}
                </pre>
              </div>

              <div>
                <div className="text-slate-300 font-sans font-semibold mb-1">
                  Run Output Data (Outputs):
                </div>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-emerald-400 overflow-x-auto">
                  {JSON.stringify(run.outputs, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'retries' && (
            <div className="space-y-3 text-xs">
              {!selectedStep ? (
                <div className="p-6 text-center text-slate-500">
                  Select a step in the DAG flowchart above to view step retry history and error telemetry.
                </div>
              ) : selectedStep.error ? (
                <div className="space-y-3">
                  <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                      <XCircle className="w-4 h-4 text-red-400" />
                      Step Execution Failed: [{selectedStep.step_id}]
                    </div>
                    <div className="text-slate-300 font-mono text-[11px] bg-red-950/60 p-2.5 rounded border border-red-900/50 break-all">
                      {typeof selectedStep.error === 'object'
                        ? selectedStep.error.message || JSON.stringify(selectedStep.error, null, 2)
                        : String(selectedStep.error)}
                    </div>
                    <div className="text-[11px] text-red-400 flex items-center gap-2">
                      <span>Total Attempts: <strong className="text-red-200">{selectedStep.attempt}</strong></span>
                      <span>•</span>
                      <span>Execution Latency: <strong className="text-red-200">{selectedStep.latency_ms} ms</strong></span>
                    </div>
                  </div>

                  {Array.from({ length: selectedStep.attempt }).map((_, idx) => {
                    const attemptNum = idx + 1;
                    const isLast = attemptNum === selectedStep.attempt;
                    return (
                      <div
                        key={attemptNum}
                        className={`p-3 rounded-lg border flex justify-between items-center ${
                          isLast
                            ? 'bg-red-950/20 border-red-800/60'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div>
                          <span className={`font-bold ${isLast ? 'text-red-400' : 'text-amber-400'}`}>
                            Attempt {attemptNum}:
                          </span>{' '}
                          <span className="text-slate-300">
                            {isLast
                              ? 'Max attempts reached. Step execution failed with error.'
                              : `Attempt ${attemptNum} failed. Backing off before retry...`}
                          </span>
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          Status: {isLast ? 'FAILED' : 'RETRYING'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : selectedStep.status === 'skipped' ? (
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-1">
                  <div className="font-semibold text-slate-300">Step Skipped</div>
                  <div className="text-slate-500 text-[11px]">
                    Step [{selectedStep.step_id}] was skipped because a prior dependent step failed.
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Step [{selectedStep.step_id}] Succeeded Cleanly
                  </div>
                  <div className="text-slate-300 text-[11px] space-y-1">
                    <div>
                      Executed in <strong className="text-emerald-300 font-mono">{selectedStep.latency_ms} ms</strong> on attempt {selectedStep.attempt || 1} with zero retries.
                    </div>
                    {selectedStep.completed_at && (
                      <div className="text-slate-500 text-[10px]">
                        Completed at: {new Date(selectedStep.completed_at).toLocaleString('en-US')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
