import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { 
  HelpCircle, 
  FileSpreadsheet, 
  CheckCircle, 
  Send,
  FileCheck2,
  Scale,
  ShieldCheck,
  Download,
  Upload,
  FileText,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  X,
  UserCheck
} from 'lucide-react';
import { RequisitionItem } from '../../types';

export const CostManagementPortalView: React.FC = () => {
  const { 
    requisitions, 
    budget, 
    clarifications, 
    agingJustifications,
    costClearance,
    createClarificationInquiry,
    issueCostClearance 
  } = useProcurement();

  const [activeTab, setActiveTab] = useState<'AUDIT_QUEUE' | 'AGING_REVIEW' | 'CLEARANCE_EXCEL'>('AUDIT_QUEUE');
  const [inquiryModalItem, setInquiryModalItem] = useState<RequisitionItem | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [clearanceNotice, setClearanceNotice] = useState(false);

  // Filter items eligible for Beginning-of-Month audit:
  // MANDATORY: Must have official QCode (no TMP codes allowed as per Golden Rule #5!)
  const auditEligibleItems = requisitions.filter(r => !r.isTempCode && r.planClassification !== 'UNCLASSIFIED');
  const blockedTempItems = requisitions.filter(r => r.isTempCode);

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryModalItem || !questionInput) return;
    createClarificationInquiry(
      inquiryModalItem.id,
      inquiryModalItem.qCode,
      inquiryModalItem.partName,
      questionInput,
      inquiryModalItem.quantity * inquiryModalItem.estimatedUnitPrice
    );
    setInquirySuccess(true);
    setQuestionInput('');
    setTimeout(() => {
      setInquirySuccess(false);
      setInquiryModalItem(null);
    }, 2000);
  };

  const handleIssueClearance = () => {
    issueCostClearance('Tran Thi Huong (Cost Mgmt Reviewer)');
    setClearanceNotice(true);
    setTimeout(() => setClearanceNotice(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                UI-ROLE-06: Cổng Thẩm Định Ban Quản Lý Chi Phí (Cost Management Portal)
              </h2>
              <Badge variant="purple">Reviewer & Assistant (1 Người Duy Nhất)</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Thẩm tra chi phí đầu tháng (Ngày 01-05), kiểm thảo lý do Over, duyệt hồ sơ giải trình tồn kho và cấp chứng chỉ Clearance phục vụ họp Ban Giám Đốc.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-slate-400">Chuyên viên Thẩm định:</span>
          <strong className="text-indigo-600 dark:text-indigo-400">Trần Thị Hường</strong>
          <span className="text-slate-400">• Bộ phận Quản Lý Chi Phí</span>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
        {[
          { id: 'AUDIT_QUEUE', label: '1. Danh Mục Thẩm Định Đầu Tháng', count: auditEligibleItems.length },
          { id: 'AGING_REVIEW', label: '2. Kiểm Thảo Tồn Kho Chậm Luân Chuyển', count: agingJustifications.length },
          { id: 'CLEARANCE_EXCEL', label: '3. Cấp Phê Chuẩn & Báo Cáo 4 Sheet', count: null },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === tab.id ? 'bg-white text-indigo-600' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3. TAB 1: Audit Queue with Strict Official QCode Requirement */}
      {activeTab === 'AUDIT_QUEUE' && (
        <div className="space-y-4">
          {/* Warning Banner on Blocked Temporary Codes */}
          {blockedTempItems.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold block">
                    QUY ĐỊNH BẮT BUỘC (NGUYÊN TẮC VÀNG #5): ĐÃ CHẶN {blockedTempItems.length} HẠNG MỤC MÃ TẠM (TMP-HW-xxxx)
                  </span>
                  <span>
                    Các hạng mục chưa được LEC cấp mã QCode chính thức trên hệ thống ERP/EMS sẽ bị khóa khỏi phiên thẩm định chi phí đầu tháng.
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Hồ Sơ Đủ Điều Kiện Thẩm Định ({auditEligibleItems.length} Hạng Mục Chính Thức)
              </h3>
              <span className="text-xs text-slate-400">
                Thẩm tra định kỳ: Ngày 01-05 hàng tháng
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Mã PR / QCode</th>
                    <th className="p-3">Tên Linh Kiện</th>
                    <th className="p-3">Phân Loại LEC</th>
                    <th className="p-3">Mã Work Order</th>
                    <th className="p-3">Số Lượng & Đơn Giá</th>
                    <th className="p-3">Thành Tiền (USD)</th>
                    <th className="p-3 text-right">Phát Hành Thắc Mắc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditEligibleItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white font-mono">{item.id}</div>
                        <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">{item.qCode}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">{item.partName}</div>
                        <div className="text-[10px] text-slate-400">{item.machineFriendlyName} • {item.requestorName}</div>
                      </td>
                      <td className="p-3">
                        {item.planClassification === 'TARGET' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            TARGET
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            OVER • {item.overReasonCode}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-600">
                        {item.workOrderNo || <span className="text-slate-400 font-normal italic">Không có</span>}
                      </td>
                      <td className="p-3 font-mono">
                        <div>{item.quantity} {item.unit}</div>
                        <div className="text-[10px] text-slate-400">${item.estimatedUnitPrice}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        ${(item.quantity * item.estimatedUnitPrice).toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setInquiryModalItem(item)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                        >
                          Gửi Thắc Mắc Cho LEC
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

      {/* 4. TAB 2: Aging Stock Review */}
      {activeTab === 'AGING_REVIEW' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Kiểm Thảo Giải Trình Tồn Kho Chậm Luân Chuyển (&gt;30 Ngày)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Theo dõi văn bản giải trình và cam kết ngày sử dụng hết của các kỹ sư hiện trường phục vụ kiểm soát chi phí ứ đọng.
            </p>

            <div className="space-y-3">
              {agingJustifications.map(j => (
                <div key={j.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="font-mono text-slate-900 dark:text-white">
                      {j.qCode} — {j.partName}
                    </span>
                    <span className="text-amber-600 font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-[10px]">
                      Tuổi tồn: {j.inventoryAgeDays} ngày • Số lượng tồn: {j.stockQty} {j.unit}
                    </span>
                  </div>

                  <div className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Lý do kỹ thuật:</strong> {j.justificationReason}
                  </div>

                  <div className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Kế hoạch sử dụng:</strong> {j.actionPlan}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-400 font-mono">
                    <span>Kỹ sư: <strong>{j.engineerName}</strong> ({j.partGroup})</span>
                    <span>Cam kết sử dụng trước: <strong className="text-emerald-600">{j.targetUsageDate}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: Cost Clearance & 4-Sheet Summary */}
      {activeTab === 'CLEARANCE_EXCEL' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
              Cấp Chứng Chỉ Thẩm Duyệt Chi Phí (Cost Clearance)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Sau khi kiểm thảo thỏa đáng danh mục Target/Over và giải trình tồn kho, Chuyên viên Quản lý Chi phí phát hành Cost Clearance để kích hoạt phê duyệt PRV/PO trên EMS và cho phép xuất kho.
            </p>

            {clearanceNotice && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã phát hành thành công Chứng chỉ Thẩm duyệt Chi phí kỳ Tháng {budget.periodMonth}!</span>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2 text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-slate-400">Trạng thái thẩm duyệt:</span>
                <strong className={`font-mono font-bold ${costClearance.status === 'CLEARED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {costClearance.status === 'CLEARED' ? 'ĐÃ PHÊ CHUẨN (CLEARED)' : 'ĐANG THẨM TRA'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mã chứng thực số:</span>
                <strong className="font-mono text-slate-900 dark:text-white">{costClearance.stampCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tổng số hạng mục đã thẩm định:</span>
                <strong className="font-mono">{costClearance.totalItemsAudited} Hạng mục</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời điểm cấp duyệt:</span>
                <strong className="font-mono">{costClearance.clearedAt}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleIssueClearance}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Ký Phát Hành Cost Clearance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Creation Modal */}
      {inquiryModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Phát Hành Thắc Mắc Thẩm Tra Cho LEC
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Mã: <strong>{inquiryModalItem.qCode}</strong> — {inquiryModalItem.partName} (${(inquiryModalItem.quantity * inquiryModalItem.estimatedUnitPrice).toLocaleString()})
            </p>

            <form onSubmit={handleSendInquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nội dung câu hỏi yêu cầu giải trình
                </label>
                <textarea
                  rows={4}
                  required
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="Yêu cầu làm rõ lý do tại sao mua Over, yêu cầu bổ sung hình ảnh giám định sự cố hoặc giải trình đơn giá..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInquiryModalItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Gửi Cho LEC Điều Phối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
