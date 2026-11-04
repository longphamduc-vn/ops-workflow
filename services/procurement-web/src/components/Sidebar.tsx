import React, { useState } from 'react';
import { useProcurement } from '../context/ProcurementContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Wrench, 
  ClipboardCheck, 
  Sliders, 
  Warehouse,
  ShieldCheck, 
  Network, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Building2,
  Cpu,
  Layers,
  Zap,
  Activity
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { currentRole, setCurrentRole, tasks, clarifications, simulateEmsStockClearance } = useProcurement();
  const { theme, toggleTheme } = useTheme();

  const roleConfigs: { 
    role: UserRole; 
    label: string; 
    icon: React.ReactNode; 
    section: 'ANALYTICS' | 'ENGINEERING' | 'COORDINATION' | 'SYSTEM';
    userText: string;
    badgeCount?: number;
    badgeColor?: string;
  }[] = [
    { 
      role: 'COMMON', 
      label: 'Tổng Quan Toàn Xưởng', 
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />, 
      section: 'ANALYTICS',
      userText: 'Plant-Wide Analytics (HW)' 
    },
    { 
      role: 'REQUESTOR', 
      label: 'Kỹ Sư Công Đoạn', 
      icon: <Wrench className="w-5 h-5 shrink-0" />, 
      section: 'ENGINEERING',
      userText: 'Nguyen Van Thang (Process Eng)',
      badgeCount: tasks.filter(t => t.type === 'INTER_TEAM_BORROW' && t.status === 'ACTIVE').length,
      badgeColor: 'bg-amber-500 text-white'
    },
    { 
      role: 'EBOM', 
      label: 'Kéo-Thả EBOM Slot', 
      icon: <Network className="w-5 h-5 shrink-0" />, 
      section: 'ENGINEERING',
      userText: 'Visual Mechanism Explorer' 
    },
    { 
      role: 'LEADER', 
      label: 'Giám Sát Leader', 
      icon: <ClipboardCheck className="w-5 h-5 shrink-0" />, 
      section: 'COORDINATION',
      userText: 'Tran Van Hung (Part & Team Leader)' 
    },
    { 
      role: 'LEC', 
      label: 'Bàn Điều Phối LEC', 
      icon: <Sliders className="w-5 h-5 shrink-0" />, 
      section: 'COORDINATION',
      userText: 'Pham Duc Long (658359 - LEC)',
      badgeCount: clarifications.filter(c => c.status !== 'RESOLVED').length,
      badgeColor: 'bg-rose-500 text-white'
    },
    { 
      role: 'WAREHOUSE', 
      label: 'Kho Phụ Tùng HW', 
      icon: <Warehouse className="w-5 h-5 shrink-0" />, 
      section: 'COORDINATION',
      userText: 'Storekeeper H1-H3 (Warehouse)' 
    },
    { 
      role: 'COST_MGMT', 
      label: 'Thẩm Định Ngày 25', 
      icon: <ShieldCheck className="w-5 h-5 shrink-0" />, 
      section: 'COORDINATION',
      userText: 'Management Reviewer' 
    },
    { 
      role: 'ADMIN', 
      label: 'Cài Đặt Hệ Thống', 
      icon: <Settings className="w-5 h-5 shrink-0" />, 
      section: 'SYSTEM',
      userText: 'System Administrator' 
    },
  ];

  const currentUserInfo = roleConfigs.find(r => r.role === currentRole);

  return (
    <aside 
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 ease-in-out flex flex-col border-r 
        ${isCollapsed ? 'w-20' : 'w-72'} 
        bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl`}
    >
      {/* 1. Brand & Plant Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="leading-tight truncate">
              <div className="text-xs font-black tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                LG DISPLAY
                <span className="text-[10px] px-1 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono font-bold">HW</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                OPS-WORKFLOW
              </div>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md">
            <Cpu className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isCollapsed ? 'hidden' : 'block'}`}
          title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Current User Profile Card */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/20">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-slate-300 dark:border-slate-600">
              {currentRole === 'LEC' ? 'PL' : currentRole === 'REQUESTOR' ? 'NT' : currentRole === 'LEADER' ? 'TH' : 'HW'}
            </div>
            <div className="overflow-hidden flex-1 leading-tight">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {currentUserInfo?.userText}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>HW Smart Watch L1</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs" title={currentUserInfo?.userText}>
              {currentRole === 'LEC' ? 'PL' : currentRole === 'REQUESTOR' ? 'NT' : 'HW'}
            </div>
          </div>
        )}
      </div>

      {/* 3. Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Group: ANALYTICS */}
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              Tổng Quan & Chỉ Số
            </div>
          )}
          <div className="space-y-1">
            {roleConfigs.filter(r => r.section === 'ANALYTICS').map(({ role, label, icon }) => {
              const isActive = currentRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setCurrentRole(role)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={label}
                >
                  {icon}
                  {!isCollapsed && <span className="truncate">{label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Group: ENGINEERING */}
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              Kỹ Thuật Hiện Trường
            </div>
          )}
          <div className="space-y-1">
            {roleConfigs.filter(r => r.section === 'ENGINEERING').map(({ role, label, icon, badgeCount, badgeColor }) => {
              const isActive = currentRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setCurrentRole(role)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={label}
                >
                  <div className="flex items-center gap-3 truncate">
                    {icon}
                    {!isCollapsed && <span className="truncate">{label}</span>}
                  </div>
                  {!isCollapsed && badgeCount && badgeCount > 0 ? (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${badgeColor}`}>
                      {badgeCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Group: COORDINATION & MANAGEMENT */}
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              Quản Trị & Điều Phối
            </div>
          )}
          <div className="space-y-1">
            {roleConfigs.filter(r => r.section === 'COORDINATION').map(({ role, label, icon, badgeCount, badgeColor }) => {
              const isActive = currentRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setCurrentRole(role)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={label}
                >
                  <div className="flex items-center gap-3 truncate">
                    {icon}
                    {!isCollapsed && <span className="truncate">{label}</span>}
                  </div>
                  {!isCollapsed && badgeCount && badgeCount > 0 ? (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${badgeColor}`}>
                      {badgeCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Group: SYSTEM */}
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              Hệ Thống & Quy Tắc
            </div>
          )}
          <div className="space-y-1">
            {roleConfigs.filter(r => r.section === 'SYSTEM').map(({ role, label, icon }) => {
              const isActive = currentRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setCurrentRole(role)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={label}
                >
                  {icon}
                  {!isCollapsed && <span className="truncate">{label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Footer & Controls */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
        {/* EMS Quick Simulation */}
        {!isCollapsed ? (
          <button 
            onClick={() => simulateEmsStockClearance('QCAD38190')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all"
            title="Mô phỏng EMS xuất kho giải phóng cờ Y->N"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Mô phỏng EMS Xuất Kho</span>
          </button>
        ) : (
          <button 
            onClick={() => simulateEmsStockClearance('QCAD38190')}
            className="w-full flex items-center justify-center p-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
            title="Mô phỏng EMS xuất kho"
          >
            <Zap className="w-4 h-4" />
          </button>
        )}

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all shadow-sm"
          title={theme === 'light' ? 'Chuyển sang Chế độ Tối (Dark Mode)' : 'Chuyển sang Chế độ Sáng (Light Mode)'}
        >
          <div className="flex items-center gap-2">
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-400" />
            )}
            {!isCollapsed && (
              <span>{theme === 'light' ? 'Giao Diện Sáng' : 'Giao Diện Tối'}</span>
            )}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-slate-500 dark:text-slate-400">
              {theme === 'light' ? 'Light' : 'Dark'}
            </span>
          )}
        </button>

        {/* Collapse toggle button at bottom */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Mở rộng sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
