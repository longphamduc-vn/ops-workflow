import React from 'react';
import { useProcurement } from '../context/ProcurementContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Wrench, 
  ClipboardCheck, 
  Sliders, 
  ShieldCheck, 
  Network, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Cpu,
  Layers,
  Zap,
  Activity,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { 
    currentRole, 
    setCurrentRole, 
    tasks, 
    clarifications, 
    qcodeSubmissions,
    activeLec, 
    setActiveLec,
    simulateEmsStockClearance 
  } = useProcurement();
  const { theme, toggleTheme } = useTheme();

  const roleConfigs: { 
    role: UserRole; 
    label: string; 
    icon: React.ReactNode; 
    section: 'ANALYTICS' | 'ENGINEERING' | 'COORDINATION' | 'GOVERNANCE';
    userText: string;
    badgeCount?: number;
    badgeColor?: string;
  }[] = [
    { 
      role: 'COMMON', 
      label: 'Dashboard Tổng Quan', 
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />, 
      section: 'ANALYTICS',
      userText: 'Plant-Wide Analytics (HW)' 
    },
    { 
      role: 'REQUESTOR', 
      label: 'Cổng Kỹ Sư Hiện Trường', 
      icon: <Wrench className="w-5 h-5 shrink-0" />, 
      section: 'ENGINEERING',
      userText: 'Nguyễn Văn Thắng (Kỹ sư Hiện trường)',
      badgeCount: tasks.filter(t => t.status === 'ACTIVE').length,
      badgeColor: 'bg-amber-500 text-white'
    },
    { 
      role: 'EBOM', 
      label: 'Visual EBOM Explorer', 
      icon: <Network className="w-5 h-5 shrink-0" />, 
      section: 'ENGINEERING',
      userText: 'Cây Cơ Cấu Kéo - Thả' 
    },
    { 
      role: 'LEADER', 
      label: 'Giám Sát Trưởng Part/Team', 
      icon: <ClipboardCheck className="w-5 h-5 shrink-0" />, 
      section: 'COORDINATION',
      userText: 'Trần Văn Hùng (Leader Part 1 & 2)' 
    },
    { 
      role: 'LEC', 
      label: 'Bàn Điều Phối LEC Master', 
      icon: <Sliders className="w-5 h-5 shrink-0" />, 
      section: 'COORDINATION',
      userText: `${activeLec.name} (${activeLec.empNo})`,
      badgeCount: qcodeSubmissions.filter(s => s.status === 'PENDING_LEC_REGISTRATION').length + clarifications.filter(c => c.status === 'PENDING_LEC').length,
      badgeColor: 'bg-rose-500 text-white'
    },
    { 
      role: 'COST_MGMT', 
      label: 'Thẩm Định Quản Lý Chi Phí', 
      icon: <ShieldCheck className="w-5 h-5 shrink-0" />, 
      section: 'GOVERNANCE',
      userText: 'Trần Thị Hường (Cost Reviewer - 1 Người)',
      badgeCount: clarifications.filter(c => c.status === 'ENGINEER_REPLIED').length,
      badgeColor: 'bg-indigo-500 text-white'
    },
    { 
      role: 'ADMIN', 
      label: 'Cài Đặt Hệ Thống', 
      icon: <Settings className="w-5 h-5 shrink-0" />, 
      section: 'GOVERNANCE',
      userText: 'Quản Trị Viên Hệ Thống' 
    },
  ];

  const sections: { key: 'ANALYTICS' | 'ENGINEERING' | 'COORDINATION' | 'GOVERNANCE'; label: string }[] = [
    { key: 'ANALYTICS', label: 'TỔNG QUAN VẬN HÀNH' },
    { key: 'ENGINEERING', label: 'KỸ SƯ & THIẾT BỊ' },
    { key: 'COORDINATION', label: 'ĐIỀU PHỐI & GIÁM SÁT' },
    { key: 'GOVERNANCE', label: 'THẨM ĐỊNH & HỆ THỐNG' },
  ];

  const currentUserInfo = roleConfigs.find(r => r.role === currentRole);

  return (
    <aside 
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 ease-in-out flex flex-col border-r 
        ${isCollapsed ? 'w-20' : 'w-72'} 
        bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl`}
    >
      {/* 1. Brand & Plant Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="leading-tight truncate">
              <div className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>LGD OPS-FLOW</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                Factory HW • Smart Watch
              </p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Cpu className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            isCollapsed ? 'hidden' : 'block'
          }`}
          title="Thu gọn Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Active Role & Profile Card */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20">
        {!isCollapsed ? (
          <div className="rounded-xl p-2.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200 dark:border-emerald-800">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
                  Đang thao tác vai trò
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {currentUserInfo?.label}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUserInfo?.userText}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full flex justify-center py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Mở rộng Sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 3. Navigation List grouped by Operational Section */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scrollbar">
        {sections.map(sec => {
          const items = roleConfigs.filter(r => r.section === sec.key);
          if (items.length === 0) return null;

          return (
            <div key={sec.key} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                  {sec.label}
                </div>
              )}
              {items.map(item => {
                const isActive = currentRole === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => setCurrentRole(item.role)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <span className={`${isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`}>
                      {item.icon}
                    </span>
                    
                    {!isCollapsed && (
                      <span className="flex-1 text-left truncate">
                        {item.label}
                      </span>
                    )}

                    {!isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                        {item.badgeCount}
                      </span>
                    )}

                    {isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* 4. EMS Parallel Sync Quick Simulator Widget */}
      {!isCollapsed && (
        <div className="p-3 mx-2 mb-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              Mô phỏng EMS Song Song
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              5 req/s
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mb-2">
            Thử nghiệm mở khóa Interlock khi kho Team bạn xuất hết hàng:
          </p>
          <button
            onClick={() => simulateEmsStockClearance('QCAD38190')}
            className="w-full text-center py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-medium text-[11px] border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            Đồng bộ EMS Cờ = 'N' (QCAD38190)
          </button>
        </div>
      )}

      {/* 5. Footer: System Info & Theme Toggle */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Nexacro EMS: <span className="text-emerald-600 dark:text-emerald-400 font-bold">READY</span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
              title={`Chuyển sang chế độ ${theme === 'light' ? 'Tối' : 'Sáng'}`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </>
        ) : (
          <button
            onClick={toggleTheme}
            className="mx-auto p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
            title={`Chuyển sang chế độ ${theme === 'light' ? 'Tối' : 'Sáng'}`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        )}
      </div>
    </aside>
  );
};
