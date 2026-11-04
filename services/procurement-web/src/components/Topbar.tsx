import React, { useState } from 'react';
import { useProcurement, availableLecs } from '../context/ProcurementContext';
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
  UserCheck,
  ChevronDown
} from 'lucide-react';

interface TopbarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ isSidebarCollapsed, onToggleSidebar }) => {
  const { currentRole, budget, clarifications, tasks, activeLec, setActiveLec } = useProcurement();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLecDropdown, setShowLecDropdown] = useState(false);

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'COMMON': return { title: 'Dashboard Tổng Quan', subtitle: 'Phễu Mua Sắm 7 Giai Đoạn, Ngân Sách SG & 6 Mã Over' };
      case 'REQUESTOR': return { title: 'Cổng Kỹ Sư Hiện Trường', subtitle: 'Đăng Ký Theo Tên Thân Thiện, Tải Folder QCode & Hộp Thư Tác Vụ' };
      case 'EBOM': return { title: 'Visual EBOM Explorer', subtitle: 'Cây Thiết Bị Trực Quan & Kéo-Thả Gán Slot Linh Kiện' };
      case 'LEADER': return { title: 'Giám Sát Trưởng Part/Team', subtitle: 'Theo Dõi Tiến Độ Team => Part & Đối Soát WO (Không Nút Phê Duyệt)' };
      case 'LEC': return { title: 'Bàn Điều Phối LEC Master', subtitle: 'Gom Mẻ, Quét Interlock, Đánh Dấu Target/Over & Cầu Nối 3 Bên' };
      case 'COST_MGMT': return { title: 'Thẩm Định Quản Lý Chi Phí', subtitle: 'Kiểm Thảo Đầu Tháng (01-05), Đối Soát QCode & Xuất Excel 4 Sheet' };
      case 'ADMIN': return { title: 'Cài Đặt Hệ Thống', subtitle: 'Cấu Trúc Tầng, Cây Multi-Team, Định Mức Nhu Cầu & Giới Hạn Tần Suất' };
      default: return { title: 'Hệ Thống Mua Sắm Ops-Workflow', subtitle: 'Factory HW Smart Watch' };
    }
  };

  const activeRoleInfo = getRoleTitle(currentRole);
  const activeAlertsCount = tasks.filter(t => t.status === 'ACTIVE').length + clarifications.filter(c => c.status !== 'RESOLVED').length;

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
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
              <span>PO Module Tech Team 2</span>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{activeRoleInfo.title}</span>
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
              placeholder="Tìm kiếm QCode (QDAB...), EM No (HWBMTL...), Tên máy (DB-01)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
            />
          </div>
        </div>

        {/* Right: Status Pills, Multi-LEC Switcher, Theme Toggle, Notifications */}
        <div className="flex items-center gap-2.5">
          {/* Multi-LEC Selector (Visible in LEC role or always accessible) */}
          <div className="relative">
            <button
              onClick={() => setShowLecDropdown(!showLecDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
              title="Đổi hồ sơ LEC trực ban"
            >
              <div className="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-[10px]">
                LEC
              </div>
              <span className="hidden sm:inline">{activeLec.name} ({activeLec.empNo})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showLecDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  Chọn Chuyên Viên LEC Trực Ban
                </div>
                {availableLecs.map(lec => (
                  <button
                    key={lec.id}
                    onClick={() => {
                      setActiveLec(lec);
                      setShowLecDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      activeLec.id === lec.id ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div>{lec.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">MSNV: {lec.empNo} • {lec.phone}</div>
                    </div>
                    {activeLec.id === lec.id && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* EMS Connection Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>EMS: Đồng Bộ Trực Tiếp</span>
          </div>

          {/* Period Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Kỳ: {budget.periodMonth}</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
              title="Thông báo tác vụ & yêu cầu giải trình"
            >
              <Bell className="w-4 h-4" />
              {activeAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {activeAlertsCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Cảnh Báo & Tác Vụ Cần Xử Lý ({activeAlertsCount})
                  </div>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Đóng
                  </button>
                </div>

                <div className="py-2 space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  {tasks.filter(t => t.status === 'ACTIVE').map(t => (
                    <div 
                      key={t.id} 
                      className={`p-2.5 rounded-xl border text-xs ${
                        t.type === 'INTER_TEAM_BORROW'
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                      }`}
                    >
                      <div className="font-bold mb-1 flex items-center justify-between">
                        <span>{t.qCode} • {t.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/60 dark:bg-black/40">
                          Hạn: {t.deadline}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90">{t.details}</p>
                    </div>
                  ))}

                  {clarifications.filter(c => c.status !== 'RESOLVED').map(c => (
                    <div 
                      key={c.id} 
                      className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs"
                    >
                      <div className="font-bold mb-1 flex items-center justify-between">
                        <span>Thắc mắc thẩm định ({c.qCode})</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                          {c.status}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90">{c.reviewerQuestion}</p>
                    </div>
                  ))}

                  {activeAlertsCount === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      Không có tác vụ tồn đọng hoặc cảnh báo nào.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
            title={`Chuyển sang chế độ ${theme === 'light' ? 'Tối' : 'Sáng'}`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
