import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  UserRole, 
  RequisitionItem, 
  PersistentTask, 
  ClarificationInquiry, 
  EbomMechanism, 
  SgBudgetSummary,
  PlanClassification,
  OverReasonCode
} from '../types';
import { 
  initialRequisitions, 
  initialTasks, 
  initialClarifications, 
  initialEbomMechanisms, 
  initialBudget 
} from '../mock/initialData';

interface ProcurementContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  requisitions: RequisitionItem[];
  tasks: PersistentTask[];
  clarifications: ClarificationInquiry[];
  ebomMechanisms: EbomMechanism[];
  budget: SgBudgetSummary;
  
  // Actions
  addRequisition: (item: Omit<RequisitionItem, 'id' | 'createdAt'>) => void;
  classifyTargetOver: (id: string, plan: PlanClassification, overReason?: OverReasonCode, workOrderNo?: string) => void;
  reclassifyEol: (id: string) => void;
  updateMilestones: (id: string, vendorConfirmDate: string, etaDate: string, monthlyAllocations: { month: string; qty: number; amount: number }[]) => void;
  
  // Task operations
  simulateEmsStockClearance: (qCode: string) => void; // Simulates EMS returning 'N' to auto-resolve cross-team task
  submitAgingJustification: (taskId: string, justification: string) => void;
  
  // 3-Party Clarification
  createClarificationInquiry: (requisitionId: string, question: string) => void;
  forwardInquiryToEngineer: (inquiryId: string, lecNote: string) => void;
  submitEngineerResponse: (inquiryId: string, response: string) => void;
  closeClarificationInquiry: (inquiryId: string) => void;
  
  // EBOM
  bindPartToSlot: (mechanismId: string, partCode: string, partName: string, maker: string, model: string, stdQty: number) => void;
  resolveLateDeclaration: (requisitionId: string, mechanismId: string) => void;
  
  // Budget & Deadlines
  updateBudgetCap: (newBudget: number) => void;
  updateDeadlines: (justificationDeadline: string, auditLockDeadline: string) => void;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('COMMON');
  const [requisitions, setRequisitions] = useState<RequisitionItem[]>(initialRequisitions);
  const [tasks, setTasks] = useState<PersistentTask[]>(initialTasks);
  const [clarifications, setClarifications] = useState<ClarificationInquiry[]>(initialClarifications);
  const [ebomMechanisms, setEbomMechanisms] = useState<EbomMechanism[]>(initialEbomMechanisms);
  const [budget, setBudget] = useState<SgBudgetSummary>(initialBudget);

  const addRequisition = (item: Omit<RequisitionItem, 'id' | 'createdAt'>) => {
    const id = `PR-2611-${String(requisitions.length + 81).padStart(4, '0')}`;
    const newItem: RequisitionItem = {
      ...item,
      id,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setRequisitions(prev => [newItem, ...prev]);

    // If agingInterlockFlag is 'Y', automatically instantiate a persistent required task
    if (newItem.agingInterlockFlag === 'Y') {
      const newTask: PersistentTask = {
        id: `TASK-INTER-STOCK-${newItem.qCode}-${Date.now().toString().slice(-4)}`,
        type: 'INTER_TEAM_BORROW',
        title: `Idle Stock Warning: Borrow ${newItem.qCode} from ${newItem.peerTeamOwner || 'Peer Team'}`,
        qCode: newItem.qCode,
        partName: newItem.partName,
        engineerName: newItem.requestorName,
        deadline: budget.justificationDeadline,
        status: 'ACTIVE',
        details: `Available in HW warehouse under ${newItem.peerTeamOwner || 'Peer Team'}. Persistent task cannot be closed manually until EMS status sync confirms 'N'.`,
        emsAutoResolvable: true
      };
      setTasks(prev => [newTask, ...prev]);
    }

    if (newItem.ebomPendingMapping) {
      const newEbomTask: PersistentTask = {
        id: `TASK-EBOM-${newItem.id}`,
        type: 'EBOM_LATE_DECLARATION',
        title: `Late Declaration: Map ${newItem.qCode} to ${newItem.machineFriendlyName}`,
        qCode: newItem.qCode,
        partName: newItem.partName,
        engineerName: newItem.requestorName,
        deadline: '2026-11-12',
        status: 'ACTIVE',
        details: `Requisition created without EBOM slot. Please map into machine assembly tree within 7 days.`,
        emsAutoResolvable: false
      };
      setTasks(prev => [newEbomTask, ...prev]);
    }
  };

  const classifyTargetOver = (id: string, plan: PlanClassification, overReason?: OverReasonCode, workOrderNo?: string) => {
    setRequisitions(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          planClassification: plan,
          overReasonCode: overReason,
          workOrderNo: workOrderNo || item.workOrderNo
        };
      }
      return item;
    }));
  };

  const reclassifyEol = (id: string) => {
    setRequisitions(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: 'EOL' };
      }
      return item;
    }));
  };

  const updateMilestones = (
    id: string, 
    vendorConfirmDate: string, 
    etaDate: string, 
    monthlyAllocations: { month: string; qty: number; amount: number }[]
  ) => {
    setRequisitions(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          vendorConfirmDate,
          etaDate,
          monthlyAllocations,
          status: 'INBOUND_TRACKING'
        };
      }
      return item;
    }));
  };

  // Simulates EMS background sync setting agingInterlockFlag to 'N', auto-resolving the persistent task!
  const simulateEmsStockClearance = (qCode: string) => {
    setRequisitions(prev => prev.map(item => {
      if (item.qCode === qCode) {
        return {
          ...item,
          agingInterlockFlag: 'N',
          status: item.status === 'CROSS_TEAM_STOCK' ? 'PURCHASABLE' : item.status
        };
      }
      return item;
    }));

    setTasks(prev => prev.map(task => {
      if (task.qCode === qCode && task.type === 'INTER_TEAM_BORROW') {
        return {
          ...task,
          status: 'RESOLVED',
          details: `${task.details} [EMS SYNC SUCCESS: Stock issuance completed on EMS, flag updated to 'N']`
        };
      }
      return task;
    }));
  };

  const submitAgingJustification = (taskId: string, justification: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: 'RESOLVED',
          details: `${task.details} (Justification submitted: ${justification})`
        };
      }
      return task;
    }));
  };

  const createClarificationInquiry = (requisitionId: string, question: string) => {
    const target = requisitions.find(r => r.id === requisitionId);
    if (!target) return;

    const newInquiry: ClarificationInquiry = {
      id: `INQ-2611-${String(clarifications.length + 1).padStart(3, '0')}`,
      requisitionId,
      qCode: target.qCode,
      partName: `${target.partName} (${target.maker} - $${target.estimatedUnitPrice})`,
      reviewerQuestion: question,
      status: 'PENDING_LEC',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setClarifications(prev => [newInquiry, ...prev]);
  };

  const forwardInquiryToEngineer = (inquiryId: string, lecNote: string) => {
    setClarifications(prev => prev.map(inq => {
      if (inq.id === inquiryId) {
        return {
          ...inq,
          lecNote,
          status: 'PENDING_ENGINEER',
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      }
      return inq;
    }));
  };

  const submitEngineerResponse = (inquiryId: string, response: string) => {
    setClarifications(prev => prev.map(inq => {
      if (inq.id === inquiryId) {
        return {
          ...inq,
          engineerResponse: response,
          status: 'ENGINEER_REPLIED',
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      }
      return inq;
    }));
  };

  const closeClarificationInquiry = (inquiryId: string) => {
    setClarifications(prev => prev.map(inq => {
      if (inq.id === inquiryId) {
        return {
          ...inq,
          status: 'RESOLVED',
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      }
      return inq;
    }));
  };

  const bindPartToSlot = (
    mechanismId: string, 
    partCode: string, 
    partName: string, 
    maker: string, 
    model: string, 
    stdQty: number
  ) => {
    setEbomMechanisms(prev => prev.map(mech => {
      if (mech.mechanismId === mechanismId) {
        return {
          ...mech,
          boundParts: [
            ...mech.boundParts,
            {
              partCode,
              partName,
              maker,
              model,
              stdQty,
              unit: 'EA',
              replacementLifespan: '25,000h'
            }
          ]
        };
      }
      return mech;
    }));
  };

  const resolveLateDeclaration = (requisitionId: string, mechanismId: string) => {
    setRequisitions(prev => prev.map(r => {
      if (r.id === requisitionId) {
        return {
          ...r,
          ebomPendingMapping: false
        };
      }
      return r;
    }));

    setTasks(prev => prev.map(t => {
      if (t.id === `TASK-EBOM-${requisitionId}`) {
        return { ...t, status: 'RESOLVED' };
      }
      return t;
    }));
  };

  const updateBudgetCap = (newBudget: number) => {
    setBudget(prev => ({ ...prev, monthlyAllocationBudget: newBudget }));
  };

  const updateDeadlines = (justificationDeadline: string, auditLockDeadline: string) => {
    setBudget(prev => ({
      ...prev,
      justificationDeadline,
      auditLockDeadline
    }));
  };

  return (
    <ProcurementContext.Provider value={{
      currentRole,
      setCurrentRole,
      requisitions,
      tasks,
      clarifications,
      ebomMechanisms,
      budget,
      addRequisition,
      classifyTargetOver,
      reclassifyEol,
      updateMilestones,
      simulateEmsStockClearance,
      submitAgingJustification,
      createClarificationInquiry,
      forwardInquiryToEngineer,
      submitEngineerResponse,
      closeClarificationInquiry,
      bindPartToSlot,
      resolveLateDeclaration,
      updateBudgetCap,
      updateDeadlines
    }}>
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = () => {
  const context = useContext(ProcurementContext);
  if (!context) {
    throw new Error('useProcurement must be used within a ProcurementProvider');
  }
  return context;
};

