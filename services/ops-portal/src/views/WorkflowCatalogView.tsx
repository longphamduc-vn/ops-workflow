import React from 'react';
import {
  FileCode2,
  Play,
  Clock,
  Sliders,
} from 'lucide-react';
import { WorkflowSummary } from '../types';

interface WorkflowCatalogViewProps {
  workflows: WorkflowSummary[];
  onTriggerWorkflow: (name: string) => void;
}

export const WorkflowCatalogView: React.FC<WorkflowCatalogViewProps> = ({
  workflows,
  onTriggerWorkflow,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-blue-400" />
            Danh mục Workflows (Registered DAGs)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Các định nghĩa workflow YAML được đăng ký trong thư mục <code className="bg-slate-900 px-1 py-0.2 rounded font-mono">workflows/</code>
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Tổng cộng: <span className="text-blue-400 font-bold">{workflows.length}</span> workflows
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((wf) => {
          const inputCount = Object.keys(wf.inputs || {}).length;

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
                  {wf.description || 'Không có mô tả chi tiết.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  {inputCount} tham số inputs
                </span>

                <button
                  onClick={() => onTriggerWorkflow(wf.name)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Play className="w-3 h-3 fill-current" /> Trigger
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
