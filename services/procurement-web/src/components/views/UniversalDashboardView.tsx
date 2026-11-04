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
  FileSpreadsheet,
  X,
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';
import { RequisitionItem } from '../../types';

export const UniversalDashboardView: React.FC = () => {
  const { requisitions, budget, agingJustifications } = useProcurement();
  const [selectedOverFilter, setSelectedOverFilter] = useState<string>('ALL');
  const [activeFunnelStage, setActiveFunnelStage] = useState<number | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeExportSheetTab, setActiveExportSheetTab] = useState<'KPI' | 'TARGET' | 'OVER' | 'AGING'>('KPI');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // 6 Over codes definitions
  const overReasons = [
    { code: 'OVR-01', name: 'Đột xuất hỏng hóc dừng chuyền (Line Stop)', color: 'bg-rose-500' },
    { code: 'OVR-02', name: 'Tăng sản lượng đột biến (Production Surge)', color: 'bg-amber-500' },
    { code: 'OVR-03', name: 'Chậm trễ chuyển giao liên pháp nhân', color: 'bg-purple-500' },
    { code: 'OVR-04', name: 'Setup model mới (D111 -> D222)', color: 'bg-blue-500' },
    { code: 'OVR-05', name: 'Biến động giá / Tỷ giá ngoại tệ NCC', color: 'bg-emerald-500' },
    { code: 'OVR-06', name: 'Hư hỏng trong căn chỉnh/lắp đặt', color: 'bg-pink-500' },
  ];

  // Filter requisitions based on Funnel stage if selected
  const filterByFunnelStage = (items: RequisitionItem[], stage: number | null) => {
    if (stage === null) return items;
    switch (stage) {
      case 1: return items.filter(r => r.isTempCode || r.status === 'DRAFT');
      case 2: return items.filter(r => r.status === 'INTERLOCK_CHECK' || r.status === 'CROSS_TEAM_STOCK');
      case 3: return items.filter(r => r.status === 'RFQ_WAITING' || r.unitPriceFlag === 'N');
      case 4: return items.filter(r => r.status === 'PURCHASABLE' || r.status === 'EMS_APPROVED');
      case 5: return items.filter(r => r.status === 'INBOUND_TRACKING' || !!r.vendorConfirmDate);
      case 6: return items.filter(r => !!r.etaDate && r.status !== 'ISSUED');
      case 7: return items.filter(r => r.status === 'ISSUED');
      default: return items;
    }
  };

  const displayedRequisitions = filterByFunnelStage(requisitions, activeFunnelStage);

  const overRequisitions = displayedRequisitions.filter(r => {
    if (r.planClassification !== 'OVER') return false;
    if (selectedOverFilter === 'ALL') return true;
    return r.overReasonCode === selectedOverFilter;
  });

  const targetRequisitions = displayedRequisitions.filter(r => r.planClassification === 'TARGET');

  // Trigger real CSV download for Excel
  const handleDownloadCsv = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM
    if (activeExportSheetTab === 'KPI') {
      csvContent += 'Chi So,Gia Tri,Don Vi,Ghi Chu\n';
      csvContent += `Hạn Mức Ngân Sách SG Tháng,${budget.monthlyAllocationBudget},USD,LEC nhập thủ công - Không lũy kế\n`;
      csvContent += `Thực Chi PO Đã Cam Kết,${budget.poCommitSpend},USD,Tổng giá trị PO phát hành\n`;
      csvContent += `Chi Phí Thực Tế Xuất Kho (EMS),${budget.emsIssueExpense},USD,Đồng bộ từ ds_Inv EMS\n`;
      csvContent += `Chi Phí Trong Định Mức (Target),${budget.withinTargetSpend},USD,Nằm trong kế hoạch\n`;
      csvContent += `Chi Phí Ngoài Kế Hoạch (Over),${budget.unplannedOverSpend},USD,Gắn với 6 mã OVR-01..06\n`;
      csvContent += `Số Dư Chuyển Sang Tháng Sau,${budget.carryoverSurplus},USD,Strict No-Rollover (Bắt buộc = 0)\n`;
    } else if (activeExportSheetTab === 'TARGET') {
      csvContent += 'Mã PR,Mã QCode,Tên Linh Kiện,Tên Máy,Cụm Cơ Cấu,Mã EM 14 Ký Tự,Số Lượng,Đơn Giá (USD),Thành Tiền (USD),Trạng Thái\n';
      targetRequisitions.forEach(r => {
        csvContent += `"${r.id}","${r.qCode}","${r.partName}","${r.machineFriendlyName}","${r.mechanismFriendlyName}","${r.emNo}",${r.quantity},${r.estimatedUnitPrice},${r.quantity * r.estimatedUnitPrice},"${r.status}"\n`;
      });
    } else if (activeExportSheetTab === 'OVER') {
      csvContent += 'Mã PR,Mã QCode,Tên Linh Kiện,Mã Nguyên Nhân Over,Mã Work Order (WO),Tên Máy Thân Thiện,Kỹ Sư Yêu Cầu,Số Lượng,Đơn Giá (USD),Thành Tiền (USD)\n';
      overRequisitions.forEach(r => {
        csvContent += `"${r.id}","${r.qCode}","${r.partName}","${r.overReasonCode || 'N/A'}","${r.workOrderNo || 'N/A'}","${r.machineFriendlyName}","${r.requestorName}",${r.quantity},${r.estimatedUnitPrice},${r.quantity * r.estimatedUnitPrice}\n`;
      });
    } else {
      csvContent += 'Mã Tác Vụ,Mã QCode,Tên Linh Kiện,Tuổi Tồn Kho (Ngày),Số Lượng Tồn,Kỹ Sư Giải Trình,Lý Do Kỹ Thuật,Kế Hoạch Sử Dụng,Ngày Cam Kết Sử Dụng\n';
      agingJustifications.forEach(j => {
        csvContent += `"${j.id}","${j.qCode}","${j.partName}",${j.inventoryAgeDays},${j.stockQty},"${j.engineerName}","${j.justificationReason}","${j.actionPlan}","${j.targetUsageDate}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Tham_Dinh_T11_2026_${activeExportSheetTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with 10 Golden Rules Reminder */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                UI-COMMON-00: Tổng Quan Tiến Độ & Tháp Điều Hành Mua Sắm Toàn Xưởng
              </h2>
              <Badge variant="info">Factory HW • Smart Watch</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kết nối thời gian thực: Kỹ Sư Hiện Trường $\leftrightarrow$ Điều Phối LEC $\leftrightarrow$ Thẩm Định Đầu Tháng $\leftrightarrow$ Cổng EMS Gateway.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <div className="text-right text-xs bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Nguyên Tắc Ngân Sách:</span>{' '}
            <strong className="text-amber-600 dark:text-amber-400 font-mono">Không Lũy Kế (Carryover = $0)</strong>
          </div>
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all"
            title="Mở hộp thoại xuất báo cáo chuẩn 4 Sheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Báo Cáo Excel 4 Sheet</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Procurement Funnel (Clickable 7-Step Pipeline) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Phễu Tiến Độ Mua Sắm 7 Giai Đoạn (Nhấn vào từng bước để lọc danh sách)
            </h3>
            {activeFunnelStage !== null && (
              <button 
                onClick={() => setActiveFunnelStage(null)}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium"
              >
                Xóa bộ lọc phễu
              </button>
            )}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Thời gian bình quân chu kỳ: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">9.4 Ngày</strong> | Tỷ lệ đúng hạn (OTD): <strong className="text-emerald-600 dark:text-emerald-400 font-bold">92.8%</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {[
            { stepId: 1, step: '1. Chuẩn Bị QCode', desc: 'Folder CAD/Catalog', count: requisitions.filter(r => r.isTempCode || r.status === 'DRAFT').length, color: 'hover:border-cyan-400' },
            { stepId: 2, step: '2. Quét Interlock', desc: 'Tồn Kho & Đơn Giá', count: requisitions.filter(r => r.status === 'INTERLOCK_CHECK' || r.status === 'CROSS_TEAM_STOCK').length, color: 'hover:border-blue-400' },
            { stepId: 3, step: '3. Chờ Báo Giá RFQ', desc: 'UP004 Chưa Giá', count: requisitions.filter(r => r.status === 'RFQ_WAITING' || r.unitPriceFlag === 'N').length, color: 'hover:border-amber-400' },
            { stepId: 4, step: '4. Duyệt Lên EMS', desc: 'Ký PRV & PO EMS', count: requisitions.filter(r => r.status === 'PURCHASABLE' || r.status === 'EMS_APPROVED').length, color: 'hover:border-purple-400' },
            { stepId: 5, step: '5. NCC Xác Nhận', desc: 'Vendor Confirm Date', count: requisitions.filter(r => r.status === 'INBOUND_TRACKING' || !!r.vendorConfirmDate).length, color: 'hover:border-indigo-400' },
            { stepId: 6, step: '6. Hàng Về Kho HW', desc: 'Theo Dõi Mốc ETA', count: requisitions.filter(r => !!r.etaDate && r.status !== 'ISSUED').length, color: 'hover:border-emerald-400' },
            { stepId: 7, step: '7. Xuất Lắp Máy (WO)', desc: 'Chi Phí ds_Inv EMS', count: requisitions.filter(r => r.status === 'ISSUED').length, color: 'hover:border-emerald-500' },
          ].map((item) => {
            const isSelected = activeFunnelStage === item.stepId;
            return (
              <button
                key={item.stepId}
                onClick={() => setActiveFunnelStage(isSelected ? null : item.stepId)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 ring-2 ring-rose-500/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800'
                } ${item.color}`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="truncate">{item.step}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${isSelected ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                    {item.count}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Three-Axis Budget Reconciliation Cards (Strict No-Rollover) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Monthly Allocation Budget */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ngân Sách SG Tháng
            </span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            ${budget.monthlyAllocationBudget.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            LEC nhập thủ công đầu tháng • <span className="text-amber-600 font-bold">Không cộng dồn</span>
          </p>
        </div>

        {/* Card 2: PO Commit Spend */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Thực Chi PO Cam Kết
            </span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            ${budget.poCommitSpend.toLocaleString()}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full" 
              style={{ width: `${Math.min(100, (budget.poCommitSpend / budget.monthlyAllocationBudget) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Đạt <strong>{((budget.poCommitSpend / budget.monthlyAllocationBudget) * 100).toFixed(1)}%</strong> ngân sách cam kết
          </p>
        </div>

        {/* Card 3: EMS Issue Expense */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chi Phí Xuất Kho (EMS)
            </span>
            <Package className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            ${budget.emsIssueExpense.toLocaleString()}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full" 
              style={{ width: `${Math.min(100, (budget.emsIssueExpense / budget.monthlyAllocationBudget) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Đồng bộ từ <code>ds_Inv</code> (Thủ kho phát vật tư lên chuyền)
          </p>
        </div>

        {/* Card 4: Over Budget Spend */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-rose-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500" />
              Chi Phí Ngoài Kế Hoạch (Over)
            </span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            ${budget.unplannedOverSpend.toLocaleString()}
          </div>
          <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1 font-medium">
            Chiếm <strong>{((budget.unplannedOverSpend / (budget.poCommitSpend || 1)) * 100).toFixed(1)}%</strong> tổng chi phí • Cần giải trình WO
          </p>
        </div>
      </div>

      {/* 4. Analysis of 6 Over Reason Codes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Phân Tích 6 Mã Nguyên Nhân Gây Over (Phân Loại Do LEC Đánh Dấu)
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Tuyệt đối không tự động phân loại • LEC đối chiếu Work Order & Lý do kỹ sư
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {overReasons.map(r => {
            const count = requisitions.filter(item => item.planClassification === 'OVER' && item.overReasonCode === r.code).length;
            const amount = requisitions
              .filter(item => item.planClassification === 'OVER' && item.overReasonCode === r.code)
              .reduce((sum, item) => sum + item.quantity * item.estimatedUnitPrice, 0);

            const isFilterActive = selectedOverFilter === r.code;

            return (
              <div 
                key={r.code}
                onClick={() => setSelectedOverFilter(isFilterActive ? 'ALL' : r.code)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isFilterActive 
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 ring-1 ring-rose-500' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1.5">
                  <span className="flex items-center gap-2 font-mono text-slate-900 dark:text-white">
                    <span className={`w-2.5 h-2.5 rounded-full ${r.color}`} />
                    {r.code}
                  </span>
                  <span className="font-mono font-black text-rose-600 dark:text-rose-400">
                    ${amount.toLocaleString()}
                  </span>
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium text-[11px] truncate">
                  {r.name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span>Số lượng: {count} hạng mục</span>
                  <span className="text-rose-500 font-bold hover:underline">Nhấn để lọc</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Detailed Requisitions Table (Segregated Target & Over with WO) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Danh Mục Mua Sắm Chi Tiết
            </h3>
            <span className="text-xs font-mono text-slate-500 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
              {displayedRequisitions.length} Hạng Mục
            </span>
            {selectedOverFilter !== 'ALL' && (
              <span className="text-xs px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold flex items-center gap-1">
                Lọc mã: {selectedOverFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedOverFilter('ALL')} />
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedOverFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                selectedOverFilter === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Tất Cả ({displayedRequisitions.length})
            </button>
            <button
              onClick={() => setSelectedOverFilter('TARGET')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                selectedOverFilter === 'TARGET'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Trong Kế Hoạch ({targetRequisitions.length})
            </button>
            <button
              onClick={() => setSelectedOverFilter('OVER')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                selectedOverFilter === 'OVER'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Ngoài Kế Hoạch ({overRequisitions.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Mã PR / QCode</th>
                <th className="px-4 py-3">Tên Linh Kiện & Thông Số</th>
                <th className="px-4 py-3">Máy & Mã EM (14 Ký Tự)</th>
                <th className="px-4 py-3">Phân Loại (LEC Đánh Dấu)</th>
                <th className="px-4 py-3">Mã Work Order (WO)</th>
                <th className="px-4 py-3">Số Lượng & Đơn Giá</th>
                <th className="px-4 py-3">Thành Tiền (USD)</th>
                <th className="px-4 py-3">Trạng Thái Vận Hành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {displayedRequisitions
                .filter(r => {
                  if (selectedOverFilter === 'ALL') return true;
                  if (selectedOverFilter === 'TARGET') return r.planClassification === 'TARGET';
                  if (selectedOverFilter === 'OVER') return r.planClassification === 'OVER';
                  return r.overReasonCode === selectedOverFilter;
                })
                .map(item => {
                  const isOver = item.planClassification === 'OVER';
                  const totalCost = item.quantity * item.estimatedUnitPrice;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white font-mono">{item.id}</div>
                        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                          {item.qCode}
                          {item.isTempCode && (
                            <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                              MÃ TẠM
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white max-w-xs truncate" title={item.partName}>
                          {item.partName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {item.maker} • {item.model}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-white">{item.machineFriendlyName}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate" title={item.emNo}>
                          EM: {item.emNo} ({item.lineName})
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isOver ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              OVER • {item.overReasonCode || 'OVR-??'}
                            </span>
                          </div>
                        ) : item.planClassification === 'TARGET' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            TARGET (Định mức)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Chưa phân loại
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        {item.workOrderNo ? (
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            {item.workOrderNo}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Không có</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div>{item.quantity} {item.unit}</div>
                        <div className="text-[11px] text-slate-400">${item.estimatedUnitPrice}/EA</div>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                        ${totalCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant={
                            item.status === 'PURCHASABLE' || item.status === 'EMS_APPROVED' ? 'success' :
                            item.status === 'CROSS_TEAM_STOCK' ? 'warning' :
                            item.status === 'EOL' ? 'error' : 'default'
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Standard 4-Sheet Excel Preview & Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Báo Cáo Tổng Hợp Thẩm Định Chi Phí Định Kỳ — Chuẩn 4 Sheet Tiêu Chuẩn
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Form cố định duy nhất phục vụ Ban Giám Đốc • Nhà máy Factory HW (Smart Watch)
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Tabs Selector */}
            <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/30 dark:bg-slate-950/20">
              {[
                { id: 'KPI', label: 'Sheet 1: KPI Dashboard', count: null },
                { id: 'TARGET', label: 'Sheet 2: Target Requisitions', count: targetRequisitions.length },
                { id: 'OVER', label: 'Sheet 3: Over Requisitions', count: overRequisitions.length },
                { id: 'AGING', label: 'Sheet 4: Aging Stock Justifications', count: agingJustifications.length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveExportSheetTab(tab.id as any)}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeExportSheetTab === tab.id
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 font-mono">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Modal Body: Live Table Preview */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {activeExportSheetTab === 'KPI' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                    <div className="font-bold text-slate-900 dark:text-white uppercase">
                      Bảng Cân Đối Tài Chính Phân Xưởng Smart Watch (Tháng {budget.periodMonth})
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-slate-400 block">Hạn mức ngân sách SG tháng:</span>
                        <strong className="text-sm font-mono text-slate-900 dark:text-white">
                          ${budget.monthlyAllocationBudget.toLocaleString()} USD
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Thực chi PO cam kết:</span>
                        <strong className="text-sm font-mono text-blue-600 dark:text-blue-400">
                          ${budget.poCommitSpend.toLocaleString()} USD
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Chi phí thực tế xuất kho (EMS ds_Inv):</span>
                        <strong className="text-sm font-mono text-emerald-600 dark:text-emerald-400">
                          ${budget.emsIssueExpense.toLocaleString()} USD
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Số dư chuyển sang tháng sau:</span>
                        <strong className="text-sm font-mono text-amber-600 dark:text-amber-400">
                          $0 USD (Strict No-Rollover)
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeExportSheetTab === 'TARGET' && (
                <div className="text-xs space-y-2">
                  <p className="text-slate-500">Danh sách các mã nằm trong kế hoạch định kỳ đã được phê chuẩn:</p>
                  <table className="w-full text-left border">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="p-2 border">QCode</th>
                        <th className="p-2 border">Tên Linh Kiện</th>
                        <th className="p-2 border">Tên Máy</th>
                        <th className="p-2 border">Số Lượng</th>
                        <th className="p-2 border">Thành Tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {targetRequisitions.map(r => (
                        <tr key={r.id}>
                          <td className="p-2 border font-mono">{r.qCode}</td>
                          <td className="p-2 border">{r.partName}</td>
                          <td className="p-2 border">{r.machineFriendlyName}</td>
                          <td className="p-2 border">{r.quantity} {r.unit}</td>
                          <td className="p-2 border font-mono font-bold">${(r.quantity * r.estimatedUnitPrice).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeExportSheetTab === 'OVER' && (
                <div className="text-xs space-y-2">
                  <p className="text-slate-500">Danh sách các mã Over phát sinh ngoài kế hoạch kèm mã Work Order và mã nguyên nhân:</p>
                  <table className="w-full text-left border">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="p-2 border">QCode</th>
                        <th className="p-2 border">Tên Linh Kiện</th>
                        <th className="p-2 border">Mã Over</th>
                        <th className="p-2 border">Work Order</th>
                        <th className="p-2 border">Kỹ Sư</th>
                        <th className="p-2 border">Thành Tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overRequisitions.map(r => (
                        <tr key={r.id}>
                          <td className="p-2 border font-mono">{r.qCode}</td>
                          <td className="p-2 border">{r.partName}</td>
                          <td className="p-2 border font-bold text-rose-600">{r.overReasonCode}</td>
                          <td className="p-2 border font-mono">{r.workOrderNo || 'N/A'}</td>
                          <td className="p-2 border">{r.requestorName}</td>
                          <td className="p-2 border font-mono font-bold">${(r.quantity * r.estimatedUnitPrice).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeExportSheetTab === 'AGING' && (
                <div className="text-xs space-y-2">
                  <p className="text-slate-500">Danh sách các giải trình tồn kho chậm luân chuyển (&gt;30 ngày) đã được kỹ sư hiện trường nộp:</p>
                  <table className="w-full text-left border">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="p-2 border">QCode</th>
                        <th className="p-2 border">Tên Linh Kiện</th>
                        <th className="p-2 border">Tuổi Tồn</th>
                        <th className="p-2 border">Kỹ Sư</th>
                        <th className="p-2 border">Lý Do Giải Trình</th>
                        <th className="p-2 border">Hạn Dùng Cam Kết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agingJustifications.map(j => (
                        <tr key={j.id}>
                          <td className="p-2 border font-mono">{j.qCode}</td>
                          <td className="p-2 border">{j.partName}</td>
                          <td className="p-2 border font-bold text-amber-600">{j.inventoryAgeDays} ngày</td>
                          <td className="p-2 border">{j.engineerName}</td>
                          <td className="p-2 border">{j.justificationReason}</td>
                          <td className="p-2 border font-mono">{j.targetUsageDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Xuất file định dạng UTF-8 CSV tương thích 100% Microsoft Excel & Nexacro Report
              </span>

              <div className="flex items-center gap-3">
                {downloadSuccess && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã tải file thành công!
                  </span>
                )}
                <button
                  onClick={handleDownloadCsv}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Sheet Hiện Tại Về Máy (.csv)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
