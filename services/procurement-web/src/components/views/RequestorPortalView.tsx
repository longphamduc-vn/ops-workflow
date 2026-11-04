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
  Check
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
  const [demandType, setDemandType] = useState<'SETUP' | 'IMPROVE' | 'BREAKDOWN' | 'PM'>('IMPROVE');
  const [machine, setMachine] = useState('Die Bonder 01 (DB-01)');
  const [mechanism, setMechanism] = useState('Tape Cut Mechanism (Mech 01)');
  const [formSuccess, setFormSuccess] = useState(false);

  // Folder upload simulation
  const [uploadedFolder, setUploadedFolder] = useState<string | null>(null);
  const [tempCodeGenerated, setTempCodeGenerated] = useState<string | null>(null);

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
      name: 'Square Photoelectric Sensor',
      maker: 'Panasonic',
      model: 'CN-73-C2',
      price: 45,
      agingInterlock: 'N',
      crossTeamQty: 0
    },
    QDAD12236: {
      name: 'Power Supply Board CPX V4',
      maker: 'Trumpf',
      model: '2912146',
      price: 3150,
      agingInterlock: 'N',
      crossTeamQty: 0
    },
    QCAD38190: {
      name: 'Dual-Rod Guided Cylinder MXQ16',
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
      mechanismFriendlyName: mechanism,
      emNo: 'HWBMTL21EC0101',
      status: preset.agingInterlock === 'Y' ? 'CROSS_TEAM_STOCK' : 'PURCHASABLE',
      planClassification: 'UNCLASSIFIED',
      requestorName: 'Nguyen Van Thang',
      partGroup: 'CP/SG Part 1',
      ebomPendingMapping: false,
      agingInterlockFlag: preset.agingInterlock as 'Y' | 'N',
      crossTeamStockQty: preset.crossTeamQty,
      peerTeamOwner: preset.owner
    });

    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  const handleSimulateFolderUpload = () => {
    setUploadedFolder('CAD_202611_Custom_Holding_Plate.zip (3 CAD files, 2 Catalogs)');
    setTempCodeGenerated(`TMP-HW-${Math.floor(1000 + Math.random() * 9000)}`);
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
      {/* Header Banner */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">UI-ROLE-01: Field Engineer Portal (Requestor Workbench)</h2>
            <Badge variant="purple">Peer Engineers (No Process Hierarchy)</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as: <strong className="text-slate-200">Nguyen Van Thang</strong> (Field Engineer - CP/SG Part 1) | Direct access to Friendly Machine Names.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('NEW_REQ')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${activeTab === 'NEW_REQ' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Create Requisition
          </button>
          <button
            onClick={() => setActiveTab('FOLDER_UPLOAD')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${activeTab === 'FOLDER_UPLOAD' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Data Prep Folder Upload
          </button>
          <button
            onClick={() => setActiveTab('CLARIFICATIONS')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${activeTab === 'CLARIFICATIONS' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            3-Party Clarification
            {pendingInquiriesForEngineer.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold">
                {pendingInquiriesForEngineer.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('AGING_TASKS')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${activeTab === 'AGING_TASKS' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Aging Tasks
            {activeAgingTasks.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                {activeAgingTasks.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Persistent Cross-Team Warning Alert (Principle 3) */}
      {activeCrossTeamTasks.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border-2 border-amber-500/60 shadow-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-2">
              PERSISTENT REQUIRED TASK ACTIVE: PEER TEAM STOCK AVAILABLE IN FACTORY HW
              <Badge variant="warning">Cannot Be Dismissed Manually</Badge>
            </h4>
            <p className="text-xs text-amber-200/90 mt-1">
              Part <strong className="font-mono text-white">QCAD38190</strong> has 6 idle units at Warehouse H1-2F owned by <strong>PO Module Tech Team 1</strong>.
              You must initiate an internal borrow/transfer on EMS prior to submitting new purchase requests. 
              <strong> This task will automatically close once EMS re-sync confirms the inventory has been issued ('N').</strong>
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: NEW REQUISITION FORM */}
      {activeTab === 'NEW_REQ' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-rose-400" />
              Requisition Input (Direct Friendly Machine Navigation)
            </h3>

            {formSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Requisition created successfully! Forwarded to LEC workbench.
              </div>
            )}

            <form onSubmit={handleCreateRequisition} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Production Machine (Friendly Name):</label>
                  <select 
                    value={machine}
                    onChange={e => setMachine(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Die Bonder 01 (DB-01)">Die Bonder 01 (DB-01) - Line #201</option>
                    <option value="Die Bonder 02 (DB-02)">Die Bonder 02 (DB-02) - Line #201</option>
                    <option value="Tape Automated Bonder (TAB-02)">Tape Automated Bonder (TAB-02) - Line #202</option>
                    <option value="Polarizer Attach (POL-01)">Polarizer Attach (POL-01) - Line #203</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Assembly / Mechanism Slot:</label>
                  <select 
                    value={mechanism}
                    onChange={e => setMechanism(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Feeder Unit (Unit 01)">Feeder Unit (Cụm Cấp Liệu Phôi)</option>
                    <option value="Bonding Head (Unit 02)">Bonding Head (Cụm Đầu Gắp Chíp)</option>
                    <option value="Tape Cut Mechanism (Mech 01)">Tape Cut Mechanism (Cụm Cắt Tape)</option>
                    <option value="[+] Unregistered Mechanism (Late Declaration)">[+] Unregistered Mechanism (Late Declaration Queue)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Select Spare Part (Official EMS QCode):</label>
                  <select 
                    value={selectedPart}
                    onChange={e => setSelectedPart(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                  >
                    <option value="QDAB03583">QDAB03583 - Panasonic Sensor CN-73-C2 ($45)</option>
                    <option value="QDAD12236">QDAD12236 - Trumpf Power Board CPX V4 ($3,150)</option>
                    <option value="QCAD38190">QCAD38190 - SMC Cylinder MXQ16-100B ($220) [⚠️ Peer Stock]</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Demand Classification:</label>
                  <select 
                    value={demandType}
                    onChange={e => setDemandType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="IMPROVE">IMPROVE - Machine Optimization / Line Improvement</option>
                    <option value="BREAKDOWN">BREAKDOWN - Urgent Line Stop Repair</option>
                    <option value="PM">PM - Preventive Scheduled Maintenance</option>
                    <option value="SETUP">SETUP - Model Conversion Setup</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Order Quantity (EA):</label>
                  <input 
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Estimated Unit Price (USD):</label>
                  <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded px-3 py-2 text-slate-400 font-mono">
                    ${partPresets[selectedPart].price} USD (Total: ${(quantity * partPresets[selectedPart].price).toLocaleString()} USD)
                  </div>
                </div>
              </div>

              {/* Instant Cross-Team Stock Notice (if QCAD38190 selected) */}
              {partPresets[selectedPart].agingInterlock === 'Y' && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>⚠️ <strong>{partPresets[selectedPart].crossTeamQty} EA</strong> idle stock detected at <strong>{partPresets[selectedPart].owner}</strong>! Submitting this form will automatically generate an intra-plant transfer task.</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 font-semibold text-white rounded-lg shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Requisition to LEC Workbench
              </button>
            </form>
          </div>

          {/* Right: Quick Instructions & Machine Snapshot */}
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg text-xs space-y-3">
              <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Operational Principles for Engineers
              </h4>
              <ul className="space-y-2 text-slate-400 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Peer Engineers:</strong> You have direct authority over your assigned machines without needing Process Leader sign-off.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Cross-Team Stock:</strong> You are not blamed for peer team aging stock, but you must prioritize borrowing before buying new.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Approvals on EMS:</strong> Submitting here initiates technical & budget coordination; official PO approval happens solely on EMS.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FOLDER UPLOAD (DATA PREP FOR QCODE) */}
      {activeTab === 'FOLDER_UPLOAD' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Upload Technical Document Folder (Data Preparation)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Drag and drop CAD drawings, catalogs, and electrical schematics to prepare data for LEC to register an official EMS QCode.
              </p>
            </div>

            {/* Drag & Drop Zone */}
            <div 
              onClick={handleSimulateFolderUpload}
              className="border-2 border-dashed border-slate-700 hover:border-rose-500/80 bg-slate-950/60 p-8 rounded-xl text-center cursor-pointer transition-all hover:bg-slate-950"
            >
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <div className="text-xs font-semibold text-slate-200">
                Click or Drag-and-drop Technical Folder Here
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Supports folder with .STEP, .DWG, .PDF, .PNG (Max: 50MB)
              </div>
            </div>

            {/* Generated Temp Code Callout */}
            {uploadedFolder && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Extracted Package:</span>
                  <Badge variant="info">Ready for LEC Registration</Badge>
                </div>
                <div className="font-mono text-xs text-slate-200 font-semibold">{uploadedFolder}</div>
                
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Generated Temp Identifier:</span>
                    <span className="font-mono font-bold text-rose-400 text-sm">{tempCodeGenerated}</span>
                  </div>
                  <div className="text-[11px] text-rose-300/80 mt-2">
                    ⚠️ <strong>Audit Rule:</strong> Temporary codes (`{tempCodeGenerated}`) are strictly <strong>BLOCKED</strong> from the Beginning-of-Month Cost Audit dossier. The LEC must complete external EMS registration and link the official QCode first.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: 3-PARTY CLARIFICATIONS */}
      {activeTab === 'CLARIFICATIONS' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              Inquiries from Cost Management (Forwarded via LEC)
            </h3>
            <span className="text-xs text-slate-400">Response loop: Cost Management ↔ LEC ↔ Engineer</span>
          </div>

          <div className="space-y-3">
            {clarifications.map(inq => (
              <div key={inq.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400 font-mono">{inq.id}</span>
                    <span className="text-slate-300 font-medium">| {inq.partName}</span>
                  </div>
                  <Badge variant={inq.status === 'ENGINEER_REPLIED' ? 'success' : inq.status === 'PENDING_ENGINEER' ? 'warning' : 'info'}>
                    {inq.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-slate-300">
                    <strong className="text-rose-400">Question from Reviewer:</strong> {inq.reviewerQuestion}
                  </div>
                  {inq.lecNote && (
                    <div className="text-slate-400 pl-3 border-l-2 border-cyan-500">
                      <strong className="text-cyan-400">Instruction from LEC:</strong> {inq.lecNote}
                    </div>
                  )}
                  {inq.engineerResponse && (
                    <div className="text-emerald-300 pl-3 border-l-2 border-emerald-500">
                      <strong className="text-emerald-400">Your Submitted Response:</strong> {inq.engineerResponse}
                    </div>
                  )}
                </div>

                {inq.status === 'PENDING_ENGINEER' && (
                  <div className="space-y-2 pt-2">
                    <textarea
                      placeholder="Type your explanation, attach work order ID, and explain breakdown or technical necessity..."
                      value={selectedInquiryId === inq.id ? replyText : ''}
                      onChange={e => {
                        setSelectedInquiryId(inq.id);
                        setReplyText(e.target.value);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                      rows={3}
                    />
                    <button
                      onClick={handleSendClarificationReply}
                      className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit Explanation to LEC
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AGING INVENTORY JUSTIFICATION TASKS */}
      {activeTab === 'AGING_TASKS' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Beginning-of-Month Inventory Aging Tasks (&gt;30 Days)
            </h3>
            <span className="text-xs text-amber-400 font-mono">Mandatory for Month-Start Cost Audit</span>
          </div>

          <div className="space-y-3">
            {tasks.filter(t => t.type === 'AGING_JUSTIFICATION').map(task => (
              <div key={task.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 font-mono">{task.qCode}</span>
                    <span className="text-slate-200 font-medium">| {task.partName}</span>
                  </div>
                  <Badge variant={task.status === 'ACTIVE' ? 'warning' : 'success'}>
                    {task.status}
                  </Badge>
                </div>

                <p className="text-slate-400">{task.details}</p>

                {task.status === 'ACTIVE' && (
                  <div className="space-y-2 pt-2">
                    <input 
                      type="text"
                      placeholder="Enter justification note (e.g., Scheduled for replacement during PM Line 201 next Tuesday)..."
                      value={selectedTaskId === task.id ? justificationNote : ''}
                      onChange={e => {
                        setSelectedTaskId(task.id);
                        setJustificationNote(e.target.value);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                    />
                    <button
                      onClick={handleSendAgingJustification}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Submit Justification Before Deadline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
