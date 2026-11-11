import React from 'react';
import {
  LayoutDashboard,
  Bug,
  ListTree,
  FileCode2,
  Network,
  ShieldCheck,
} from 'lucide-react';

export type PortalTab = 'dashboard' | 'inspector' | 'runs' | 'workflows' | 'connectors';

interface SidebarProps {
  currentTab: PortalTab;
  onSelectTab: (tab: PortalTab) => void;
  failedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  failedCount = 1,
}) => {
  const navItems = [
    {
      id: 'dashboard' as PortalTab,
      label: 'Tổng quan (Dashboard)',
      icon: LayoutDashboard,
    },
    {
      id: 'inspector' as PortalTab,
      label: 'DAG & Debug Console',
      icon: Bug,
      badge: failedCount > 0 ? `${failedCount} lỗi` : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
    },
    {
      id: 'runs' as PortalTab,
      label: 'Lịch sử Thực thi (Runs)',
      icon: ListTree,
    },
    {
      id: 'workflows' as PortalTab,
      label: 'Workflows YAML',
      icon: FileCode2,
    },
    {
      id: 'connectors' as PortalTab,
      label: 'Connectors & EMS',
      icon: Network,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between flex-shrink-0">
      <div className="p-3.5 space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2">
          Điều hướng Hệ thống
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Gateway Health Widget */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Bảo mật & Whitelist</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          SimpleEval Sandbox active. Secrets auto-masked.
        </p>
      </div>
    </aside>
  );
};
