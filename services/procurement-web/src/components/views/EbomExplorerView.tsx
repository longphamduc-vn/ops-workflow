import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { 
  FolderTree, 
  Cpu, 
  Plus, 
  AlertTriangle, 
  Layers,
  CheckCircle2
} from 'lucide-react';

export const EbomExplorerView: React.FC = () => {
  const { ebomMechanisms, bindPartToSlot, requisitions, resolveLateDeclaration } = useProcurement();

  const [selectedMachine, setSelectedMachine] = useState('DB-01');
  const [selectedMechanismId, setSelectedMechanismId] = useState('MECH-DB01-FEED-01');
  const [saveNotice, setSaveNotice] = useState(false);

  const lateDeclarationRequisitions = requisitions.filter(r => r.ebomPendingMapping);

  const availablePartsInTray = [
    { partCode: 'QDAB03583', partName: 'Square Photoelectric Sensor', maker: 'Panasonic', model: 'CN-73-C2' },
    { partCode: 'QCAD38190', partName: 'Dual-Rod Cylinder MXQ16', maker: 'SMC', model: 'MXQ16-100B' },
    { partCode: 'QDAD12236', partName: 'Power Supply Board CPX V4', maker: 'Trumpf', model: '2912146' },
    { partCode: 'TMP-HW-0105', partName: 'Custom Chuck Clamp Jig Plate', maker: 'Local Machining Co.', model: 'JIG-SW-D222' },
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

  const selectedMechanism = ebomMechanisms.find(m => m.mechanismId === selectedMechanismId) || ebomMechanisms[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">UI-EBOM-01: Drag-and-Drop Visual EBOM Slot Mapper</h2>
            <Badge variant="info">Factory HW (Smart Watch 1)</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Separation of Friendly Business Names (Engineers) vs Auto-generated 14-Character EM No (`HWBMTL21EC0101`) & Late Declaration Queue.
          </p>
        </div>

        {saveNotice && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            EBOM Slot Mapping Saved!
          </div>
        )}
      </div>

      {/* 3-Column Visual Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pane 1: Friendly Machine Hierarchy Tree (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-cyan-400" />
            1. Friendly Equipment Tree
          </h3>

          <div className="space-y-1 text-xs font-medium">
            <div className="text-slate-400 font-bold flex items-center gap-1.5">
              <span>🏭 Factory HW (Smart Watch 1)</span>
            </div>
            
            <div className="pl-3 space-y-1 border-l border-slate-800 mt-1">
              <div className="text-slate-300 font-semibold">🌐 Line #201 (Floor 2F)</div>
              
              <div className="pl-3 space-y-1 border-l border-slate-800">
                <button
                  onClick={() => setSelectedMachine('DB-01')}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition-all flex items-center justify-between ${
                    selectedMachine === 'DB-01' ? 'bg-rose-900/40 text-rose-300 border border-rose-700/50' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🤖 DB-01 (Die Bonder 01)</span>
                  <span className="text-[10px] font-mono text-slate-500">2 Units</span>
                </button>

                <button
                  onClick={() => setSelectedMachine('DB-02')}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition-all flex items-center justify-between ${
                    selectedMachine === 'DB-02' ? 'bg-rose-900/40 text-rose-300 border border-rose-700/50' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🤖 DB-02 (Die Bonder 02)</span>
                  <span className="text-[10px] font-mono text-slate-500">1 Unit</span>
                </button>

                <div className="text-slate-400 px-2.5 py-1 text-xs">🤖 EC-01 (Cleaner 01)</div>
                <div className="text-slate-400 px-2.5 py-1 text-xs">🤖 PL-01 (Polarizer Attach)</div>
              </div>
            </div>
          </div>

          {/* Late Declaration Queue */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Late Declaration Queue ({lateDeclarationRequisitions.length})
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Requisitions created without EBOM slots. Map them below to clear `EBOM_PENDING_MAPPING`.
            </p>

            {lateDeclarationRequisitions.map(req => (
              <div key={req.id} className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] space-y-1">
                <div className="font-bold text-amber-300 font-mono">{req.qCode}</div>
                <div className="text-slate-300">{req.partName}</div>
                <div className="text-slate-500">{req.machineFriendlyName}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pane 2: Slot Schematic Canvas (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              2. Slot Schematic Canvas: {selectedMachine}
            </h3>
            <span className="text-xs font-mono text-slate-400">Master: <strong className="text-emerald-400">HWBMTL21EC0000</strong></span>
          </div>

          {/* Mechanism Tabs */}
          <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {ebomMechanisms.map(mech => (
              <button
                key={mech.mechanismId}
                onClick={() => setSelectedMechanismId(mech.mechanismId)}
                className={`flex-1 py-1 px-2 rounded text-center truncate transition-all font-medium ${
                  selectedMechanismId === mech.mechanismId 
                    ? 'bg-emerald-600 text-white font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mech.friendlyName.split('(')[0]}
              </button>
            ))}
          </div>

          {/* Active Mechanism Details & Bound Slots */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-slate-400">Mechanism Unit:</span>
                <div className="font-bold text-white text-sm">{selectedMechanism.friendlyName}</div>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Auto 14-char EM No:</span>
                <div className="font-mono font-bold text-cyan-400 text-sm">{selectedMechanism.emNo}</div>
              </div>
            </div>

            {/* Slots */}
            <div className="space-y-3">
              <span className="text-slate-400 font-medium">Bound Spare Parts Slots:</span>
              
              {selectedMechanism.boundParts.map((part, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-cyan-400">{part.partCode}</span>
                    <div className="font-medium text-slate-200 mt-0.5">{part.partName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">Lifespan: {part.replacementLifespan} | Maker: {part.maker}</div>
                  </div>
                  <Badge variant="success">Std Qty: {part.stdQty} {part.unit}</Badge>
                </div>
              ))}

              {/* Drop Target Placeholder */}
              <div className="p-4 rounded-lg border-2 border-dashed border-slate-800 bg-slate-900/40 text-center text-slate-400 hover:border-emerald-500/60 transition-colors">
                <span className="text-xs">Drag or click a part from the right tray to bind to this mechanism slot</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pane 3: Spare Parts Tray (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            3. Spare Parts Tray (Click to Bind)
          </h3>

          <div className="space-y-2.5">
            {availablePartsInTray.map((part, idx) => (
              <div 
                key={idx} 
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/60 transition-all text-xs flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-cyan-400">{part.partCode}</span>
                    {part.partCode.startsWith('TMP') && <Badge variant="warning">Late Queue</Badge>}
                  </div>
                  <div className="font-medium text-slate-200 mt-0.5 leading-snug">{part.partName}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{part.maker} {part.model}</div>
                </div>

                <button
                  onClick={() => handleBindPart(selectedMechanismId, part)}
                  className="px-2.5 py-1.5 bg-emerald-600/20 group-hover:bg-emerald-600 text-emerald-400 group-hover:text-white rounded font-bold text-xs transition-all flex items-center gap-1 shrink-0 ml-2"
                  title="Bind to active mechanism slot"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Bind
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300">14-Character EM No Logic:</div>
            <div className="font-mono text-cyan-400 text-[10px]">
              HW (Plant) + BMTL (Line) + 2 (Floor) + 1 (Line Hex) + EC (Mach) + 01 (Unit) + 01 (Assy) = HWBMTL21EC0101
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

