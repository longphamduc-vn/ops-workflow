import React from 'react';
import { RunStatus } from '../../types';

interface StatusBadgeProps {
  status: RunStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = status.toLowerCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';
  let label = status.toUpperCase();

  switch (norm) {
    case 'success':
      styles = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      break;
    case 'failed':
      styles = 'bg-red-500/15 text-red-400 border-red-500/30';
      break;
    case 'running':
      styles = 'bg-blue-500/15 text-blue-400 border-blue-500/30 animate-pulse';
      break;
    case 'pending':
      styles = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      break;
    case 'wait_approval':
      styles = 'bg-purple-500/15 text-purple-400 border-purple-500/30 font-bold';
      label = 'APPROVAL NEEDED';
      break;
    case 'skipped':
      styles = 'bg-slate-800/80 text-slate-400 border-slate-700/60';
      break;
    case 'cancelled':
      styles = 'bg-zinc-800 text-zinc-400 border-zinc-700';
      break;
  }

  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold border rounded-md font-sans ${padding} ${styles}`}>
      {norm === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>}
      {norm === 'failed' && <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>}
      {norm === 'success' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
      {label}
    </span>
  );
};

