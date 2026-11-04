import React, { useState } from 'react';
import { ProcurementProvider, useProcurement } from './context/ProcurementContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { UniversalDashboardView } from './components/views/UniversalDashboardView';
import { RequestorPortalView } from './components/views/RequestorPortalView';
import { LeaderDashboardView } from './components/views/LeaderDashboardView';
import { LecWorkbenchView } from './components/views/LecWorkbenchView';
import { WarehousePortalView } from './components/views/WarehousePortalView';
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
    case 'WAREHOUSE':
      return <WarehousePortalView />;
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

const AppShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* 1. Collapsible Enterprise Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />

      {/* 2. Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'pl-20' : 'pl-72'
        }`}
      >
        {/* Topbar with breadcrumb, search, notifications and theme toggle */}
        <Topbar 
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Dynamic Page Body */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1700px] w-full mx-auto animate-fadeIn">
          <MainViewContent />
        </main>

        {/* Enterprise Industrial Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur px-6 py-4 text-xs text-slate-500 dark:text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">LG Display Factory HW</span>
            <span>—</span>
            <span>Display Module Plant 1 (Smart Watch Division | Org ID: 28753)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              EMS REST Gateway Sync Active
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>10 Core Rules Enforced</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono font-medium">No-Rollover SG Budget</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <ProcurementProvider>
        <AppShell />
      </ProcurementProvider>
    </ThemeProvider>
  );
}

export default App;
