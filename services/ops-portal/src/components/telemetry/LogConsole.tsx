import React, { useState } from 'react';
import {
  Terminal,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';

interface LogConsoleProps {
  logs: string;
  runId: string;
  onClearLogs?: () => Promise<void> | void;
}

export const LogConsole: React.FC<LogConsoleProps> = ({ logs, runId, onClearLogs }) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  const lines = logs.split('\n').filter((l) => l.trim().length > 0);

  const filteredLines = lines.filter((line) => {
    if (filterLevel !== 'ALL' && !line.includes(`[${filterLevel}]`)) {
      return false;
    }
    if (searchTerm && !line.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getLineClass = (line: string) => {
    if (line.includes('[ERROR]') || line.includes('[FATAL]')) return 'text-red-400 font-semibold';
    if (line.includes('[WARN]')) return 'text-amber-400';
    if (line.includes('[WIRE:REQ]') || line.includes('[WIRE:RESP]')) return 'text-blue-300';
    if (line.includes('[STEP:START]') || line.includes('[STEP:FINISH]')) return 'text-cyan-300';
    if (line.includes('[DEBUG]')) return 'text-purple-300';
    return 'text-slate-300';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${runId}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    if (onClearLogs) {
      setIsClearing(true);
      try {
        await onClearLogs();
      } finally {
        setIsClearing(false);
        setIsConfirmingClear(false);
      }
    }
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs flex flex-col">
      {/* Console Toolbar */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-300 font-bold">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            Execution Console Log
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[11px]">
            File: <span className="text-slate-200">logs/runs/{runId}.log</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-md px-2 py-1">
            <Filter className="w-3 h-3 text-slate-500" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Levels (ALL)</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="DEBUG">DEBUG</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search regex / keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md pl-7 pr-2.5 py-1 text-xs text-slate-200 w-48 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Auto-scroll toggle */}
          <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
            />
            Auto-scroll
          </label>

          {/* Action: Copy */}
          <button
            onClick={handleCopy}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Action: Download */}
          <button
            onClick={handleDownload}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition"
            title="Download log file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Action: Clear / Delete Logs */}
          {onClearLogs && (
            <>
              {isConfirmingClear ? (
                <div className="flex items-center gap-1 bg-red-950/80 border border-red-800 px-2 py-0.5 rounded-md">
                  <span className="text-[10px] text-red-300">Clear?</span>
                  <button
                    onClick={handleClear}
                    disabled={isClearing}
                    className="px-1.5 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold"
                  >
                    {isClearing ? '...' : 'Yes'}
                  </button>
                  <button
                    onClick={() => setIsConfirmingClear(false)}
                    className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsConfirmingClear(true)}
                  className="p-1.5 bg-slate-800 hover:bg-red-900/60 hover:text-red-300 text-slate-400 rounded-md transition"
                  title="Clear / Delete run logs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Console Output Screen */}
      <div className="p-3.5 space-y-1 max-h-80 overflow-y-auto custom-scrollbar leading-relaxed">
        {filteredLines.length === 0 ? (
          <div className="text-slate-500 text-center py-8">
            {logs.trim() === '' ? 'No execution logs recorded (empty log file).' : 'No log entries match the current filter.'}
          </div>
        ) : (
          filteredLines.map((line, idx) => (
            <div key={idx} className={`break-all ${getLineClass(line)}`}>
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
