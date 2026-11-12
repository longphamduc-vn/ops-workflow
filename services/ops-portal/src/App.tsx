import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, PortalTab } from './components/layout/Sidebar';
import { DashboardView } from './views/DashboardView';
import { RunInspectorView } from './views/RunInspectorView';
import { RunsExplorerView } from './views/RunsExplorerView';
import { WorkflowCatalogView } from './views/WorkflowCatalogView';
import { ConnectorsView } from './views/ConnectorsView';
import { TriggerRunModal } from './components/modals/TriggerRunModal';
import { ReplayModal } from './components/modals/ReplayModal';
import { opsClient } from './api/client';
import { WorkflowSummary, RunRecord, StepRunRecord } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<PortalTab>('dashboard');
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [currentRun, setCurrentRun] = useState<RunRecord | null>(null);
  const [currentSteps, setCurrentSteps] = useState<StepRunRecord[]>([]);
  const [currentLogs, setCurrentLogs] = useState<string>('');
  const [serverOnline, setServerOnline] = useState<boolean>(true);

  // Modals state
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState<boolean>(false);
  const [isReplayModalOpen, setIsReplayModalOpen] = useState<boolean>(false);
  const [triggerWorkflowDefault, setTriggerWorkflowDefault] = useState<string>('');

  // Initial Data Fetching
  const loadData = async () => {
    try {
      const health = await opsClient.getHealth();
      setServerOnline(health.status === 'ok');

      const wfList = await opsClient.listWorkflows();
      setWorkflows(wfList);

      const runList = await opsClient.listRuns();
      setRuns(runList.items);

      const activeId = selectedRunId || runList.items[0]?.run_id || '';
      if (activeId) {
        if (!selectedRunId) {
          setSelectedRunId(activeId);
        }
        const runDetail = await opsClient.getRun(activeId);
        setCurrentRun(runDetail);

        const steps = await opsClient.getRunSteps(activeId);
        setCurrentSteps(steps);

        const logs = await opsClient.getRunLogs(activeId);
        setCurrentLogs(logs);
      }
    } catch (err) {
      console.error('Error fetching opsflow data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [selectedRunId]);

  const handleSelectRun = async (runId: string) => {
    setSelectedRunId(runId);
    const detail = await opsClient.getRun(runId);
    setCurrentRun(detail);
    const steps = await opsClient.getRunSteps(runId);
    setCurrentSteps(steps);
    const logs = await opsClient.getRunLogs(runId);
    setCurrentLogs(logs);
  };

  const handleTriggerFromCatalog = (workflowName: string) => {
    setTriggerWorkflowDefault(workflowName);
    setIsTriggerModalOpen(true);
  };

  const handleRunStarted = (newRunId: string) => {
    loadData();
    handleSelectRun(newRunId);
    setCurrentTab('inspector');
  };

  const handleReplaySuccess = (targetRunId: string) => {
    loadData();
    handleSelectRun(targetRunId);
    setCurrentTab('inspector');
  };

  const handleClearLogs = async (targetRunId?: string) => {
    const idToClear = targetRunId || selectedRunId;
    if (idToClear) {
      await opsClient.deleteRunLogs(idToClear);
      if (idToClear === selectedRunId) {
        setCurrentLogs('');
      }
    }
  };

  const handleDeleteRun = async (runId: string) => {
    await opsClient.deleteRun(runId);
    if (runId === selectedRunId) {
      setSelectedRunId('');
      setCurrentRun(null);
      setCurrentSteps([]);
      setCurrentLogs('');
    }
    await loadData();
  };

  const handleDeleteAllRuns = async () => {
    await opsClient.deleteAllRuns();
    setSelectedRunId('');
    setCurrentRun(null);
    setCurrentSteps([]);
    setCurrentLogs('');
    await loadData();
  };

  const failedRunsCount = runs.filter((r) => r.status === 'failed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* 1. Top Navigation Header */}
      <Header
        onOpenTrigger={() => {
          setTriggerWorkflowDefault(workflows[0]?.name || '');
          setIsTriggerModalOpen(true);
        }}
        onOpenReplay={() => setIsReplayModalOpen(true)}
        serverOnline={serverOnline}
      />

      {/* 2. Main Portal Shell: Sidebar + Dynamic Body View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          failedCount={failedRunsCount}
        />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-950">
          {currentTab === 'dashboard' && (
            <DashboardView
              runs={runs}
              workflows={workflows}
              onSelectRun={handleSelectRun}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'inspector' && currentRun && (
            <RunInspectorView
              run={currentRun}
              runs={runs}
              onSelectRun={handleSelectRun}
              steps={currentSteps}
              logs={currentLogs}
              onOpenReplay={() => setIsReplayModalOpen(true)}
              onClearLogs={handleClearLogs}
            />
          )}

          {currentTab === 'runs' && (
            <RunsExplorerView
              runs={runs}
              onSelectRun={handleSelectRun}
              onOpenReplayForRun={(id) => {
                setSelectedRunId(id);
                setIsReplayModalOpen(true);
              }}
              onNavigateInspector={() => setCurrentTab('inspector')}
              onClearRunLogs={handleClearLogs}
              onDeleteRun={handleDeleteRun}
              onDeleteAllRuns={handleDeleteAllRuns}
            />
          )}

          {currentTab === 'workflows' && (
            <WorkflowCatalogView
              workflows={workflows}
              onTriggerWorkflow={handleTriggerFromCatalog}
            />
          )}

          {currentTab === 'connectors' && <ConnectorsView />}
        </main>
      </div>

      {/* Trigger Modal */}
      <TriggerRunModal
        isOpen={isTriggerModalOpen}
        onClose={() => setIsTriggerModalOpen(false)}
        workflows={workflows}
        defaultWorkflowName={triggerWorkflowDefault}
        onRunStarted={handleRunStarted}
      />

      {/* Replay Modal */}
      {currentRun && (
        <ReplayModal
          isOpen={isReplayModalOpen}
          onClose={() => setIsReplayModalOpen(false)}
          runId={currentRun.run_id}
          workflowName={currentRun.workflow_name}
          onReplaySuccess={handleReplaySuccess}
        />
      )}
    </div>
  );
};

