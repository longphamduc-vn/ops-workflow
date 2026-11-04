import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { 
  Calculator, 
  Factory, 
  Users, 
  DollarSign, 
  Server, 
  BookOpen, 
  CheckCircle2,
  Radio,
  Building2,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { budget, updateBudgetCap } = useProcurement();

  const [activeTab, setActiveTab] = useState<'BUDGET' | 'PLANT' | 'ROLES' | 'LOGIC' | 'GATEWAY' | 'DICTIONARIES'>('BUDGET');
  const [budgetCapInput, setBudgetCapInput] = useState(budget.monthlyAllocationBudget);
  const [saveNotice, setSaveNotice] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  // Line floor tester state
  const [testLineInput, setTestLineInput] = useState('201');

  const computedFloor = testLineInput ? `${testLineInput.charAt(0)}F` : '1F';

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    updateBudgetCap(Number(budgetCapInput));
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 3000);
  };

  const handleSimulatePing = () => {
    setPingSuccess(true);
    setTimeout(() => setPingSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              UI-ROLE-05: Cổng Cài Đặt Quản Trị Hệ Thống (Admin Settings Console)
            </h2>
            <Badge variant="purple">Cấu Hình Đa Nhà Máy (Multi-Plant)</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản trị Master Data: Cấu trúc phân xưởng, Định mức 5 nhu cầu, Ngân sách SG No-Rollover và Giới hạn tần suất Gateway EMS.
          </p>
        </div>

        {/* 6 Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          {[
            { id: 'BUDGET', label: '1. Ngân Sách SG', icon: <DollarSign className="w-3.5 h-3.5" /> },
            { id: 'PLANT', label: '2. Sơ Đồ Xưởng & Tầng', icon: <Factory className="w-3.5 h-3.5" /> },
            { id: 'ROLES', label: '3. Ma Trận Vai Trò', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'LOGIC', label: '4. Định Mức 5 Nhu Cầu', icon: <Calculator className="w-3.5 h-3.5" /> },
            { id: 'GATEWAY', label: '5. Cổng EMS Nexacro', icon: <Server className="w-3.5 h-3.5" /> },
            { id: 'DICTIONARIES', label: '6. Bộ Mã Over OVR', icon: <BookOpen className="w-3.5 h-3.5" /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === t.id 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {saveNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Cấu hình đã được lưu và cập nhật đồng bộ cho toàn bộ hệ thống!</span>
        </div>
      )}

      {/* TAB 1: SG BUDGET & STRICT NO-ROLLOVER POLICY */}
      {activeTab === 'BUDGET' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-2xl mx-auto space-y-5 text-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cấu Hình Ngân Sách SG Tháng & Nguyên Tắc No-Rollover</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">Khóa sổ rạch ròi theo từng tháng tài chính độc lập, tuyệt đối không cộng dồn số dư.</p>
            </div>
            <Badge variant="error">Nguyên Tắc Vàng #10</Badge>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Nguyên tắc toán học kiểm soát ngân sách:</span>
            <div className="font-mono text-cyan-600 dark:text-cyan-400 text-sm font-bold">
              Số Dư Chuyển Sang Tháng Sau = $0 USD (Bắt Buộc Hết Hạn)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Dù phân xưởng chỉ tiêu \$120,000 trên tổng \$150,000 được giao, số dư \$30,000 sẽ tự động hủy vào 23:59 ngày cuối tháng và không được chuyển sang tháng sau.
            </p>
          </div>

          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Trần Ngân Sách Mua Sắm SG Mặc Định Hàng Tháng (USD)
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
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Cập Nhật Trần Ngân Sách
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: PLANT TOPOLOGY & FLOOR RULE */}
      {activeTab === 'PLANT' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-3xl mx-auto space-y-5 text-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cấu Trúc Nhà Máy & Quy Tắc Tầng (Floor Logic)</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">Áp dụng công thức <code>Left(Line, 1) = Tầng (Floor)</code></p>
            </div>
            <Badge variant="info">Multi-Plant Topology</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30">
              <span className="font-bold text-rose-700 dark:text-rose-300 block">Factory HW (Module 1)</span>
              <span className="text-[11px] text-slate-500 font-mono">Org ID: 28753 • Smart Watch</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 opacity-70">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Factory TV</span>
              <span className="text-[11px] text-slate-500 font-mono">Org ID: 29011 • Large OLED</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 opacity-70">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Factory Auto Display</span>
              <span className="text-[11px] text-slate-500 font-mono">Org ID: 31054 • Automotive</span>
            </div>
          </div>

          {/* Interactive Tester */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Trình Thử Nghiệm Quy Tắc Biên Dịch Số Chuyền $\rightarrow$ Tầng:
            </span>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={testLineInput}
                onChange={(e) => setTestLineInput(e.target.value)}
                placeholder="Nhập số chuyền (e.g. 201, 301)"
                className="w-48 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-xs">
                Kết quả tầng: Tầng {computedFloor}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROLE ARCHITECTURE (No Warehouse role) */}
      {activeTab === 'ROLES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-4xl mx-auto space-y-5 text-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ma Trận 5 Vai Trò Người Dùng Chuẩn Hóa</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">Loại bỏ hoàn toàn vai trò Thủ kho và Trưởng công đoạn phê duyệt nội bộ.</p>
            </div>
            <Badge variant="purple">Triệt Tiêu Phân Cấp Công Đoạn</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { role: 'Field Engineer (Requestor)', scope: 'Theo cụm máy thân thiện (Die Bonder, TAB...)', note: 'Đồng nghiệp ngang hàng, trực tiếp tạo đơn & chuẩn bị folder QCode' },
              { role: 'Leader Part & Team', scope: 'Theo Team => Part (PO Module 2)', note: 'Giám sát kỹ thuật, theo dõi WO (Tuyệt đối không có nút duyệt PRV)' },
              { role: 'Team LEC (Master Workbench)', scope: 'Toàn bộ Team (Đa LEC)', note: 'Gom mẻ, quét Interlock, đánh dấu Target/Over, mốc Inbound & cầu nối 3 bên' },
              { role: 'Cost Management Department', scope: 'Toàn nhà máy (1 Chuyên viên duy nhất)', note: 'Hợp nhất Reviewer & Assistant; thẩm định chi phí đầu tháng (01-05)' },
              { role: 'System Administrator', scope: 'Toàn quyền cấu hình tham số', note: 'Quản trị cây xưởng, định mức, giới hạn tần suất Gateway EMS' },
            ].map(r => (
              <div key={r.role} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">{r.role}</span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold block">{r.scope}</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: 5-DEMAND FORMULAS */}
      {activeTab === 'LOGIC' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-3xl mx-auto space-y-5 text-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Công Thức Tính Toán 5 Loại Nhu Cầu</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">Setup, Improve, Breakdown, PM, Safety Stock</p>
            </div>
            <Badge variant="info">Công Thức Tự Động</Badge>
          </div>

          <div className="space-y-3">
            {[
              { type: '1. BREAKDOWN (Sự Cố)', formula: 'Nhu cầu = 1 EA (Thay thế trực tiếp)', req: 'Bắt buộc gắn mã Work Order (WO) sự cố' },
              { type: '2. PM (Bảo Dưỡng)', formula: 'Nhu cầu = StdQty x Số Lượng Máy Đến Hạn Bảo Dưỡng', req: 'Căn cứ vào chu kỳ tuổi thọ EBOM (Lifespan)' },
              { type: '3. IMPROVE (Cải Tiến)', formula: 'Nhu cầu = Số lượng theo đề xuất dự án cải tiến', req: 'Đánh giá Target vs Over theo ngân sách dự án' },
              { type: '4. SETUP (Model Mới)', formula: 'Nhu cầu = Bộ đồ gá mới (Jig/Nozzle) theo Model', req: 'Gán mã OVR-04 khi vượt ngân sách NPI' },
              { type: '5. SAFETY STOCK (Dự Phòng)', formula: 'Safety Stock = Max(DailyUsage x LeadTime x Multiplier - OnHand, 0)', req: 'Hệ số Multiplier = 1.25' },
            ].map(f => (
              <div key={f.type} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="font-bold text-slate-900 dark:text-white mb-1">{f.type}</div>
                <div className="font-mono text-cyan-600 dark:text-cyan-400 font-bold mb-0.5">{f.formula}</div>
                <div className="text-[11px] text-slate-400">Yêu cầu: {f.req}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EMS GATEWAY & RATE LIMITER */}
      {activeTab === 'GATEWAY' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-3xl mx-auto space-y-5 text-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cổng Nexacro EMS Gateway & Giới Hạn Tần Suất</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">Thuật toán Token Bucket bảo vệ máy chủ EMS khỏi quá tải.</p>
            </div>
            <Badge variant="success">Token Bucket Active</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block mb-1">Tốc độ tối đa cho phép:</span>
              <strong className="text-xl font-mono text-emerald-600">5 Requests / Giây</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block mb-1">Dung lượng hàng đợi burst:</span>
              <strong className="text-xl font-mono text-blue-600">50 Requests</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Kiểm tra kết nối Gateway EMS</span>
              <span className="text-[11px] text-slate-400 font-mono">Endpoint: /nexacro/v1/sync/inventory</span>
            </div>
            <button
              onClick={handleSimulatePing}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              Ping Thử Nghiệm
            </button>
          </div>

          {pingSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Kết nối ổn định! Độ trễ phản hồi: <strong>38ms</strong> (Mã phản hồi: EMS-200 OK)</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: OVER CODES MASTER DICTIONARY */}
      {activeTab === 'DICTIONARIES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-4xl mx-auto space-y-5 text-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Từ Điển 6 Mã Nguyên Nhân Over Tiêu Chuẩn</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">Dùng để LEC đánh dấu phân loại và đối chiếu trong phiên kiểm thảo đầu tháng.</p>
            </div>
            <Badge variant="error">6 Mã Tiêu Chuẩn</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-2.5 border">Mã Over</th>
                  <th className="p-2.5 border">Tên Nguyên Nhân</th>
                  <th className="p-2.5 border">Diễn Giải Vận Hành</th>
                  <th className="p-2.5 border">Hồ Sơ Đối Chiếu Bắt Buộc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { code: 'OVR-01', name: 'Đột xuất hỏng hóc dừng chuyền', desc: 'Sự cố thiết bị bất ngờ gây gián đoạn sản xuất (Line Stop)', doc: 'Mã Work Order (WO) sự cố' },
                  { code: 'OVR-02', name: 'Tăng sản lượng đột biến', desc: 'Nhà máy tăng công suất vượt kế hoạch ban đầu', doc: 'Kế hoạch sản xuất cập nhật' },
                  { code: 'OVR-03', name: 'Chậm trễ chuyển giao liên pháp nhân', desc: 'Hàng chuyển giao từ pháp nhân khác bị trễ, phải mua gấp', doc: 'Mã phiếu Transfer trễ hạn' },
                  { code: 'OVR-04', name: 'Setup model mới (D111 -> D222)', desc: 'Cải tạo, căn chỉnh máy để chạy sản phẩm mới', doc: 'Phiên bản Model & Kế hoạch NPI' },
                  { code: 'OVR-05', name: 'Biến động giá / Tỷ giá NCC', desc: 'NCC tăng giá đơn lẻ hoặc biến động tỷ giá ngoại tệ', doc: 'Báo giá so sánh của Mua hàng' },
                  { code: 'OVR-06', name: 'Hư hỏng trong căn chỉnh/lắp đặt', desc: 'Linh kiện bị vỡ, hỏng trong quá trình kỹ sư lắp ráp thử nghiệm', doc: 'Biên bản bất thường kỹ thuật' },
                ].map(item => (
                  <tr key={item.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 border font-mono font-bold text-rose-600">{item.code}</td>
                    <td className="p-2.5 border font-semibold">{item.name}</td>
                    <td className="p-2.5 border text-slate-600 dark:text-slate-400">{item.desc}</td>
                    <td className="p-2.5 border font-medium text-indigo-600 dark:text-indigo-400">{item.doc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
