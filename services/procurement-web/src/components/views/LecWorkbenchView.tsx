import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { 
  Truck, 
  MessageSquare, 
  Calendar, 
  AlertTriangle,
  Send,
  CheckCircle2
} from 'lucide-react';

export const LecWorkbenchView: React.FC = () => {
  const { 
    requisitions, 
    clarifications, 
    budget, 
    classifyTargetOver, 
    reclassifyEol, 
    updateMilestones, 
    forwardInquiryToEngineer,
    closeClarificationInquiry,
    updateDeadlines 
  } = useProcurement();

  const [activeTab, setActiveTab] = useState<'BATCH_GROUP' | 'MILESTONES' | 'CLARIFICATIONS' | 'DEADLINES'>('BATCH_GROUP');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PURCHASABLE' | 'CROSS_TEAM_STOCK' | 'EOL'>('ALL');

  // Milestone edit modal state
  const [editingMilestoneItem, setEditingMilestoneItem] = useState<any | null>(null);
  const [vendorConfirmInput, setVendorConfirmInput] = useState('');
  const [etaInput, setEtaInput] = useState('');
  const [m1Qty, setM1Qty] = useState(2);
  const [m2Qty, setM2Qty] = useState(1);
  const [m3Qty, setM3Qty] = useState(1);

  // 3-Party Bridge state
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [lecNoteInput, setLecNoteInput] = useState('');

  // Deadline state
  const [justificationDeadlineInput, setJustificationDeadlineInput] = useState(budget.justificationDeadline);
  const [auditLockDeadlineInput, setAuditLockDeadlineInput] = useState(budget.auditLockDeadline);
  const [deadlineSavedNotice, setDeadlineSavedNotice] = useState(false);

  const filteredRequisitions = requisitions.filter(r => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  const handleOpenMilestoneModal = (item: any) => {
    setEditingMilestoneItem(item);
    setVendorConfirmInput(item.vendorConfirmDate || '2026-11-08');
    setEtaInput(item.etaDate || '2026-11-15');
    setM1Qty(Math.ceil(item.quantity / 2));
    setM2Qty(Math.floor(item.quantity / 4));
    setM3Qty(item.quantity - Math.ceil(item.quantity / 2) - Math.floor(item.quantity / 4));
  };

  const handleSaveMilestones = () => {
    if (!editingMilestoneItem) return;
    const unitPrice = editingMilestoneItem.estimatedUnitPrice;
    const allocations = [
      { month: '2026-11', qty: m1Qty, amount: m1Qty * unitPrice },
      { month: '2026-12', qty: m2Qty, amount: m2Qty * unitPrice },
      { month: '2027-01', qty: m3Qty, amount: m3Qty * unitPrice },
    ];

    updateMilestones(editingMilestoneItem.id, vendorConfirmInput, etaInput, allocations);
    setEditingMilestoneItem(null);
  };

  const handleForwardToEngineer = (inquiryId: string) => {
    if (!lecNoteInput) return;
    forwardInquiryToEngineer(inquiryId, lecNoteInput);
    setLecNoteInput('');
    setSelectedInquiryId(null);
  };

  const handleSaveDeadlines = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeadlines(justificationDeadlineInput, auditLockDeadlineInput);
    setDeadlineSavedNotice(true);
    setTimeout(() => setDeadlineSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">UI-ROLE-03: LEC Master Engineering & Progress Workbench</h2>
            <Badge variant="info">Coordinator: Pham Duc Long (658359)</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sole authority for manual Target vs Over marking, Interlock resolution, milestone delivery tracking, and 3-Party Clarification Bridge.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('BATCH_GROUP')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${activeTab === 'BATCH_GROUP' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Batch Group & Interlocks
          </button>
          <button
            onClick={() => setActiveTab('MILESTONES')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${activeTab === 'MILESTONES' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Inbound Milestones & Allocations
          </button>
          <button
            onClick={() => setActiveTab('CLARIFICATIONS')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${activeTab === 'CLARIFICATIONS' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            3-Party Bridge
            {clarifications.filter(c => c.status === 'PENDING_LEC' || c.status === 'ENGINEER_REPLIED').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold">
                {clarifications.filter(c => c.status === 'PENDING_LEC' || c.status === 'ENGINEER_REPLIED').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('DEADLINES')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${activeTab === 'DEADLINES' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Deadline Configuration
          </button>
        </div>
      </div>

      {/* TAB 1: BATCH GROUPING & TARGET/OVER MARKING */}
      {activeTab === 'BATCH_GROUP' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter By Status:</span>
              <div className="flex gap-1">
                {(['ALL', 'PURCHASABLE', 'CROSS_TEAM_STOCK', 'EOL'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      statusFilter === st 
                        ? 'bg-slate-800 text-cyan-400 border border-cyan-500/50' 
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Prerequisite: <strong className="text-emerald-400">Official QCode Mandatory for Audit</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-medium">
                  <th className="py-2.5 px-3">Req ID / QCode</th>
                  <th className="py-2.5 px-3">Part Name</th>
                  <th className="py-2.5 px-3">Machine & Line</th>
                  <th className="py-2.5 px-3">Qty & Price</th>
                  <th className="py-2.5 px-3">Interlock Scan</th>
                  <th className="py-2.5 px-3">LEC Manual Plan Tag</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {filteredRequisitions.map(item => (
                  <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-white">{item.id}</span>
                      <div className="text-[11px] text-cyan-400 flex items-center gap-1">
                        {item.qCode}
                        {item.isTempCode && <Badge variant="danger">TMP (NO AUDIT)</Badge>}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-medium text-slate-200">{item.partName}</div>
                      <div className="text-[11px] text-slate-400">{item.maker} {item.model}</div>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div>{item.machineFriendlyName}</div>
                      <div className="text-[11px] text-slate-400">{item.lineName}</div>
                    </td>
                    <td className="py-3 px-3">
                      {item.quantity} {item.unit} @ ${item.estimatedUnitPrice}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      {item.agingInterlockFlag === 'Y' ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          PEER STOCK ({item.crossTeamStockQty} EA)
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          CLEAR TO PROCEED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {/* Strictly Non-Automated Manual Tagging by LEC */}
                      <div className="flex gap-1 font-sans">
                        <button
                          onClick={() => classifyTargetOver(item.id, 'TARGET')}
                          className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                            item.planClassification === 'TARGET'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-950 text-slate-400 hover:text-emerald-400 border border-slate-800'
                          }`}
                        >
                          🟢 TARGET
                        </button>
                        <button
                          onClick={() => classifyTargetOver(item.id, 'OVER', 'OVR-01', item.workOrderNo || 'WO-248926091')}
                          className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                            item.planClassification === 'OVER'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-950 text-slate-400 hover:text-rose-400 border border-slate-800'
                          }`}
                        >
                          🔴 OVER
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex gap-1 justify-end font-sans">
                        {item.status !== 'EOL' && (
                          <button
                            onClick={() => reclassifyEol(item.id)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                            title="Reclassify to Discontinued (EOL) if maker no longer produces"
                          >
                            Set EOL
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenMilestoneModal(item)}
                          className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 rounded text-[11px] flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3" />
                          Milestones
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INBOUND DELIVERY MILESTONES & MONTHLY EXPENSE ALLOCATION */}
      {activeTab === 'MILESTONES' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              Pre-Arrival Delivery Milestones & Monthly Expense Allocation Plan
            </h3>
            <span className="text-xs text-slate-400">Physical receipt verified on EMS | Pre-arrival milestones tracked here</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-medium">
                  <th className="py-2.5 px-3">Req ID / QCode</th>
                  <th className="py-2.5 px-3">Part & Qty</th>
                  <th className="py-2.5 px-3">Vendor Confirm Date</th>
                  <th className="py-2.5 px-3">ETA HW Dock</th>
                  <th className="py-2.5 px-3">Monthly Issuance & Expense Distribution Plan</th>
                  <th className="py-2.5 px-3 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {requisitions.map(item => (
                  <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-white">{item.id}</span>
                      <div className="text-[11px] text-cyan-400">{item.qCode}</div>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-medium text-slate-200">{item.partName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.quantity} {item.unit} (${(item.quantity * item.estimatedUnitPrice).toLocaleString()})</div>
                    </td>
                    <td className="py-3 px-3">
                      {item.vendorConfirmDate ? (
                        <span className="text-emerald-400 font-bold">{item.vendorConfirmDate}</span>
                      ) : (
                        <span className="text-slate-500 italic font-sans">Pending Supplier</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {item.etaDate ? (
                        <span className="text-cyan-400 font-bold">{item.etaDate}</span>
                      ) : (
                        <span className="text-slate-500 italic font-sans">Pending ETA</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      {item.monthlyAllocations && item.monthlyAllocations.length > 0 ? (
                        <div className="flex gap-2">
                          {item.monthlyAllocations.map((alloc, idx) => (
                            <div key={idx} className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[10px]">
                              <span className="text-slate-400 font-mono">{alloc.month}:</span>{' '}
                              <strong className="text-emerald-400">{alloc.qty} EA</strong>{' '}
                              <span className="text-slate-500 font-mono">(${alloc.amount})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No allocation plan configured</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleOpenMilestoneModal(item)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-sans"
                      >
                        Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 3-PARTY BRIDGE */}
      {activeTab === 'CLARIFICATIONS' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              3-Party Clarification Bridge Console (Reviewer ↔ LEC ↔ Engineer)
            </h3>
            <span className="text-xs text-slate-400">LEC acts as the vital bridge between Cost Management and Field Engineers</span>
          </div>

          <div className="space-y-3">
            {clarifications.map(inq => (
              <div key={inq.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400 font-mono">{inq.id}</span>
                    <span className="text-slate-200 font-medium">| {inq.partName}</span>
                  </div>
                  <Badge variant={
                    inq.status === 'PENDING_LEC' ? 'danger' :
                    inq.status === 'PENDING_ENGINEER' ? 'warning' :
                    inq.status === 'ENGINEER_REPLIED' ? 'success' : 'neutral'
                  }>
                    {inq.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-slate-200">
                    <strong className="text-rose-400">Inquiry from Reviewer (Cost Management):</strong> {inq.reviewerQuestion}
                  </div>
                  {inq.lecNote && (
                    <div className="text-slate-300 pl-3 border-l-2 border-cyan-500">
                      <strong className="text-cyan-400">Your Instructions to Engineer:</strong> {inq.lecNote}
                    </div>
                  )}
                  {inq.engineerResponse && (
                    <div className="text-emerald-300 pl-3 border-l-2 border-emerald-500">
                      <strong className="text-emerald-400">Response from Engineer (Nguyen Van Thang):</strong> {inq.engineerResponse}
                    </div>
                  )}
                </div>

                {/* If PENDING_LEC: Input instruction and forward to engineer */}
                {inq.status === 'PENDING_LEC' && (
                  <div className="space-y-2 pt-2">
                    <textarea
                      placeholder="Add technical instructions or specific evidence needed before forwarding to the field engineer..."
                      value={selectedInquiryId === inq.id ? lecNoteInput : ''}
                      onChange={e => {
                        setSelectedInquiryId(inq.id);
                        setLecNoteInput(e.target.value);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                      rows={2}
                    />
                    <button
                      onClick={() => handleForwardToEngineer(inq.id)}
                      className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Forward Inquiry to Field Engineer
                    </button>
                  </div>
                )}

                {/* If ENGINEER_REPLIED: Review and return to reviewer */}
                {inq.status === 'ENGINEER_REPLIED' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => closeClarificationInquiry(inq.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verify Evidence & Return Finalized Dossier to Cost Management Reviewer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DEADLINE CONFIGURATION */}
      {activeTab === 'DEADLINES' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg max-w-xl mx-auto space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            LEC Operational Deadline Configuration
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Per Principle 7, the Beginning-of-Month Audit occurs during Days 01–05, and submission deadlines for engineer justifications and dossier lock are dynamically configured by the LEC.
          </p>

          {deadlineSavedNotice && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Deadlines updated successfully! Synchronized across Engineer and Leader portals.
            </div>
          )}

          <form onSubmit={handleSaveDeadlines} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Engineer Aging Justification Submission Deadline:</label>
              <input 
                type="date"
                value={justificationDeadlineInput}
                onChange={e => setJustificationDeadlineInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Beginning-of-Month Audit Dossier Lock Deadline:</label>
              <input 
                type="date"
                value={auditLockDeadlineInput}
                onChange={e => setAuditLockDeadlineInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded-lg shadow-lg transition-all"
            >
              Save Operational Deadlines
            </button>
          </form>
        </div>
      )}

      {/* Milestone Modal */}
      {editingMilestoneItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Configure Milestones: {editingMilestoneItem.id} ({editingMilestoneItem.qCode})
              </h4>
              <button 
                onClick={() => setEditingMilestoneItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Vendor Confirm Date:</label>
                <input
                  type="date"
                  value={vendorConfirmInput}
                  onChange={e => setVendorConfirmInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">ETA Dock Arrival Date:</label>
                <input
                  type="date"
                  value={etaInput}
                  onChange={e => setEtaInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-slate-300 font-semibold mb-2">
                Monthly Expense Allocation Plan (Total Qty: {editingMilestoneItem.quantity} EA):
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400">Nov 2026:</span>
                  <input
                    type="number"
                    min="0"
                    max={editingMilestoneItem.quantity}
                    value={m1Qty}
                    onChange={e => setM1Qty(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono mt-1"
                  />
                  <div className="text-[10px] text-emerald-400 mt-1">${m1Qty * editingMilestoneItem.estimatedUnitPrice}</div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400">Dec 2026:</span>
                  <input
                    type="number"
                    min="0"
                    max={editingMilestoneItem.quantity}
                    value={m2Qty}
                    onChange={e => setM2Qty(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono mt-1"
                  />
                  <div className="text-[10px] text-emerald-400 mt-1">${m2Qty * editingMilestoneItem.estimatedUnitPrice}</div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400">Jan 2027:</span>
                  <input
                    type="number"
                    min="0"
                    max={editingMilestoneItem.quantity}
                    value={m3Qty}
                    onChange={e => setM3Qty(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono mt-1"
                  />
                  <div className="text-[10px] text-emerald-400 mt-1">${m3Qty * editingMilestoneItem.estimatedUnitPrice}</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setEditingMilestoneItem(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMilestones}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 font-bold text-slate-950 rounded shadow-md"
              >
                Save Milestones & Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
