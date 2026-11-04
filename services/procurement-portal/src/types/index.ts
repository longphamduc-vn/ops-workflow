export type UserRole = 'COMMON' | 'REQUESTOR' | 'LEADER' | 'LEC' | 'COST_MGMT' | 'EBOM' | 'ADMIN';

export type DemandType = 'SETUP' | 'IMPROVE' | 'BREAKDOWN' | 'PM' | 'SAFETY_STOCK';

export type PlanClassification = 'TARGET' | 'OVER' | 'UNCLASSIFIED';

export type OverReasonCode = 
  | 'OVR-01' // Sudden Breakdown / Line Stop
  | 'OVR-02' // Production Volume Surge
  | 'OVR-03' // Inter-Entity Transfer Delay
  | 'OVR-04' // New Model Setup (D111 -> D222)
  | 'OVR-05' // Supplier Price Increase / Currency Volatility
  | 'OVR-06'; // Setup / Installation Damage

export type RequisitionStatus = 
  | 'DRAFT'
  | 'INTERLOCK_CHECK'
  | 'CROSS_TEAM_STOCK'
  | 'PURCHASABLE'
  | 'EOL'
  | 'INTER_ENTITY'
  | 'EMS_APPROVED'
  | 'INBOUND_TRACKING'
  | 'ISSUED';

export interface RequisitionItem {
  id: string;
  qCode: string;
  isTempCode: boolean; // TMP-HW-xxxx
  partName: string;
  maker: string;
  model: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
  unitPriceFlag: 'Y' | 'N'; // Y = Contract price (UP001), N = None price (UP004 RFQ)
  demandType: DemandType;
  machineFriendlyName: string; // e.g. Die Bonder 01 (DB-01)
  lineName: string; // Line #201
  mechanismFriendlyName: string; // Cụm Đầu Gắp (Bonding Head)
  emNo: string; // 14-char code e.g. HWBMTL21EC0101
  status: RequisitionStatus;
  planClassification: PlanClassification; // Evaluated manually by LEC
  overReasonCode?: OverReasonCode;
  workOrderNo?: string;
  requestorName: string;
  partGroup: string; // CP/SG Part 1
  createdAt: string;
  ebomPendingMapping: boolean;
  agingInterlockFlag: 'Y' | 'N';
  crossTeamStockQty?: number;
  peerTeamOwner?: string; // e.g. PO Module Tech Team 1
  vendorConfirmDate?: string;
  etaDate?: string;
  monthlyAllocations?: { month: string; qty: number; amount: number }[];
}

export interface PersistentTask {
  id: string;
  type: 'INTER_TEAM_BORROW' | 'AGING_JUSTIFICATION' | 'EBOM_LATE_DECLARATION' | 'CLARIFICATION_RESPONSE';
  title: string;
  qCode: string;
  partName: string;
  engineerName: string;
  deadline: string;
  status: 'ACTIVE' | 'RESOLVED';
  details: string;
  emsAutoResolvable: boolean; // True for agingInterlockFlag tasks that auto-close when EMS confirms 'N'
}

export interface ClarificationInquiry {
  id: string;
  requisitionId: string;
  qCode: string;
  partName: string;
  reviewerQuestion: string;
  lecNote?: string;
  engineerResponse?: string;
  status: 'PENDING_LEC' | 'PENDING_ENGINEER' | 'ENGINEER_REPLIED' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
}

export interface EbomMechanism {
  mechanismId: string;
  friendlyName: string;
  unitCode: string;
  assemblyCode: string;
  emNo: string;
  machineId: string;
  boundParts: {
    partCode: string;
    partName: string;
    maker: string;
    model: string;
    stdQty: number;
    unit: string;
    replacementLifespan: string;
  }[];
}

export interface SgBudgetSummary {
  periodMonth: string; // 2026-11
  monthlyAllocationBudget: number; // LEC entered manually e.g. 150000
  poCommitSpend: number; // 148200
  emsIssueExpense: number; // 118450 (Synced from EMS ds_Inv)
  withinTargetSpend: number; // 122000
  unplannedOverSpend: number; // 26200
  carryoverSurplus: number; // ALWAYS 0 (Strict No-Rollover)
  justificationDeadline: string; // LEC configured e.g. 2026-11-04
  auditLockDeadline: string; // LEC configured e.g. 2026-11-06
}
