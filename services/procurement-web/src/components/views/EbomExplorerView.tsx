import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { 
  FolderTree, 
  Cpu, 
  Plus, 
  AlertTriangle, 
  Layers,
  CheckCircle2,
  FolderPlus,
  MoveRight,
  Sparkles,
  Link2
} from 'lucide-react';

export const EbomExplorerView: React.FC = () => {
  const { ebomMechanisms, bindPartToSlot, requisitions, resolveLateDeclaration } = useProcurement();

  const [selectedMachine, setSelectedMachine] = useState('DB-01');
  const [selectedMechanismId, setSelectedMechanismId] = useState('MECH-DB01-FEED-01');
  const [saveNotice, setSaveNotice] = useState(false);
  const [draggedPart, setDraggedPart] = useState<any | null>(null);

  const lateDeclarationRequisitions = requisitions.filter(r => r.ebomPendingMapping);

  const availablePartsInTray = [
    { partCode: 'QDAB03583', partName: 'Cảm biến quang vuông Panasonic', maker: 'Panasonic', model: 'CN-73-C2' },
    { partCode: 'QCAD38190', partName: 'Xylanh đôi dẫn hướng SMC MXQ16', maker: 'SMC', model: 'MXQ16-100B' },
    { partCode: 'QDAD12236', partName: 'Board nguồn CPX V4 Trumpf', maker: 'Trumpf', model: '2912146' },
    { partCode: 'TMP-HW-0105', partName: 'Cữ kẹp tự chế máy dán chip', maker: 'Gia Công Ngoài', model: 'JIG-SW-D222' },
  ];

  const handleBindPart = (mechanismId: string, part: typeof availablePartsInTray[0]) => {
    bindPartToSlot(mechanismId, part.partCode, part.partName, part.maker, part.model, 1);
    
    // Check if it resolves late declaration
    const matchingReq = lateDeclarationRequisitions.find(r => r.qCode === part.partCode);
    if (matchingReq) {
      resolveLateDeclaration(matchingReq.id, mechanismId);
    }

    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 3000);
  };

  const handleDropOnSlot = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedPart) {
      handleBindPart(selectedMechanismId, draggedPart);
      setDraggedPart(null);
    }
  };

  const selectedMechanism = ebomMechanisms.find(m => m.mechanismId === selectedMechanismId) || ebomMechanisms[0];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              UI-EBOM-01: Bàn Kéo - Thả EBOM Trực Quan (Drag-and-Drop Slot Mapper)
            </h2>
            <Badge variant="info">Factory HW (Smart Watch 1)</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tách biệt Tên Thân Thiện (Line, Máy, Cơ Cấu) vs Mã 14 ký tự EM No (`HWBMTL21EC0101`) & Xử lý Hàng Đợi Khai Báo Sau.
          </p>
        </div>

        {saveNotice && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Đã gán linh kiện vào cơ cấu EBOM thành công!</span>
          </div>
        )}
      </div>

      {/* 3-Column Visual Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pane 1: Friendly Machine Hierarchy Tree (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4 transition-colors">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            1. Cây Phân Cấp Máy Thân Thiện
          </h3>

          <div className="space-y-1.5 text-xs font-medium">
            <div className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
              <span>🏭 Factory HW (Smart Watch 1)</span>
            </div>
            
            <div className="pl-3 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 mt-1">
              <div className="text-slate-600 dark:text-slate-400 font-semibold text-[11px]">🌐 Line #201 (Tầng 2F)</div>
              
              <div className="pl-2.5 space-y-1 border-l-2 border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedMachine('DB-01')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between text-xs font-semibold ${
                    selectedMachine === 'DB-01' 
                      ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>🤖 DB-01 (Die Bonder 01)</span>
                  <span className="text-[10px] font-mono opacity-70">2 Cụm</span>
                </button>

                <button
                  onClick={() => setSelectedMachine('DB-02')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between text-xs font-semibold ${
                    selectedMachine === 'DB-02' 
                      ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>🤖 DB-02 (Die Bonder 02)</span>
                  <span className="text-[10px] font-mono opacity-70">1 Cụm</span>
                </button>

                <div className="text-slate-400 px-3 py-1.5 text-xs">🤖 EC-01 (Máy Vệ Sinh 01)</div>
                <div className="text-slate-400 px-3 py-1.5 text-xs">🤖 PL-01 (Máy Dán Phim 01)</div>
              </div>
            </div>
          </div>

          {/* Late Declaration Queue */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Hàng Đợi Khai Báo Sau ({lateDeclarationRequisitions.length})
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Đơn mua tạo khi chưa có slot cơ cấu. Gán vào cơ cấu bên phải để xóa cờ <code>EBOM_PENDING_MAPPING</code>.
            </p>

            {lateDeclarationRequisitions.map(req => (
              <div key={req.id} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] space-y-1">
                <div className="font-bold text-amber-900 dark:text-amber-300 font-mono">{req.qCode}</div>
                <div className="text-slate-800 dark:text-slate-200 font-medium">{req.partName}</div>
                <div className="text-slate-500 dark:text-slate-400">{req.machineFriendlyName}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pane 2: Slot Schematic Canvas (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              2. Sơ Đồ Cơ Cấu Máy: {selectedMachine}
            </h3>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              EM No Gốc: <strong className="text-cyan-600 dark:text-cyan-400 font-bold">HWBMTL21EC0000</strong>
            </span>
          </div>

          {/* Mechanism Tabs */}
          <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            {ebomMechanisms.map(mech => (
              <button
                key={mech.mechanismId}
                onClick={() => setSelectedMechanismId(mech.mechanismId)}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-center truncate transition-all text-xs font-semibold ${
                  selectedMechanismId === mech.mechanismId 
                    ? 'bg-rose-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {mech.friendlyName.split('(')[0]}
              </button>
            ))}
          </div>

          {/* Active Mechanism Details & Bound Slots */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Tên Cơ Cấu Nghiệp Vụ:</span>
                <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{selectedMechanism.friendlyName}</div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Mã 14 Ký Tự EM No Tự Sinh:</span>
                <div className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm mt-0.5">{selectedMechanism.emNo}</div>
              </div>
            </div>

            {/* Slots list */}
            <div className="space-y-3">
              <span className="text-slate-600 dark:text-slate-300 font-bold text-xs">Danh Mục Phụ Tùng Đã Gắn Vào Cơ Cấu Này:</span>
              
              {selectedMechanism.boundParts.map((part, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{part.partCode}</span>
                    <div className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5">{part.partName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Tuổi thọ: {part.replacementLifespan} | Hãng: {part.maker}</div>
                  </div>
                  <Badge variant="success">Định mức: {part.stdQty} {part.unit}</Badge>
                </div>
              ))}

              {/* Drop Target Placeholder */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropOnSlot}
                className="p-5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/40 text-center text-slate-500 dark:text-slate-400 hover:border-emerald-500 transition-colors cursor-pointer"
              >
                <Link2 className="w-5 h-5 mx-auto text-slate-400 mb-1.5" />
                <span className="text-xs font-semibold">
                  Kéo thả phụ tùng từ Khay bên phải hoặc click "Gắn Slot" để liên kết vào cơ cấu này
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pane 3: Spare Parts Tray (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4 transition-colors">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            3. Khay Phụ Tùng Chờ Gắn (Kéo Hoặc Bấm Gắn)
          </h3>

          <div className="space-y-2.5">
            {availablePartsInTray.map((part, idx) => (
              <div 
                key={idx} 
                draggable
                onDragStart={() => setDraggedPart(part)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all text-xs flex items-center justify-between group cursor-grab active:cursor-grabbing shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{part.partCode}</span>
                    {part.partCode.startsWith('TMP') && <Badge variant="warning">Mã Tạm</Badge>}
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5 leading-snug">{part.partName}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{part.maker} {part.model}</div>
                </div>

                <button
                  onClick={() => handleBindPart(selectedMechanismId, part)}
                  className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-emerald-950/60 dark:hover:bg-emerald-600 dark:text-emerald-300 dark:hover:text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1 shrink-0 ml-2 shadow-sm"
                  title="Gắn trực tiếp vào cơ cấu đang chọn"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Gắn Slot
                </button>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-800 dark:text-slate-200">Công thức cấu tạo mã EM No 14 ký tự:</div>
            <div className="font-mono text-cyan-600 dark:text-cyan-400 text-[10px]">
              HW (Nhà máy) + BMTL (Line) + 2 (Tầng) + 1 (Line Hex) + EC (Máy) + 01 (Cụm Unit) + 01 (Cơ cấu) = HWBMTL21EC0101
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
