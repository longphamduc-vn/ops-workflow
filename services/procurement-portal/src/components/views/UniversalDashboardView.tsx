import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { 
  DollarSign, 
  TrendingUp, 
  AlertOctagon, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Package, 
  ShieldAlert,
  Flame
} from 'lucide-react';

export const UniversalDashboardView: React.FC = () => {
  const { requisitions, budget } = useProcurement();

  const overRequisitions = requisitions.filter(r => r.planClassification === 'OVER');
  const targetRequisitions = requisitions.filter(r => r.planClassification === 'TARGET');

  return (
    <div className="space-y-6">
      {/* Principle Callout Alert */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-4 rounded-xl border border-slate-800 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              UI-COMMON-00: Universal Operations & Procurement Analytics Dashboard
              <Badge variant="info">Factory HW - Smart Watch</Badge>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time intelligence connecting Requisitions, Beginning-of-Month Cost Appraisals, Vendor Milestones, and EMS Core Sync.
            </p>
          </div>
        </div>
        <div className="text-right text-xs">
          <span className="text-slate-400">SG Budget Policy:</span>{' '}
          <strong className="text-amber-400 font-mono">Strict No-Rollover (Month-end expiry)</strong>
        </div>
      </div>

      {/* 1. Procurement Funnel & Progress Pipeline */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            1. Procurement Pipeline & Progress Funnel (End-to-End Milestones)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Avg Cycle Time: <strong className="text-emerald-400">9.4 Days</strong> | OTD: <strong className="text-emerald-400">92.8%</strong></span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { step: '1. Requisition', count: requisitions.length, color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-400' },
            { step: '2. Interlock Scan', count: requisitions.filter(r => r.status !== 'DRAFT').length, color: 'border-blue-500/40 bg-blue-950/20 text-blue-400' },
            { step: '3. Month Appraisal', count: requisitions.filter(r => r.status === 'PURCHASABLE' || r.planClassification !== 'UNCLASSIFIED').length, color: 'border-amber-500/40 bg-amber-950/20 text-amber-400' },
            { step: '4. EMS Approval', count: requisitions.filter(r => r.status === 'EMS_APPROVED' || r.status === 'INBOUND_TRACKING').length, color: 'border-purple-500/40 bg-purple-950/20 text-purple-400' },
            { step: '5. Vendor Confirm', count: requisitions.filter(r => !!r.vendorConfirmDate).length, color: 'border-indigo-500/40 bg-indigo-950/20 text-indigo-400' },
            { step: '6. ETA Arrival', count: requisitions.filter(r => !!r.etaDate).length, color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400' },
            { step: '7. Machine Issue', count: requisitions.filter(r => r.status === 'ISSUED').length, color: 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300' },
          ].map((item, idx) => (
            <div key={idx} className={`p-3 rounded-lg border flex flex-col justify-between ${item.color}`}>
              <div className="text-[11px] font-medium text-slate-300 truncate">{item.step}</div>
              <div className="text-xl font-bold font-mono mt-2">{item.count} <span className="text-xs font-normal text-slate-400">items</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* 2 & 3. Inventory Aging & 3-Axis SG Budget Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory KPIs & Aging */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              2. Inventory Aging Distribution & Beginning-of-Month Audit
            </h3>
            <Badge variant="warning">HW Warehouse H1-H3</Badge>
          </div>

          <div className="mb-4">
            <div className="text-xs text-slate-400">Total Factory HW On-Hand Inventory:</div>
            <div className="text-2xl font-bold text-white font-mono mt-0.5">$286,400 <span className="text-xs font-normal text-slate-400">USD</span></div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
              <div className="text-xs text-slate-400">&lt; 30 Days</div>
              <div className="text-base font-bold text-emerald-400 font-mono mt-1">$214,000</div>
              <div className="text-[10px] text-emerald-500 mt-0.5">74.7% (Healthy)</div>
            </div>
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40">
              <div className="text-xs text-slate-400">30 - 60 Days</div>
              <div className="text-base font-bold text-amber-400 font-mono mt-1">$54,200</div>
              <div className="text-[10px] text-amber-500 mt-0.5">18.9% (Watch)</div>
            </div>
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/40">
              <div className="text-xs text-slate-400">&gt; 60 Days</div>
              <div className="text-base font-bold text-rose-400 font-mono mt-1">$18,200</div>
              <div className="text-[10px] text-rose-500 mt-0.5">6.4% (Dead Stock)</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Engineer Aging Justifications: <strong className="text-emerald-400">14/16 Submitted</strong></span>
            <span>Cutoff Deadline: <strong className="text-amber-400 font-mono">{budget.justificationDeadline}</strong></span>
          </div>
        </div>

        {/* 3-Axis SG Budget Balance (Strict No-Rollover) */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              3. 3-Axis SG Budget Balance (Strict No-Rollover)
            </h3>
            <Badge variant="danger">Zero Surplus Carryover</Badge>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">1. Monthly Allocation Cap (LEC Input):</span>
                <span className="font-mono font-bold text-white">${budget.monthlyAllocationBudget.toLocaleString()} USD</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-600 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">2. PO Commit Spend (Purchasing Commitments):</span>
                <span className="font-mono font-bold text-amber-400">
                  ${budget.poCommitSpend.toLocaleString()} USD ({(budget.poCommitSpend / budget.monthlyAllocationBudget * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${Math.min(100, budget.poCommitSpend / budget.monthlyAllocationBudget * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">3. Actual Issue Expense (Auto-Synced from EMS ds_Inv):</span>
                <span className="font-mono font-bold text-emerald-400">
                  ${budget.emsIssueExpense.toLocaleString()} USD ({(budget.emsIssueExpense / budget.monthlyAllocationBudget * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${Math.min(100, budget.emsIssueExpense / budget.monthlyAllocationBudget * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Within Target Spend:</span>
              <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">${budget.withinTargetSpend.toLocaleString()} USD</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Unbudgeted Over Spend:</span>
              <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">${budget.unplannedOverSpend.toLocaleString()} USD</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Deep Over Analysis (6 Root-Cause Codes) */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            4. Deep Root-Cause Over Analysis (Total Over: ${budget.unplannedOverSpend.toLocaleString()} USD)
          </h3>
          <span className="text-xs text-slate-400">6 Standardized Over Diagnostic Codes</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { code: 'OVR-01', label: 'Sudden Breakdown', amount: 13500, count: 4 },
            { code: 'OVR-02', label: 'Volume Surge', amount: 5800, count: 2 },
            { code: 'OVR-03', label: 'Entity Transfer Lag', amount: 3900, count: 2 },
            { code: 'OVR-04', label: 'Model Setup D222', amount: 1800, count: 1 },
            { code: 'OVR-05', label: 'Vendor Price Hike', amount: 750, count: 1 },
            { code: 'OVR-06', label: 'Operation Damage', amount: 450, count: 1 },
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-rose-400 font-mono">{item.code}</span>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">{item.label}</div>
              </div>
              <div className="mt-2 text-sm font-bold text-slate-200 font-mono">${item.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Detailed Over Contribution Matrix */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            5. Detailed Over Contribution Matrix (Requisitions Marked OVER)
          </h3>
          <Badge variant="danger">{overRequisitions.length} Active Items</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="py-2.5 px-3">Req ID / QCode</th>
                <th className="py-2.5 px-3">Part Name & Model</th>
                <th className="py-2.5 px-3">Machine & Line</th>
                <th className="py-2.5 px-3">Qty & Unit Price</th>
                <th className="py-2.5 px-3">Over Amount</th>
                <th className="py-2.5 px-3">Over Code</th>
                <th className="py-2.5 px-3">Work Order</th>
                <th className="py-2.5 px-3">Requestor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {overRequisitions.map(item => (
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
                  <td className="py-3 px-3">
                    {item.quantity} {item.unit} @ ${item.estimatedUnitPrice}
                  </td>
                  <td className="py-3 px-3 font-bold text-rose-400">
                    ${(item.quantity * item.estimatedUnitPrice).toLocaleString()} USD
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="danger">{item.overReasonCode || 'OVR-01'}</Badge>
                  </td>
                  <td className="py-3 px-3 text-cyan-400 underline">
                    {item.workOrderNo || 'WO-248926091'}
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-400">
                    {item.requestorName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
