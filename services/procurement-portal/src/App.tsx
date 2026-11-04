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

const MainContent: React.FC = () => {
  const { currentRole } = useProcurement();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {currentRole === 'COMMON' && <UniversalDashboardView />}
      {currentRole === 'REQUESTOR' && <RequestorPortalView />}
      {currentRole === 'LEADER' && <LeaderDashboardView />}
      {currentRole === 'LEC' && <LecWorkbenchView />}
      {currentRole === 'COST_MGMT' && <CostManagementPortalView />}
      {currentRole === 'EBOM' && <EbomExplorerView />}
      {currentRole === 'ADMIN' && <AdminSettingsView />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <ProcurementProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
        <Header />
        <div className="flex-1">
          <MainContent />
        </div>
        <footer className="py-4 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500">
          LG Display Factory HW — Spare Parts Procurement Portal & Operations Intelligence &bull; Parallel with Nexacro EMS
        </footer>
      </div>
    </ProcurementProvider>
  );
};

export default App;
