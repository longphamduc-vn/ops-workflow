import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { 
  ClipboardCheck, 
  Eye, 
  Ban
} from 'lucide-react';

export const LeaderDashboardView: React.FC = () => {
  const { requisitions, tasks, budget } = useProcurement();
  const [selectedPartFilter, setSelectedPartFilter] = useState<string>('ALL');
  const [selectedItemForInspect, setSelectedItemForInspect] = useState<any | null>(null);

  const filteredRequisitions = requisitions.filter(r => {
    if (selectedPartFilter === 'ALL') return true;
    return r.partGroup === selectedPartFilter;
  });

  const activeTasks = tasks.filter(t => t.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Principle Callout */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">UI-ROLE-02: Leader Team & Part Monitoring Dashboard</h2>
            <Badge variant="neutral">Team =&gt; Part Scope</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervising: <strong className="text-slate-200">PO Module Technology Team 2</strong> (CP/SG Part 1 & Part 2) | Peer Engineers Hierarchy.
          </p>
        </div>

        {/* Clear Notice: No In-App Approvals */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-medium">
          <Ban className="w-4 h-4 text-amber-400 shrink-0" />
          <span>No In-App Approvals: Official PRV sign-off executed exclusively on EMS.</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400">Total Team Requisitions</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{requisitions.length} <span className="text-xs font-normal text-slate-400">items</span></div>
          <div className="text-[11px] text-cyan-400 mt-1">7 in progress | 2 purchasable</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400">Within Target Commit</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">${budget.withinTargetSpend.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">81.3% of monthly SG ceiling</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400">Unbudgeted Over Under Review</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">${budget.unplannedOverSpend.toLocaleString()}</div>
          <div className="text-[11px] text-rose-400/80 mt-1">18.7% requires audit justification</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400">Active Engineer Tasks</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{activeTasks.length} <span className="text-xs font-normal text-slate-400">pending</span></div>
          <div className="text-[11px] text-amber-500 mt-1">1 cross-team borrow | 2 aging justifications</div>
        </div>
      </div>

      {/* Requisitions Monitoring Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-cyan-400" />
            Team Purchase Progress Pipeline (No-Approval Supervision)
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter Part:</span>
            <select
              value={selectedPartFilter}
              onChange={e => setSelectedPartFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
            >
              <option value="ALL">All Parts (Part 1 & 2)</option>
              <option value="CP/SG Part 1">CP/SG Part 1</option>
              <option value="CP/SG Part 2">CP/SG Part 2</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-medium">
                <th className="py-2.5 px-3">Req ID / QCode</th>
                <th className="py-2.5 px-3">Part Name</th>
                <th className="py-2.5 px-3">Machine & Line</th>
                <th className="py-2.5 px-3">Engineer (Peer)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Plan Marking</th>
                <th className="py-2.5 px-3">Milestone Progress</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredRequisitions.map(item => (
                <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-white">{item.id}</span>
                    <div className="text-[11px] text-cyan-400">{item.qCode}</div>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <div className="font-medium text-slate-200">{item.partName}</div>
                    <div className="text-[11px] text-slate-400">{item.maker} {item.model}</div>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <div>{item.machineFriendlyName}</div>
                    <div className="text-[11px] text-slate-400">{item.lineName}</div>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-300">
                    {item.requestorName}
                    <div className="text-[10px] text-slate-500">{item.partGroup}</div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={
                      item.status === 'CROSS_TEAM_STOCK' ? 'warning' :
                      item.status === 'PURCHASABLE' ? 'success' :
                      item.status === 'EOL' ? 'danger' : 'neutral'
                    }>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    {item.planClassification === 'TARGET' && <Badge variant="success">IN TARGET</Badge>}
                    {item.planClassification === 'OVER' && <Badge variant="danger">OVER ({item.overReasonCode})</Badge>}
                    {item.planClassification === 'UNCLASSIFIED' && <Badge variant="neutral">PENDING LEC</Badge>}
                  </td>
                  <td className="py-3 px-3 font-sans text-[11px]">
                    {item.vendorConfirmDate ? (
                      <span className="text-emerald-400 font-mono">Confirmed: {item.vendorConfirmDate} (ETA: {item.etaDate})</span>
                    ) : (
                      <span className="text-slate-500 italic">Awaiting Supplier Confirmation</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedItemForInspect(item)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-sans text-xs flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal (No Approval Buttons) */}
      {selectedItemForInspect && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Technical Incident Inspection: {selectedItemForInspect.id}
              </h4>
              <button 
                onClick={() => setSelectedItemForInspect(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-slate-300">
              <div>
                <span className="text-slate-400">Part Details:</span>
                <div className="font-semibold text-white mt-0.5">{selectedItemForInspect.partName} ({selectedItemForInspect.qCode})</div>
                <div className="text-[11px] text-slate-400">{selectedItemForInspect.maker} | {selectedItemForInspect.model}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500">Machine:</span>
                  <div className="font-medium text-slate-200">{selectedItemForInspect.machineFriendlyName}</div>
                </div>
                <div>
                  <span className="text-slate-500">Line:</span>
                  <div className="font-medium text-slate-200">{selectedItemForInspect.lineName}</div>
                </div>
                <div>
                  <span className="text-slate-500">Order Quantity:</span>
                  <div className="font-medium text-white">{selectedItemForInspect.quantity} {selectedItemForInspect.unit}</div>
                </div>
                <div>
                  <span className="text-slate-500">Total Price:</span>
                  <div className="font-medium text-emerald-400">${(selectedItemForInspect.quantity * selectedItemForInspect.estimatedUnitPrice).toLocaleString()} USD</div>
                </div>
              </div>

              {selectedItemForInspect.planClassification === 'OVER' && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300">
                  <div className="font-semibold">Over Budget Root-Cause: {selectedItemForInspect.overReasonCode}</div>
                  <div className="text-[11px] mt-1">Work Order reference: {selectedItemForInspect.workOrderNo}</div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 italic">Leader oversight only; sign-off conducted on EMS.</span>
              <button
                onClick={() => setSelectedItemForInspect(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
