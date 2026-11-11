import React from 'react';
import {
  Workflow,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface HeaderProps {
  onOpenTrigger: () => void;
  onOpenReplay?: () => void;
  serverOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTrigger,
  onOpenReplay,
  serverOnline = true,
}) => {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between z-30 flex-shrink-0">
      {/* Brand & Connection State */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
          <Workflow className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 tracking-tight text-sm">
              OPSFLOW PORTAL
            </span>
            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
              Component 2
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                serverOnline ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            ></span>
            <span>{serverOnline ? 'Engine Online (:8000)' : 'Offline'}</span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3 inline" />
              Nexacro EMS Session Active
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Toolbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenTrigger}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
        >
          <Play className="w-3 h-3 fill-current" />
          Trigger Run
        </button>

        {onOpenReplay && (
          <button
            onClick={onOpenReplay}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            Replay Run
          </button>
        )}

        <div className="h-5 w-px bg-slate-800 mx-1"></div>

        <div className="text-xs text-slate-400 font-mono bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-500" />
          Asia/Ho_Chi_Minh
        </div>
      </div>
    </header>
  );
};
