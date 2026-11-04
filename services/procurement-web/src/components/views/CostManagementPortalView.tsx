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
  FileText
} from 'lucide-react';

export const CostManagementPortalView: React.FC = () => {
  const { requisitions, budget, createClarificationInquiry } = useProcurement();

  const [inquiryModalItem, setInquiryModalItem] = useState<any | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [clearanceIssued, setClearanceIssued] = useState(false);
  const [excelExportNotice, setExcelExportNotice] = useState(false);
  const [scanUploaded, setScanUploaded] = useState(false);

  const overItems = requisitions.filter(r => r.planClassification === 'OVER');

  const handleSendInquiry = () => {
    if (!inquiryModalItem || !questionInput) return;
    createClarificationInquiry(inquiryModalItem.id, questionInput);
    setQuestionInput('');
    setInquiryModalItem(null);
  };

  const handleSimulateExcelExport = () => {
    setExcelExportNotice(true);
    setTimeout(() => setExcelExportNotice(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              UI-ROLE-06: Cổng Thẩm Định Ban Quản Lý (Management Audit Portal)
            </h2>
            <Badge variant="purple">Reviewer & Assistant (Thẩm Định Ngày 25)</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Thẩm tra tính hợp lý của các hạng mục Mua ngoài kế hoạch (Over), kiểm thảo tồn kho chưa dùng và ký duyệt hồ sơ Offline ngày 25.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSimulateExcelExport}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Xuất File Excel (4 Sheet Mẫu)
          </button>
          <button
            onClick={() => setClearanceIssued(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
          >
            <FileCheck2 className="w-4 h-4" />
            Cấp Phê Chuẩn Thẩm Định
          </button>
        </div>
      </div>

      {excelExportNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Đã tạo file <strong>COST_AUDIT_202611_HW.xlsx</strong> gồm Sheet 1 (Kiểm kê tồn kho), Sheet 2 (Ngân sách SG No-Rollover), Sheet 3 (Danh sách Over), và Sheet 4 (Tiết kiệm Interlock).</span>
        </div>
      )}

      {clearanceIssued && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-xs space-y-2">
          <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            ĐÃ CẤP CHỨNG NHẬN THẨM ĐỊNH KỲ THÁNG 11/2026 CHO TOÀN BỘ TEAM 2!
          </div>
          <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
            Hồ sơ đã được phê duyệt. Hệ thống mở khóa toàn diện để LEC thao tác tạo mã đơn PRV/PO trên EMS và kích hoạt xuất kho chuyển giao. Mua bán và chuyển giao chính thức bắt đầu!
          </p>
        </div>
      )}

      {/* 4-Sheet Fixed Template KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sheet 1: Giải Trình Tồn Kho</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">14/16 Hoàn Tất</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tồn kho &gt;30 ngày đã giải trình</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sheet 2: Ngân Sách SG (No Rollover)</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">${budget.monthlyAllocationBudget.toLocaleString()} USD</div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-semibold">Khóa sổ tháng 11: 0% dồn số dư</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sheet 3: Hạng Mục Over Ngoài Kế Hoạch</div>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">{overItems.length} Dòng Phiếu</div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5 font-medium">${budget.unplannedOverSpend.toLocaleString()} USD tổng chi</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sheet 4: Tiết Kiệm Qua Interlock</div>
          <div className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-1">$1,320 USD</div>
          <div className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-0.5 font-medium">Tái sử dụng tồn kho Team 1</div>
        </div>
      </div>

      {/* Unplanned Over Review Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-rose-500" />
              Thẩm Định Chi Tiết Danh Sách Hạng Mục Gây Over (Chuẩn Bị Phê Duyệt)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              100% các dòng Over bắt buộc phải có giải trình kỹ thuật và mã Work Order sự cố hợp lệ.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Phiên Thẩm Định: 2026-11-25</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 uppercase">
                <th className="py-2.5 px-3">Mã Phiếu / QCode</th>
                <th className="py-2.5 px-3">Tên Phụ Tùng & Model</th>
                <th className="py-2.5 px-3">Vị Trí Máy</th>
                <th className="py-2.5 px-3">Giá Trị Over</th>
                <th className="py-2.5 px-3">Mã Lý Do & Căn Cứ</th>
                <th className="py-2.5 px-3">Mã Lệnh Sửa Chữa</th>
                <th className="py-2.5 px-3 text-right">Thao Tác Thẩm Định</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
              {overItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 dark:text-white">{item.id}</span>
                    <div className="text-[11px] text-cyan-600 dark:text-cyan-400">{item.qCode}</div>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{item.partName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.maker} {item.model}</div>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <div className="text-slate-800 dark:text-slate-200 font-medium">{item.machineFriendlyName}</div>
                    <div className="text-[11px] text-slate-400">{item.lineName}</div>
                  </td>
                  <td className="py-3 px-3 font-bold text-rose-600 dark:text-rose-400">
                    ${(item.quantity * item.estimatedUnitPrice).toLocaleString()} USD
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <Badge variant="danger">{item.overReasonCode || 'OVR-01'}</Badge>
                  </td>
                  <td className="py-3 px-3 text-cyan-600 dark:text-cyan-400 font-medium">
                    {item.workOrderNo || 'WO-248926091'}
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <button
                      onClick={() => setInquiryModalItem(item)}
                      className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950 dark:hover:bg-cyan-900 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Yêu Cầu Giải Trình
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Modal */}
      {inquiryModalItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Gửi Câu Hỏi Thẩm Định Cho LEC: {inquiryModalItem.id} ({inquiryModalItem.qCode})
              </h4>
              <button 
                onClick={() => setInquiryModalItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-slate-600 dark:text-slate-300">
                Nhập câu hỏi chất vấn kỹ thuật hoặc yêu cầu tài liệu bổ sung. Câu hỏi sẽ được gửi đến <strong>LEC</strong> để điều phối với kỹ sư phụ trách.
              </p>

              <textarea
                placeholder="Ví dụ: Đề nghị cung cấp biên bản sự cố dừng máy ca đêm, ảnh chụp board nguồn chập cháy và giải trình lý do tại sao không thể dùng phụ tùng của Team 1..."
                value={questionInput}
                onChange={e => setQuestionInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                rows={4}
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setInquiryModalItem(null)}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 text-xs"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleSendInquiry}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-1.5 text-xs transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                Gửi Cho LEC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
