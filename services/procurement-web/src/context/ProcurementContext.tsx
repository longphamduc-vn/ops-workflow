import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  UserRole, 
  RequisitionItem, 
  PersistentTask, 
  ClarificationInquiry, 
  EbomMechanism, 
  SgBudgetSummary,
  PlanClassification,
  OverReasonCode,
  RequisitionStatus,
  QCodeSubmission,
  AgingJustificationRecord,
  CostClearanceRecord
} from '../types';
import { 
  initialRequisitions, 
  initialTasks, 
  initialClarifications, 
  initialQCodeSubmissions,
  initialAgingJustifications,
  initialEbomMechanisms, 
  initialBudget,
  initialCostClearance
} from '../mock/initialData';

export interface LecProfile {
  id: string;
  name: string;
  empNo: string;
  phone: string;
  team: string;
}

export const availableLecs: LecProfile[] = [
  { id: 'LEC-01', name: 'Phạm Đức Long', empNo: '658359', phone: '0988.123.456', team: 'PO Module Tech Team 2' },
  { id: 'LEC-02', name: 'Nguyễn Đình Hoàng', empNo: '649102', phone: '0977.654.321', team: 'PO Module Tech Team 2' },
  { id: 'LEC-03', name: 'Vũ Quốc Trung', empNo: '651280', phone: '0912.888.999', team: 'PO Module Tech Team 2' }
];

interface ProcurementContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeLec: LecProfile;
  setActiveLec: (lec: LecProfile) => void;
  
  requisitions: RequisitionItem[];
  tasks: PersistentTask[];
  clarifications: ClarificationInquiry[];
  qcodeSubmissions: QCodeSubmission[];
  agingJustifications: AgingJustificationRecord[];
  ebomMechanisms: EbomMechanism[];
  budget: SgBudgetSummary;
  costClearance: CostClearanceRecord;
  
  // Requisition actions
  addRequisition: (item: Omit<RequisitionItem, 'id' | 'createdAt'>) => void;
  batchUpdateRequisitionStatus: (ids: string[], newStatus: RequisitionStatus) => void;
  classifyTargetOver: (id: string, plan: PlanClassification, overReason?: OverReasonCode, workOrderNo?: string) => void;
  reclassifyEol: (id: string) => void;
  updateMilestones: (id: string, vendorConfirmDate: string, etaDate: string, monthlyAllocations: { month: string; qty: number; amount: number }[]) => void;
  syncEmsPrvPo: (id: string, prvNo: string, poNo: string) => void;
  
  // Task operations
  simulateEmsStockClearance: (qCode: string) => void;
  submitAgingJustification: (taskId: string, justification: string, plan: string, targetDate: string) => void;
  acceptInterTeamBorrow: (taskId: string) => void;
  
  // 3-Party Clarification
  createClarificationInquiry: (requisitionId: string, qCode: string, partName: string, question: string, costImpactUsd?: number) => void;
  forwardInquiryToEngineer: (inquiryId: string, lecNote: string) => void;
  submitEngineerResponse: (inquiryId: string, response: string) => void;
  resolveClarificationInquiry: (inquiryId: string) => void;
  
  // QCode Folder Onboarding
  submitQCodeFolder: (submission: Omit<QCodeSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  registerOfficialQCode: (submissionId: string, officialQCode: string) => void;
  
  // EBOM
  bindPartToSlot: (mechanismId: string, partCode: string, partName: string, maker: string, model: string, stdQty: number, replacementLifespan?: string) => void;
  resolveLateDeclaration: (requisitionId: string, mechanismId: string) => void;
  
  // Budget & Deadlines & Clearance
  updateBudgetCap: (newBudget: number) => void;
  updateDeadlines: (justificationDeadline: string, auditLockDeadline: string) => void;
  issueCostClearance: (auditorName: string) => void;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('COMMON');
  const [activeLec, setActiveLec] = useState<LecProfile>(availableLecs[0]);
  
  const [requisitions, setRequisitions] = useState<RequisitionItem[]>(initialRequisitions);
  const [tasks, setTasks] = useState<PersistentTask[]>(initialTasks);
  const [clarifications, setClarifications] = useState<ClarificationInquiry[]>(initialClarifications);
  const [qcodeSubmissions, setQcodeSubmissions] = useState<QCodeSubmission[]>(initialQCodeSubmissions);
  const [agingJustifications, setAgingJustifications] = useState<AgingJustificationRecord[]>(initialAgingJustifications);
  const [ebomMechanisms, setEbomMechanisms] = useState<EbomMechanism[]>(initialEbomMechanisms);
  const [budget, setBudget] = useState<SgBudgetSummary>(initialBudget);
  const [costClearance, setCostClearance] = useState<CostClearanceRecord>(initialCostClearance);

  // Recalculate spend metrics dynamically based on requisitions
  const recalculateBudget = (updatedReqs: RequisitionItem[], currentCap: number) => {
    let target = 0;
    let over = 0;
    let poCommit = 0;
    
    updatedReqs.forEach(r => {
      const itemCost = r.quantity * r.estimatedUnitPrice;
      if (r.status === 'PURCHASABLE' || r.status === 'EMS_APPROVED' || r.status === 'INBOUND_TRACKING' || r.status === 'ISSUED') {
        poCommit += itemCost;
      }
      if (r.planClassification === 'TARGET') {
        target += itemCost;
      } else if (r.planClassification === 'OVER') {
        over += itemCost;
      }
    });

    setBudget(prev => ({
      ...prev,
      monthlyAllocationBudget: currentCap,
      withinTargetSpend: target,
      unplannedOverSpend: over,
      poCommitSpend: poCommit,
      carryoverSurplus: 0 // Strict no-rollover
    }));
  };

  const addRequisition = (item: Omit<RequisitionItem, 'id' | 'createdAt'>) => {
    const id = `PR-2611-${String(requisitions.length + 81).padStart(4, '0')}`;
    const newItem: RequisitionItem = {
      ...item,
      id,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const nextRequisitions = [newItem, ...requisitions];
    setRequisitions(nextRequisitions);
    recalculateBudget(nextRequisitions, budget.monthlyAllocationBudget);

    // If agingInterlockFlag is 'Y', automatically instantiate a persistent required task
    if (newItem.agingInterlockFlag === 'Y') {
      const newTask: PersistentTask = {
        id: `TASK-INTER-STOCK-${newItem.qCode}-${Date.now().toString().slice(-4)}`,
        type: 'INTER_TEAM_BORROW',
        title: `Cảnh báo tồn kho liên Team: Ưu tiên mượn ${newItem.qCode} từ ${newItem.peerTeamOwner || 'Team bạn'}`,
        qCode: newItem.qCode,
        partName: newItem.partName,
        engineerName: newItem.requestorName,
        deadline: budget.justificationDeadline,
        status: 'ACTIVE',
        details: `Có sẵn tại kho H1-2F thuộc sở hữu của ${newItem.peerTeamOwner || 'Team bạn'}. Tác vụ bắt buộc không thể tự đóng, chỉ giải phóng khi EMS đồng bộ cờ tồn kho = N.`,
        emsAutoResolvable: true
      };
      setTasks(prev => [newTask, ...prev]);
    }

    if (newItem.ebomPendingMapping) {
      const newEbomTask: PersistentTask = {
        id: `TASK-EBOM-${newItem.id}`,
        type: 'EBOM_LATE_DECLARATION',
        title: `Khai báo muộn: Gán ${newItem.qCode} vào cụm máy ${newItem.machineFriendlyName}`,
        qCode: newItem.qCode,
        partName: newItem.partName,
        engineerName: newItem.requestorName,
        deadline: '2026-11-12',
        status: 'ACTIVE',
        details: `Yêu cầu mua sắm tạo khẩn cấp chưa có Slot cơ cấu. Vui lòng kéo-thả gán vào cây máy trong vòng 7 ngày.`,
        emsAutoResolvable: false
      };
      setTasks(prev => [newEbomTask, ...prev]);
    }
  };

  const batchUpdateRequisitionStatus = (ids: string[], newStatus: RequisitionStatus) => {
    const nextReqs = requisitions.map(item => {
      if (ids.includes(item.id)) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    setRequisitions(nextReqs);
    recalculateBudget(nextReqs, budget.monthlyAllocationBudget);
  };

  const classifyTargetOver = (id: string, plan: PlanClassification, overReason?: OverReasonCode, workOrderNo?: string) => {
    const nextReqs = requisitions.map(item => {
      if (item.id === id) {
        return {
          ...item,
          planClassification: plan,
          overReasonCode: overReason,
          workOrderNo: workOrderNo || item.workOrderNo
        };
      }
      return item;
    });
    setRequisitions(nextReqs);
    recalculateBudget(nextReqs, budget.monthlyAllocationBudget);
  };

  const reclassifyEol = (id: string) => {
    const nextReqs = requisitions.map(item => {
      if (item.id === id) {
        return { ...item, status: 'EOL' as RequisitionStatus };
      }
      return item;
    });
    setRequisitions(nextReqs);
  };

  const updateMilestones = (
    id: string, 
    vendorConfirmDate: string, 
    etaDate: string, 
    monthlyAllocations: { month: string; qty: number; amount: number }[]
  ) => {
    const nextReqs = requisitions.map(item => {
      if (item.id === id) {
        return {
          ...item,
          vendorConfirmDate,
          etaDate,
          monthlyAllocations,
          status: 'INBOUND_TRACKING' as RequisitionStatus
        };
      }
      return item;
    });
    setRequisitions(nextReqs);
  };

  const syncEmsPrvPo = (id: string, prvNo: string, poNo: string) => {
    const nextReqs = requisitions.map(item => {
      if (item.id === id) {
        return {
          ...item,
          prvNo,
          poNo,
          status: 'EMS_APPROVED' as RequisitionStatus
        };
      }
      return item;
    });
    setRequisitions(nextReqs);
    recalculateBudget(nextReqs, budget.monthlyAllocationBudget);
  };

  const simulateEmsStockClearance = (qCode: string) => {
    // 1. Mark cross-team tasks for this qCode as resolved
    setTasks(prev => prev.map(t => {
      if (t.qCode === qCode && t.emsAutoResolvable) {
        return { ...t, status: 'RESOLVED', resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) };
      }
      return t;
    }));

    // 2. Clear agingInterlockFlag on matching requisitions
    const nextReqs = requisitions.map(r => {
      if (r.qCode === qCode) {
        return { ...r, agingInterlockFlag: 'N' as const, status: 'PURCHASABLE' as RequisitionStatus };
      }
      return r;
    });
    setRequisitions(nextReqs);
  };

  const submitAgingJustification = (taskId: string, justification: string, plan: string, targetDate: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Update task
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'RESOLVED',
          justificationText: justification,
          resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return t;
    }));

    // Add to agingJustifications table
    const newRecord: AgingJustificationRecord = {
      id: `AJ-2611-${String(agingJustifications.length + 1).padStart(2, '0')}`,
      taskId,
      qCode: task.qCode,
      partName: task.partName,
      lotNo: `LOT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-AUTO`,
      inventoryAgeDays: 45,
      stockQty: 5,
      unit: 'EA',
      engineerName: task.engineerName,
      partGroup: 'CP/SG Part 1',
      justificationReason: justification,
      actionPlan: plan,
      targetUsageDate: targetDate,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setAgingJustifications(prev => [newRecord, ...prev]);
  };

  const acceptInterTeamBorrow = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'RESOLVED',
          resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          details: t.details + ' [Kỹ sư đã xác nhận mượn tồn kho liên team thành công].'
        };
      }
      return t;
    }));
  };

  // 3-Party Clarification
  const createClarificationInquiry = (requisitionId: string, qCode: string, partName: string, question: string, costImpactUsd?: number) => {
    const newInquiry: ClarificationInquiry = {
      id: `INQ-2611-${String(clarifications.length + 1).padStart(3, '0')}`,
      requisitionId,
      qCode,
      partName,
      reviewerQuestion: question,
      status: 'PENDING_LEC',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      costImpactUsd
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
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
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
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return inq;
    }));
  };

  const resolveClarificationInquiry = (inquiryId: string) => {
    setClarifications(prev => prev.map(inq => {
      if (inq.id === inquiryId) {
        return {
          ...inq,
          status: 'RESOLVED',
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return inq;
    }));
  };

  // QCode Folder Onboarding
  const submitQCodeFolder = (submission: Omit<QCodeSubmission, 'id' | 'submittedAt' | 'status'>) => {
    const id = `SUB-2611-${String(qcodeSubmissions.length + 1).padStart(3, '0')}`;
    const newSubmission: QCodeSubmission = {
      ...submission,
      id,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'PENDING_LEC_REGISTRATION'
    };
    setQcodeSubmissions(prev => [newSubmission, ...prev]);
  };

  const registerOfficialQCode = (submissionId: string, officialQCode: string) => {
    const targetSub = qcodeSubmissions.find(s => s.id === submissionId);
    if (!targetSub) return;

    // Update submission status
    setQcodeSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          status: 'OFFICIALLY_REGISTERED',
          officialQCode,
          registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return s;
    }));

    // Update any requisition that was using this tempCode
    setRequisitions(prev => prev.map(r => {
      if (r.qCode === targetSub.tempCode) {
        return {
          ...r,
          qCode: officialQCode,
          isTempCode: false,
          status: 'PURCHASABLE'
        };
      }
      return r;
    }));

    // Update any task pointing to this tempCode
    setTasks(prev => prev.map(t => {
      if (t.qCode === targetSub.tempCode) {
        return {
          ...t,
          qCode: officialQCode,
          details: t.details + ` [Đã cấp QCode chính thức: ${officialQCode}]`
        };
      }
      return t;
    }));
  };

  // EBOM
  const bindPartToSlot = (
    mechanismId: string, 
    partCode: string, 
    partName: string, 
    maker: string, 
    model: string, 
    stdQty: number,
    replacementLifespan: string = '20,000h'
  ) => {
    setEbomMechanisms(prev => prev.map(mech => {
      if (mech.mechanismId === mechanismId) {
        const existingIdx = mech.boundParts.findIndex(p => p.partCode === partCode);
        if (existingIdx >= 0) {
          const updatedParts = [...mech.boundParts];
          updatedParts[existingIdx] = {
            ...updatedParts[existingIdx],
            stdQty,
            replacementLifespan
          };
          return { ...mech, boundParts: updatedParts };
        } else {
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
                replacementLifespan
              }
            ]
          };
        }
      }
      return mech;
    }));
  };

  const resolveLateDeclaration = (requisitionId: string, mechanismId: string) => {
    const targetReq = requisitions.find(r => r.id === requisitionId);
    if (!targetReq) return;

    // 1. Clear ebomPendingMapping on requisition
    setRequisitions(prev => prev.map(r => {
      if (r.id === requisitionId) {
        return { ...r, ebomPendingMapping: false };
      }
      return r;
    }));

    // 2. Resolve matching EBOM task
    setTasks(prev => prev.map(t => {
      if (t.qCode === targetReq.qCode && t.type === 'EBOM_LATE_DECLARATION') {
        return { ...t, status: 'RESOLVED', resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) };
      }
      return t;
    }));

    // 3. Bind part into the target mechanism
    bindPartToSlot(
      mechanismId, 
      targetReq.qCode, 
      targetReq.partName, 
      targetReq.maker, 
      targetReq.model, 
      targetReq.quantity
    );
  };

  // Budget & Deadlines & Clearance
  const updateBudgetCap = (newBudget: number) => {
    setBudget(prev => ({
      ...prev,
      monthlyAllocationBudget: newBudget,
      carryoverSurplus: 0
    }));
  };

  const updateDeadlines = (justificationDeadline: string, auditLockDeadline: string) => {
    setBudget(prev => ({
      ...prev,
      justificationDeadline,
      auditLockDeadline
    }));
    setTasks(prev => prev.map(t => {
      if (t.type === 'AGING_JUSTIFICATION') {
        return { ...t, deadline: justificationDeadline };
      }
      return t;
    }));
  };

  const issueCostClearance = (auditorName: string) => {
    setCostClearance({
      periodMonth: budget.periodMonth,
      auditorName,
      clearedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      totalItemsAudited: requisitions.filter(r => !r.isTempCode).length,
      totalTargetSpend: budget.withinTargetSpend,
      totalOverSpend: budget.unplannedOverSpend,
      status: 'CLEARED',
      stampCode: `CC-HW-${budget.periodMonth.replace('-', '')}-PASS`
    });
  };

  return (
    <ProcurementContext.Provider value={{
      currentRole,
      setCurrentRole,
      activeLec,
      setActiveLec,
      requisitions,
      tasks,
      clarifications,
      qcodeSubmissions,
      agingJustifications,
      ebomMechanisms,
      budget,
      costClearance,
      addRequisition,
      batchUpdateRequisitionStatus,
      classifyTargetOver,
      reclassifyEol,
      updateMilestones,
      syncEmsPrvPo,
      simulateEmsStockClearance,
      submitAgingJustification,
      acceptInterTeamBorrow,
      createClarificationInquiry,
      forwardInquiryToEngineer,
      submitEngineerResponse,
      resolveClarificationInquiry,
      submitQCodeFolder,
      registerOfficialQCode,
      bindPartToSlot,
      resolveLateDeclaration,
      updateBudgetCap,
      updateDeadlines,
      issueCostClearance
    }}>
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = (): ProcurementContextType => {
  const context = useContext(ProcurementContext);
  if (!context) {
    throw new Error('useProcurement must be used within a ProcurementProvider');
  }
  return context;
};
