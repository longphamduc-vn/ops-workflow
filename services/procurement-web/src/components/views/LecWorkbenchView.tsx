import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { 
  Sliders, 
  Truck, 
  MessageSquare, 
  Calendar, 
  AlertTriangle,
  Send,
  CheckCircle2,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  XCircle,
  HelpCircle,
  FolderUp,
  FileCheck2,
  Lock,
  Unlock,
  CheckSquare,
  Square,
  Flame,
  FileSpreadsheet
} from 'lucide-react';
import { PlanClassification, OverReasonCode, RequisitionItem, RequisitionStatus } from '../../types';

export const LecWorkbenchView: React.FC = () => {
  const { 
    requisitions, 
    clarifications, 
    qcodeSubmissions,
    budget, 
    activeLec,
    batchUpdateRequisitionStatus,
    classifyTargetOver, 
    reclassifyEol, 
    updateMilestones, 
    forwardInquiryToEngineer,
    resolveClarificationInquiry,
    registerOfficialQCode,
    updateDeadlines,
    updateBudgetCap,
    syncEmsPrvPo
  } = useProcurement();

  const [activeTab, setActiveTab] = useState<'BATCH_GROUP' | 'TARGET_OVER' | 'QCODE_ONBOARD' | 'MILESTONES' | 'CLARIFICATIONS' | 'BUDGET_DEADLINES'>('BATCH_GROUP');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PURCHASABLE' | 'INTERLOCK_CHECK' | 'CROSS_TEAM_STOCK' | 'RFQ_WAITING' | 'EOL'>('ALL');

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Target / Over classification modal
  const [targetOverModalItem, setTargetOverModalItem] = useState<RequisitionItem | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanClassification>('TARGET');
  const [selectedOverReason, setSelectedOverReason] = useState<OverReasonCode>('OVR-01');
  const [workOrderInput, setWorkOrderInput] = useState('');

  // QCode registration modal
  const [onboardModalSub, setOnboardModalSub] = useState<any | null>(null);
  const [officialQCodeInput, setOfficialQCodeInput] = useState('');

  // Milestone edit modal state
  const [editingMilestoneItem, setEditingMilestoneItem] = useState<RequisitionItem | null>(null);
  const [vendorConfirmInput, setVendorConfirmInput] = useState('');
  const [etaInput, setEtaInput] = useState('');
  const [m1Qty, setM1Qty] = useState(2);
  const [m2Qty, setM2Qty] = useState(1);
  const [m3Qty, setM3Qty] = useState(1);

  // 3-Party Bridge state
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [lecNoteInput, setLecNoteInput] = useState('');

  // Budget & Deadline settings
  const [budgetCapInput, setBudgetCapInput] = useState(budget.monthlyAllocationBudget);
  const [justificationDeadlineInput, setJustificationDeadlineInput] = useState(budget.justificationDeadline);
  const [auditLockDeadlineInput, setAuditLockDeadlineInput] = useState(budget.auditLockDeadline);
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  const filteredRequisitions = requisitions.filter(r => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  // Batch toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRequisitions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRequisitions.map(r => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Batch action handlers
  const handleBatchUnlockInterlock = () => {
    if (selectedIds.length === 0) return;
    batchUpdateRequisitionStatus(selectedIds, 'PURCHASABLE');
    setSelectedIds([]);
  };

  const handleBatchSendToEms = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id, idx) => {
      syncEmsPrvPo(id, `PRV-2611-${900 + idx}`, `PO-2611-${400 + idx}`);
    });
    setSelectedIds([]);
  };

  const handleBatchMarkEol = () => {
    if (selectedIds.length === 0) return;
    batchUpdateRequisitionStatus(selectedIds, 'EOL');
    setSelectedIds([]);
  };

  // Milestone save
  const handleOpenMilestoneModal = (item: RequisitionItem) => {
    setEditingMilestoneItem(item);
    setVendorConfirmInput(item.vendorConfirmDate || '2026-11-08');
    setEtaInput(item.etaDate || '2026-11-15');
    setM1Qty(Math.ceil(item.quantity / 2));
    setM2Qty(Math.floor(item.quantity / 4));
    setM3Qty(item.quantity - Math.ceil(item.quantity / 2) - Math.floor(item.quantity / 4));
  };

  const handleSaveMilestones = () => {
    if (!editingMilestoneItem) return;
    const unitPrice = editingMilestoneItem.estimatedUnitPrice;
    const allocations = [
      { month: '2026-11', qty: m1Qty, amount: m1Qty * unitPrice },
      { month: '2026-12', qty: m2Qty, amount: m2Qty * unitPrice },
      { month: '2027-01', qty: m3Qty, amount: m3Qty * unitPrice },
    ];

    updateMilestones(editingMilestoneItem.id, vendorConfirmInput, etaInput, allocations);
    setEditingMilestoneItem(null);
  };

  // Target/Over submit
  const handleSaveTargetOver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOverModalItem) return;
    classifyTargetOver(
      targetOverModalItem.id,
      selectedPlan,
      selectedPlan === 'OVER' ? selectedOverReason : undefined,
      workOrderInput || targetOverModalItem.workOrderNo
    );
    setTargetOverModalItem(null);
  };

  // QCode registration submit
  const handleRegisterQCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardModalSub || !officialQCodeInput) return;
    registerOfficialQCode(onboardModalSub.id, officialQCodeInput);
    setOnboardModalSub(null);
    setOfficialQCodeInput('');
  };

  // Forward to Engineer
  const handleForwardToEngineer = (inquiryId: string) => {
    if (!lecNoteInput) return;
    forwardInquiryToEngineer(inquiryId, lecNoteInput);
    setLecNoteInput('');
    setSelectedInquiryId(null);
  };

  // Save budget cap and deadlines
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateBudgetCap(Number(budgetCapInput));
    updateDeadlines(justificationDeadlineInput, auditLockDeadlineInput);
    setConfigSavedNotice(true);
    setTimeout(() => setConfigSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Active LEC Info */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                UI-ROLE-03: Bàn Điều Phối Thiết Bị LEC Master Workbench
              </h2>
              <Badge variant="error">Đa LEC (Multi-LEC Team)</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gom mẻ theo trạng thái, giải tỏa Interlock 4 bước, đánh dấu thủ công Target/Over, đăng ký mã QCode và cầu nối giải trình 3 bên.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-slate-400">LEC Trực Ban:</span>
          <strong className="text-slate-900 dark:text-white font-mono">{activeLec.name}</strong>
          <span className="text-slate-400 font-mono">({activeLec.empNo})</span>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
        {[
          { id: 'BATCH_GROUP', label: '1. Gom Mẻ & Xử Lý Đồng Loạt', count: requisitions.length },
          { id: 'TARGET_OVER', label: '2. Đánh Dấu Thủ Công Target/Over', count: requisitions.filter(r => r.planClassification === 'UNCLASSIFIED').length },
          { id: 'QCODE_ONBOARD', label: '3. Hồ Sơ Đăng Ký Mã QCode', count: qcodeSubmissions.filter(s => s.status === 'PENDING_LEC_REGISTRATION').length },
          { id: 'MILESTONES', label: '4. Mốc Giao Hàng & Phân Bổ 3 Tháng', count: requisitions.filter(r => !!r.vendorConfirmDate).length },
          { id: 'CLARIFICATIONS', label: '5. Cầu Nối Giải Trình 3 Bên', count: clarifications.filter(c => c.status !== 'RESOLVED').length },
          { id: 'BUDGET_DEADLINES', label: '6. Ngân Sách SG & Deadlines', count: null },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && tab.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === tab.id ? 'bg-white text-rose-600' : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3. TAB 1: Batch Grouping & Action Engine */}
      {activeTab === 'BATCH_GROUP' && (
        <div className="space-y-4">
          {/* Filter Bar & Batch Actions Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lọc Trạng Thái:</span>
              {[
                { id: 'ALL', label: 'Tất Cả' },
                { id: 'PURCHASABLE', label: 'Có Thể Mua' },
                { id: 'INTERLOCK_CHECK', label: 'Đang Quét Interlock' },
                { id: 'CROSS_TEAM_STOCK', label: 'Tồn Kho Liên Team' },
                { id: 'RFQ_WAITING', label: 'Chờ Báo Giá RFQ' },
                { id: 'EOL', label: 'Ngừng Sản Xuất (EOL)' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === f.id
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Batch Actions Button Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-mono">
                Đã chọn: <strong className="text-rose-600">{selectedIds.length}</strong>
              </span>

              <button
                onClick={handleBatchUnlockInterlock}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs cursor-pointer"
                title="Mở khóa cờ Interlock cho các mã đã kiểm tra tồn kho xong"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Mở Khóa Interlock</span>
              </button>

              <button
                onClick={handleBatchSendToEms}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs cursor-pointer"
                title="Tạo PRV & PO trên EMS"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Chuyển Sang EMS</span>
              </button>

              <button
                onClick={handleBatchMarkEol}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold shadow-xs cursor-pointer"
                title="Đánh dấu linh kiện ngừng sản xuất"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Gán EOL</span>
              </button>
            </div>
          </div>

          {/* Batch Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3 w-10">
                      <button onClick={toggleSelectAll} className="cursor-pointer">
                        {selectedIds.length === filteredRequisitions.length && filteredRequisitions.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-rose-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </th>
                    <th className="p-3">Mã PR / QCode</th>
                    <th className="p-3">Tên Linh Kiện & Thông Số</th>
                    <th className="p-3">Máy & Cụm Cơ Cấu</th>
                    <th className="p-3">Kỹ Sư Yêu Cầu</th>
                    <th className="p-3">Số Lượng & Giá</th>
                    <th className="p-3">Phân Loại (Target/Over)</th>
                    <th className="p-3">Trạng Thái Interlock</th>
                    <th className="p-3 text-right">Thao Tác Nhanh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRequisitions.map(r => {
                    const isSelected = selectedIds.includes(r.id);

                    return (
                      <tr key={r.id} className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${isSelected ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''}`}>
                        <td className="p-3">
                          <button onClick={() => toggleSelectOne(r.id)} className="cursor-pointer">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-rose-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white font-mono">{r.id}</div>
                          <div className="text-[11px] font-mono text-slate-500">{r.qCode}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">{r.partName}</div>
                          <div className="text-[10px] text-slate-400">{r.maker} • {r.model}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{r.machineFriendlyName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">EM: {r.emNo}</div>
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
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              CHƯA ĐÁNH DẤU
                            </span>
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
                            onClick={() => {
                              setTargetOverModalItem(r);
                              setSelectedPlan(r.planClassification === 'UNCLASSIFIED' ? 'TARGET' : r.planClassification);
                              setSelectedOverReason(r.overReasonCode || 'OVR-01');
                              setWorkOrderInput(r.workOrderNo || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                          >
                            Đánh Dấu Target/Over
                          </button>
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

      {/* 4. TAB 2: Strict Manual Target vs Over Evaluation Modal */}
      {activeTab === 'TARGET_OVER' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              Đánh Giá Thủ Công Phân Loại Target vs. Over (Strict Non-Automated Evaluation)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Theo <strong>Nguyên tắc vàng #6</strong>: Hệ thống tuyệt đối không tự động phân loại. LEC trực tiếp đánh dấu dựa trên mã Work Order và lý do kỹ sư hiện trường cung cấp.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requisitions.map(item => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="font-mono text-slate-900 dark:text-white">{item.id} • {item.qCode}</span>
                    <span className="font-mono text-rose-600 font-bold">${(item.quantity * item.estimatedUnitPrice).toLocaleString()}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{item.partName}</div>
                    <div className="text-[11px] text-slate-400">Máy: {item.machineFriendlyName} ({item.lineName})</div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Hiện tại:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{item.planClassification}</strong>
                      {item.overReasonCode && <span className="text-rose-500 text-[10px] block">Mã: {item.overReasonCode}</span>}
                    </div>

                    <button
                      onClick={() => {
                        setTargetOverModalItem(item);
                        setSelectedPlan(item.planClassification === 'UNCLASSIFIED' ? 'TARGET' : item.planClassification);
                        setSelectedOverReason(item.overReasonCode || 'OVR-01');
                        setWorkOrderInput(item.workOrderNo || '');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Đổi Phân Loại
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Target/Over Evaluation Drawer/Modal */}
      {targetOverModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Đánh Dấu Phân Loại Cho Mã {targetOverModalItem.qCode}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Hạng mục: <strong>{targetOverModalItem.partName}</strong> (${(targetOverModalItem.quantity * targetOverModalItem.estimatedUnitPrice).toLocaleString()})
            </p>

            <form onSubmit={handleSaveTargetOver} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Phân Loại Ngân Sách
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('TARGET')}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      selectedPlan === 'TARGET'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    TRONG KẾ HOẠCH (TARGET)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('OVER')}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      selectedPlan === 'OVER'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    NGOÀI KẾ HOẠCH (OVER)
                  </button>
                </div>
              </div>

              {selectedPlan === 'OVER' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Gán 1 Trong 6 Mã Nguyên Nhân Over Bắt Buộc
                    </label>
                    <select
                      value={selectedOverReason}
                      onChange={(e) => setSelectedOverReason(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    >
                      <option value="OVR-01">OVR-01: Đột xuất hỏng hóc dừng chuyền (Line Stop)</option>
                      <option value="OVR-02">OVR-02: Tăng sản lượng đột biến (Production Surge)</option>
                      <option value="OVR-03">OVR-03: Chậm trễ chuyển giao liên pháp nhân</option>
                      <option value="OVR-04">OVR-04: Setup model mới (D111 → D222)</option>
                      <option value="OVR-05">OVR-05: Biến động giá / Tỷ giá ngoại tệ NCC</option>
                      <option value="OVR-06">OVR-06: Hư hỏng trong căn chỉnh/lắp đặt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mã Work Order (WO) Sự Cố Của Kỹ Sư
                    </label>
                    <input
                      type="text"
                      required
                      value={workOrderInput}
                      onChange={(e) => setWorkOrderInput(e.target.value)}
                      placeholder="e.g. WO-248926091"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetOverModalItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Lưu Đánh Dấu Phân Loại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. TAB 3: QCode Registration Queue */}
      {activeTab === 'QCODE_ONBOARD' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <FolderUp className="w-4 h-4 text-cyan-500" />
              Tiếp Nhận Folder Kỹ Thuật & Cấp Mã QCode Chính Thức
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              LEC tải folder bản vẽ CAD/Catalog về, đăng ký QCode trên ERP/EMS ngoài, sau đó quay lại nhập mã chính thức vào đây để mở khóa thẩm định chi phí.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Mã Tạm</th>
                    <th className="p-3">Tên Phụ Tùng Đề Xuất</th>
                    <th className="p-3">Kỹ Sư Nộp</th>
                    <th className="p-3">Số Tệp Đính Kèm</th>
                    <th className="p-3">Trạng Thái</th>
                    <th className="p-3 text-right">Hành Động LEC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {qcodeSubmissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        {sub.tempCode}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{sub.partName}</div>
                        <div className="text-[10px] text-slate-400">{sub.specDescription}</div>
                      </td>
                      <td className="p-3">{sub.requestorName} ({sub.partGroup})</td>
                      <td className="p-3 font-mono">{sub.files.length} Tệp</td>
                      <td className="p-3">
                        {sub.status === 'OFFICIALLY_REGISTERED' ? (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {sub.officialQCode}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                            Chờ Cấp Mã
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {sub.status === 'PENDING_LEC_REGISTRATION' && (
                          <button
                            onClick={() => {
                              setOnboardModalSub(sub);
                              setOfficialQCodeInput(`QDAC${Math.floor(10000 + Math.random() * 90000)}`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Nhập QCode Chính Thức
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* QCode Register Modal */}
          {onboardModalSub && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Cập Nhật Mã QCode Chính Thức Sau Khi Đăng Ký EMS
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Chuyển đổi mã tạm <strong>{onboardModalSub.tempCode}</strong> sang QCode chính thức để đủ điều kiện thẩm định đầu tháng.
                </p>

                <form onSubmit={handleRegisterQCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mã QCode Chính Thức Từ Hệ Thống Ngoài (ERP/EMS)
                    </label>
                    <input
                      type="text"
                      required
                      value={officialQCodeInput}
                      onChange={(e) => setOfficialQCodeInput(e.target.value)}
                      placeholder="e.g. QDAC77219"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setOnboardModalSub(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Xác Nhận Cấp Mã
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 4: Inbound Milestones & 3-Month Allocations */}
      {activeTab === 'MILESTONES' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-500" />
              Theo Dõi Mốc Giao Hàng & Phân Bổ Ghi Nhận Chi Phí 3 Tháng
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Theo dõi Vendor Confirmation Date, ETA ngày hàng về, và kế hoạch phân bổ chi phí ngân sách theo tháng.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Mã PR / QCode</th>
                    <th className="p-3">Tên Linh Kiện</th>
                    <th className="p-3">Ngày NCC Xác Nhận</th>
                    <th className="p-3">Ngày Dự Kiến Hàng Về (ETA)</th>
                    <th className="p-3">Phân Bổ Chi Phí Theo Tháng</th>
                    <th className="p-3 text-right">Cập Nhật Mốc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {requisitions.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        {r.id} <span className="text-[10px] text-slate-400 block">{r.qCode}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{r.partName}</td>
                      <td className="p-3 font-mono">{r.vendorConfirmDate || 'Chưa có'}</td>
                      <td className="p-3 font-mono text-emerald-600 font-bold">{r.etaDate || 'Chưa có'}</td>
                      <td className="p-3 font-mono text-[11px]">
                        {r.monthlyAllocations ? (
                          <div className="flex gap-2">
                            {r.monthlyAllocations.map(m => (
                              <span key={m.month} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                {m.month}: {m.qty} EA (${m.amount})
                              </span>
                            ))}
                          </div>
                        ) : 'Chưa phân bổ'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleOpenMilestoneModal(r)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Chỉnh Sửa Mốc
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Milestone Modal */}
          {editingMilestoneItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Cập Nhật Mốc Inbound Cho {editingMilestoneItem.qCode}
                </h4>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Ngày NCC Xác Nhận
                      </label>
                      <input
                        type="date"
                        value={vendorConfirmInput}
                        onChange={(e) => setVendorConfirmInput(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Ngày Dự Kiến Về Cảng/Kho (ETA)
                      </label>
                      <input
                        type="date"
                        value={etaInput}
                        onChange={(e) => setEtaInput(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                      Phân Bổ Số Lượng Ghi Nhận Chi Phí Theo Tháng (Tổng {editingMilestoneItem.quantity} EA)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Tháng 11/2026:</span>
                        <input
                          type="number"
                          value={m1Qty}
                          onChange={(e) => setM1Qty(Number(e.target.value))}
                          className="w-full p-1.5 text-xs rounded border text-center font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Tháng 12/2026:</span>
                        <input
                          type="number"
                          value={m2Qty}
                          onChange={(e) => setM2Qty(Number(e.target.value))}
                          className="w-full p-1.5 text-xs rounded border text-center font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Tháng 01/2027:</span>
                        <input
                          type="number"
                          value={m3Qty}
                          onChange={(e) => setM3Qty(Number(e.target.value))}
                          className="w-full p-1.5 text-xs rounded border text-center font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingMilestoneItem(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveMilestones}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Lưu Mốc & Phân Bổ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. TAB 5: 3-Party Clarification Bridge */}
      {activeTab === 'CLARIFICATIONS' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Cầu Nối Thẩm Định 3 Bên: Người Thẩm Định $\leftrightarrow$ LEC $\leftrightarrow$ Kỹ Sư Hiện Trường
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Theo <strong>Nguyên tắc vàng #8</strong>: LEC tiếp nhận thắc mắc từ Bộ phận Quản lý Chi phí, bổ sung ghi chú kỹ thuật chuyển cho kỹ sư, và đệ trình phản hồi sau khi kỹ sư hoàn thành.
            </p>

            <div className="space-y-4">
              {clarifications.map(c => (
                <div key={c.id} className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="font-mono text-indigo-950 dark:text-indigo-200">
                      {c.id} • Mã: {c.qCode} — {c.partName}
                    </span>
                    <Badge variant={c.status === 'RESOLVED' ? 'success' : 'warning'}>
                      {c.status}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-bold text-rose-600 block mb-1">Câu hỏi của Người thẩm định (Cost Mgmt):</span>
                    <p>{c.reviewerQuestion}</p>
                  </div>

                  {c.lecNote && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                      <span className="font-bold block mb-1">Ghi chú của LEC:</span>
                      <p>{c.lecNote}</p>
                    </div>
                  )}

                  {c.engineerResponse && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                      <span className="font-bold block mb-1">Giải trình của Kỹ sư Hiện trường:</span>
                      <p>{c.engineerResponse}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    {c.status === 'PENDING_LEC' && (
                      <button
                        onClick={() => setSelectedInquiryId(c.id)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Thêm Ghi Chú & Chuyển Cho Kỹ Sư
                      </button>
                    )}

                    {c.status === 'ENGINEER_REPLIED' && (
                      <button
                        onClick={() => resolveClarificationInquiry(c.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Xác Nhận Giải Trình & Hoàn Tất Với Reviewer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forward Modal */}
          {selectedInquiryId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Chuyển Tiếp Câu Hỏi Cho Kỹ Sư Hiện Trường
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ghi chú / Hướng dẫn của LEC cho Kỹ sư
                    </label>
                    <textarea
                      rows={3}
                      value={lecNoteInput}
                      onChange={(e) => setLecNoteInput(e.target.value)}
                      placeholder="e.g. Nhớ chụp ảnh mạch và gửi kèm nhật ký ca đêm có chữ ký nhé..."
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedInquiryId(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={() => handleForwardToEngineer(selectedInquiryId)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Chuyển Cho Kỹ Sư
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. TAB 6: SG Budget Cap & Deadlines (Strict No-Rollover) */}
      {activeTab === 'BUDGET_DEADLINES' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              Cấu Hình Ngân Sách SG & Thiết Lập Deadline Kiểm Thảo Đầu Tháng
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Theo <strong>Nguyên tắc vàng #7 & #10</strong>: LEC quản trị hạn chót nộp giải trình của kỹ sư, hạn chót khóa sổ kiểm thảo và hạn mức ngân sách SG tháng (Strict No-Rollover, số dư = $0).
            </p>

            {configSavedNotice && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã lưu thành công hạn mức ngân sách và thời hạn deadline!</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hạn Mức Ngân Sách SG Tháng (USD) — LEC Nhập Thủ Công
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={budgetCapInput}
                    onChange={(e) => setBudgetCapInput(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block font-medium">
                  Chính sách: Tuyệt đối không cộng dồn số dư sang tháng sau (Carryover Surplus = $0).
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hạn Chót Kỹ Sư Nộp Giải Trình Tồn Kho
                  </label>
                  <input
                    type="date"
                    value={justificationDeadlineInput}
                    onChange={(e) => setJustificationDeadlineInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Mặc định: Ngày 05 hàng tháng</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hạn Chót Khóa Sổ Thẩm Định Đầu Tháng
                  </label>
                  <input
                    type="date"
                    value={auditLockDeadlineInput}
                    onChange={(e) => setAuditLockDeadlineInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Mặc định: Ngày 07 hàng tháng</span>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Lưu Cài Đặt Deadline & Ngân Sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
