import React, { useState } from 'react';
import {
  RotateCcw,
  Bolt,
  Terminal,
  Code2,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { RunRecord, StepRunRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { DagVisualizer } from '../components/dag/DagVisualizer';
import { WireDebugger } from '../components/telemetry/WireDebugger';
import { LogConsole } from '../components/telemetry/LogConsole';

interface RunInspectorViewProps {
  run: RunRecord;
  steps: StepRunRecord[];
  logs: string;
  onOpenReplay: () => void;
}

export const RunInspectorView: React.FC<RunInspectorViewProps> = ({
  run,
  steps,
  logs,
  onOpenReplay,
}) => {
  const [selectedStepId, setSelectedStepId] = useState<string>(
    steps.find((s) => s.status === 'failed')?.step_id || steps[0]?.step_id || 'get_wip_entity'
  );
  const [activeTab, setActiveTab] = useState<'wire' | 'logs' | 'context' | 'retries'>('wire');

  const selectedStep = steps.find((s) => s.step_id === selectedStepId);
  const isFailed = selectedStep?.status === 'failed' || run.status === 'failed';

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
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-100 font-mono">{run.run_id}</span>
              <StatusBadge status={run.status} />
              <span className="text-xs text-slate-400 font-mono">wf: {run.workflow_name}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span>Bắt đầu: {run.started_at ? new Date(run.started_at).toLocaleTimeString('vi-VN') : '--'}</span>
              <span className="text-slate-700">•</span>
              <span>Trigger: <code className="bg-slate-800 px-1 py-0.2 rounded font-mono text-slate-300">cron</code></span>
              <span className="text-slate-700">•</span>
              <span>Độ trễ: <span className="text-amber-400 font-mono font-bold">1,250 ms</span></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReplay}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Replay từ bước lỗi (Resume)
          </button>
        </div>
      </div>

      {/* Visual DAG Diagram */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-200">
              Đồ thị Luồng Thực thi (Visual Interactive DAG)
            </h3>
            <span className="text-[11px] text-slate-400">
              (Bấm vào từng bước để soi Wire Telemetry và biến đổi dữ liệu)
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Bước đang chọn: <span className="text-blue-400 font-bold">{selectedStepId}</span>
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
              Inputs & Outputs JSON
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
              Lịch sử Retry (3 lần)
            </button>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Step: <span className="text-slate-200 font-bold">{selectedStepId}</span>
          </span>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'wire' && (
            <WireDebugger stepId={selectedStepId} isFailed={isFailed} />
          )}

          {activeTab === 'logs' && (
            <LogConsole logs={logs} runId={run.run_id} />
          )}

          {activeTab === 'context' && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="text-slate-300 font-sans font-semibold mb-1">
                  Tham số đầu vào của Run (Inputs Context):
                </div>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-blue-300 overflow-x-auto">
                  {JSON.stringify(run.inputs, null, 2)}
                </pre>
              </div>

              <div>
                <div className="text-slate-300 font-sans font-semibold mb-1">
                  Dữ liệu đầu ra của Run (Outputs):
                </div>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-emerald-400 overflow-x-auto">
                  {JSON.stringify(run.outputs, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'retries' && (
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                <div>
                  <span className="font-bold text-red-400">Attempt 1:</span>{' '}
                  <span className="text-slate-300">Nexacro HTTP 500 (Session Expired)</span>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  Latency: 385ms • Backoff: 2.0s
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                <div>
                  <span className="font-bold text-red-400">Attempt 2:</span>{' '}
                  <span className="text-slate-300">Auto-relogin vào /login.do thất bại</span>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  Latency: 430ms • Backoff: 4.0s
                </div>
              </div>

              <div className="p-3 bg-red-950/20 border border-red-800/60 rounded-lg flex justify-between items-center">
                <div>
                  <span className="font-bold text-red-400">Attempt 3:</span>{' '}
                  <span className="text-red-300 font-semibold">Đạt số lần thử tối đa (3/3). Hủy bước.</span>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  Latency: 435ms • Trạng thái: FAILED
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
