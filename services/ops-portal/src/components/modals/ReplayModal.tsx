import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  Zap,
  Copy,
} from 'lucide-react';
import { opsClient } from '../../api/client';

interface ReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  runId: string;
  workflowName: string;
  onReplaySuccess: (targetRunId: string) => void;
}

export const ReplayModal: React.FC<ReplayModalProps> = ({
  isOpen,
  onClose,
  runId,
  workflowName,
  onReplaySuccess,
}) => {
  const [resumeFromFailed, setResumeFromFailed] = useState<boolean>(true);
  const [newRun, setNewRun] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReplay = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await opsClient.replayRun(runId, {
        resume_from_failed: resumeFromFailed,
        new_run: newRun,
      });
      onReplaySuccess(res.run_id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to trigger replay');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Replay & Crash-Resume Run</h3>
              <p className="text-[11px] text-slate-400">Resume execution from the exact point of failure</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800 rounded-lg text-red-300">
              {errorMsg}
            </div>
          )}

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1 font-mono text-[11px]">
            <div className="text-slate-400">
              Target Run ID: <span className="text-blue-400 font-bold">{runId}</span>
            </div>
            <div className="text-slate-400">
              Workflow: <span className="text-slate-200">{workflowName}</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/60 cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={resumeFromFailed}
                onChange={(e) => setResumeFromFailed(e.target.checked)}
                className="mt-0.5 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
              />
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Enable Crash-Resume (Recommended)
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Reuses outputs from previously succeeded steps; only retries the failed step and its downstream dependencies.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/60 cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={newRun}
                onChange={(e) => setNewRun(e.target.checked)}
                className="mt-0.5 rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-0"
              />
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  Clone into a New Run ID
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Generates a fresh Run ID to preserve immutable execution history for auditing.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs transition"
          >
            Cancel
          </button>
          <button
            onClick={handleReplay}
            disabled={isSubmitting}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {isSubmitting ? 'Replaying...' : 'Start Replay'}
          </button>
        </div>
      </div>
    </div>
  );
};
