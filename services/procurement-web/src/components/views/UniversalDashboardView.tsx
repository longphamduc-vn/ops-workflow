import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { 
  DollarSign, 
  Clock, 
  Package, 
  ShieldAlert,
  Flame,
  AlertOctagon,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export const UniversalDashboardView: React.FC = () => {
  const { requisitions, budget } = useProcurement();
  const [selectedOverFilter, setSelectedOverFilter] = useState<string>('ALL');
  const [exportNotice, setExportNotice] = useState(false);

  const overRequisitions = requisitions.filter(r => {
    if (r.planClassification !== 'OVER') return false;
    if (selectedOverFilter === 'ALL') return true;
    return r.overReasonCode === selectedOverFilter;
  });

  const handleExportExcel = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Principle Callout Alert Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                UI-COMMON-00: Tổng Quan Tiến Độ & Báo Cáo Phân Tích Toàn Xưởng
              </h2>
              <Badge variant="info">Factory HW - Smart Watch</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kết nối thời gian thực giữa Nhu Cầu Kỹ Sư, Thẩm Định Đầu Tháng Ngày 25, Tiến Độ Mua Hàng Purchase và Cổng EMS Gateway.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="text-right text-xs bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Nguyên Tắc Ngân Sách:</span>{' '}
            <strong className="text-amber-600 dark:text-amber-400 font-mono">Tuyệt Đối Không Dồn Số Dư (No Rollover)</strong>
          </div>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
            title="Xuất file Excel báo cáo tổng hợp thẩm định"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel Ngày 25</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Đã xuất thành công file <strong>Bao_Cao_Tong_Hop_Tham_Dinh_T11_2026.xlsx</strong> gồm 4 sheet tiêu chuẩn theo quy định Ban Giám Đốc!</span>
        </div>
      )}

      {/* 2. Procurement Funnel & Progress Pipeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            1. Phễu Tiến Độ Mua Hàng 7 Giai Đoạn (End-to-End Milestones)
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Thời gian trung bình: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">9.4 Ngày</strong> | Đúng Hạn (OTD): <strong className="text-emerald-600 dark:text-emerald-400 font-bold">92.8%</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {[
            { step: '1. Đăng Ký Yêu Cầu', count: requisitions.length, color: 'border-cyan-200 dark:border-cyan-900/60 bg-cyan-50/70 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300' },
            { step: '2. Quét Interlock', count: requisitions.filter(r => r.status !== 'DRAFT').length, color: 'border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300' },
            { step: '3. Thẩm Định Ngày 25', count: requisitions.filter(r => r.status === 'PURCHASABLE' || r.planClassification !== 'UNCLASSIFIED').length, color: 'border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300' },
            { step: '4. Duyệt Lên EMS', count: requisitions.filter(r => r.status === 'EMS_APPROVED' || r.status === 'INBOUND_TRACKING').length, color: 'border-purple-200 dark:border-purple-900/60 bg-purple-50/70 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300' },
            { step: '5. NCC Xác Nhận', count: requisitions.filter(r => !!r.vendorConfirmDate).length, color: 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300' },
            { step: '6. Hàng Về Kho HW', count: requisitions.filter(r => !!r.etaDate).length, color: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' },
            { step: '7. Xuất Lắp Máy (WO)', count: requisitions.filter(r => r.status === 'ISSUED').length, color: 'border-emerald-300 dark:border-emerald-800 bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold' },
          ].map((item, idx) => (
            <div key={idx} className={`p-3 rounded-xl border flex flex-col justify-between transition-transform hover:-translate-y-0.5 ${item.color}`}>
              <div className="text-[11px] font-medium truncate">{item.step}</div>
              <div className="text-xl font-bold font-mono mt-2">
                {item.count} <span className="text-[11px] font-normal opacity-70">mục</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Inventory Aging & 3-Axis SG Budget Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Aging Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              2. Phân Bổ Tồn Kho & Kiểm Thảo Hàng Tháng
            </h3>
            <Badge variant="warning">Kho HW (H1 - H3)</Badge>
          </div>

          <div className="mb-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">Tổng Giá Trị Tồn Kho Vật Lý Tại Xưởng HW:</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              $286,400 <span className="text-xs font-normal text-slate-400">USD</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
              <div className="text-xs text-slate-500 dark:text-slate-400">&lt; 30 Ngày</div>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">$214,000</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold mt-0.5">74.7% (An Toàn)</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
              <div className="text-xs text-slate-500 dark:text-slate-400">30 - 60 Ngày</div>
              <div className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">$54,200</div>
              <div className="text-[10px] text-amber-600 dark:text-amber-500 font-semibold mt-0.5">18.9% (Theo Dõi)</div>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40">
              <div className="text-xs text-slate-500 dark:text-slate-400">&gt; 60 Ngày</div>
              <div className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono mt-1">$18,200</div>
              <div className="text-[10px] text-rose-600 dark:text-rose-500 font-semibold mt-0.5">6.4% (Tồn Đọng)</div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Tiến độ nộp Task giải trình tồn kho: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">14/16 Task Hoàn Tất</strong></span>
            <span>Hạn nộp: <strong className="text-amber-600 dark:text-amber-400 font-mono">{budget.justificationDeadline}</strong></span>
          </div>
        </div>

        {/* 3-Axis SG Budget Balance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              3. Cân Đối 3 Trục Ngân Sách SG (Thủ Công & No-Rollover)
            </h3>
            <Badge variant="danger">Tháng Nào Khóa Tháng Đó</Badge>
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">1. Hạn Mức Ngân Sách Tháng (LEC Nhập Thủ Công):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">${budget.monthlyAllocationBudget.toLocaleString()} USD</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 dark:bg-slate-600 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">2. Cam Kết Chi Mua (PO Commit Spend):</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  ${budget.poCommitSpend.toLocaleString()} USD ({(budget.poCommitSpend / budget.monthlyAllocationBudget * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${Math.min(100, budget.poCommitSpend / budget.monthlyAllocationBudget * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">3. Chi Phí Xuất Kho Thực Tế (Tự động đồng bộ từ EMS):</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ${budget.emsIssueExpense.toLocaleString()} USD ({(budget.emsIssueExpense / budget.monthlyAllocationBudget * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${Math.min(100, budget.emsIssueExpense / budget.monthlyAllocationBudget * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Chi Trong Target (Kế Hoạch):</span>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                ${budget.withinTargetSpend.toLocaleString()} USD
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Phát Sinh Over Ngoài Kế Hoạch:</span>
              <div className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                ${budget.unplannedOverSpend.toLocaleString()} USD
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Deep Root-Cause Over Analysis */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            4. Phân Tích Chi Tiết 6 Mã Nguyên Nhân Gây Over (Tổng Over: ${budget.unplannedOverSpend.toLocaleString()} USD)
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Lọc theo mã:</span>
            <select
              value={selectedOverFilter}
              onChange={(e) => setSelectedOverFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">Tất Cả 6 Mã (ALL)</option>
              <option value="OVR-01">OVR-01: Sự cố máy hỏng (Breakdown)</option>
              <option value="OVR-02">OVR-02: Sản lượng tăng đột biến</option>
              <option value="OVR-03">OVR-03: Pháp nhân bạn chậm chuyển giao</option>
              <option value="OVR-04">OVR-04: Setup Model D222 mới</option>
              <option value="OVR-05">OVR-05: Nhà cung cấp tăng giá</option>
              <option value="OVR-06">OVR-06: Hư hại thao tác lắp máy</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { code: 'OVR-01', label: 'Sự cố máy hỏng', amount: 13500, count: 4 },
            { code: 'OVR-02', label: 'Tăng sản lượng', amount: 5800, count: 2 },
            { code: 'OVR-03', label: 'Pháp nhân chậm giao', amount: 3900, count: 2 },
            { code: 'OVR-04', label: 'Setup Model D222', amount: 1800, count: 1 },
            { code: 'OVR-05', label: 'Biến động giá NCC', amount: 750, count: 1 },
            { code: 'OVR-06', label: 'Hư hại thao tác', amount: 450, count: 1 },
          ].map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedOverFilter(selectedOverFilter === item.code ? 'ALL' : item.code)}
              className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                selectedOverFilter === item.code 
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 shadow-sm ring-2 ring-rose-500/20' 
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">{item.code}</span>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">{item.label}</div>
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white font-mono">${item.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Detailed Over Contribution Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            5. Danh Sách Các Hạng Mục Gây Over Chi Tiết (LEC Chính Thức Đánh Dấu)
          </h3>
          <Badge variant="danger">{overRequisitions.length} Hạng Mục Phát Sinh</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 uppercase">
                <th className="py-2.5 px-3">Mã Phiếu / QCode</th>
                <th className="py-2.5 px-3">Tên Phụ Tùng & Model</th>
                <th className="py-2.5 px-3">Tên Máy Thân Thiện</th>
                <th className="py-2.5 px-3">Số Lượng & Đơn Giá</th>
                <th className="py-2.5 px-3">Giá Trị Over</th>
                <th className="py-2.5 px-3">Mã Nguyên Nhân</th>
                <th className="py-2.5 px-3">Mã Work Order</th>
                <th className="py-2.5 px-3">Kỹ Sư Tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {overRequisitions.map(item => (
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
                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                    {item.quantity} {item.unit} @ ${item.estimatedUnitPrice}
                  </td>
                  <td className="py-3 px-3 font-bold text-rose-600 dark:text-rose-400 font-mono">
                    ${(item.quantity * item.estimatedUnitPrice).toLocaleString()} USD
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="danger">{item.overReasonCode || 'OVR-01'}</Badge>
                  </td>
                  <td className="py-3 px-3 text-cyan-600 dark:text-cyan-400 font-mono font-medium">
                    {item.workOrderNo || 'WO-248926091'}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {item.requestorName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
