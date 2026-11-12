import React, { useState } from 'react';
import {
  FileCode2,
  Play,
  Clock,
  Sliders,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { WorkflowSummary } from '../types';

interface WorkflowCatalogViewProps {
  workflows: WorkflowSummary[];
  onTriggerWorkflow: (name: string) => void;
  onReloadWorkflows?: () => Promise<any> | void;
}

export const WorkflowCatalogView: React.FC<WorkflowCatalogViewProps> = ({
  workflows,
  onTriggerWorkflow,
  onReloadWorkflows,
}) => {
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [reloadMessage, setReloadMessage] = useState<string | null>(null);

  const handleReload = async () => {
    if (!onReloadWorkflows) return;
    setIsReloading(true);
    setReloadMessage(null);
    try {
      const res = await onReloadWorkflows();
      if (res && res.message) {
        setReloadMessage(res.message);
      } else {
        setReloadMessage('Workflows successfully reloaded from disk.');
      }
      setTimeout(() => setReloadMessage(null), 5000);
    } catch (err: any) {
      setReloadMessage(`Failed to reload workflows: ${err.message || err}`);
      setTimeout(() => setReloadMessage(null), 6000);
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-blue-400" />
            Registered Workflows Catalog (DAGs)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            YAML workflow definitions discovered in directory <code className="bg-slate-900 px-1 py-0.2 rounded font-mono text-blue-300">workflows/</code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            Total: <span className="text-blue-400 font-bold">{workflows.length}</span> workflows
          </span>

          {onReloadWorkflows && (
            <button
              onClick={handleReload}
              disabled={isReloading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shadow-sm transition"
              title="Reload and re-parse all YAML workflow definitions from disk"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isReloading ? 'animate-spin' : ''}`} />
              <span>{isReloading ? 'Reloading...' : 'Reload Workflows from Disk'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Alert Banner if Reloaded */}
      {reloadMessage && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs transition ${
            reloadMessage.includes('Failed')
              ? 'bg-red-950/40 border-red-800/80 text-red-300'
              : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
          }`}
        >
          {reloadMessage.includes('Failed') ? (
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span>{reloadMessage}</span>
        </div>
      )}

      {/* Workflows Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((wf) => {
          const inputEntries = Object.entries(wf.inputs || {});

          return (
            <div
              key={wf.name}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-xs font-bold border border-blue-500/20">
                    v{wf.version}
                  </span>
                  <span className="text-xs text-purple-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {wf.trigger_type}
                  </span>
                </div>

                <h3 className="font-bold text-slate-100 text-sm tracking-tight">{wf.name}</h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {wf.description || 'No description provided.'}
                </p>

                {/* Input Parameters Preview */}
                {inputEntries.length > 0 && (
                  <div className="pt-1">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                      Inputs Schema ({inputEntries.length}):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {inputEntries.slice(0, 4).map(([k, schema]) => (
                        <span
                          key={k}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800"
                          title={`${k} (${schema.type}): ${schema.description || ''}`}
                        >
                          {k}: <strong className="text-blue-400">{schema.type}</strong>
                        </span>
                      ))}
                      {inputEntries.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500">
                          +{inputEntries.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  {inputEntries.length} inputs
                </span>

                <button
                  onClick={() => onTriggerWorkflow(wf.name)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Play className="w-3 h-3 fill-current" /> Trigger Run
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
