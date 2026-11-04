import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { 
  ClipboardCheck, 
  Eye, 
  Ban,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Search,
  Wrench,
  FileText,
  Users,
  Clock,
  Flame,
  CheckSquare,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  X
} from 'lucide-react';
import { RequisitionItem } from '../../types';

export const LeaderDashboardView: React.FC = () => {
  const { requisitions, tasks, budget, agingJustifications } = useProcurement();
  const [selectedPartFilter, setSelectedPartFilter] = useState<string>('ALL');
  const [selectedItemForInspect, setSelectedItemForInspect] = useState<RequisitionItem | null>(null);
  const [activeTab, setActiveTab] = useState<'REQUISITIONS' | 'AGING_COMPLIANCE' | 'OVER_ANALYSIS'>('REQUISITIONS');

  const filteredRequisitions = requisitions.filter(r => {
    if (selectedPartFilter === 'ALL') return true;
    return r.partGroup === selectedPartFilter;
  });

  const activeTasks = tasks.filter(t => t.status === 'ACTIVE');

  // Breakdown of engineers in Team 2
  const engineers = [
    { name: 'Nguyen Van Thang', part: 'CP/SG Part 1', count: requisitions.filter(r => r.requestorName === 'Nguyen Van Thang').length, pendingTasks: tasks.filter(t => t.engineerName === 'Nguyen Van Thang' && t.status === 'ACTIVE').length },
    { name: 'Le Hoang Quan', part: 'CP/SG Part 1', count: requisitions.filter(r => r.requestorName === 'Le Hoang Quan').length, pendingTasks: tasks.filter(t => t.engineerName === 'Le Hoang Quan' && t.status === 'ACTIVE').length },
    { name: 'Tran Duc Minh', part: 'CP/SG Part 2', count: requisitions.filter(r => r.requestorName === 'Tran Duc Minh').length, pendingTasks: tasks.filter(t => t.engineerName === 'Tran Duc Minh' && t.status === 'ACTIVE').length },
    { name: 'Pham Van Kien', part: 'CP/SG Part 2', count: requisitions.filter(r => r.requestorName === 'Pham Van Kien').length, pendingTasks: tasks.filter(t => t.engineerName === 'Pham Van Kien' && t.status === 'ACTIVE').length },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Non-Approval Rule Reminder */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 shrink-0">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                UI-ROLE-02: Dashboard Giám Sát Trưởng Nhóm / Part (Leader Dashboard)
              </h2>
              <Badge variant="neutral">Phạm vi: Team =&gt; Part Scope</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Phòng ban: <strong className="text-slate-800 dark:text-slate-200">PO Module Technology Team 2</strong> (CP/SG Part 1 & Part 2) • Mối quan hệ Đồng nghiệp ngang hàng.
            </p>
          </div>
        </div>

        {/* Golden Rule 1: No Approval Banner */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold shadow-xs">
          <Ban className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Nguyên tắc vàng #1:</strong> Mọi ký duyệt PRV & phê duyệt ngân sách thực hiện 100% trên Nexacro EMS. Giao diện này phục vụ theo dõi và đối soát kỹ thuật nội bộ.
          </span>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng Đơn Hàng Của Team</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {requisitions.length} <span className="text-xs font-normal text-slate-400">hạng mục</span>
          </div>
          <div className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-1 font-medium">
            CP/SG Part 1: {requisitions.filter(r => r.partGroup === 'CP/SG Part 1').length} • Part 2: {requisitions.filter(r => r.partGroup === 'CP/SG Part 2').length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Giá Trị Trong Định Mức (Target)</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ${budget.withinTargetSpend.toLocaleString()} USD
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {((budget.withinTargetSpend / budget.monthlyAllocationBudget) * 100).toFixed(1)}% ngân sách tháng
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Giá Trị Over Cần Kiểm Thảo</div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            ${budget.unplannedOverSpend.toLocaleString()} USD
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
            Có {requisitions.filter(r => r.planClassification === 'OVER').length} hạng mục gắn mã WO sự cố
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tác Vụ Kỹ Sư Cần Rà Soát</div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {activeTasks.length} <span className="text-xs font-normal text-slate-400">tác vụ</span>
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-500 mt-1 font-medium">
            Hạn chót giải trình: <strong>{budget.justificationDeadline}</strong>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs for Leader */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
        {[
          { id: 'REQUISITIONS', label: '1. Giám Sát Tiến Độ Team => Part', count: filteredRequisitions.length },
          { id: 'AGING_COMPLIANCE', label: '2. Tỷ Lệ Hoàn Thành Giải Trình Tồn Kho', count: tasks.filter(t => t.type === 'AGING_JUSTIFICATION').length },
          { id: 'OVER_ANALYSIS', label: '3. Đối Soát Mã Work Order & Nguyên Nhân Over', count: requisitions.filter(r => r.planClassification === 'OVER').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === tab.id ? 'bg-white text-purple-600' : 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 4. TAB 1: Team & Part Requisition Progress Table */}
      {activeTab === 'REQUISITIONS' && (
        <div className="space-y-4">
          {/* Peer Engineers Quick Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {engineers.map(eng => (
              <div key={eng.name} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <div className="font-bold text-slate-900 dark:text-white truncate">{eng.name}</div>
                <div className="text-[11px] text-slate-400 mb-2">{eng.part}</div>
                <div className="flex justify-between items-center text-[11px]">
                  <span>Đơn mua: <strong>{eng.count}</strong></span>
                  <span className={eng.pendingTasks > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
                    Tồn đọng: {eng.pendingTasks}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Chi Tiết Yêu Cầu Mua Toàn Team (PO Module 2)
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Lọc Part:</span>
                <select
                  value={selectedPartFilter}
                  onChange={(e) => setSelectedPartFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value="ALL">Tất Cả Part</option>
                  <option value="CP/SG Part 1">CP/SG Part 1 (Tầng 2F)</option>
                  <option value="CP/SG Part 2">CP/SG Part 2 (Tầng 3F)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Mã PR / QCode</th>
                    <th className="p-3">Tên Linh Kiện</th>
                    <th className="p-3">Thiết Bị & Chuyền</th>
                    <th className="p-3">Kỹ Sư Đăng Ký</th>
                    <th className="p-3">Số Lượng & Giá</th>
                    <th className="p-3">Phân Loại Kế Hoạch</th>
                    <th className="p-3">Trạng Thái</th>
                    <th className="p-3 text-right">Xem Xét Kỹ Thuật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRequisitions.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white font-mono">{r.id}</div>
                        <div className="text-[11px] font-mono text-slate-400">{r.qCode}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">{r.partName}</div>
                        <div className="text-[10px] text-slate-400">{r.maker} • {r.model}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{r.machineFriendlyName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">EM: {r.emNo} ({r.lineName})</div>
                      </td>
                      <td className="p-3">
                        <div>{r.requestorName}</div>
                        <div className="text-[10px] text-slate-400">{r.partGroup}</div>
                      </td>
                      <td className="p-3 font-mono">
                        <div>{r.quantity} {r.unit}</div>
                        <div className="text-[10px] text-slate-400 font-bold">${(r.quantity * r.estimatedUnitPrice).toLocaleString()}</div>
                      </td>
                      <td className="p-3">
                        {r.planClassification === 'TARGET' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            TARGET
                          </span>
                        ) : r.planClassification === 'OVER' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            OVER • {r.overReasonCode}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Chờ LEC đánh dấu</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={
                            r.status === 'PURCHASABLE' || r.status === 'EMS_APPROVED' ? 'success' :
                            r.status === 'CROSS_TEAM_STOCK' ? 'warning' :
                            r.status === 'EOL' ? 'error' : 'default'
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedItemForInspect(r)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                        >
                          Kiểm Tra WO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: Aging Justification Compliance Tracking */}
      {activeTab === 'AGING_COMPLIANCE' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Theo Dõi Tiến Độ Giải Trình Tồn Kho Đầu Tháng Của Kỹ Sư
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Hạn chót do LEC thiết lập: <strong className="text-rose-600 font-mono">{budget.justificationDeadline}</strong>. Leader đôn đốc kỹ sư nộp văn bản giải trình trước khi chuyển sang Quản lý Chi phí kiểm thảo.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Mã Tác Vụ</th>
                    <th className="p-3">QCode & Tên Linh Kiện</th>
                    <th className="p-3">Kỹ Sư Phụ Trách</th>
                    <th className="p-3">Hạn Chót</th>
                    <th className="p-3">Trạng Thái Nộp</th>
                    <th className="p-3">Nội Dung Giải Trình</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tasks.filter(t => t.type === 'AGING_JUSTIFICATION').map(t => {
                    const isSubmitted = t.status === 'RESOLVED';

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{t.id}</td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{t.qCode}</div>
                          <div className="text-[10px] text-slate-400">{t.partName}</div>
                        </td>
                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{t.engineerName}</td>
                        <td className="p-3 font-mono text-rose-600 font-bold">{t.deadline}</td>
                        <td className="p-3">
                          {isSubmitted ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Đã nộp giải trình
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 w-max">
                              Chưa hoàn thành
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-[11px] text-slate-600 dark:text-slate-300 max-w-sm">
                          {t.justificationText || <span className="italic text-slate-400">Kỹ sư chưa nhập lý do</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: Over Analysis & Work Orders */}
      {activeTab === 'OVER_ANALYSIS' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              Đối Soát Các Hạng Mục Ngoài Kế Hoạch (Over) & Mã Work Order
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Leader rà soát tính xác thực của sự cố dừng máy hoặc tăng sản lượng trước phiên họp kiểm thảo đầu tháng với Quản lý Chi phí.
            </p>

            <div className="space-y-3">
              {requisitions.filter(r => r.planClassification === 'OVER').map(item => (
                <div key={item.id} className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <span className="font-mono text-slate-900 dark:text-white">{item.id} • {item.qCode}</span>
                      <span className="text-rose-600 font-bold px-2 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-[10px]">
                        {item.overReasonCode}
                      </span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-semibold">{item.partName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Máy: <strong>{item.machineFriendlyName}</strong> • Kỹ sư: <strong>{item.requestorName}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Mã Work Order:</span>
                      <strong className="font-mono text-blue-600 dark:text-blue-400 font-bold">{item.workOrderNo || 'N/A'}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Giá trị:</span>
                      <strong className="font-mono text-rose-600 font-black text-sm">${(item.quantity * item.estimatedUnitPrice).toLocaleString()}</strong>
                    </div>
                    <button
                      onClick={() => setSelectedItemForInspect(item)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs cursor-pointer"
                    >
                      Kiểm Tra Hồ Sơ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. Work Order Inspector Modal */}
      {selectedItemForInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Kiểm Tra Kỹ Thuật Hồ Sơ Work Order
              </h4>
              <button 
                onClick={() => setSelectedItemForInspect(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div><span className="text-slate-400">Mã yêu cầu:</span> <strong className="font-mono">{selectedItemForInspect.id}</strong></div>
                <div><span className="text-slate-400">Linh kiện:</span> <strong className="font-mono">{selectedItemForInspect.qCode}</strong> — {selectedItemForInspect.partName}</div>
                <div><span className="text-slate-400">Thiết bị:</span> {selectedItemForInspect.machineFriendlyName} ({selectedItemForInspect.lineName})</div>
                <div><span className="text-slate-400">Mã EM 14 ký tự:</span> <code className="font-mono font-bold">{selectedItemForInspect.emNo}</code></div>
                <div><span className="text-slate-400">Mã Work Order sự cố:</span> <strong className="font-mono text-blue-600">{selectedItemForInspect.workOrderNo || 'Chưa gán WO'}</strong></div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                <span className="font-bold block mb-1">Ghi Chú Kỹ Thuật Leader:</span>
                <p className="leading-relaxed">
                  Thiết bị gặp sự cố ngoài giờ hành chính ca đêm. Kỹ sư đã tiến hành cô lập lỗi và xác nhận linh kiện hỏng không thể phục hồi. Khuyến nghị Quản lý Chi phí phê chuẩn mã Over trong kỳ kiểm thảo đầu tháng.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedItemForInspect(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold"
                >
                  Đóng Hộp Thoại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
