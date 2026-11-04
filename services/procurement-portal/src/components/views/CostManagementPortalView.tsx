import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { 
  ShieldCheck, 
  HelpCircle, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Send,
  FileCheck2,
  DollarSign,
  Scale
} from 'lucide-react';

export const CostManagementPortalView: React.FC = () => {
  const { requisitions, budget, createClarificationInquiry } = useProcurement();

  const [inquiryModalItem, setInquiryModalItem] = useState<any | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [clearanceIssued, setClearanceIssued] = useState(false);
  const [excelExportNotice, setExcelExportNotice] = useState(false);

  const overItems = requisitions.filter(r => r.planClassification === 'OVER');
  const targetItems = requisitions.filter(r => r.planClassification === 'TARGET');

  const handleSendInquiry = () => {
    if (!inquiryModalItem || !questionInput) return;
    createClarificationInquiry(inquiryModalItem.id, questionInput);
    setQuestionInput('');
    setInquiryModalItem(null);
  };

  const handleSimulateExcelExport = () => {
    setExcelExportNotice(true);
    setTimeout(() => setExcelExportNotice(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">UI-ROLE-06: Cost Management Audit & Appraisal Portal</h2>
            <Badge variant="purple">Reviewer & Assistant is 1 Single Person</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cost Controller / Reviewer: Beginning-of-Month Cost Appraisal (Days 01–05), Inventory Aging Review & 3-Party Clarification Dispatch.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSimulateExcelExport}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Export Fixed-Template Excel (4 Sheets)
          </button>
          <button
            onClick={() => setClearanceIssued(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Issue Cost Clearance
          </button>
        </div>
      </div>

      {excelExportNotice && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          Generated `COST_AUDIT_202611_HW.xlsx` containing Sheet 1 (Aging Variance), Sheet 2 (No-Rollover SG Budget), Sheet 3 (Over List), and Sheet 4 (Interlock Savings).
        </div>
      )}

      {clearanceIssued && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-xs space-y-2">
          <div className="font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            COST CLEARANCE ISSUED FOR NOVEMBER 2026 AUDIT CYCLE
          </div>
          <p className="text-emerald-200/90">
            Dossier verified and cost clearance slip generated. LEC is now authorized to create formal PRV/PO numbers on EMS. Official approval will take place solely on the EMS Nexacro interface.
          </p>
        </div>
      )}

      {/* 4-Sheet Fixed Template KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400">Sheet 1: Aging Variance</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">14/16 Verified</div>
          <div className="text-[11px] text-slate-500 mt-0.5">&gt;30d on-hand justified</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400">Sheet 2: SG Budget (No Rollover)</div>
          <div className="text-lg font-bold font-mono text-white mt-1">${budget.monthlyAllocationBudget.toLocaleString()}</div>
          <div className="text-[11px] text-amber-400 mt-0.5">Zero rollover from Oct</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400">Sheet 3: Over Items</div>
          <div className="text-lg font-bold font-mono text-rose-400 mt-1">{overItems.length} Lines</div>
          <div className="text-[11px] text-rose-400/80 mt-0.5">${budget.unplannedOverSpend.toLocaleString()} USD total</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400">Sheet 4: Interlock Savings</div>
          <div className="text-lg font-bold font-mono text-cyan-400 mt-1">$1,320 USD</div>
          <div className="text-[11px] text-cyan-400/80 mt-0.5">Cross-team stock reuse</div>
        </div>
      </div>

      {/* Unplanned Over Review Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Scale className="w-4 h-4 text-rose-400" />
            Unplanned Over Line Item Scrutiny (Reviewer Approval Prep)
          </h3>
          <span className="text-xs text-slate-400 font-mono">100% of Over items require technical justification</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-medium">
                <th className="py-2.5 px-3">Req ID / QCode</th>
                <th className="py-2.5 px-3">Part Name & Specs</th>
                <th className="py-2.5 px-3">Machine & Line</th>
                <th className="py-2.5 px-3">Over Amount</th>
                <th className="py-2.5 px-3">Over Code & Reason</th>
                <th className="py-2.5 px-3">Work Order</th>
                <th className="py-2.5 px-3 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {overItems.map(item => (
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
                  <td className="py-3 px-3 font-bold text-rose-400">
                    ${(item.quantity * item.estimatedUnitPrice).toLocaleString()} USD
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="danger">{item.overReasonCode || 'OVR-01'}</Badge>
                  </td>
                  <td className="py-3 px-3 text-cyan-400 underline">
                    {item.workOrderNo || 'WO-248926091'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setInquiryModalItem(item)}
                      className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 rounded text-[11px] font-sans flex items-center gap-1 ml-auto"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Request Clarification
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Modal */}
      {inquiryModalItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Request Clarification to LEC: {inquiryModalItem.id} ({inquiryModalItem.qCode})
              </h4>
              <button 
                onClick={() => setInquiryModalItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-slate-300">
                Type the specific technical questions or documentation requirements. Per Principle 8, this inquiry will be sent to the <strong>LEC</strong>, who will coordinate with the responsible engineer to provide evidence.
              </p>

              <textarea
                placeholder="e.g. Please provide night-shift breakdown incident report, C14 capacitor burn photo, and justify why peer team spare parts could not be used..."
                value={questionInput}
                onChange={e => setQuestionInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-rose-500 text-xs"
                rows={4}
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setInquiryModalItem(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInquiry}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Inquiry to LEC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
