import React, { useState } from 'react';
import { useProcurement } from '../context/ProcurementContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Menu,
  Clock,
  ExternalLink,
  Layers
} from 'lucide-react';

interface TopbarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ isSidebarCollapsed, onToggleSidebar }) => {
  const { currentRole, setCurrentRole, budget, clarifications, tasks } = useProcurement();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'COMMON': return { title: 'Tổng Quan Toàn Xưởng', subtitle: 'Universal Operations & Procurement Analytics' };
      case 'REQUESTOR': return { title: 'Cổng Kỹ Sư Công Đoạn', subtitle: 'Requestor Requisition & Late EBOM Declaration' };
      case 'EBOM': return { title: 'Kéo-Thả EBOM Slot Mapper', subtitle: 'Visual Equipment Hierarchy & Mechanism Slots' };
      case 'LEADER': return { title: 'Giám Sát Leader Công Đoạn', subtitle: 'Leader Monitoring & Work Order Appraisal' };
      case 'LEC': return { title: 'Bàn Làm Việc Điều Phối LEC', subtitle: 'Master Workbench, Interlock Y/N, RFQ & Budget' };
      case 'WAREHOUSE': return { title: 'Cổng Thủ Kho Nhà Máy HW', subtitle: 'Barcode EM No Scanning & Operational Issue Expense' };
      case 'COST_MGMT': return { title: 'Thẩm Định Chi Phí Ngày 25', subtitle: 'Monthly Management Audit & Scan Archive' };
      case 'ADMIN': return { title: 'Cấu Hình Quản Trị Hệ Thống', subtitle: 'Global System Settings & Multi-Plant Parameters' };
      default: return { title: 'Hệ Thống Mua Bán', subtitle: 'Ops-Workflow' };
    }
  };

  const activeRoleInfo = getRoleTitle(currentRole);
  const activeAlertsCount = tasks.filter(t => t.status === 'ACTIVE').length + clarifications.filter(c => c.status !== 'RESOLVED').length;

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Sidebar Toggle + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Đóng / Mở Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="leading-tight">
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-rose-500" />
                Factory HW (Smart Watch)
              </span>
              <span>/</span>
              <span>Org ID: 28753</span>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">{activeRoleInfo.title}</span>
            </div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {activeRoleInfo.subtitle}
            </h1>
          </div>
        </div>

        {/* Center: Quick Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm nhanh QCode (QDAB...), EM No (HWBMTL...), Tên Máy (DB-01)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
            />
          </div>
        </div>

        {/* Right: Status Pills, Theme Toggle, Notifications, Quick Actions */}
        <div className="flex items-center gap-2.5">
          {/* EMS Connection Pill */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>EMS Gateway: Online</span>
          </div>

          {/* Period Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
            <span>Kỳ: 2026-11</span>
          </div>

          {/* Theme Switcher in Topbar */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700/70"
            title={theme === 'light' ? 'Chuyển sang Giao Diện Tối (Dark Mode)' : 'Chuyển sang Giao Diện Sáng (Light Mode)'}
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700/70"
              title="Thông báo công việc cần xử lý"
            >
              <Bell className="w-4 h-4" />
              {activeAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {activeAlertsCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-rose-500" />
                    Cần Xử Lý ({activeAlertsCount})
                  </h4>
                  <span className="text-[10px] text-slate-400">Thời gian thực</span>
                </div>

                <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                  {tasks.filter(t => t.status === 'ACTIVE').map(t => (
                    <div key={t.id} className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200">
                      <div className="font-bold text-[11px] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        {t.title}
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {t.details}
                      </div>
                    </div>
                  ))}

                  {clarifications.filter(c => c.status !== 'RESOLVED').map(c => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/40 text-cyan-900 dark:text-cyan-200">
                      <div className="font-bold text-[11px]">
                        Hỏi đáp mã {c.qCode}: {c.partName}
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                        "{c.reviewerQuestion}"
                      </div>
                    </div>
                  ))}

                  {activeAlertsCount === 0 && (
                    <div className="text-center py-6 text-slate-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                      Không có công việc tồn đọng.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
