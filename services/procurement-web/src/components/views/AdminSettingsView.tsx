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
  Cpu
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { budget, updateBudgetCap } = useProcurement();

  const [activeTab, setActiveTab] = useState<'BUDGET' | 'PLANT' | 'ROLES' | 'LOGIC' | 'GATEWAY' | 'DICTIONARIES'>('BUDGET');
  const [budgetCapInput, setBudgetCapInput] = useState(budget.monthlyAllocationBudget);
  const [saveNotice, setSaveNotice] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    updateBudgetCap(budgetCapInput);
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
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              UI-ROLE-05: Cổng Cài Đặt Quản Trị Hệ Thống (Admin Console)
            </h2>
            <Badge variant="purple">Cấu Hình Tham Số Đa Nhà Máy (Multi-Plant)</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản trị Master Data: Sơ đồ phân xưởng, Định mức nhu cầu, Ngân sách SG No-Rollover và Cổng EMS Gateway.
          </p>
        </div>

        {/* 6 Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          {[
            { id: 'BUDGET', label: '1. Ngân Sách SG', icon: <DollarSign className="w-3.5 h-3.5" /> },
            { id: 'PLANT', label: '2. Sơ Đồ Xưởng', icon: <Factory className="w-3.5 h-3.5" /> },
            { id: 'ROLES', label: '3. Phân Quyền RBAC', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'LOGIC', label: '4. Logic Đặt Hàng', icon: <Calculator className="w-3.5 h-3.5" /> },
            { id: 'GATEWAY', label: '5. Cổng EMS', icon: <Server className="w-3.5 h-3.5" /> },
            { id: 'DICTIONARIES', label: '6. Mã Over', icon: <BookOpen className="w-3.5 h-3.5" /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === t.id 
                  ? 'bg-rose-600 text-white shadow-sm' 
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
          <span>Cấu hình đã được lưu và cập nhật đồng bộ cho toàn bộ các vai trò trên hệ thống!</span>
        </div>
      )}

      {/* TAB 1: SG BUDGET & STRICT NO-ROLLOVER POLICY */}
      {activeTab === 'BUDGET' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm max-w-2xl mx-auto space-y-5 text-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cấu Hình Ngân Sách SG Tháng & Nguyên Tắc No-Rollover</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">Khóa sổ rạch ròi theo từng tháng tài chính độc lập, không cộng dồn số dư.</p>
            </div>
            <Badge variant="danger">Quy Tắc Số 10</Badge>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Công thức toán học kiểm soát ngân sách:</span>
            <div className="font-mono text-cyan-600 dark:text-cyan-400 text-sm font-bold">
              {"Hạn Mức Tháng(M) = Ngân Sách Nhập Mới(M) [Số Dư Tháng Trước = 0]"}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Số dư chưa chi tiêu hết của tháng trước tự động hết hiệu lực vào 23:59:59 của ngày cuối tháng. Tháng mới bắt đầu 100% bằng hạn mức do LEC nhập thủ công, ngăn chặn hiện tượng dồn toa sốc dòng tiền.
            </p>
          </div>

          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Hạn Mức Ngân Sách SG Tháng 11/2026 (USD): (*)
              </label>
              <input 
                type="number"
                step="1000"
                value={budgetCapInput}
                onChange={e => setBudgetCapInput(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 font-bold text-white rounded-xl shadow-md shadow-rose-600/20 text-xs transition-all"
            >
              Lưu Cấu Hình Ngân Sách SG Team 2
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: PLANT TOPOLOGY & MULTI-PLANT EXPANSION */}
      {activeTab === 'PLANT' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 text-xs transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cấu Hình Sơ Đồ Phân Xưởng & Mở Rộng Đa Nhà Máy (Multi-Plant)</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Quy tắc giải mã tầng tự động: <code className="text-cyan-600 dark:text-cyan-400 font-mono bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded">Left(Line, 1) = Floor</code>. Dễ dàng nhân rộng cho Nhà máy TV, Auto Display...
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
            {[
              { plant: 'Factory HW', line: 'Line #201', floor: '2F', machines: 'DB-01, DB-02, EC-01', desc: 'Smart Watch Line 1 (Org 28753)' },
              { plant: 'Factory HW', line: 'Line #202', floor: '2F', machines: 'TAB-01, TAB-02', desc: 'Smart Watch Line 2 (Org 28753)' },
              { plant: 'Factory TV', line: 'Line #101', floor: '1F', machines: 'BLU-01, OC-01', desc: 'TV Display Module (Org 28810)' },
              { plant: 'Factory AU', line: 'Line #301', floor: '3F', machines: 'AUTO-DB, LAMI-01', desc: 'Automotive Cockpit (Org 28940)' },
            ].map((l, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">{l.plant}</span>
                  <span className="text-cyan-600 dark:text-cyan-400 text-[11px] font-bold">{l.line}</span>
                </div>
                <div className="text-slate-900 dark:text-white font-bold text-xs">Tầng: {l.floor}</div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px] font-sans">{l.machines}</div>
                <div className="text-slate-400 text-[10px] font-sans">{l.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ROLES & RBAC */}
      {activeTab === 'ROLES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 text-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ma Trận Phân Quyền 6 Vai Trò (Role-Based Access Control)</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">Phân định rạch ròi không gian làm việc giữa Hiện trường, Điều phối và Lãnh đạo.</p>
            </div>
            <Badge variant="info">6 Role Matrix</Badge>
          </div>

          <div className="space-y-2.5">
            {[
              { role: 'Kỹ Sư Công Đoạn (Requestor)', scope: 'Peer Engineers (CP/SG Part 1)', perm: 'Làm việc theo tên máy thân thiện, upload folder QCode, late EBOM, nộp Task tồn kho' },
              { role: 'Leader Công Đoạn (Leader)', scope: 'Team & Part Leaders', perm: 'Giám sát tiến độ mua sắm Team => Part => Process, duyệt Work Order sự cố' },
              { role: 'Điều Phối LEC (LEC Master)', scope: 'Multi-LEC (Pham Duc Long - 658359)', perm: 'Thẩm quyền duy nhất đánh dấu Target/Over, quét Interlock, RFQ, nhập budget No-Rollover' },
              { role: 'Thủ Kho Nhà Máy (Warehouse)', scope: 'Storekeeper Kho H1-H3', perm: 'Quét Barcode EM No xuất kho lắp máy, đối soát tồn kho vật lý vs EMS' },
              { role: 'Ban Quản Lý Thẩm Định (Management)', scope: 'Reviewer & Assistant (1 Người)', perm: 'Thẩm định Offline ngày 25, duyệt Mua Bán/Chuyển Giao, lưu trữ biên bản scan' },
              { role: 'Quản Trị Hệ Thống (Admin)', scope: 'System Administrator', perm: 'Cấu hình tham số toàn cục, sơ đồ xưởng đa đơn vị, Gateway EMS' },
            ].map((r, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{r.role}</span>
                  <span className="text-slate-400 ml-2 font-mono text-[11px]">({r.scope})</span>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{r.perm}</div>
                </div>
                <Badge variant="success">Hoạt Động</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REORDER LOGIC */}
      {activeTab === 'LOGIC' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 text-xs transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Công Thức Tự Động Tính Toán Nhu Cầu Theo Phân Loại Cơ Sở</h3>
          
          <div className="space-y-3 font-mono">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">1. SETUP / CHUYỂN ĐỔI MODEL:</span>
              <div className="text-slate-700 dark:text-slate-300 mt-1">SL_Mua = Số_Máy_Cần_Setup * Hệ_Số_Cavity - Tồn_Kho_Khả_Dụng</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">2. PM / BẢO DƯỠNG ĐỊNH KỲ:</span>
              <div className="text-slate-700 dark:text-slate-300 mt-1">SL_Mua = (Số_Chu_Kỳ_Tháng / Tuổi_Thọ_MTBF) * Số_Vị_Trí_Slot - Buffer_An_Toàn</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">3. SỰ CỐ MÁY HỎNG (BREAKDOWN):</span>
              <div className="text-slate-700 dark:text-slate-300 mt-1">SL_Mua = Số_Lượng_Hỏng_Thực_Tế (Gắn bắt buộc với Work Order máy dừng)</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EMS GATEWAY */}
      {activeTab === 'GATEWAY' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm max-w-xl mx-auto space-y-4 text-xs transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cổng Giao Tiếp EMS Nexacro Gateway Rate Limiting</h3>
            <Badge variant="success">Gateway Trực Tuyến</Badge>
          </div>

          <div className="space-y-3 font-mono bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500">EMS Server URL:</span>
              <span className="text-cyan-600 dark:text-cyan-400">http://ems.lgdisplay.com:9000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">max_concurrent:</span>
              <span className="text-slate-800 dark:text-white font-bold">3 kết nối</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">min_interval:</span>
              <span className="text-slate-800 dark:text-white font-bold">100 ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tài khoản kết nối:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">658359 (Pham Duc Long)</span>
            </div>
          </div>

          {pingSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Kết nối đến máy chủ EMS Gateway thành công! Độ trễ phản hồi: 24ms.</span>
            </div>
          )}

          <button
            onClick={handleSimulatePing}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 text-xs transition-all flex items-center justify-center gap-2"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-500" />
            Kiểm Tra Kết Nối Tức Thì (PING EMS)
          </button>
        </div>
      )}

      {/* TAB 6: OVER DICTIONARIES */}
      {activeTab === 'DICTIONARIES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 text-xs transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Danh Mục 6 Mã Chuẩn Hóa Giải Trình Lý Do Over (OVR-01 đến OVR-06)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { code: 'OVR-01', name: 'Sự cố máy hỏng bất thường (Breakdown)', desc: 'Bắt buộc đính kèm mã Work Order ca đêm và ảnh hiện trường' },
              { code: 'OVR-02', name: 'Sản lượng Smart Watch tăng đột xuất', desc: 'Có văn bản điều chỉnh công suất từ phòng Kế hoạch (PP)' },
              { code: 'OVR-03', name: 'Pháp nhân bạn chậm/vướng điều chuyển', desc: 'Quá hạn SLA 48h hoặc vướng thủ tục hải quan xuất nhập khẩu' },
              { code: 'OVR-04', name: 'Setup Model mới (D111 -> D222)', desc: 'Có dự án ECO / NPI chuyển đổi dây chuyền' },
              { code: 'OVR-05', name: 'Biến động giá từ Nhà cung cấp ngoài', desc: 'Xác nhận tăng giá theo báo giá thương mại từ Purchase Dept' },
              { code: 'OVR-06', name: 'Hư hại thao tác trong khi lắp đặt', desc: 'Biên bản kiểm điểm sự cố và đề xuất đào tạo lại thao tác' },
            ].map((c, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono text-xs">{c.code}</span>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{c.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
