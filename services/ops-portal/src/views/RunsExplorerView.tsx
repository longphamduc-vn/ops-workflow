import React, { useState } from 'react';
import {
  Search,
  Filter,
  Bug,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { RunRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

interface RunsExplorerViewProps {
  runs: RunRecord[];
  onSelectRun: (runId: string) => void;
  onOpenReplayForRun: (runId: string) => void;
  onNavigateInspector: () => void;
  onClearRunLogs?: (runId: string) => Promise<boolean | void>;
}

export const RunsExplorerView: React.FC<RunsExplorerViewProps> = ({
  runs,
  onSelectRun,
  onOpenReplayForRun,
  onNavigateInspector,
  onClearRunLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wfFilter, setWfFilter] = useState<string>('all');
  const [confirmClearRunId, setConfirmClearRunId] = useState<string | null>(null);
  const [clearingRunId, setClearingRunId] = useState<string | null>(null);

  const filteredRuns = runs.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (wfFilter !== 'all' && r.workflow_name !== wfFilter) return false;
    if (
      searchTerm &&
      !r.run_id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !r.workflow_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const uniqueWorkflows = Array.from(new Set(runs.map((r) => r.workflow_name)));

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Run ID or Workflow name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses (All)</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="running">Running</option>
              <option value="wait_approval">Wait Approval</option>
            </select>
          </div>

          <select
            value={wfFilter}
            onChange={(e) => setWfFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Workflows</option>
            {uniqueWorkflows.map((wf) => (
              <option key={wf} value={wf}>
                {wf}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="text-slate-200 font-bold">{filteredRuns.length}</span> of {runs.length} runs
        </div>
      </div>

      {/* Runs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-3.5 font-semibold">Run ID</th>
              <th className="p-3.5 font-semibold">Workflow</th>
              <th className="p-3.5 font-semibold">Status</th>
              <th className="p-3.5 font-semibold">Started At</th>
              <th className="p-3.5 font-semibold">Completed At</th>
              <th className="p-3.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono">
            {filteredRuns.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500 font-sans">
                  No workflow execution runs match the current filter.
                </td>
              </tr>
            ) : (
              filteredRuns.map((r) => (
                <tr key={r.run_id} className="hover:bg-slate-800/40 transition">
                  <td
                    onClick={() => {
                      onSelectRun(r.run_id);
                      onNavigateInspector();
                    }}
                    className="p-3.5 text-blue-400 font-bold cursor-pointer hover:underline"
                  >
                    {r.run_id}
                  </td>
                  <td className="p-3.5 text-slate-200">{r.workflow_name}</td>
                  <td className="p-3.5 font-sans">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="p-3.5 text-slate-400 font-sans text-[11px]">
                    {new Date(r.created_at).toLocaleString('en-US')}
                  </td>
                  <td className="p-3.5 text-slate-400 font-sans text-[11px]">
                    {r.completed_at ? new Date(r.completed_at).toLocaleTimeString('en-US') : '--'}
                  </td>
                  <td className="p-3.5 text-right font-sans">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          onSelectRun(r.run_id);
                          onNavigateInspector();
                        }}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold text-xs"
                      >
                        <Bug className="w-3.5 h-3.5" /> Debug
                      </button>

                      <button
                        onClick={() => onOpenReplayForRun(r.run_id)}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold text-xs ml-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Replay
                      </button>

                      {onClearRunLogs && (
                        confirmClearRunId === r.run_id ? (
                          <div className="flex items-center gap-1 bg-red-950/90 border border-red-800 px-2 py-0.5 rounded ml-1">
                            <span className="text-[10px] text-red-300 font-medium">Clear?</span>
                            <button
                              onClick={async () => {
                                setClearingRunId(r.run_id);
                                try {
                                  await onClearRunLogs(r.run_id);
                                } finally {
                                  setClearingRunId(null);
                                  setConfirmClearRunId(null);
                                }
                              }}
                              disabled={clearingRunId === r.run_id}
                              className="px-1.5 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold"
                            >
                              {clearingRunId === r.run_id ? '...' : 'Yes'}
                            </button>
                            <button
                              onClick={() => setConfirmClearRunId(null)}
                              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmClearRunId(r.run_id)}
                            className="text-slate-400 hover:text-red-400 flex items-center gap-1 font-semibold text-xs ml-1 transition"
                            title="Clear execution log"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400/80" /> Clear Log
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
