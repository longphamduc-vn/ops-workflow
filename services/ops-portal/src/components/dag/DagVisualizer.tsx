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
  ChevronLeft,
  ChevronRight,
  Eye,
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
  const getStepIcon = (stepId: string) => {
    if (
      stepId.includes('fetch') ||
      stepId.includes('wip') ||
      stepId.includes('master') ||
      stepId.includes('stock') ||
      stepId.includes('query')
    ) {
      return <Server className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (stepId.includes('transform') || stepId.includes('normalize') || stepId.includes('evaluate')) {
      return <Code2 className="w-3.5 h-3.5 text-purple-400" />;
    }
    if (stepId.includes('join')) {
      return <Code2 className="w-3.5 h-3.5 text-indigo-400" />;
    }
    if (stepId.includes('db') || stepId.includes('upsert') || stepId.includes('save')) {
      return <Database className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (stepId.includes('notify') || stepId.includes('slack') || stepId.includes('alert')) {
      return <Bell className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (stepId.includes('approval')) {
      return <UserCheck className="w-3.5 h-3.5 text-pink-400" />;
    }
    return <Server className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getStepType = (stepId: string) => {
    if (stepId.includes('join')) return 'join';
    if (stepId.includes('transform') || stepId.includes('normalize') || stepId.includes('evaluate'))
      return 'transform';
    if (stepId.includes('notify') || stepId.includes('alert') || stepId.includes('slack')) return 'notify';
    if (stepId.includes('db') || stepId.includes('upsert') || stepId.includes('save')) return 'db_upsert';
    if (stepId.includes('approval')) return 'approval';
    if (
      stepId.includes('fetch') ||
      stepId.includes('query') ||
      stepId.includes('wip') ||
      stepId.includes('stock') ||
      stepId.includes('master')
    ) {
      return 'call: ems';
    }
    return 'call';
  };

  const getOutputSummary = (outputs: any) => {
    if (!outputs) return null;
    if (Array.isArray(outputs)) {
      return `${outputs.length} items`;
    }
    if (typeof outputs === 'object') {
      const keys = Object.keys(outputs);
      if (keys.length === 1 && Array.isArray(outputs[keys[0]])) {
        return `${outputs[keys[0]].length} ${keys[0]}`;
      }
      return `${keys.length} keys`;
    }
    return 'ready';
  };

  if (steps.length === 0) {
    return (
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-5">
        <div className="py-6 text-center text-slate-500 font-sans text-xs">
          No execution step nodes recorded for this workflow run.
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.step_id === selectedStepId);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectStep(steps[currentIndex - 1].step_id);
    }
  };

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      onSelectStep(steps[currentIndex + 1].step_id);
    }
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
      {/* Top Step Navigation Bar */}
      <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Step {currentIndex >= 0 ? currentIndex + 1 : 1} of {steps.length}:</span>
          <span className="font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/40">
            {selectedStepId || steps[0]?.step_id}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-slate-300 flex items-center gap-1 transition"
            title="Inspect previous step"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev Step</span>
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= steps.length - 1}
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-slate-300 flex items-center gap-1 transition"
            title="Inspect next step"
          >
            <span>Next Step</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable DAG Track */}
      <div className="overflow-x-auto custom-scrollbar py-2">
        <div className="flex items-center justify-start min-w-max gap-3 px-1">
          {steps.map((step, idx) => {
            const isSelected = selectedStepId === step.step_id;
            const isFailed = step.status === 'failed';
            const isSuccess = step.status === 'success';
            const isSkipped = step.status === 'skipped';
            const isRunning = step.status === 'running';
            const outputSummary = getOutputSummary(step.outputs);

            let borderClass = 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900';
            if (isSelected) {
              borderClass = 'ring-2 ring-blue-500 border-blue-400 bg-slate-900 shadow-lg shadow-blue-500/10';
            }
            if (isFailed) {
              borderClass = isSelected
                ? 'ring-2 ring-red-500 border-red-400 bg-red-950/30'
                : 'border-red-500/80 bg-red-950/20 shadow-lg shadow-red-500/10 ring-1 ring-red-500/40';
            }

            return (
              <React.Fragment key={step.step_id}>
                {/* Node Card */}
                <div
                  onClick={() => onSelectStep(step.step_id)}
                  className={`cursor-pointer rounded-xl p-3.5 w-64 border transition-all transform hover:-translate-y-0.5 ${borderClass} ${
                    isSkipped ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  {/* Node Header */}
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/50">
                      {getStepIcon(step.step_id)}
                      {getStepType(step.step_id)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                      <span className="font-mono text-[11px] text-slate-400 font-medium">
                        {step.latency_ms > 0 ? `${step.latency_ms} ms` : '--'}
                      </span>
                    </div>
                  </div>

                  {/* Node Title */}
                  <div className="font-bold text-sm text-slate-100 truncate tracking-tight" title={step.step_id}>
                    {step.step_id}
                  </div>

                  {/* Node Outputs Indicator */}
                  {outputSummary && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400/90 font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">
                      <Database className="w-2.5 h-2.5" />
                      <span className="truncate">Outputs: {outputSummary}</span>
                    </div>
                  )}

                  {/* Node Footer Status */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1">
                      {isSuccess && (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Succeeded
                        </span>
                      )}
                      {isFailed && (
                        <span className="flex items-center gap-1 text-red-400 font-medium">
                          <XCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                      {isSkipped && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" /> Skipped
                        </span>
                      )}
                      {isRunning && (
                        <span className="flex items-center gap-1 text-blue-400">
                          <Clock className="w-3 h-3 animate-spin" /> Running...
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <span className="text-blue-400 font-semibold text-[10px] flex items-center gap-1 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-900/50">
                        <Eye className="w-2.5 h-2.5" /> Inspecting
                      </span>
                    )}
                  </div>
                </div>

                {/* Edge Arrow */}
                {idx < steps.length - 1 && (
                  <div className="text-slate-700 flex items-center px-0.5">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
