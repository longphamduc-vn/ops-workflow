import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { 
  PlusCircle, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  Send,
  Clock,
  Check,
  FolderUp,
  FileCode,
  Image as ImageIcon,
  MessageSquare,
  AlertCircle,
  Building2,
  Cpu,
  Layers,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Paperclip,
  Calendar
} from 'lucide-react';

export const RequestorPortalView: React.FC = () => {
  const { 
    tasks, 
    clarifications, 
    qcodeSubmissions,
    addRequisition, 
    submitEngineerResponse, 
    submitAgingJustification,
    acceptInterTeamBorrow,
    submitQCodeFolder,
    budget
  } = useProcurement();

  const [activeTab, setActiveTab] = useState<'NEW_REQ' | 'FOLDER_UPLOAD' | 'AGING_TASKS' | 'CLARIFICATIONS'>('NEW_REQ');

  // Friendly Machine Selection State
  const [line, setLine] = useState<'201' | '202' | '301'>('201');
  const [machineType, setMachineType] = useState('DB-01');
  const [mechanism, setMechanism] = useState('MECH-01');
  const [selectedPart, setSelectedPart] = useState<'QDAB03583' | 'QDAD12236' | 'QCAD38190' | 'QCAD88102'>('QCAD38190');
  const [quantity, setQuantity] = useState(2);
  const [demandType, setDemandType] = useState<'SETUP' | 'IMPROVE' | 'BREAKDOWN' | 'PM' | 'SAFETY_STOCK'>('BREAKDOWN');
  const [workOrderNo, setWorkOrderNo] = useState('WO-248926095');
  const [isLateDeclaration, setIsLateDeclaration] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Folder Upload Simulation State
  const [folderName, setFolderName] = useState('');
  const [partNameInput, setPartNameInput] = useState('');
  const [makerInput, setMakerInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [specInput, setSpecInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const [folderSubmitSuccess, setFolderSubmitSuccess] = useState(false);

  // Clarification reply state
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);

  // Aging justification state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [justificationReason, setJustificationReason] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [targetUsageDate, setTargetUsageDate] = useState('2026-11-20');
  const [taskSubmitSuccess, setTaskSubmitSuccess] = useState(false);

  // Preset parts database for instant lookup
  const partPresets: Record<string, {
    name: string;
    maker: string;
    model: string;
    price: number;
    unitPriceFlag: 'Y' | 'N';
    agingInterlock: 'Y' | 'N';
    crossTeamQty: number;
    peerOwner?: string;
  }> = {
    QDAB03583: {
      name: 'Cảm biến quang vuông Panasonic CN-73-C2',
      maker: 'Panasonic',
      model: 'CN-73-C2',
      price: 45,
      unitPriceFlag: 'Y',
      agingInterlock: 'N',
      crossTeamQty: 0
    },
    QDAD12236: {
      name: 'Bo mạch nguồn cao tần CPX V4 Trumpf',
      maker: 'Trumpf',
      model: '2912146',
      price: 3150,
      unitPriceFlag: 'Y',
      agingInterlock: 'N',
      crossTeamQty: 0
    },
    QCAD38190: {
      name: 'Xy lanh dẫn hướng 2 ty MXQ16-100B SMC',
      maker: 'SMC',
      model: 'MXQ16-100B',
      price: 220,
      unitPriceFlag: 'Y',
      agingInterlock: 'Y', // Cross-Team Stock Trigger!
      crossTeamQty: 6,
      peerOwner: 'PO Module Tech Team 1'
    },
    QCAD88102: {
      name: 'Van điện từ khí nén SMC SY5120',
      maker: 'SMC',
      model: 'SY5120-5LZD-01',
      price: 85,
      unitPriceFlag: 'N', // UP004 RFQ Needed
      agingInterlock: 'N',
      crossTeamQty: 0
    }
  };

  const currentPartInfo = partPresets[selectedPart];

  // Auto-calculated 14-character EM No
  const computeEmNo = () => {
    const plant = 'HW';
    const prod = 'BM';
    const proc = 'TL';
    const lineCode = line === '201' ? '21' : line === '202' ? '22' : '31';
    const eqCode = 'EC';
    const eqSeq = machineType === 'DB-01' ? '01' : machineType === 'TAB-02' ? '02' : '03';
    const subUnit = mechanism === 'MECH-01' ? '01' : mechanism === 'MECH-02' ? '02' : '03';
    return `${plant}${prod}${proc}${lineCode}${eqCode}${eqSeq}${subUnit}`;
  };

  const generatedEmNo = computeEmNo();

  // Friendly names resolution
  const machineFriendlyName = machineType === 'DB-01' ? 'Die Bonder 01 (DB-01)' : machineType === 'TAB-02' ? 'Tape Automated Bonder (TAB-02)' : 'Polarizer Attach (POL-01)';
  const mechanismFriendlyName = mechanism === 'MECH-01' ? 'Cụm Đầu Gắp (Bonding Head)' : mechanism === 'MECH-02' ? 'Bàn Nhiệt (Heating Stage)' : 'Cụm Cấp Phôi (Feeder Unit)';

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = partPresets[selectedPart];

    addRequisition({
      qCode: selectedPart,
      isTempCode: false,
      partName: preset.name,
      maker: preset.maker,
      model: preset.model,
      quantity,
      unit: 'EA',
      estimatedUnitPrice: preset.price,
      unitPriceFlag: preset.unitPriceFlag,
      demandType,
      machineFriendlyName,
      lineName: `Line #${line}`,
      mechanismFriendlyName,
      emNo: generatedEmNo,
      status: preset.agingInterlock === 'Y' ? 'CROSS_TEAM_STOCK' : preset.unitPriceFlag === 'N' ? 'RFQ_WAITING' : 'PURCHASABLE',
      planClassification: 'UNCLASSIFIED',
      workOrderNo: workOrderNo || undefined,
      requestorName: 'Nguyen Van Thang',
      partGroup: line === '301' ? 'CP/SG Part 2' : 'CP/SG Part 1',
      ebomPendingMapping: isLateDeclaration,
      agingInterlockFlag: preset.agingInterlock,
      crossTeamStockQty: preset.crossTeamQty,
      peerTeamOwner: preset.peerOwner
    });

    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  const handleSimulateFolderSelect = () => {
    setFolderName('CAD_DWG_Catalog_SpecialChuck_RevB');
    setPartNameInput('Đồ gá Chuck hút phôi mạ vàng tùy biến');
    setMakerInput('Kyocera Advanced Ceramics');
    setModelInput('CK-AU-991');
    setSpecInput('Đồ gá gốm phủ vàng chống xước mặt kính module SW, độ phẳng bề mặt 0.002mm.');
    setUploadedFiles([
      { name: 'Assembly_Drawing_Chuck_Plate_v2.dwg', size: '3.8 MB', type: 'CAD' },
      { name: 'Catalog_Kyocera_Chuck_Series.pdf', size: '2.1 MB', type: 'PDF' },
      { name: 'ESD_Surface_Test_Report.pdf', size: '0.9 MB', type: 'PDF' },
      { name: 'Microscope_Inspection_Sample.png', size: '4.2 MB', type: 'IMAGE' }
    ]);
  };

  const handleSubmitFolderPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partNameInput || uploadedFiles.length === 0) return;

    const tempCode = `TMP-HW-${String(Math.floor(1000 + Math.random() * 9000))}`;
    submitQCodeFolder({
      tempCode,
      partName: partNameInput,
      maker: makerInput || 'Custom Maker',
      model: modelInput || 'MOD-CUSTOM',
      specDescription: specInput,
      files: uploadedFiles,
      requestorName: 'Nguyen Van Thang',
      partGroup: 'CP/SG Part 1',
      machineFriendlyName: 'Die Bonder 01 (DB-01)'
    });

    setFolderSubmitSuccess(true);
    setFolderName('');
    setPartNameInput('');
    setUploadedFiles([]);
    setTimeout(() => setFolderSubmitSuccess(false), 4000);
  };

  const handleReplyClarification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiryId || !replyText) return;
    submitEngineerResponse(selectedInquiryId, replyText);
    setReplySuccess(true);
    setReplyText('');
    setTimeout(() => {
      setReplySuccess(false);
      setSelectedInquiryId(null);
    }, 2000);
  };

  const handleSubmitAging = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !justificationReason) return;
    submitAgingJustification(selectedTaskId, justificationReason, actionPlan, targetUsageDate);
    setTaskSubmitSuccess(true);
    setJustificationReason('');
    setActionPlan('');
    setTimeout(() => {
      setTaskSubmitSuccess(false);
      setSelectedTaskId(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Principle Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                UI-ROLE-01: Cổng Tác Nghiệp Kỹ Sư Hiện Trường (Field Engineer Portal)
              </h2>
              <Badge variant="default">Quan Hệ Đồng Nghiệp Ngang Hàng</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Đăng ký mua sắm theo tên thân thiện máy, tải folder bản vẽ/catalog chuẩn bị đăng ký QCode, giải trình tồn kho đầu tháng và trả lời thẩm tra chi phí.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-slate-400">Kỹ sư:</span>
          <strong className="text-slate-800 dark:text-slate-200">Nguyễn Văn Thắng</strong>
          <span className="text-slate-400">• CP/SG Part 1</span>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
        {[
          { id: 'NEW_REQ', label: '1. Đăng Ký Theo Tên Thân Thiện', icon: <PlusCircle className="w-4 h-4" />, count: null },
          { id: 'FOLDER_UPLOAD', label: '2. Tải Folder Chuẩn Bị QCode', icon: <FolderUp className="w-4 h-4" />, count: qcodeSubmissions.length },
          { id: 'AGING_TASKS', label: '3. Hộp Thư Tác Vụ Bắt Buộc', icon: <Clock className="w-4 h-4" />, count: tasks.filter(t => t.status === 'ACTIVE').length },
          { id: 'CLARIFICATIONS', label: '4. Cầu Nối Trao Đổi Với LEC', icon: <MessageSquare className="w-4 h-4" />, count: clarifications.filter(c => c.status === 'PENDING_ENGINEER').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
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

      {/* 3. TAB 1: Friendly Machine Requisition Form */}
      {activeTab === 'NEW_REQ' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-rose-500" />
              Tạo Yêu Cầu Mua Sắm Spare Part Mới
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Chọn tên thiết bị, chuyền và cơ cấu bằng tên gọi thông dụng; hệ thống tự động biên dịch thành mã EM 14 ký tự chuẩn.
            </p>

            {formSuccess && (
              <div className="p-3 mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Yêu cầu mua sắm đã được ghi nhận thành công và đẩy vào hàng đợi quét Interlock của LEC!</span>
              </div>
            )}

            <form onSubmit={handleCreateRequisition} className="space-y-4">
              {/* Row 1: Line & Floor Rule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dây Chuyền Sản Xuất (Line #)
                  </label>
                  <select
                    value={line}
                    onChange={(e) => setLine(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="201">Line #201 (Tầng 2F - CP/SG Part 1)</option>
                    <option value="202">Line #202 (Tầng 2F - CP/SG Part 1)</option>
                    <option value="301">Line #301 (Tầng 3F - CP/SG Part 2)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Quy tắc hệ thống: <code>Left(Line, 1) = Tầng (Floor)</code>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên Máy Thân Thiện (Machine)
                  </label>
                  <select
                    value={machineType}
                    onChange={(e) => setMachineType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="DB-01">Die Bonder 01 (DB-01)</option>
                    <option value="TAB-02">Tape Automated Bonder (TAB-02)</option>
                    <option value="POL-01">Polarizer Attach (POL-01)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Mechanism selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cụm Cơ Cấu Lắp Đặt (Mechanism / Assembly)
                </label>
                <select
                  value={mechanism}
                  onChange={(e) => setMechanism(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="MECH-01">Cụm Đầu Gắp Chip (Bonding Head - SubUnit 01)</option>
                  <option value="MECH-02">Bàn Nhiệt Gia Nhiệt (Heating Stage - SubUnit 02)</option>
                  <option value="MECH-03">Cụm Cấp Liệu Phôi (Feeder Unit - SubUnit 03)</option>
                </select>
              </div>

              {/* Row 3: Part Selection & Instant Stock Warning */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chọn Linh Kiện Dự Phòng (QCode & Tên Phụ Tùng)
                </label>
                <select
                  value={selectedPart}
                  onChange={(e) => setSelectedPart(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="QCAD38190">QCAD38190 — Xy lanh dẫn hướng đôi khí nén SMC MXQ16-100B ($220) [CÓ TỒN LIÊN TEAM]</option>
                  <option value="QDAB03583">QDAB03583 — Cảm biến quang vuông Panasonic CN-73-C2 ($45) [CÓ HỢP ĐỒNG UP001]</option>
                  <option value="QDAD12236">QDAD12236 — Bo mạch nguồn cao tần CPX V4 Trumpf ($3,150) [GIÁ TRỊ CAO]</option>
                  <option value="QCAD88102">QCAD88102 — Van điện từ khí nén SMC SY5120 ($85) [CHƯA CÓ GIÁ UP004 RFQ]</option>
                </select>
              </div>

              {/* INSTANT CROSS-TEAM STOCK WARNING BANNER */}
              {currentPartInfo.agingInterlock === 'Y' && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1.5 animate-fadeIn">
                  <div className="font-bold flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>CẢNH BÁO TỒN KHO LIÊN TEAM (AGING INTERLOCK FLAG = 'Y')</span>
                  </div>
                  <p className="leading-relaxed">
                    Hệ thống phát hiện tại Kho H1-2F của <strong>{currentPartInfo.peerOwner}</strong> đang có sẵn{' '}
                    <strong className="underline">{currentPartInfo.crossTeamQty} EA</strong> tồn kho chưa sử dụng.
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                    → Theo <strong>Nguyên tắc vàng #3</strong>: Bạn bắt buộc phải ưu tiên mượn/chuyển giao số hàng này. Tác vụ mượn hàng sẽ được gán bắt buộc vào tài khoản của bạn và chỉ tự động giải phóng khi EMS xác nhận cờ = 'N'.
                  </p>
                </div>
              )}

              {/* RFQ Price Warning */}
              {currentPartInfo.unitPriceFlag === 'N' && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Mã này chưa có đơn giá hợp đồng (UP004). LEC sẽ yêu cầu báo giá RFQ từ bộ phận Mua hàng sau khi tạo yêu cầu.</span>
                </div>
              )}

              {/* Row 4: Quantity & Demand Type & WO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số Lượng (EA)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Loại Nhu Cầu (Demand Type)
                  </label>
                  <select
                    value={demandType}
                    onChange={(e) => setDemandType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="BREAKDOWN">Sự cố khẩn cấp (Breakdown)</option>
                    <option value="PM">Bảo dưỡng định kỳ (PM)</option>
                    <option value="IMPROVE">Cải tiến thiết bị (Improve)</option>
                    <option value="SETUP">Chuẩn bị Model mới (Setup)</option>
                    <option value="SAFETY_STOCK">Dự phòng tồn an toàn (Safety Stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Work Order (WO) Sự Cố
                  </label>
                  <input
                    type="text"
                    value={workOrderNo}
                    onChange={(e) => setWorkOrderNo(e.target.value)}
                    placeholder="e.g. WO-248926095"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Late Declaration Option */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="lateDec"
                  checked={isLateDeclaration}
                  onChange={(e) => setIsLateDeclaration(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <label htmlFor="lateDec" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <span className="font-bold">Khai báo muộn cơ cấu EBOM:</span> Trường hợp máy phát sinh hỏng linh kiện chưa kịp gán Slot EBOM, tích chọn để hệ thống cho phép tạo yêu cầu trước và gán Slot trong 7 ngày.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Xác Nhận Đăng Ký Yêu Cầu Mua Sắm</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Preview Card: 14-character EM No Decomposition */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Giải Mã Mã EM Thiết Bị 14 Ký Tự
              </h4>
              <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-center text-sm font-black tracking-widest border border-slate-700 mb-3 shadow-inner">
                {generatedEmNo}
              </div>

              <div className="space-y-1.5 text-[11px] divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
                  <span>1-2. Nhà máy (Plant):</span>
                  <strong className="font-mono text-slate-900 dark:text-white">HW (Factory HW)</strong>
                </div>
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
                  <span>3-4. Ngành hàng (Product):</span>
                  <strong className="font-mono text-slate-900 dark:text-white">BM (Bonding Module)</strong>
                </div>
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
                  <span>5-6. Công đoạn (Process):</span>
                  <strong className="font-mono text-slate-900 dark:text-white">TL (Total Line)</strong>
                </div>
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
                  <span>7-8. Số chuyền (Line):</span>
                  <strong className="font-mono text-slate-900 dark:text-white">{line === '201' ? '21' : line === '202' ? '22' : '31'} (Line #{line})</strong>
                </div>
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
                  <span>9-10. Loại thiết bị (Cat):</span>
                  <strong className="font-mono text-slate-900 dark:text-white">EC (Core Bonder)</strong>
                </div>
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
                  <span>11-12. Số thứ tự máy (Seq):</span>
                  <strong className="font-mono text-slate-900 dark:text-white">{machineType === 'DB-01' ? '01' : '02'} ({machineFriendlyName})</strong>
                </div>
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
                  <span>13-14. Cụm cơ cấu (SubUnit):</span>
                  <strong className="font-mono text-slate-900 dark:text-white">{mechanism === 'MECH-01' ? '01' : '02'} ({mechanismFriendlyName})</strong>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Ước tính giá trị yêu cầu:
              </span>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                ${(quantity * currentPartInfo.price).toLocaleString()} USD
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Kỹ sư tạo yêu cầu $\rightarrow$ LEC gom mẻ & thẩm tra $\rightarrow$ Ký PRV trên EMS ngoài.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: CAD / Folder Upload for QCode Onboarding */}
      {activeTab === 'FOLDER_UPLOAD' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderUp className="w-4 h-4 text-cyan-500" />
                  Chuẩn Bị Hồ Sơ Kỹ Thuật Đăng Ký Mã QCode Mới
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tải lên Folder bản vẽ CAD (.dwg), Catalog PDF và hình ảnh linh kiện để LEC tiến hành đăng ký mã QCode trên ERP/EMS.
                </p>
              </div>

              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Quy định:</strong> Mã tạm <code>TMP-HW-xxxx</code> không được tham gia thẩm định chi phí cho đến khi LEC cấp QCode chính thức!
                </span>
              </div>
            </div>

            {folderSubmitSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hồ sơ folder đã được chuyển đến Bàn làm việc LEC để đăng ký mã QCode chính thức!</span>
              </div>
            )}

            <form onSubmit={handleSubmitFolderPackage} className="space-y-4">
              {/* Drop area */}
              <div 
                onClick={handleSimulateFolderSelect}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
              >
                <FolderUp className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {folderName ? `Thư mục đã chọn: ${folderName}` : 'Kéo thả toàn bộ Thư mục (Folder) chứa Bản vẽ & Catalog vào đây'}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Hỗ trợ định dạng: <code>.dwg</code>, <code>.dxf</code>, <code>.pdf</code>, <code>.step</code>, <code>.png</code>, <code>.jpg</code> (Nhấn để nạp thư mục mẫu kiểm thử)
                </p>
              </div>

              {/* Uploaded File List Preview */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Các tệp kỹ thuật đã trích xuất ({uploadedFiles.length} tệp):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {f.type === 'CAD' ? <FileCode className="w-4 h-4 text-blue-500" /> : f.type === 'PDF' ? <FileText className="w-4 h-4 text-rose-500" /> : <ImageIcon className="w-4 h-4 text-emerald-500" />}
                        <span className="truncate font-mono flex-1 text-[11px]">{f.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{f.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Specifications Sheet */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Linh Kiện Đề Xuất</label>
                  <input
                    type="text"
                    value={partNameInput}
                    onChange={(e) => setPartNameInput(e.target.value)}
                    placeholder="e.g. Tấm đồ gá Chuck kẹp phôi"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nhà Sản Xuất (Maker)</label>
                  <input
                    type="text"
                    value={makerInput}
                    onChange={(e) => setMakerInput(e.target.value)}
                    placeholder="e.g. SMC / Kyocera"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Model / Part Number</label>
                  <input
                    type="text"
                    value={modelInput}
                    onChange={(e) => setModelInput(e.target.value)}
                    placeholder="e.g. MOD-CK-01"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mô Tả Thông Số Kỹ Thuật (Spec Description)</label>
                <textarea
                  rows={2}
                  value={specInput}
                  onChange={(e) => setSpecInput(e.target.value)}
                  placeholder="Kích thước, dung sai gia công, vật liệu, điều kiện áp dụng..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={!partNameInput || uploadedFiles.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Nộp Hồ Sơ Folder Cho LEC Đăng Ký QCode</span>
                </button>
              </div>
            </form>
          </div>

          {/* Submission Queue Table */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Danh Sách Hồ Sơ Đăng Ký Mã QCode Đã Nộp ({qcodeSubmissions.length})
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Mã Tạm / Hồ Sơ</th>
                    <th className="p-3">Tên Phụ Tùng Đề Xuất</th>
                    <th className="p-3">Tệp Đính Kèm</th>
                    <th className="p-3">Ngày Nộp</th>
                    <th className="p-3">Trạng Thái Đăng Ký QCode</th>
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
                        <div className="text-[11px] text-slate-400">{sub.maker} • {sub.model}</div>
                      </td>
                      <td className="p-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono">
                          {sub.files.length} Tệp (CAD, PDF)
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400">{sub.submittedAt}</td>
                      <td className="p-3">
                        {sub.status === 'OFFICIALLY_REGISTERED' ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>ĐÃ CẤP MÃ: {sub.officialQCode}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Chờ LEC Đăng Ký ERP/EMS
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: Mandatory Persistent Tasks Inbox */}
      {activeTab === 'AGING_TASKS' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Hộp Thư Tác Vụ Bắt Buộc (Mandatory Persistent Tasks)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Bao gồm tác vụ mượn hàng tồn liên team (không thể tự đóng, chỉ giải phóng khi EMS xác nhận cờ = N), giải trình tồn kho chậm luân chuyển đầu tháng và khai báo muộn EBOM.
            </p>

            <div className="space-y-3">
              {tasks.map(t => {
                const isActive = t.status === 'ACTIVE';

                return (
                  <div 
                    key={t.id} 
                    className={`p-4 rounded-2xl border transition-all ${
                      t.type === 'INTER_TEAM_BORROW' 
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80' 
                        : t.type === 'AGING_JUSTIFICATION'
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80'
                        : 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                        <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span>{t.title}</span>
                        <span className="font-mono text-slate-500">({t.qCode})</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-slate-400">Hạn chót:</span>
                        <strong className="text-rose-600 dark:text-rose-400 font-bold">{t.deadline}</strong>
                        <Badge variant={isActive ? 'warning' : 'success'}>
                          {t.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                      {t.details}
                    </p>

                    {/* Action buttons based on task type */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[11px] text-slate-400">
                        {t.emsAutoResolvable ? 'Đồng bộ tự động từ EMS Gateway' : 'Yêu cầu kỹ sư thao tác nhập giải trình'}
                      </span>

                      {isActive && t.type === 'AGING_JUSTIFICATION' && (
                        <button
                          onClick={() => setSelectedTaskId(t.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Nhập Bản Giải Trình Tồn Kho Đầu Tháng
                        </button>
                      )}

                      {isActive && t.type === 'INTER_TEAM_BORROW' && (
                        <button
                          onClick={() => acceptInterTeamBorrow(t.id)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Xác Nhận Đã Mượn Hàng Thành Công
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aging Justification Modal */}
          {selectedTaskId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Giải Trình Lý Do Linh Kiện Tồn Kho Chưa Đưa Vào Sử Dụng
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Bản giải trình này sẽ được xuất vào <strong>Sheet 4 của Báo Cáo Excel Thẩm Định</strong> gửi Ban Giám Đốc.
                </p>

                <form onSubmit={handleSubmitAging} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Lý Do Kỹ Thuật Chưa Sử Dụng (Tại sao chưa thay thế?)
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={justificationReason}
                      onChange={(e) => setJustificationReason(e.target.value)}
                      placeholder="e.g. Do xưởng ưu tiên sản lượng Model D111 nên lùi lịch bảo dưỡng PM sang tuần tới..."
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kế Hoạch & Hành Động Khắc Phục (Action Plan)
                    </label>
                    <input
                      type="text"
                      required
                      value={actionPlan}
                      onChange={(e) => setActionPlan(e.target.value)}
                      placeholder="e.g. Thay thế toàn bộ cụm gắp trong đợt bảo dưỡng ngày 15/11"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ngày Cam Kết Xuất Dùng Hết Hàng Tồn (Target Usage Date)
                    </label>
                    <input
                      type="date"
                      required
                      value={targetUsageDate}
                      onChange={(e) => setTargetUsageDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTaskId(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
                    >
                      Nộp Giải Trình Cho Thẩm Định
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 4: 2-Way Clarification Thread with LEC */}
      {activeTab === 'CLARIFICATIONS' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Kênh Trao Đổi Giải Trình Thẩm Định 3 Bên (Cầu Nối Với LEC)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Người Thẩm Định (Quản Lý Chi Phí) $\rightarrow$ LEC chuyển tiếp $\rightarrow$ Kỹ Sư phản hồi bằng chứng $\rightarrow$ LEC tổng hợp đệ trình.
            </p>

            <div className="space-y-4">
              {clarifications.map(c => (
                <div key={c.id} className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Yêu cầu giải trình mã: <strong className="font-mono">{c.qCode}</strong> — {c.partName}
                    </span>
                    <Badge variant={c.status === 'RESOLVED' ? 'success' : 'warning'}>
                      {c.status}
                    </Badge>
                  </div>

                  {/* 1. Reviewer Question */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-rose-600 block mb-1">
                      1. Câu hỏi từ Bộ phận Quản lý Chi phí:
                    </span>
                    <p className="leading-relaxed">{c.reviewerQuestion}</p>
                  </div>

                  {/* 2. LEC Note */}
                  {c.lecNote && (
                    <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                      <span className="font-bold block mb-1">
                        2. Hướng dẫn từ LEC (Phạm Đức Long):
                      </span>
                      <p>{c.lecNote}</p>
                    </div>
                  )}

                  {/* 3. Engineer Response */}
                  {c.engineerResponse ? (
                    <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                      <span className="font-bold block mb-1">
                        3. Phản hồi của bạn (Kỹ sư Hiện trường):
                      </span>
                      <p>{c.engineerResponse}</p>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <button
                        onClick={() => setSelectedInquiryId(c.id)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                      >
                        Viết Phản Hồi Kỹ Thuật Đính Kèm Bằng Chứng
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reply Editor Modal */}
          {selectedInquiryId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Phản Hồi Câu Hỏi Thẩm Định Cho LEC
                </h4>
                <form onSubmit={handleReplyClarification} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nội dung giải trình kỹ thuật
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Mô tả nguyên nhân hư hỏng, biên bản ca đêm, hoặc đối chiếu mã WO..."
                      className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                    <Paperclip className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                    Đính kèm ảnh chụp hiện trường hoặc biên bản WO đã ký
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedInquiryId(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                    >
                      Gửi Phản Hồi Cho LEC
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
