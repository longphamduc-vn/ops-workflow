import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { 
  Truck, 
  MessageSquare, 
  Calendar, 
  AlertTriangle,
  Send,
  CheckCircle2,
  Sliders,
  DollarSign,
  Mail,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  XCircle,
  HelpCircle
} from 'lucide-react';

export const LecWorkbenchView: React.FC = () => {
  const { 
    requisitions, 
    clarifications, 
    budget, 
    classifyTargetOver, 
    reclassifyEol, 
    updateMilestones, 
    forwardInquiryToEngineer,
    closeClarificationInquiry,
    updateDeadlines 
  } = useProcurement();

  const [activeTab, setActiveTab] = useState<'BATCH_GROUP' | 'MILESTONES' | 'CLARIFICATIONS' | 'DEADLINES'>('BATCH_GROUP');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PURCHASABLE' | 'CROSS_TEAM_STOCK' | 'EOL'>('ALL');

  // Milestone edit modal state
  const [editingMilestoneItem, setEditingMilestoneItem] = useState<any | null>(null);
  const [vendorConfirmInput, setVendorConfirmInput] = useState('');
  const [etaInput, setEtaInput] = useState('');
  const [m1Qty, setM1Qty] = useState(2);
  const [m2Qty, setM2Qty] = useState(1);
  const [m3Qty, setM3Qty] = useState(1);

  // 3-Party Bridge state
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [lecNoteInput, setLecNoteInput] = useState('');

  // Email exception simulation state
  const [showEmailExceptionModal, setShowEmailExceptionModal] = useState(false);
  const [emailExceptionPart, setEmailExceptionPart] = useState<any | null>(null);
  const [emailQuoteNote, setEmailQuoteNote] = useState('');

  // Deadline state
  const [justificationDeadlineInput, setJustificationDeadlineInput] = useState(budget.justificationDeadline);
  const [auditLockDeadlineInput, setAuditLockDeadlineInput] = useState(budget.auditLockDeadline);
  const [deadlineSavedNotice, setDeadlineSavedNotice] = useState(false);

  const filteredRequisitions = requisitions.filter(r => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  const handleOpenMilestoneModal = (item: any) => {
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

  const handleForwardToEngineer = (inquiryId: string) => {
    if (!lecNoteInput) return;
    forwardInquiryToEngineer(inquiryId, lecNoteInput);
    setLecNoteInput('');
    setSelectedInquiryId(null);
  };

  const handleSaveDeadlines = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeadlines(justificationDeadlineInput, auditLockDeadlineInput);
    setDeadlineSavedNotice(true);
    setTimeout(() => setDeadlineSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              UI-ROLE-03: Bàn Làm Việc Điều Phối LEC (LEC Master Workbench)
            </h2>
            <Badge variant="info">Multi-LEC: Pham Duc Long (658359)</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Thẩm quyền duy nhất đánh dấu nhãn Target vs Over, gom đơn đồng loạt, xử lý Interlock Y/N, quản lý tiến độ RFQ và Budget No-Rollover.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('BATCH_GROUP')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'BATCH_GROUP' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gom Đơn & Interlock
          </button>
          <button
            onClick={() => setActiveTab('MILESTONES')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'MILESTONES' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tiến Độ Về Kho & Phân Bổ
          </button>
          <button
            onClick={() => setActiveTab('CLARIFICATIONS')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'CLARIFICATIONS' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Kênh Hỏi Đáp 3 Bên
            {clarifications.filter(c => c.status === 'PENDING_LEC' || c.status === 'ENGINEER_REPLIED').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold">
                {clarifications.filter(c => c.status === 'PENDING_LEC' || c.status === 'ENGINEER_REPLIED').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('DEADLINES')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'DEADLINES' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Cấu Hình Deadline & Budget
          </button>
        </div>
      </div>

      {/* TAB 1: GOM HẠNG MỤC THEO TRẠNG THÁI & ĐÁNH DẤU TARGET / OVER */}
      {activeTab === 'BATCH_GROUP' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Lọc Theo Trạng Thái:</span>
              <div className="flex gap-1">
                {(['ALL', 'PURCHASABLE', 'CROSS_TEAM_STOCK', 'EOL'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      statusFilter === st 
                        ? 'bg-rose-600 text-white shadow-sm' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st === 'ALL' ? 'Tất Cả (184)' : st === 'PURCHASABLE' ? 'Có Thể Mua' : st === 'CROSS_TEAM_STOCK' ? 'Tồn Kho Team Bạn' : 'Hãng Ngừng SX (EOL)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Quy định bắt buộc: <strong className="text-emerald-600 dark:text-emerald-400">Chỉ mã có QCode chính thức mới được đưa vào Thẩm định ngày 25</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 uppercase">
                  <th className="py-2.5 px-3">Mã Đơn / QCode</th>
                  <th className="py-2.5 px-3">Tên Phụ Tùng & Maker</th>
                  <th className="py-2.5 px-3">Vị Trí Máy (Line)</th>
                  <th className="py-2.5 px-3">Số Lượng & Giá</th>
                  <th className="py-2.5 px-3">Quét Interlock Y/N</th>
                  <th className="py-2.5 px-3">LEC Đánh Dấu Target / Over</th>
                  <th className="py-2.5 px-3 text-right">Thao Tác Kỹ Thuật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredRequisitions.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{item.id}</span>
                      <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono flex items-center gap-1">
                        {item.qCode}
                        {item.isTempCode && <Badge variant="danger">TMP (CHƯA AUDIT)</Badge>}
                      </div>
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
                    <td className="py-3 px-3">
                      {item.agingInterlockFlag === 'Y' ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          TỒN TEAM BẠN ({item.crossTeamStockQty} EA)
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ĐỦ ĐIỀU KIỆN MUA
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {/* Strictly Non-Automated Manual Tagging by LEC */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => classifyTargetOver(item.id, 'TARGET')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            item.planClassification === 'TARGET'
                              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-600 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          🟢 TARGET
                        </button>
                        <button
                          onClick={() => classifyTargetOver(item.id, 'OVER', 'OVR-01', item.workOrderNo || 'WO-248926091')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            item.planClassification === 'OVER'
                              ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          🔴 OVER
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex gap-1.5 justify-end">
                        {item.status !== 'EOL' && (
                          <button
                            onClick={() => reclassifyEol(item.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold transition-colors"
                            title="Đổi phân loại sang Ngừng sản xuất (EOL) nếu hãng không còn bán"
                          >
                            Gắn EOL
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenMilestoneModal(item)}
                          className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950 dark:hover:bg-cyan-900 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Tiến Độ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INBOUND DELIVERY MILESTONES */}
      {activeTab === 'MILESTONES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Theo Dõi Tiến Độ Hàng Về Cảng & Kế Hoạch Phân Bổ Chi Phí Tháng
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Quản lý các mốc trung gian trước khi hàng về dock kho HW (phần mà EMS cũ không có).
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Kỳ Kế Toán: 2026-11</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 uppercase">
                  <th className="py-2.5 px-3">Mã Phiếu / QCode</th>
                  <th className="py-2.5 px-3">Phụ Tùng & Số Lượng</th>
                  <th className="py-2.5 px-3">Ngày NCC Xác Nhận</th>
                  <th className="py-2.5 px-3">Dự Kiến Về Dock HW</th>
                  <th className="py-2.5 px-3">Kế Hoạch Phân Bổ Xuất Dùng 3 Tháng</th>
                  <th className="py-2.5 px-3 text-right">Cấu Hình</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
                {requisitions.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 dark:text-white">{item.id}</span>
                      <div className="text-[11px] text-cyan-600 dark:text-cyan-400">{item.qCode}</div>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{item.partName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {item.quantity} {item.unit} (${(item.quantity * item.estimatedUnitPrice).toLocaleString()} USD)
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {item.vendorConfirmDate ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.vendorConfirmDate}</span>
                      ) : (
                        <span className="text-slate-400 italic font-sans">Chờ NCC báo</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {item.etaDate ? (
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold">{item.etaDate}</span>
                      ) : (
                        <span className="text-slate-400 italic font-sans">Chờ vận đơn</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      {item.monthlyAllocations && item.monthlyAllocations.length > 0 ? (
                        <div className="flex gap-1.5 flex-wrap">
                          {item.monthlyAllocations.map((alloc, idx) => (
                            <div key={idx} className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px]">
                              <span className="text-slate-500 dark:text-slate-400 font-mono">{alloc.month}:</span>{' '}
                              <strong className="text-emerald-600 dark:text-emerald-400">{alloc.qty} EA</strong>{' '}
                              <span className="text-slate-400 font-mono">(${alloc.amount})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa lập kế hoạch</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleOpenMilestoneModal(item)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold font-sans transition-colors"
                      >
                        Thiết Lập
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 3-PARTY BRIDGE */}
      {activeTab === 'CLARIFICATIONS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Bàn Điều Phối Hỏi Đáp 3 Bên (Reviewer / Management ↔ LEC ↔ Kỹ Sư)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              LEC đóng vai trò cầu nối: nhận câu hỏi từ Ban Quản Lý, bổ sung ghi chú kỹ thuật và chuyển tiếp cho Kỹ sư trả lời.
            </p>
          </div>

          <div className="space-y-3">
            {clarifications.map(c => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{c.qCode}</span>
                    <span>—</span>
                    <span>{c.partName}</span>
                  </div>
                  <Badge variant={c.status === 'RESOLVED' ? 'success' : 'warning'}>
                    {c.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">1. Câu hỏi từ Lãnh Đạo (Reviewer):</span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-medium">"{c.reviewerQuestion}"</p>
                </div>

                {c.engineerResponse && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px]">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">2. Phản hồi từ Kỹ Sư:</span>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5">{c.engineerResponse}</p>
                  </div>
                )}

                {c.status === 'PENDING_LEC' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="LEC ghi chú kỹ thuật trước khi chuyển tiếp cho Kỹ Sư..."
                      value={selectedInquiryId === c.id ? lecNoteInput : ''}
                      onChange={e => { setSelectedInquiryId(c.id); setLecNoteInput(e.target.value); }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs"
                    />
                    <button
                      onClick={() => handleForwardToEngineer(c.id)}
                      className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-sm transition-all"
                    >
                      Chuyển Tiếp Cho Kỹ Sư Công Đoạn
                    </button>
                  </div>
                ) : c.status === 'ENGINEER_REPLIED' ? (
                  <button
                    onClick={() => closeClarificationInquiry(c.id)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    Xác Nhận Đã Rõ & Đóng Câu Hỏi
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DEADLINE CONFIGURATION & BUDGET */}
      {activeTab === 'DEADLINES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              Thiết Lập Deadline Kiểm Thảo Ngày 25
            </h3>

            {deadlineSavedNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đã cập nhật cấu hình Deadline thành công!</span>
              </div>
            )}

            <form onSubmit={handleSaveDeadlines} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  1. Hạn Chót Nộp Giải Trình Tồn Kho:
                </label>
                <input
                  type="date"
                  value={justificationDeadlineInput}
                  onChange={e => setJustificationDeadlineInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  2. Thời Điểm Khóa Sổ Thẩm Định Ngày 25:
                </label>
                <input
                  type="date"
                  value={auditLockDeadlineInput}
                  onChange={e => setAuditLockDeadlineInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md shadow-rose-600/20 text-xs transition-all"
              >
                Lưu Cấu Hình Deadline
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Nguyên Tắc Ngân Sách SG Tháng (Strict No-Rollover)
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Hạn Mức Tháng 11/2026:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">${budget.monthlyAllocationBudget.toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Số Dư Chuyển Sang Kỳ Sau:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">$0 USD (Không Rollover)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                Toàn bộ hạn mức chưa sử dụng trong tháng sẽ tự động hết hiệu lực vào cuối tháng để đảm bảo số liệu kiểm thảo chính xác.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Config Modal */}
      {editingMilestoneItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-xs animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-500" />
                Thiết Lập Tiến Độ Hàng Về: {editingMilestoneItem.qCode}
              </h3>
              <button 
                onClick={() => setEditingMilestoneItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Ngày NCC Xác Nhận:</label>
                <input
                  type="date"
                  value={vendorConfirmInput}
                  onChange={e => setVendorConfirmInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Dự Kiến Về Dock Kho HW (ETA):</label>
                <input
                  type="date"
                  value={etaInput}
                  onChange={e => setEtaInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Kế Hoạch Xuất Dùng 3 Tháng (Tổng: {editingMilestoneItem.quantity} EA):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">Tháng 11/2026:</span>
                    <input
                      type="number"
                      value={m1Qty}
                      onChange={e => setM1Qty(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Tháng 12/2026:</span>
                    <input
                      type="number"
                      value={m2Qty}
                      onChange={e => setM2Qty(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Tháng 01/2027:</span>
                    <input
                      type="number"
                      value={m3Qty}
                      onChange={e => setM3Qty(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setEditingMilestoneItem(null)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveMilestones}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-sm"
              >
                Lưu Tiến Độ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
