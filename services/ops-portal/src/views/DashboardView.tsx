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
import { RunRecord } from '../types';

interface DashboardViewProps {
  runs: RunRecord[];
  onSelectRun: (runId: string) => void;
  onNavigateTab: (tab: 'inspector' | 'runs' | 'workflows') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  runs,
  onSelectRun,
  onNavigateTab,
}) => {
  const failedRuns = runs.filter((r) => r.status === 'failed');
  const latestFailedRun = failedRuns[0];

  return (
    <div className="space-y-5">
      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Runs (24h)"
          value="1,428"
          subtitle="1 active running • 2 pending"
          icon={<Activity className="w-4 h-4" />}
          trend={{ value: '+12%', isPositive: true }}
          highlightColor="blue"
        />

        <MetricCard
          title="Success Rate"
          value="98.6%"
          subtitle="1,408 Succeeded / 20 Failed"
          icon={<CheckCircle2 className="w-4 h-4" />}
          trend={{ value: 'Target ≥ 98%', isPositive: true }}
          highlightColor="emerald"
        />

        <MetricCard
          title="EMS Gateway Latency (P95)"
          value="420 ms"
          subtitle="Nexacro XML Protocol • Session OK"
          icon={<Gauge className="w-4 h-4" />}
          trend={{ value: 'Normal', isPositive: true }}
          highlightColor="amber"
        />

        <MetricCard
          title="Cron Triggers (APScheduler)"
          value="6 Jobs"
          subtitle="Next: equipment-status in 4m"
          icon={<CalendarDays className="w-4 h-4" />}
          highlightColor="purple"
        />
      </div>

      {/* Critical Failure Alert Banner */}
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
                Workflow: <code className="bg-red-900/40 px-1 py-0.2 rounded font-mono">{latestFailedRun.workflow_name}</code>
                {' '}• Nexacro XML communication failure or session timeout on step <code className="bg-red-900/40 px-1 py-0.2 rounded font-mono">get_wip_entity</code>
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
                {runs.slice(0, 5).map((r) => (
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
                      {new Date(r.created_at).toLocaleTimeString('en-US')}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cron Schedule (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-purple-400" />
              Cron Triggers (APScheduler)
            </h3>
            <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded font-mono font-bold">
              6 active
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span>equipment-status-lookup</span>
                <span className="font-mono text-emerald-400 text-[11px]">*/15 * * * *</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                <span>Next run: in 4 mins</span>
                <span className="text-slate-400">Asia/Ho_Chi_Minh</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span>spare-parts-inventory-sync</span>
                <span className="font-mono text-purple-400 text-[11px]">0 */2 * * *</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                <span>Next run: at 12:00 PM</span>
                <span className="text-slate-400">Every 2 hours</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span>target-stock-optimization</span>
                <span className="font-mono text-blue-400 text-[11px]">0 2 * * *</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                <span>Next run: 02:00 AM tomorrow</span>
                <span className="text-slate-400">Nightly batch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
