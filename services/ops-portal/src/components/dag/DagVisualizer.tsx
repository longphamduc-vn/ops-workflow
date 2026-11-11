import React from 'react';
import {
  Server,
  ArrowRight,
  Database,
  Code2,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { StepRunRecord } from '../../types';

interface DagVisualizerProps {
  steps: StepRunRecord[];
  selectedStepId: string;
  onSelectStep: (stepId: string) => void;
}

export const DagVisualizer: React.FC<DagVisualizerProps> = ({
  steps,
  selectedStepId,
  onSelectStep,
}) => {
  // Step icons helper
  const getStepIcon = (stepId: string) => {
    if (stepId.includes('wip') || stepId.includes('master') || stepId.includes('stock')) {
      return <Server className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (stepId.includes('transform') || stepId.includes('normalize')) {
      return <Code2 className="w-3.5 h-3.5 text-purple-400" />;
    }
    if (stepId.includes('db') || stepId.includes('upsert')) {
      return <Database className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (stepId.includes('notify') || stepId.includes('slack')) {
      return <Bell className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (stepId.includes('approval')) {
      return <UserCheck className="w-3.5 h-3.5 text-pink-400" />;
    }
    return <Server className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getStepType = (stepId: string) => {
    if (stepId.includes('wip') || stepId.includes('master')) return 'call: ems';
    if (stepId.includes('transform')) return 'transform';
    if (stepId.includes('notify')) return 'call: http';
    if (stepId.includes('db')) return 'db_upsert';
    if (stepId.includes('approval')) return 'approval';
    return 'call';
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 overflow-x-auto custom-scrollbar">
      <div className="flex items-center justify-start md:justify-center min-w-max gap-3 py-2">
        {steps.map((step, idx) => {
          const isSelected = selectedStepId === step.step_id;
          const isFailed = step.status === 'failed';
          const isSuccess = step.status === 'success';
          const isSkipped = step.status === 'skipped';
          const isRunning = step.status === 'running';

          let borderClass = 'border-slate-800 hover:border-slate-700 bg-slate-900/60';
          if (isSelected) {
            borderClass = 'ring-2 ring-blue-500 border-blue-400 bg-slate-900';
          }
          if (isFailed) {
            borderClass = 'border-red-500/80 bg-red-950/20 shadow-lg shadow-red-500/10 ring-1 ring-red-500/40';
          }

          return (
            <React.Fragment key={step.step_id}>
              {/* Node Card */}
              <div
                onClick={() => onSelectStep(step.step_id)}
                className={`cursor-pointer rounded-xl p-3.5 w-60 border transition-all ${borderClass} ${
                  isSkipped ? 'opacity-50' : 'opacity-100'
                }`}
              >
                {/* Node Header */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/50">
                    {getStepIcon(step.step_id)}
                    {getStepType(step.step_id)}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 font-medium">
                    {step.latency_ms > 0 ? `${step.latency_ms} ms` : '--'}
                  </span>
                </div>

                {/* Node Title */}
                <div className="font-bold text-sm text-slate-100 truncate tracking-tight">
                  {step.step_id}
                </div>

                {/* Node Footer Status */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1">
                    {isSuccess && (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Thành công
                      </span>
                    )}
                    {isFailed && (
                      <span className="text-red-400 font-medium flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Thất bại (Lần {step.attempt})
                      </span>
                    )}
                    {isSkipped && <span className="text-slate-400">Đã bỏ qua (Skipped)</span>}
                    {isRunning && (
                      <span className="text-blue-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-spin" /> Đang chạy...
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <span className="text-blue-400 font-semibold text-[10px] underline">
                      Đang soi
                    </span>
                  )}
                </div>
              </div>

              {/* Edge Arrow */}
              {idx < steps.length - 1 && (
                <div className="text-slate-700 flex items-center px-1">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

