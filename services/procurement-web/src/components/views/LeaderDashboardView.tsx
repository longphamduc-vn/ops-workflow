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
  FileText
} from 'lucide-react';

export const LeaderDashboardView: React.FC = () => {
  const { requisitions, tasks, budget } = useProcurement();
  const [selectedPartFilter, setSelectedPartFilter] = useState<string>('ALL');
  const [selectedItemForInspect, setSelectedItemForInspect] = useState<any | null>(null);

  const filteredRequisitions = requisitions.filter(r => {
    if (selectedPartFilter === 'ALL') return true;
    return r.partGroup === selectedPartFilter;
  });

  const activeTasks = tasks.filter(t => t.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* 1. Principle Callout Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              UI-ROLE-02: Bàn Giám Sát Của Leader Công Đoạn (Leader Dashboard)
            </h2>
            <Badge variant="neutral">Phạm vi: Team =&gt; Part Scope</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Giám sát kỹ thuật: <strong className="text-slate-800 dark:text-slate-200">PO Module Technology Team 2</strong> (CP/SG Part 1 & Part 2) | Quản trị không gian Peer Engineers.
          </p>
        </div>

        {/* Notice */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold">
          <Ban className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Giám sát hiện trường & duyệt Work Order (Ký duyệt PRV chính thức trên EMS).</span>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng Đơn Hàng Của Team</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {requisitions.length} <span className="text-xs font-normal text-slate-400">mục</span>
          </div>
          <div className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-1 font-medium">7 đang xử lý | 2 có thể mua</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Giá Trị Trong Target (Kế Hoạch)</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ${budget.withinTargetSpend.toLocaleString()} USD
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">81.3% trần ngân sách tháng</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Giá Trị Over Cần Kiểm Thảo</div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            ${budget.unplannedOverSpend.toLocaleString()} USD
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">18.7% cần giải trình ngày 25</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Task Kỹ Sư Cần Rà Soát</div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {activeTasks.length} <span className="text-xs font-normal text-slate-400">chờ duyệt</span>
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-500 mt-1 font-medium">1 mượn kho team bạn | 2 giải trình tồn</div>
        </div>
      </div>

      {/* 3. Requisitions Monitoring Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Giám Sát Tiến Độ Toàn Bộ Yêu Cầu Mua Trong Team
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Lọc Phân Ban:</span>
            <select
              value={selectedPartFilter}
              onChange={e => setSelectedPartFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
            >
              <option value="ALL">Tất Cả Phân Ban (Part 1 & 2)</option>
              <option value="CP/SG Part 1">CP/SG Part 1 (Nguyễn Văn Thắng)</option>
              <option value="CP/SG Part 2">CP/SG Part 2 (Lê Hoàng Quân)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 uppercase">
                <th className="py-2.5 px-3">Mã Phiếu / QCode</th>
                <th className="py-2.5 px-3">Tên Phụ Tùng & Maker</th>
                <th className="py-2.5 px-3">Vị Trí Máy Thân Thiện</th>
                <th className="py-2.5 px-3">Kỹ Sư Tạo</th>
                <th className="py-2.5 px-3">Trạng Thái Hệ Thống</th>
                <th className="py-2.5 px-3">LEC Đánh Dấu</th>
                <th className="py-2.5 px-3">Tiến Độ Purchase</th>
                <th className="py-2.5 px-3 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredRequisitions.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{item.id}</span>
                    <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono">{item.qCode}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{item.partName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.maker} {item.model}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-800 dark:text-slate-200 font-medium">{item.machineFriendlyName}</div>
                    <div className="text-[11px] text-slate-400">{item.lineName}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{item.requestorName}</div>
                    <div className="text-[10px] text-slate-400">{item.partGroup}</div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={
                      item.status === 'CROSS_TEAM_STOCK' ? 'warning' :
                      item.status === 'PURCHASABLE' ? 'success' :
                      item.status === 'EOL' ? 'danger' : 'neutral'
                    }>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    {item.planClassification === 'TARGET' && <Badge variant="success">TRONG TARGET</Badge>}
                    {item.planClassification === 'OVER' && <Badge variant="danger">OVER ({item.overReasonCode})</Badge>}
                    {item.planClassification === 'UNCLASSIFIED' && <Badge variant="neutral">CHỜ LEC ĐÁNH DẤU</Badge>}
                  </td>
                  <td className="py-3 px-3 text-[11px]">
                    {item.vendorConfirmDate ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        Đã chốt: {item.vendorConfirmDate} (ETA: {item.etaDate})
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Đang chờ Purchase đàm phán</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedItemForInspect(item)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedItemForInspect && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-500" />
                Hồ Sơ Chi Tiết Yêu Cầu: {selectedItemForInspect.id}
              </h4>
              <button 
                onClick={() => setSelectedItemForInspect(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Thông tin phụ tùng:</span>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedItemForInspect.partName} ({selectedItemForInspect.qCode})</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{selectedItemForInspect.maker} | {selectedItemForInspect.model}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400">Máy vận hành:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedItemForInspect.machineFriendlyName}</div>
                </div>
                <div>
                  <span className="text-slate-400">Dây chuyền:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedItemForInspect.lineName}</div>
                </div>
                <div>
                  <span className="text-slate-400">Số lượng đặt:</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedItemForInspect.quantity} {selectedItemForInspect.unit}</div>
                </div>
                <div>
                  <span className="text-slate-400">Thành tiền:</span>
                  <div className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                    ${(selectedItemForInspect.quantity * selectedItemForInspect.estimatedUnitPrice).toLocaleString()} USD
                  </div>
                </div>
              </div>

              {selectedItemForInspect.planClassification === 'OVER' && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
                  <div className="font-bold">Mã nguyên nhân Over: {selectedItemForInspect.overReasonCode}</div>
                  <div className="text-[11px] mt-0.5">Mã Work Order sự cố: {selectedItemForInspect.workOrderNo}</div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 italic">Leader giám sát và xác nhận Work Order; ký PRV trên EMS.</span>
              <button
                onClick={() => setSelectedItemForInspect(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-semibold text-xs transition-colors"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
