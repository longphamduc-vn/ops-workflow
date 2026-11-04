import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Badge } from '../common/Badge';
import { 
  Settings, 
  Calculator, 
  Factory, 
  Users, 
  DollarSign, 
  Server, 
  BookOpen, 
  CheckCircle2,
  Lock,
  Radio
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { budget, updateBudgetCap } = useProcurement();

  const [activeTab, setActiveTab] = useState<'LOGIC' | 'PLANT' | 'ROLES' | 'BUDGET' | 'GATEWAY' | 'DICTIONARIES'>('BUDGET');
  const [budgetCapInput, setBudgetCapInput] = useState(budget.monthlyAllocationBudget);
  const [saveNotice, setSaveNotice] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    updateBudgetCap(budgetCapInput);
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 3000);
  };

  const handleSimulatePing = () => {
    setPingSuccess(true);
    setTimeout(() => setPingSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">UI-ROLE-05: System Administration & Governance Console</h2>
            <Badge variant="purple">Parametric Multi-Tenant Engine</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Master Data Configuration: Production Topology, Reorder Logic, No-Rollover SG Budgeting, and EMS Nexacro Gateway.
          </p>
        </div>

        {/* 6 Tabs */}
        <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto">
          {[
            { id: 'LOGIC', label: '1. Reorder Logic', icon: <Calculator className="w-3.5 h-3.5" /> },
            { id: 'PLANT', label: '2. Plant Topology', icon: <Factory className="w-3.5 h-3.5" /> },
            { id: 'ROLES', label: '3. Roles & RBAC', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'BUDGET', label: '4. SG Budget & Policy', icon: <DollarSign className="w-3.5 h-3.5" /> },
            { id: 'GATEWAY', label: '5. EMS Gateway', icon: <Server className="w-3.5 h-3.5" /> },
            { id: 'DICTIONARIES', label: '6. Over Dictionaries', icon: <BookOpen className="w-3.5 h-3.5" /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === t.id ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {saveNotice && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Settings updated and synchronized across all active roles!
        </div>
      )}

      {/* TAB 4: SG BUDGET & STRICT NO-ROLLOVER POLICY */}
      {activeTab === 'BUDGET' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg max-w-2xl mx-auto space-y-6 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Monthly SG Budget Allocation & Strict No-Rollover Policy</h3>
              <p className="text-slate-400 mt-0.5">Enforces independent calendar month budget boundaries without carryover.</p>
            </div>
            <Badge variant="danger">Principle 10 Enforced</Badge>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-slate-300 font-semibold">Strict No-Rollover Mathematical Constraint:</span>
            <div className="font-mono text-cyan-400 text-sm font-bold">
              {"Budget(M) = NewMonthlyAllocation(M) [Surplus(M-1) = 0]"}
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Surplus unspent at the end of October is automatically retired. November budget begins strictly with the fresh allocation entered below, preventing unchecked accumulation of purchasing commitments.
            </p>
          </div>

          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div>
              <label className="block text-slate-400 mb-1">November 2026 Monthly SG Budget Cap (USD):</label>
              <input 
                type="number"
                step="1000"
                value={budgetCapInput}
                onChange={e => setBudgetCapInput(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-rose-500 font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 font-bold text-white rounded-lg shadow-lg transition-all"
            >
              Update Team SG Budget Cap
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: PLANT TOPOLOGY */}
      {activeTab === 'PLANT' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white">Factory HW (Display Module Plant 1) Line Configuration</h3>
          <p className="text-slate-400">
            Automated Floor Mapping rule: <code className="text-cyan-400 font-mono bg-slate-950 px-2 py-0.5 rounded">Left(Line, 1) = Floor</code>. Strictly no process/stage hierarchy.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            {[
              { line: 'Line #201', floor: '2F', machines: 'DB-01, DB-02, EC-01', desc: 'Smart Watch Line 1' },
              { line: 'Line #202', floor: '2F', machines: 'TAB-01, TAB-02', desc: 'Smart Watch Line 2' },
              { line: 'Line #203', floor: '2F', machines: 'POL-01, POL-02', desc: 'Smart Watch Line 3' },
              { line: 'Line #601', floor: '6F', machines: 'MOD-01, MOD-02', desc: 'High-Density Module' },
            ].map((l, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-white font-bold">{l.line}</div>
                <div className="text-cyan-400 text-[11px]">Floor: {l.floor}</div>
                <div className="text-slate-400 text-[10px] mt-1 font-sans">{l.machines}</div>
                <div className="text-slate-500 text-[10px] mt-0.5 font-sans">{l.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ROLES & RBAC */}
      {activeTab === 'ROLES' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">5-Role RBAC Model (Warehouse Role Eliminated)</h3>
            <Badge variant="warning">No Warehouse Portal</Badge>
          </div>

          <div className="space-y-2">
            {[
              { role: 'Requestor', scope: 'Field Engineers (Peers)', perm: 'Direct machine access, CAD folder upload, persistent task tracking' },
              { role: 'Leader', scope: 'Team & Part Leaders', perm: 'Hierarchical progress monitoring by Team => Part. No in-app approvals.' },
              { role: 'LEC', scope: 'Line Equipment Coordinator (Pham Duc Long)', perm: 'Manual Target/Over classification, Interlocks, Milestone delivery logging, 3-party bridge' },
              { role: 'Cost Management', scope: 'Reviewer & Assistant (1 Person)', perm: 'Beginning-of-Month Cost Audit, Inquiry creation to LEC, Cost clearance slip' },
              { role: 'Admin', scope: 'System Administrator', perm: 'Global configuration, master dictionaries, rate limits' },
            ].map((r, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">{r.role}</span>
                  <span className="text-slate-400 ml-2 font-mono">({r.scope})</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">{r.perm}</div>
                </div>
                <Badge variant="info">Active</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EMS GATEWAY */}
      {activeTab === 'GATEWAY' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg max-w-xl mx-auto space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Core EMS Nexacro Gateway Rate Limiting</h3>
            <Badge variant="success">Gateway Online</Badge>
          </div>

          <div className="space-y-3 font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">EMS Server URL:</span>
              <span className="text-cyan-400">http://ems.lgdisplay.com:9000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">max_concurrent:</span>
              <span className="text-white">3 calls</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">min_interval:</span>
              <span className="text-white">100 ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Session User:</span>
              <span className="text-emerald-400">658359 (Pham Duc Long)</span>
            </div>
          </div>

          {pingSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Gateway Ping Successful! Round-trip latency: 24ms.
            </div>
          )}

          <button
            onClick={handleSimulatePing}
            className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 rounded-lg border border-slate-700 text-xs transition-all flex items-center justify-center gap-2"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Test Connection Instantly (PING EMS)
          </button>
        </div>
      )}

      {/* TAB 6: OVER DICTIONARIES */}
      {activeTab === 'DICTIONARIES' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white">Standard 6 Over Cause Codes (OVR-01 to OVR-06)</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { code: 'OVR-01', name: 'Sudden Breakdown / Line Stop', desc: 'Requires night-shift electrical/mechanical breakdown Work Order' },
              { code: 'OVR-02', name: 'Production Volume Surge', desc: 'Smart Watch volume increase above monthly baseline' },
              { code: 'OVR-03', name: 'Inter-Entity Transfer Delay', desc: 'Cross-entity site failed to deliver within 48h SLA' },
              { code: 'OVR-04', name: 'New Model Setup', desc: 'Conversion from D111 to D222 product model' },
              { code: 'OVR-05', name: 'Supplier Price Increase', desc: 'Commercial RFQ price adjustment by Purchasing' },
              { code: 'OVR-06', name: 'Installation Damage', desc: 'Accidental operational damage during assembly' },
            ].map((c, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-rose-400 font-mono">{c.code}</span>
                <div className="font-medium text-slate-200 mt-0.5">{c.name}</div>
                <div className="text-[11px] text-slate-400 mt-1">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: REORDER LOGIC */}
      {activeTab === 'LOGIC' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white">Reorder Formulation by Demand Type</h3>
          
          <div className="space-y-3 font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold">SETUP / MODEL CONVERSION:</span>
              <div className="text-slate-300 mt-1">OrderQty = TargetConversionCount * CavityMultiplier - OnHandInventory</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold">PM / PREVENTIVE MAINTENANCE:</span>
              <div className="text-slate-300 mt-1">OrderQty = (MonthlyPlannedCycles / MTBF_Cycles) * AssemblySlotCount - SafetyStock</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold">BREAKDOWN / REPAIR:</span>
              <div className="text-slate-300 mt-1">OrderQty = ActualFailedQty (Immediate requisition linked to Work Order)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
