import { RequisitionItem, PersistentTask, ClarificationInquiry, EbomMechanism, SgBudgetSummary } from '../types';

export const initialRequisitions: RequisitionItem[] = [
  {
    id: 'PR-2611-0081',
    qCode: 'QDAB03583',
    isTempCode: false,
    partName: 'Square Photoelectric Sensor',
    maker: 'Panasonic',
    model: 'CN-73-C2',
    quantity: 10,
    unit: 'EA',
    estimatedUnitPrice: 45,
    unitPriceFlag: 'Y',
    demandType: 'PM',
    machineFriendlyName: 'Die Bonder 01 (DB-01)',
    lineName: 'Line #201',
    mechanismFriendlyName: 'Feeder Unit (Unit 01)',
    emNo: 'HWBMTL21EC0101',
    status: 'PURCHASABLE',
    planClassification: 'TARGET',
    requestorName: 'Nguyen Van Thang',
    partGroup: 'CP/SG Part 1',
    createdAt: '2026-11-01',
    ebomPendingMapping: false,
    agingInterlockFlag: 'N',
    vendorConfirmDate: '2026-11-07',
    etaDate: '2026-11-14',
    monthlyAllocations: [
      { month: '2026-11', qty: 5, amount: 225 },
      { month: '2026-12', qty: 5, amount: 225 }
    ]
  },
  {
    id: 'PR-2611-0082',
    qCode: 'QDAD12236',
    isTempCode: false,
    partName: 'Power Supply Board CPX V4',
    maker: 'Trumpf',
    model: '2912146',
    quantity: 1,
    unit: 'EA',
    estimatedUnitPrice: 3150,
    unitPriceFlag: 'Y',
    demandType: 'BREAKDOWN',
    machineFriendlyName: 'Die Bonder 01 (DB-01)',
    lineName: 'Line #201',
    mechanismFriendlyName: 'Bonding Head (Unit 02)',
    emNo: 'HWBMTL21EC0201',
    status: 'PURCHASABLE',
    planClassification: 'OVER',
    overReasonCode: 'OVR-01',
    workOrderNo: 'WO-248926091',
    requestorName: 'Nguyen Van Thang',
    partGroup: 'CP/SG Part 1',
    createdAt: '2026-11-02',
    ebomPendingMapping: false,
    agingInterlockFlag: 'N',
    vendorConfirmDate: '2026-11-05',
    etaDate: '2026-11-10',
    monthlyAllocations: [
      { month: '2026-11', qty: 1, amount: 3150 }
    ]
  },
  {
    id: 'PR-2611-0083',
    qCode: 'QCAD38190',
    isTempCode: false,
    partName: 'Dual-Rod Guided Cylinder MXQ16',
    maker: 'SMC',
    model: 'MXQ16-100B',
    quantity: 4,
    unit: 'EA',
    estimatedUnitPrice: 220,
    unitPriceFlag: 'Y',
    demandType: 'IMPROVE',
    machineFriendlyName: 'Tape Automated Bonder (TAB-02)',
    lineName: 'Line #202',
    mechanismFriendlyName: 'Tape Cut Mechanism (Mech 01)',
    emNo: 'HWBMTL22EC0101',
    status: 'CROSS_TEAM_STOCK',
    planClassification: 'UNCLASSIFIED',
    requestorName: 'Le Hoang Quan',
    partGroup: 'CP/SG Part 1',
    createdAt: '2026-11-03',
    ebomPendingMapping: false,
    agingInterlockFlag: 'Y',
    crossTeamStockQty: 6,
    peerTeamOwner: 'PO Module Tech Team 1',
    vendorConfirmDate: '2026-11-12',
    etaDate: '2026-11-20',
    monthlyAllocations: [
      { month: '2026-11', qty: 2, amount: 440 },
      { month: '2026-12', qty: 2, amount: 440 }
    ]
  },
  {
    id: 'PR-2611-0084',
    qCode: 'QCAB99120',
    isTempCode: false,
    partName: 'AC Servo Driver 200W',
    maker: 'Omron',
    model: 'R88D-KT02H',
    quantity: 2,
    unit: 'EA',
    estimatedUnitPrice: 890,
    unitPriceFlag: 'N',
    demandType: 'PM',
    machineFriendlyName: 'Polarizer Attach (POL-01)',
    lineName: 'Line #203',
    mechanismFriendlyName: 'Infeed Conveyor (Mech 02)',
    emNo: 'HWBMTL23EC0101',
    status: 'EOL',
    planClassification: 'UNCLASSIFIED',
    requestorName: 'Tran Duc Minh',
    partGroup: 'CP/SG Part 2',
    createdAt: '2026-11-02',
    ebomPendingMapping: false,
    agingInterlockFlag: 'N'
  },
  {
    id: 'PR-2611-0085',
    qCode: 'TMP-HW-0105',
    isTempCode: true,
    partName: 'Custom Chuck Clamp Jig Plate',
    maker: 'Local Machining Co.',
    model: 'JIG-SW-D222',
    quantity: 2,
    unit: 'EA',
    estimatedUnitPrice: 180,
    unitPriceFlag: 'N',
    demandType: 'SETUP',
    machineFriendlyName: 'Die Bonder 01 (DB-01)',
    lineName: 'Line #201',
    mechanismFriendlyName: 'Sub-Chuck Fixture (Late Declaration)',
    emNo: 'HWBMTL21EC0301',
    status: 'DRAFT',
    planClassification: 'UNCLASSIFIED',
    requestorName: 'Nguyen Van Thang',
    partGroup: 'CP/SG Part 1',
    createdAt: '2026-11-04',
    ebomPendingMapping: true,
    agingInterlockFlag: 'N'
  }
];

export const initialTasks: PersistentTask[] = [
  {
    id: 'TASK-INTER-STOCK-QCAD38190',
    type: 'INTER_TEAM_BORROW',
    title: 'Idle Stock Alert: Borrow from Team 1 Prior to Purchase',
    qCode: 'QCAD38190',
    partName: 'Dual-Rod Guided Cylinder MXQ16',
    engineerName: 'Le Hoang Quan',
    deadline: '2026-11-06',
    status: 'ACTIVE',
    details: '6 units available in Warehouse H1-2F owned by PO Module Tech Team 1. Initiate intra-plant transfer requisition to consume before purchasing new.',
    emsAutoResolvable: true
  },
  {
    id: 'TASK-AGING-JUSTIFY-QDAB03583',
    type: 'AGING_JUSTIFICATION',
    title: 'Beginning-of-Month Inventory Aging Justification (>30 Days)',
    qCode: 'QDAB03583',
    partName: 'Square Photoelectric Sensor',
    engineerName: 'Nguyen Van Thang',
    deadline: '2026-11-05',
    status: 'ACTIVE',
    details: '5 EA on-hand unconsumed since October. Submit explanation note and planned machine installation schedule for Cost Management audit review.',
    emsAutoResolvable: false
  },
  {
    id: 'TASK-EBOM-MAPPING-TMP0105',
    type: 'EBOM_LATE_DECLARATION',
    title: 'Late Declaration: Map Custom Jig into Machine EBOM Slot',
    qCode: 'TMP-HW-0105',
    partName: 'Custom Chuck Clamp Jig Plate',
    engineerName: 'Nguyen Van Thang',
    deadline: '2026-11-10',
    status: 'ACTIVE',
    details: 'Created under late declaration queue. Open Drag-and-Drop EBOM Slot Mapper and assign to DB-01 fixture slot.',
    emsAutoResolvable: false
  }
];

export const initialClarifications: ClarificationInquiry[] = [
  {
    id: 'INQ-2611-001',
    requisitionId: 'PR-2611-0082',
    qCode: 'QDAD12236',
    partName: 'Power Supply Board CPX V4 Trumpf ($3,150)',
    reviewerQuestion: 'Cost Management Reviewer: Over breakdown claim requires electrical inspection evidence of lightning surge C14 capacitor failure and night shift breakdown work order log.',
    lecNote: 'LEC (Pham Duc Long): Thang, please attach the lab diagnosis photos and submit the signed night shift breakdown sheet.',
    engineerResponse: 'Engineer (Nguyen Van Thang): Attached C14 capacitor burn photos and WO-248926091 signed shift log.',
    status: 'ENGINEER_REPLIED',
    createdAt: '2026-11-03 09:30',
    updatedAt: '2026-11-03 16:45'
  },
  {
    id: 'INQ-2611-002',
    requisitionId: 'PR-2611-0083',
    qCode: 'QCAD38190',
    partName: 'Dual-Rod Cylinder MXQ16 ($220)',
    reviewerQuestion: 'Cost Management Reviewer: Explain why the 6 units in Team 1 stock were not fully borrowed for this requisition.',
    lecNote: 'LEC (Pham Duc Long): Quan, please clarify if Team 1 needs to reserve remaining units for their line.',
    status: 'PENDING_ENGINEER',
    createdAt: '2026-11-04 08:15',
    updatedAt: '2026-11-04 08:30'
  }
];

export const initialEbomMechanisms: EbomMechanism[] = [
  {
    mechanismId: 'MECH-DB01-FEED-01',
    friendlyName: 'Feeder Unit (Cụm Cấp Liệu Phôi)',
    unitCode: '01',
    assemblyCode: '01',
    emNo: 'HWBMTL21EC0101',
    machineId: 'DB-01',
    boundParts: [
      {
        partCode: 'QDAB03583',
        partName: 'Square Photoelectric Sensor CN-73-C2',
        maker: 'Panasonic',
        model: 'CN-73-C2',
        stdQty: 2,
        unit: 'EA',
        replacementLifespan: '20,000h'
      }
    ]
  },
  {
    mechanismId: 'MECH-DB01-HEAD-02',
    friendlyName: 'Bonding Head (Cụm Đầu Gắp Chíp)',
    unitCode: '02',
    assemblyCode: '01',
    emNo: 'HWBMTL21EC0201',
    machineId: 'DB-01',
    boundParts: [
      {
        partCode: 'QDAD12236',
        partName: 'Power Supply Board CPX V4',
        maker: 'Trumpf',
        model: '2912146',
        stdQty: 1,
        unit: 'EA',
        replacementLifespan: '40,000h'
      },
      {
        partCode: 'QCAD38190',
        partName: 'Dual-Rod Cylinder MXQ16-100B',
        maker: 'SMC',
        model: 'MXQ16-100B',
        stdQty: 2,
        unit: 'EA',
        replacementLifespan: '15,000h'
      }
    ]
  }
];

export const initialBudget: SgBudgetSummary = {
  periodMonth: '2026-11',
  monthlyAllocationBudget: 150000,
  poCommitSpend: 148200,
  emsIssueExpense: 118450,
  withinTargetSpend: 122000,
  unplannedOverSpend: 26200,
  carryoverSurplus: 0, // Strict No-Rollover Policy
  justificationDeadline: '2026-11-05',
  auditLockDeadline: '2026-11-07'
};

