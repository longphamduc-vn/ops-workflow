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
  Link2,
  GripVertical,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Wrench
} from 'lucide-react';

export const EbomExplorerView: React.FC = () => {
  const { ebomMechanisms, bindPartToSlot, requisitions, resolveLateDeclaration } = useProcurement();

  const [selectedMachine, setSelectedMachine] = useState('DB-01');
  const [selectedMechanismId, setSelectedMechanismId] = useState('MECH-DB01-FEED-01');
  const [saveNotice, setSaveNotice] = useState(false);
  const [draggedPart, setDraggedPart] = useState<any | null>(null);

  const lateDeclarationRequisitions = requisitions.filter(r => r.ebomPendingMapping);

  const availablePartsInTray = [
    { partCode: 'QDAB03583', partName: 'Cảm biến quang vuông Panasonic', maker: 'Panasonic', model: 'CN-73-C2', lifespan: '20,000h' },
    { partCode: 'QCAD38190', partName: 'Xy lanh dẫn hướng 2 ty SMC MXQ16', maker: 'SMC', model: 'MXQ16-100B', lifespan: '15,000h' },
    { partCode: 'QDAD12236', partName: 'Bo mạch nguồn cao tần CPX V4 Trumpf', maker: 'Trumpf', model: '2912146', lifespan: '40,000h' },
    { partCode: 'TMP-HW-0105', partName: 'Tấm đồ gá Chuck kẹp phôi tùy biến', maker: 'Local Machining Co.', model: 'JIG-SW-D222', lifespan: '5,000h' },
    { partCode: 'QDAC77219', partName: 'Vòi hút chân không Carbide Nozzle', maker: 'DISCO', model: 'NZ-TC-012', lifespan: '8,000h' }
  ];

  const handleBindPart = (mechanismId: string, part: typeof availablePartsInTray[0]) => {
    bindPartToSlot(mechanismId, part.partCode, part.partName, part.maker, part.model, 1, part.lifespan);
    
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
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 shrink-0">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                UI-ROLE-07: Visual Machine EBOM Explorer (Bàn Kéo - Thả Slot Cơ Cấu)
              </h2>
              <Badge variant="info">Factory HW • Smart Watch 1</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Khớp nối Tên Thân Thiện (Máy, Chuyền, Cụm Cơ Cấu) $\leftrightarrow$ Mã EM 14 Ký Tự và Giải Tỏa Hàng Đợi Khai Báo Muộn (Late Declaration Queue).
            </p>
          </div>
        </div>

        {saveNotice && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Đã gán linh kiện vào Slot cơ cấu EBOM thành công!</span>
          </div>
        )}
      </div>

      {/* 2. Three-Panel Layout: Tree | Mechanism Slots | Parts Tray */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel 1: Friendly Machine Hierarchy Tree (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4 transition-colors">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            1. Cây Phân Cấp Thiết Bị
          </h3>

          <div className="space-y-2 text-xs font-medium">
            <div className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
              <span>🏭 Factory HW (Smart Watch 1)</span>
            </div>
            
            {/* Line 201 */}
            <div className="pl-3 space-y-1.5 border-l-2 border-slate-200 dark:border-slate-800">
              <div className="text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
                🌐 Line #201 (Tầng 2F)
              </div>
              
              <div className="pl-2.5 space-y-1 border-l-2 border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedMachine('DB-01')}
                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                    selectedMachine === 'DB-01'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Die Bonder 01 (DB-01)</span>
                </button>
              </div>
            </div>

            {/* Line 202 */}
            <div className="pl-3 space-y-1.5 border-l-2 border-slate-200 dark:border-slate-800">
              <div className="text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
                🌐 Line #202 (Tầng 2F)
              </div>
              
              <div className="pl-2.5 space-y-1 border-l-2 border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedMachine('TAB-02')}
                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                    selectedMachine === 'TAB-02'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Tape Bonder 02 (TAB-02)</span>
                </button>
              </div>
            </div>

            {/* Line 301 */}
            <div className="pl-3 space-y-1.5 border-l-2 border-slate-200 dark:border-slate-800">
              <div className="text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
                🌐 Line #301 (Tầng 3F)
              </div>
              <div className="pl-2.5 space-y-1 border-l-2 border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedMachine('POL-01')}
                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                    selectedMachine === 'POL-01'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Polarizer Attach (POL-01)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Mechanism Drop Target & Bound Parts Slots (5 cols) */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOnSlot}
          className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              2. Các Cụm Cơ Cấu Của Máy: {selectedMachine}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Thả linh kiện vào đây
            </span>
          </div>

          {/* Mechanism Tabs for Selected Machine */}
          <div className="flex gap-2 flex-wrap">
            {ebomMechanisms
              .filter(m => m.machineId === selectedMachine)
              .map(m => (
                <button
                  key={m.mechanismId}
                  onClick={() => setSelectedMechanismId(m.mechanismId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedMechanismId === m.mechanismId
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {m.friendlyName}
                </button>
              ))}
          </div>

          {/* Mechanism Details & 14-char EM No */}
          {selectedMechanism && (
            <div className="space-y-4 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Cụm cơ cấu:</span>
                  <strong className="text-slate-900 dark:text-white font-semibold">{selectedMechanism.friendlyName}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Mã EM No (14 Ký Tự Chuẩn):</span>
                  <strong className="font-mono text-purple-600 dark:text-purple-400 font-bold tracking-wider">{selectedMechanism.emNo}</strong>
                </div>
              </div>

              {/* Bound Spare Parts Slot List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Linh Kiện Đang Gán Định Mức Trong Cơ Cấu Này ({selectedMechanism.boundParts.length}):
                </span>

                <div className="space-y-2">
                  {selectedMechanism.boundParts.map((part, idx) => (
                    <div 
                      key={part.partCode} 
                      className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="font-mono text-purple-600 dark:text-purple-400">{part.partCode}</span>
                          <span className="text-slate-700 dark:text-slate-300 truncate">{part.partName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {part.maker} • {part.model} • Tuổi thọ định mức: <strong>{part.replacementLifespan}</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {part.stdQty} {part.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drop Target Box */}
              <div className="p-4 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-800 text-center text-xs text-purple-600 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/20">
                Kéo mã linh kiện từ Khay bên phải thả vào đây để gán Slot cơ cấu
              </div>
            </div>
          )}
        </div>

        {/* Panel 3: Spare Parts Inventory Tray (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 transition-colors">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            3. Khay Linh Kiện Dự Phòng Đã Đăng Ký
          </h3>
          <p className="text-[11px] text-slate-400">
            Kéo thả hoặc nhấn "Gán Nhanh" để thiết lập quan hệ thay thế với Slot cơ cấu.
          </p>

          <div className="space-y-2">
            {availablePartsInTray.map(part => (
              <div
                key={part.partCode}
                draggable
                onDragStart={() => setDraggedPart(part)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs hover:border-purple-500 cursor-grab active:cursor-grabbing transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="font-mono text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                    {part.partCode}
                  </span>
                  <button
                    onClick={() => handleBindPart(selectedMechanismId, part)}
                    className="px-2 py-0.5 rounded bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-[10px] font-bold"
                  >
                    Gán Nhanh
                  </button>
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{part.partName}</div>
                <div className="text-[10px] text-slate-400">{part.maker} • {part.model}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bottom Panel: Late Declaration Queue */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hàng Đợi Khai Báo Muộn Cơ Cấu EBOM ({lateDeclarationRequisitions.length} Hạng Mục Cần Gán)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Cho phép mua gấp khi dừng chuyền $\rightarrow$ Bắt buộc hoàn tất gán Slot trong 7 ngày
          </span>
        </div>

        {lateDeclarationRequisitions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Mã Đơn / QCode</th>
                  <th className="p-3">Tên Linh Kiện Mua Gấp</th>
                  <th className="p-3">Thiết Bị Cần Gán</th>
                  <th className="p-3">Kỹ Sư Mua</th>
                  <th className="p-3 text-right">Thao Tác Gán Slot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lateDeclarationRequisitions.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                      {req.id} <span className="text-[10px] text-slate-400 block">{req.qCode}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{req.partName}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{req.machineFriendlyName} ({req.lineName})</td>
                    <td className="p-3">{req.requestorName}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => resolveLateDeclaration(req.id, selectedMechanismId)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Gán Vào Cụm Hiện Tại
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            Không có hạng mục nào tồn đọng trong hàng đợi khai báo muộn.
          </div>
        )}
      </div>
    </div>
  );
};
