import React from 'react';
import { useProcurement } from '../context/ProcurementContext';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Wrench, 
  ClipboardCheck, 
  Sliders, 
  ShieldCheck, 
  Network, 
  Settings, 
  Bell, 
  Zap, 
  AlertTriangle 
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentRole, setCurrentRole, tasks, clarifications, simulateEmsStockClearance } = useProcurement();

  const roleConfigs: { role: UserRole; label: string; icon: React.ReactNode; userText: string }[] = [
    { 
      role: 'COMMON', 
      label: 'Operations Analytics', 
      icon: <LayoutDashboard className="w-4 h-4" />, 
      userText: 'Plant-Wide Overview (Factory HW)' 
    },
    { 
      role: 'REQUESTOR', 
      label: 'Requestor Portal', 
      icon: <Wrench className="w-4 h-4" />, 
      userText: 'Nguyen Van Thang (Peer Engineer - Part 1)' 
    },
    { 
      role: 'LEADER', 
      label: 'Leader Monitoring', 
      icon: <ClipboardCheck className="w-4 h-4" />, 
      userText: 'Tran Van Hung (Part & Team Leader)' 
    },
    { 
      role: 'LEC', 
      label: 'LEC Workbench', 
      icon: <Sliders className="w-4 h-4" />, 
      userText: 'Pham Duc Long (658359 - Multi-LEC)' 
    },
    { 
      role: 'COST_MGMT', 
      label: 'Cost Management', 
      icon: <ShieldCheck className="w-4 h-4" />, 
      userText: 'Reviewer & Assistant (1 Single Person)' 
    },
    { 
      role: 'EBOM', 
      label: 'EBOM Slot Mapper', 
      icon: <Network className="w-4 h-4" />, 
      userText: 'Visual Mechanism Explorer' 
    },
    { 
      role: 'ADMIN', 
      label: 'Admin Settings', 
      icon: <Settings className="w-4 h-4" />, 
      userText: 'System Administrator' 
    },
  ];

  const activeInterTeamTasks = tasks.filter(t => t.type === 'INTER_TEAM_BORROW' && t.status === 'ACTIVE');
  const pendingInquiries = clarifications.filter(c => c.status !== 'RESOLVED');

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-xl">
      {/* Top Banner */}
      <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-wider text-rose-500 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            LG DISPLAY FACTORY HW
          </span>
          <span className="text-slate-600">|</span>
          <span>Org ID: <strong className="text-slate-300">28753</strong> (Smart Watch Module Plant 1)</span>
          <span className="text-slate-600">|</span>
          <span>Core EMS Sync: <span className="text-emerald-400 font-mono">ONLINE (Gateway max_concurrent: 3)</span></span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            <span className="text-slate-400">Current Period:</span>
            <span className="text-cyan-400 font-semibold font-mono">2026-11 (Nov 2026)</span>
          </div>

          {/* Quick Simulation Trigger */}
          <button 
            onClick={() => simulateEmsStockClearance('QCAD38190')}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded transition-all text-xs font-medium"
            title="Simulate EMS updating agingInterlockFlag from 'Y' to 'N', auto-closing persistent borrowing task"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Simulate EMS Stock Issuance ('N')
          </button>
        </div>
      </div>

      {/* Main Navigation & Role Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {roleConfigs.map(({ role, label, icon }) => {
            const isActive = currentRole === role;
            return (
              <button
                key={role}
                onClick={() => setCurrentRole(role)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30 font-semibold'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                {icon}
                {label}
                {role === 'REQUESTOR' && activeInterTeamTasks.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                    {activeInterTeamTasks.length}
                  </span>
                )}
                {role === 'LEC' && pendingInquiries.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold">
                    {pendingInquiries.length}
                  </span>
                )}
                {role === 'COST_MGMT' && pendingInquiries.filter(c => c.status === 'ENGINEER_REPLIED').length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-bold">
                    {pendingInquiries.filter(c => c.status === 'ENGINEER_REPLIED').length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Current User Info */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-200">
              {roleConfigs.find(r => r.role === currentRole)?.userText}
            </div>
            <div className="text-[11px] text-slate-400">
              PO Module Tech Team 2 | Smart Watch Lines
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            HW
          </div>
        </div>
      </div>
    </header>
  );
};
