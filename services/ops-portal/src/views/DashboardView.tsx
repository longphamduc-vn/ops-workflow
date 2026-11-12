import React from 'react';
import {
  Activity,
  CheckCircle2,
  Gauge,
  CalendarDays,
  AlertTriangle,
  ArrowRight,
  Bug,
  ListTree,
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { RunRecord, WorkflowSummary } from '../types';

interface DashboardViewProps {
  runs: RunRecord[];
  workflows?: WorkflowSummary[];
  onSelectRun: (runId: string) => void;
  onNavigateTab: (tab: 'inspector' | 'runs' | 'workflows') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  runs,
  workflows = [],
  onSelectRun,
  onNavigateTab,
}) => {
  const totalRuns = runs.length;
  const runningCount = runs.filter((r) => r.status === 'running' || r.status === 'pending').length;
  const failedRuns = runs.filter((r) => r.status === 'failed');
  const successRuns = runs.filter((r) => r.status === 'success');
  const latestFailedRun = failedRuns[0];

  const successRate = totalRuns > 0 ? ((successRuns.length / totalRuns) * 100).toFixed(1) : '100.0';

  // Calculate real average duration from completed runs
  const completedDurations = runs
    .filter((r) => r.started_at && r.completed_at)
    .map((r) => Math.max(0, new Date(r.completed_at!).getTime() - new Date(r.started_at!).getTime()))
    .filter((d) => d > 0);

  const avgLatencyMs =
    completedDurations.length > 0
      ? Math.round(completedDurations.reduce((a, b) => a + b, 0) / completedDurations.length)
      : 0;

  const cronWorkflows = workflows.filter((w) => w.trigger_type === 'cron');

  // Format real error text for the failure banner
  const failureErrorText = latestFailedRun?.error
    ? typeof latestFailedRun.error === 'object'
      ? latestFailedRun.error.message ||
        (latestFailedRun.error.failed_steps
          ? `Failed step(s): ${latestFailedRun.error.failed_steps.join(', ')}`
          : JSON.stringify(latestFailedRun.error))
      : String(latestFailedRun.error)
    : 'Execution error occurred during workflow step execution';

  return (
    <div className="space-y-5">
      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Recorded Runs"
          value={totalRuns.toLocaleString()}
          subtitle={`${runningCount} active • ${failedRuns.length} failed`}
          icon={<Activity className="w-4 h-4" />}
          highlightColor="blue"
        />

        <MetricCard
          title="Workflow Success Rate"
          value={`${successRate}%`}
          subtitle={`${successRuns.length} Succeeded / ${failedRuns.length} Failed`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          trend={{ value: 'Target ≥ 98%', isPositive: parseFloat(successRate) >= 98 }}
          highlightColor="emerald"
        />

        <MetricCard
          title="Avg Workflow Latency"
          value={avgLatencyMs > 0 ? `${avgLatencyMs.toLocaleString()} ms` : '--'}
          subtitle={`Across ${completedDurations.length} completed executions`}
          icon={<Gauge className="w-4 h-4" />}
          trend={{ value: avgLatencyMs > 0 && avgLatencyMs < 2000 ? 'Optimal' : 'Normal', isPositive: true }}
          highlightColor="amber"
        />

        <MetricCard
          title="Active Cron Workflows"
          value={`${cronWorkflows.length} Jobs`}
          subtitle={
            cronWorkflows.length > 0
              ? `${cronWorkflows[0]?.name || ''}${cronWorkflows.length > 1 ? ` +${cronWorkflows.length - 1} more` : ''}`
              : 'No scheduled workflows'
          }
          icon={<CalendarDays className="w-4 h-4" />}
          highlightColor="purple"
        />
      </div>

      {/* Critical Failure Alert Banner (Real Failure Telemetry) */}
      {latestFailedRun && (
        <div className="bg-red-950/35 border border-red-800/50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-red-200">
                Recent execution failure detected:{' '}
                <span className="font-mono text-red-300">{latestFailedRun.run_id}</span>
              </div>
              <div className="text-[11px] text-red-400/90 mt-0.5">
                Workflow:{' '}
                <code className="bg-red-900/40 px-1 py-0.2 rounded font-mono">
                  {latestFailedRun.workflow_name}
                </code>
                {' • '}
                <span>{failureErrorText}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onSelectRun(latestFailedRun.run_id);
              onNavigateTab('inspector');
            }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <Bug className="w-3.5 h-3.5" />
            Inspect & Debug Now
          </button>
        </div>
      )}

      {/* Grid: Recent Runs & Cron Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Runs Table (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <ListTree className="w-4 h-4 text-blue-400" />
              Recent Execution Runs
            </h3>
            <button
              onClick={() => onNavigateTab('runs')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2.5 font-medium">Run ID</th>
                  <th className="pb-2.5 font-medium">Workflow</th>
                  <th className="pb-2.5 font-medium">Status</th>
                  <th className="pb-2.5 font-medium">Started</th>
                  <th className="pb-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
                      No workflow runs recorded yet. Click "Trigger Workflow" to dispatch a run.
                    </td>
                  </tr>
                ) : (
                  runs.slice(0, 5).map((r) => (
                    <tr key={r.run_id} className="hover:bg-slate-800/40 transition">
                      <td
                        onClick={() => {
                          onSelectRun(r.run_id);
                          onNavigateTab('inspector');
                        }}
                        className="py-2.5 text-blue-400 font-semibold cursor-pointer hover:underline"
                      >
                        {r.run_id}
                      </td>
                      <td className="py-2.5 text-slate-200">{r.workflow_name}</td>
                      <td className="py-2.5 font-sans">
                        <StatusBadge status={r.status} size="sm" />
                      </td>
                      <td className="py-2.5 text-slate-400 font-sans text-[11px]">
                        {r.started_at ? new Date(r.started_at).toLocaleTimeString('en-US') : '--'}
                      </td>
                      <td className="py-2.5 text-right font-sans">
                        <button
                          onClick={() => {
                            onSelectRun(r.run_id);
                            onNavigateTab('inspector');
                          }}
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 ml-auto text-xs font-medium"
                        >
                          <Bug className="w-3 h-3" /> Debug
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cron Schedule (1 col) - Dynamically populated from registered workflows */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-purple-400" />
              Scheduled Workflows
            </h3>
            <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded font-mono font-bold">
              {cronWorkflows.length} active
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {cronWorkflows.length === 0 ? (
              <div className="text-slate-500 text-center py-6">
                No scheduled cron workflows registered.
              </div>
            ) : (
              cronWorkflows.map((w) => (
                <div key={w.name} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span className="truncate">{w.name}</span>
                    <span className="font-mono text-emerald-400 text-[11px]">v{w.version}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Trigger: <code className="text-purple-300 font-mono">cron</code></span>
                    <span className="text-slate-500">
                      {Object.keys(w.inputs || {}).length} inputs
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
