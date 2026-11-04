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
  AlertCircle
} from 'lucide-react';

export const RequestorPortalView: React.FC = () => {
  const { 
    tasks, 
    clarifications, 
    addRequisition, 
    submitEngineerResponse, 
    submitAgingJustification 
  } = useProcurement();

  const [activeTab, setActiveTab] = useState<'NEW_REQ' | 'FOLDER_UPLOAD' | 'CLARIFICATIONS' | 'AGING_TASKS'>('NEW_REQ');

  // Form state
  const [selectedPart, setSelectedPart] = useState<'QDAB03583' | 'QDAD12236' | 'QCAD38190'>('QCAD38190');
  const [quantity, setQuantity] = useState(2);
  const [demandType, setDemandType] = useState<'SETUP' | 'IMPROVE' | 'BREAKDOWN' | 'PM'>('BREAKDOWN');
  const [machine, setMachine] = useState('Die Bonder 01 (DB-01)');
  const [mechanismOption, setMechanismOption] = useState<'EXISTING' | 'LATE_DECLARATION'>('EXISTING');
  const [mechanism, setMechanism] = useState('Cụm Đầu Gắp Bonding Head (Mech 01)');
  const [lateMechanismName, setLateMechanismName] = useState('');
  const [workOrderNo, setWorkOrderNo] = useState('WO-248926091');
  const [breakdownReasonNote, setBreakdownReasonNote] = useState('Cụm xylanh trượt bị rơ lắc khi vận hành tốc độ cao ca đêm, nguy cơ dừng máy.');
  const [formSuccess, setFormSuccess] = useState(false);

  // Folder upload simulation
  const [uploadedFolder, setUploadedFolder] = useState<string | null>(null);
  const [parsedFiles, setParsedFiles] = useState<{ name: string; type: string; size: string }[]>([]);
  const [tempCodeGenerated, setTempCodeGenerated] = useState<string | null>(null);
  const [folderSubmitSuccess, setFolderSubmitSuccess] = useState(false);

  // Clarification reply state
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Aging reply state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [justificationNote, setJustificationNote] = useState('');

  const partPresets: Record<string, {
    name: string;
    maker: string;
    model: string;
    price: number;
    agingInterlock: string;
    crossTeamQty: number;
    owner?: string;
  }> = {
    QDAB03583: {
      name: 'Cảm biến quang vuông Panasonic CN-73-C2',
      maker: 'Panasonic',
      model: 'CN-73-C2',
      price: 45,
      agingInterlock: 'N',
      crossTeamQty: 0
    },
    QDAD12236: {
      name: 'Board nguồn CPX V4 Trumpf 2912146',
      maker: 'Trumpf',
      model: '2912146',
      price: 3150,
      agingInterlock: 'N',
      crossTeamQty: 0
    },
    QCAD38190: {
      name: 'Xylanh dẫn hướng đôi khí nén SMC 16-100B',
      maker: 'SMC',
      model: 'MXQ16-100B',
      price: 220,
      agingInterlock: 'Y', // TRIGGER CROSS-TEAM WARNING!
      crossTeamQty: 6,
      owner: 'PO Module Tech Team 1'
    }
  };

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = partPresets[selectedPart];
    const isLate = mechanismOption === 'LATE_DECLARATION';

    addRequisition({
      qCode: selectedPart,
      isTempCode: false,
      partName: preset.name,
      maker: preset.maker,
      model: preset.model,
      quantity,
      unit: 'EA',
      estimatedUnitPrice: preset.price,
      unitPriceFlag: 'Y',
      demandType,
      machineFriendlyName: machine,
      lineName: 'Line #201',
      mechanismFriendlyName: isLate ? `${lateMechanismName || 'Cơ cấu phát sinh ngoài hiện trường'} (Khai Báo Sau)` : mechanism,
      emNo: isLate ? 'PENDING_EM_MAPPING' : 'HWBMTL21EC0101',
      status: preset.agingInterlock === 'Y' ? 'CROSS_TEAM_STOCK' : 'PURCHASABLE',
      planClassification: 'UNCLASSIFIED', // LEC will officially classify
      requestorName: 'Nguyen Van Thang',
      partGroup: 'CP/SG Part 1',
      ebomPendingMapping: isLate,
      agingInterlockFlag: preset.agingInterlock as 'Y' | 'N',
      crossTeamStockQty: preset.crossTeamQty,
      peerTeamOwner: preset.owner,
      workOrderNo: workOrderNo
    });

    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  const handleSimulateFolderUpload = () => {
    setUploadedFolder('Folder_Setup_DieBonder_DB01 (Bản vẽ CAD, Catalog, Ảnh)');
    setParsedFiles([
      { name: 'DWG_CumGatPhoi_DB01_V2.dwg', type: 'CAD 2D/3D', size: '4.8 MB' },
      { name: 'Catalog_SMC_MXQ_Series.pdf', type: 'Catalog PDF', size: '2.1 MB' },
      { name: 'Datasheet_Panasonic_CN73.pdf', type: 'Datasheet', size: '890 KB' },
      { name: 'AnhThucTe_LinhKien_01.jpg', type: 'Hình Ảnh', size: '1.2 MB' },
    ]);
    setTempCodeGenerated(`TMP-HW-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleSubmitFolderToLec = () => {
    setFolderSubmitSuccess(true);
    setTimeout(() => {
      setFolderSubmitSuccess(false);
      setUploadedFolder(null);
      setParsedFiles([]);
      setTempCodeGenerated(null);
    }, 4000);
  };

  const handleSendClarificationReply = () => {
    if (!selectedInquiryId || !replyText) return;
    submitEngineerResponse(selectedInquiryId, replyText);
    setReplyText('');
    setSelectedInquiryId(null);
  };

  const handleSendAgingJustification = () => {
    if (!selectedTaskId || !justificationNote) return;
    submitAgingJustification(selectedTaskId, justificationNote);
    setJustificationNote('');
    setSelectedTaskId(null);
  };

  const pendingInquiriesForEngineer = clarifications.filter(c => c.status === 'PENDING_ENGINEER');
  const activeAgingTasks = tasks.filter(t => t.type === 'AGING_JUSTIFICATION' && t.status === 'ACTIVE');
  const activeCrossTeamTasks = tasks.filter(t => t.type === 'INTER_TEAM_BORROW' && t.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              UI-ROLE-01: Cổng Kỹ Sư Công Đoạn (Requestor Portal)
            </h2>
            <Badge variant="purple">Kỹ Sư Hiện Trường - CP/SG Part 1</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Đăng nhập: <strong className="text-slate-800 dark:text-slate-200">Nguyen Van Thang</strong> (Process Engineer) | Thao tác 100% bằng Tên Máy & Cụm Cơ Cấu Thân Thiện.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('NEW_REQ')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'NEW_REQ' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tạo Đơn Mua
          </button>
          <button
            onClick={() => setActiveTab('FOLDER_UPLOAD')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'FOLDER_UPLOAD' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Upload Folder QCode
          </button>
          <button
            onClick={() => setActiveTab('CLARIFICATIONS')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'CLARIFICATIONS' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Phản Hồi Với LEC
            {pendingInquiriesForEngineer.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold">
                {pendingInquiriesForEngineer.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('AGING_TASKS')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'AGING_TASKS' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Task Giải Trình Tồn Kho
            {activeAgingTasks.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {activeAgingTasks.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Persistent Cross-Team Warning Alert */}
      {activeCrossTeamTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 shadow-sm flex items-start gap-3 transition-colors">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide flex items-center gap-2">
              TASK BẮT BUỘC ĐANG KÍCH HOẠT: CÓ TỒN KHO TẠI TEAM BẠN TRONG FACTORY HW
              <Badge variant="warning">Không Thể Bỏ Qua Thủ Công</Badge>
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-200/90 mt-1">
              Phụ tùng <strong className="font-mono font-bold">QCAD38190</strong> hiện đang có 6 đơn vị tồn kho nhàn rỗi tại Kho H1-2F thuộc sở hữu của <strong>PO Module Tech Team 1</strong>.
              Bạn phải làm việc điều chuyển nội bộ trước khi đăng ký mua mới. 
              <strong> Task này sẽ tự động đóng ngay khi hệ thống EMS xác nhận phụ tùng đã được xuất ('N').</strong>
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: FORM TẠO ĐƠN MUA */}
      {activeTab === 'NEW_REQ' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: 2 Cols */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-rose-500" />
              Đăng Ký Hạng Mục Mua (Bằng Tên Máy Thân Thiện)
            </h3>

            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Yêu cầu mua sắm đã gửi thành công sang Hàng Đợi của LEC trong Team!</span>
              </div>
            )}

            <form onSubmit={handleCreateRequisition} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    1. Tên Máy Vận Hành (Friendly Machine Name): (*)
                  </label>
                  <select 
                    value={machine}
                    onChange={e => setMachine(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="Die Bonder 01 (DB-01)">Máy Die Bonder 01 (DB-01) - Line #201</option>
                    <option value="Die Bonder 02 (DB-02)">Máy Die Bonder 02 (DB-02) - Line #201</option>
                    <option value="Tape Automated Bonder (TAB-02)">Máy Ép TAB (TAB-02) - Line #202</option>
                    <option value="Polarizer Attach (POL-01)">Máy Dán Phim (POL-01) - Line #203</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    2. Chi Tiết Cơ Cấu Lắp Đặt: (*)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="mechOpt"
                          checked={mechanismOption === 'EXISTING'}
                          onChange={() => setMechanismOption('EXISTING')}
                          className="text-rose-600"
                        />
                        <span className="text-slate-700 dark:text-slate-300">Đã có trong EBOM</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="mechOpt"
                          checked={mechanismOption === 'LATE_DECLARATION'}
                          onChange={() => setMechanismOption('LATE_DECLARATION')}
                          className="text-rose-600"
                        />
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">Chưa có (Khai báo sau)</span>
                      </label>
                    </div>

                    {mechanismOption === 'EXISTING' ? (
                      <select 
                        value={mechanism}
                        onChange={e => setMechanism(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      >
                        <option value="Cụm Cấp Liệu Feeder (Mech 01)">01. Cụm Cấp Liệu Feeder (Ray trượt)</option>
                        <option value="Cụm Đầu Gắp Bonding Head (Mech 01)">02. Cụm Đầu Gắp Bonding Head (Xylanh gắp)</option>
                        <option value="Cụm Gia Nhiệt Heat Nozzle (Mech 02)">02. Cụm Gia Nhiệt Heat Nozzle</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Gõ mô tả cơ cấu máy phát sinh ngoài hiện trường..."
                        value={lateMechanismName}
                        onChange={e => setLateMechanismName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-amber-300 dark:border-amber-700/80 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        required
                      />
                    )}
                  </div>
                </div>
              </div>

              {mechanismOption === 'LATE_DECLARATION' && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>💡 Chính Sách Khai Báo Sau: Hệ thống <strong>KHÔNG CHẶN</strong> đơn mua! Cờ <code>EBOM_PENDING_MAPPING</code> sẽ được kích hoạt để bạn hoàn thiện vào cây EBOM trong vòng 7 ngày.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    3. Chọn Phụ Tùng Cần Mua: (*)
                  </label>
                  <select 
                    value={selectedPart}
                    onChange={e => setSelectedPart(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="QCAD38190">QCAD38190 — Xylanh đôi SMC MXQ16-100B ($220.00)</option>
                    <option value="QDAB03583">QDAB03583 — Cảm biến quang vuông Panasonic CN-73-C2 ($45.00)</option>
                    <option value="QDAD12236">QDAD12236 — Board nguồn CPX V4 Trumpf ($3,150.00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Số Lượng (EA): (*)
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-bold text-center focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    4. Phân Loại Nhu Cầu Cơ Sở:
                  </label>
                  <select 
                    value={demandType}
                    onChange={e => setDemandType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="BREAKDOWN">3. Thay Thế Sự Cố Máy Hỏng (BREAKDOWN)</option>
                    <option value="IMPROVE">2. Cải Tiến Kỹ Thuật Hiện Trường (IMPROVE)</option>
                    <option value="SETUP">1. Setup Dây Chuyền / Model Mới</option>
                    <option value="PM">4. Bảo Dưỡng Phòng Ngừa Định Kỳ (PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Mã Lệnh Sự Cố (Work Order):
                  </label>
                  <input 
                    type="text"
                    value={workOrderNo}
                    onChange={e => setWorkOrderNo(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    placeholder="WO-248926091"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  5. Hiện Trạng Sự Cố & Vấn Đề Gặp Phải (Để LEC Thẩm Định Target vs Over):
                </label>
                <textarea 
                  rows={2}
                  value={breakdownReasonNote}
                  onChange={e => setBreakdownReasonNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  placeholder="Mô tả hiện tượng hỏng hóc, báo lỗi alarm máy..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition-all text-xs"
                >
                  <Send className="w-4 h-4" />
                  Gửi Yêu Cầu Đến Bàn Làm Việc Của LEC
                </button>
              </div>
            </form>
          </div>

          {/* Right Summary: 1 Col */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-500" />
              Đối Soát Tồn Kho & Thông Số Linh Kiện
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Linh kiện đang chọn:</div>
              <div className="font-bold text-slate-900 dark:text-white">{partPresets[selectedPart].name}</div>
              <div className="text-slate-600 dark:text-slate-300 text-[11px]">
                Maker: <strong>{partPresets[selectedPart].maker}</strong> | Model: <strong>{partPresets[selectedPart].model}</strong>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Đơn giá ước tính:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">${partPresets[selectedPart].price} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Thành tiền dự kiến:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                  ${(quantity * partPresets[selectedPart].price).toLocaleString()} USD
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                Quy Trình Xử Lý Tiếp Theo
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <li>LEC gom đơn cùng trạng thái trong Team.</li>
                <li>Hệ thống quét Interlock (Cờ Y/N).</li>
                <li>LEC thẩm định và đánh dấu nhãn <strong>Target / Over</strong>.</li>
                <li>Đưa vào hồ sơ Thẩm định Offline ngày 25.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD CẢ FOLDER ĐĂNG KÝ QCODE */}
      {activeTab === 'FOLDER_UPLOAD' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 transition-colors">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderUp className="w-5 h-5 text-indigo-500" />
              Upload Cả Thư Mục Bản Vẽ CAD & Catalog Để Đăng Ký QCode
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kỹ sư tải lên toàn bộ folder (chứa file bản vẽ DWG/STEP, catalog PDF, datasheet và ảnh chụp) $\rightarrow$ Hệ thống tự động bóc tách và sinh bảng lưới thông tin $\rightarrow$ Submit cho LEC hoàn thiện mã ngoài.
            </p>
          </div>

          {folderSubmitSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Hồ sơ thư mục kỹ thuật kèm mã tạm <strong>{tempCodeGenerated}</strong> đã được chuyển giao cho LEC để đăng ký QCode trên ERP/EMS!</span>
            </div>
          )}

          {/* Drag and Drop Zone */}
          {!uploadedFolder ? (
            <div 
              onClick={handleSimulateFolderUpload}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-10 text-center cursor-pointer transition-all hover:bg-indigo-50/30"
            >
              <UploadCloud className="w-12 h-12 mx-auto text-indigo-500 dark:text-indigo-400 mb-3" />
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Kéo thả nguyên thư mục vào đây hoặc click để chọn thư mục từ máy tính
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Hỗ trợ tệp CAD (.dwg, .step), Catalog PDF, Datasheet thông số, Ảnh chụp JPG/PNG
              </p>
              <button 
                type="button"
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Chọn Thư Mục Tài Liệu Kỹ Thuật
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white">
                    <FolderUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-indigo-950 dark:text-indigo-200">{uploadedFolder}</div>
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400">
                      Hệ thống tự động cấp mã tạm thời: <strong className="font-mono">{tempCodeGenerated}</strong>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFolder(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  Đổi Thư Mục Khác
                </button>
              </div>

              {/* Auto-generated Metadata Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  Bảng Thuộc Tính Tự Động Sinh Ra Từ Thư Mục:
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 uppercase">
                        <th className="py-2.5 px-3">Tên Tệp Đã Quét</th>
                        <th className="py-2.5 px-3">Phân Loại Tệp</th>
                        <th className="py-2.5 px-3">Dung Lượng</th>
                        <th className="py-2.5 px-3">Trạng Thái Khớp Nối</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {parsedFiles.map((file, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            {file.type.includes('CAD') ? <FileCode className="w-4 h-4 text-blue-500" /> : file.type.includes('Ảnh') ? <ImageIcon className="w-4 h-4 text-emerald-500" /> : <FileText className="w-4 h-4 text-amber-500" />}
                            {file.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{file.type}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{file.size}</td>
                          <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Đã gán vào hồ sơ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSubmitFolderToLec}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <Send className="w-4 h-4" />
                  Submit Hồ Sơ Cho LEC Hoàn Thiện & Cấp QCode
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KÊNH ĐỐI THOẠI 2 CHIỀU VỚI LEC */}
      {activeTab === 'CLARIFICATIONS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-500" />
              Kênh Trao Đổi 2 Chiều Với LEC (Khi Đổi Mã Hoặc Báo Giá Bất Thường)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Phản hồi trực tiếp khi LEC đề xuất đổi sang mã cải tiến hoặc nhận thông báo bất thường từ email của Purchase Dept.
            </p>
          </div>

          <div className="space-y-3">
            {clarifications.map(c => (
              <div 
                key={c.id} 
                className={`p-4 rounded-xl border text-xs space-y-3 transition-all ${
                  c.status === 'PENDING_ENGINEER'
                    ? 'border-cyan-300 dark:border-cyan-700 bg-cyan-50/50 dark:bg-cyan-950/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{c.qCode}</span>
                    <span>—</span>
                    <span>{c.partName}</span>
                  </div>
                  <Badge variant={c.status === 'PENDING_ENGINEER' ? 'warning' : 'success'}>
                    {c.status === 'PENDING_ENGINEER' ? 'Chờ Kỹ Sư Phản Hồi' : 'Đã Giải Quyết'}
                  </Badge>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Ý kiến từ Ban Quản Lý / LEC:</div>
                  <div className="text-slate-800 dark:text-slate-200 font-medium">"{c.reviewerQuestion}"</div>
                  {c.lecNote && (
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                      ↳ Ghi chú kỹ thuật từ LEC: {c.lecNote}
                    </div>
                  )}
                </div>

                {c.engineerResponse ? (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px]">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">Phản hồi của bạn:</span>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5">{c.engineerResponse}</p>
                  </div>
                ) : (
                  <div>
                    {selectedInquiryId === c.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Nhập nội dung xác nhận đồng ý đổi mã hoặc giải trình kỹ thuật bổ sung..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedInquiryId(null)}
                            className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 text-xs"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={handleSendClarificationReply}
                            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-sm"
                          >
                            Gửi Phản Hồi Cho LEC
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setSelectedInquiryId(c.id); setReplyText(''); }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-sm transition-all"
                      >
                        Trả Lời LEC / Xác Nhận Phương Án
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BÀN TASK GIẢI TRÌNH TỒN KHO CHƯA SỬ DỤNG */}
      {activeTab === 'AGING_TASKS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Bàn Task Giải Trình Tồn Kho Chưa Sử Dụng (&gt; 30 Ngày)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Phục vụ phiên Kiểm Thảo Định Kỳ ngày 25 với Ban Giám Đốc. Kỹ sư bắt buộc giải trình lý do tại sao phụ tùng đã về kho nhưng chưa xuất lắp máy.
            </p>
          </div>

          <div className="space-y-3">
            {activeAgingTasks.map(t => (
              <div key={t.id} className="p-4 rounded-xl border border-amber-300 dark:border-amber-700/80 bg-amber-50/40 dark:bg-amber-950/20 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-white">
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{t.qCode}</span>
                    <span> — {t.partName}</span>
                  </div>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-mono font-semibold">
                    Hạn nộp: {t.deadline}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  {t.details}
                </p>

                {selectedTaskId === t.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={justificationNote}
                      onChange={e => setJustificationNote(e.target.value)}
                      placeholder="Giải trình lý do chưa lắp máy (ví dụ: máy hoạt động tốt chi tiết cũ chưa mòn hỏng, kế hoạch PM dời sang tháng sau...)"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setSelectedTaskId(null)}
                        className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 text-xs"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSendAgingJustification}
                        className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-sm"
                      >
                        Nộp Giải Trình Kiểm Thảo
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setSelectedTaskId(t.id); setJustificationNote(''); }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    Viết Giải Trình Tồn Kho
                  </button>
                )}
              </div>
            ))}

            {activeAgingTasks.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                Toàn bộ các phụ tùng nhập kho đều đã được giải trình hoặc xuất lắp máy đầy đủ!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
