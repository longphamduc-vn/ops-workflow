import React from 'react';
import { ProcurementProvider, useProcurement } from './context/ProcurementContext';
import { Header } from './components/Header';
import { UniversalDashboardView } from './components/views/UniversalDashboardView';
import { RequestorPortalView } from './components/views/RequestorPortalView';
import { LeaderDashboardView } from './components/views/LeaderDashboardView';
import { LecWorkbenchView } from './components/views/LecWorkbenchView';
import { CostManagementPortalView } from './components/views/CostManagementPortalView';
import { EbomExplorerView } from './components/views/EbomExplorerView';
import { AdminSettingsView } from './components/views/AdminSettingsView';

const MainViewContent: React.FC = () => {
  const { currentRole } = useProcurement();

  switch (currentRole) {
    case 'COMMON':
      return <UniversalDashboardView />;
    case 'REQUESTOR':
      return <RequestorPortalView />;
    case 'LEADER':
      return <LeaderDashboardView />;
    case 'LEC':
      return <LecWorkbenchView />;
    case 'COST_MGMT':
      return <CostManagementPortalView />;
    case 'EBOM':
      return <EbomExplorerView />;
    case 'ADMIN':
      return <AdminSettingsView />;
    default:
      return <UniversalDashboardView />;
  }
};

export function App() {
  return (
    <ProcurementProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
        <Header />
        
        <main className="flex-1 w-full max-w-[1700px] mx-auto p-4 md:p-6 lg:p-8">
          <MainViewContent />
        </main>

        <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">LG Display Factory HW</span>
            <span>—</span>
            <span>Display Module Plant 1 (Smart Watch Division | Org ID: 28753)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              EMS REST Gateway Sync Active
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">10 Core Operational Rules Enforced</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">SG Budget: Strict Monthly Allocation</span>
          </div>
        </footer>
      </div>
    </ProcurementProvider>
  );
}

export default App;

