import { 
  RequisitionItem, 
  PersistentTask, 
  ClarificationInquiry, 
  EbomMechanism, 
  SgBudgetSummary,
  QCodeSubmission,
  AgingJustificationRecord,
  CostClearanceRecord
} from '../types';

export const initialRequisitions: RequisitionItem[] = [
  {
    id: 'PR-2611-0081',
    qCode: 'QDAB03583',
    isTempCode: false,
    partName: 'Cảm biến quang vuông (Square Photoelectric Sensor)',
    maker: 'Panasonic',
    model: 'CN-73-C2',
    quantity: 10,
    unit: 'EA',
    estimatedUnitPrice: 45,
    unitPriceFlag: 'Y',
    demandType: 'PM',
    machineFriendlyName: 'Die Bonder 01 (DB-01)',
    lineName: 'Line #201',
    mechanismFriendlyName: 'Cụm Cấp Liệu Phôi (Feeder Unit)',
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
    ],
    prvNo: 'PRV-2611-901',
    poNo: 'PO-2611-401'
  },
  {
    id: 'PR-2611-0082',
    qCode: 'QDAD12236',
    isTempCode: false,
    partName: 'Bo mạch nguồn cao tần CPX V4 (Power Supply Board)',
    maker: 'Trumpf',
    model: '2912146',
    quantity: 1,
    unit: 'EA',
    estimatedUnitPrice: 3150,
    unitPriceFlag: 'Y',
    demandType: 'BREAKDOWN',
    machineFriendlyName: 'Die Bonder 01 (DB-01)',
    lineName: 'Line #201',
    mechanismFriendlyName: 'Cụm Đầu Gắp Chíp (Bonding Head)',
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
    ],
    prvNo: 'PRV-2611-902',
    poNo: 'PO-2611-402'
  },
  {
    id: 'PR-2611-0083',
    qCode: 'QCAD38190',
    isTempCode: false,
    partName: 'Xy lanh dẫn hướng 2 ty MXQ16 (Dual-Rod Cylinder)',
    maker: 'SMC',
    model: 'MXQ16-100B',
    quantity: 4,
    unit: 'EA',
    estimatedUnitPrice: 220,
    unitPriceFlag: 'Y',
    demandType: 'IMPROVE',
    machineFriendlyName: 'Tape Automated Bonder (TAB-02)',
    lineName: 'Line #202',
    mechanismFriendlyName: 'Cụm Cắt Băng Dính (Tape Cut Mech)',
    emNo: 'HWBMTL22EC0101',
    status: 'CROSS_TEAM_STOCK',
    planClassification: 'OVER',
    overReasonCode: 'OVR-03',
    workOrderNo: 'WO-248926095',
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
    partName: 'Bộ điều khiển Driver Servo AC 200W',
    maker: 'Omron',
    model: 'R88D-KT02H',
    quantity: 2,
    unit: 'EA',
    estimatedUnitPrice: 890,
    unitPriceFlag: 'N',
    demandType: 'PM',
    machineFriendlyName: 'Polarizer Attach (POL-01)',
    lineName: 'Line #203',
    mechanismFriendlyName: 'Băng Tải Cấp (Infeed Conveyor)',
    emNo: 'HWBMTL23EC0101',
    status: 'EOL',
    planClassification: 'TARGET',
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
    partName: 'Tấm đồ gá Chuck kẹp phôi tùy biến (Custom Chuck Clamp Jig Plate)',
    maker: 'Local Machining Co.',
    model: 'JIG-SW-D222',
    quantity: 2,
    unit: 'EA',
    estimatedUnitPrice: 180,
    unitPriceFlag: 'N',
    demandType: 'SETUP',
    machineFriendlyName: 'Die Bonder 01 (DB-01)',
    lineName: 'Line #201',
    mechanismFriendlyName: 'Đồ Gá Phụ (Sub-Chuck Fixture)',
    emNo: 'HWBMTL21EC0301',
    status: 'DRAFT',
    planClassification: 'OVER',
    overReasonCode: 'OVR-04',
    workOrderNo: 'WO-248926102',
    requestorName: 'Nguyen Van Thang',
    partGroup: 'CP/SG Part 1',
    createdAt: '2026-11-04',
    ebomPendingMapping: true,
    agingInterlockFlag: 'N'
  },
  {
    id: 'PR-2611-0086',
    qCode: 'QCAD88102',
    isTempCode: false,
    partName: 'Van tiết lưu điện từ SMC SY5120 (Solenoid Valve)',
    maker: 'SMC',
    model: 'SY5120-5LZD-01',
    quantity: 8,
    unit: 'EA',
    estimatedUnitPrice: 85,
    unitPriceFlag: 'Y',
    demandType: 'SAFETY_STOCK',
    machineFriendlyName: 'Dispenser Robot (DISP-01)',
    lineName: 'Line #301',
    mechanismFriendlyName: 'Cụm Van Bơm Keo (Glue Pump Valve)',
    emNo: 'HWBMTL31EC0101',
    status: 'INBOUND_TRACKING',
    planClassification: 'OVER',
    overReasonCode: 'OVR-02',
    workOrderNo: 'WO-248926088',
    requestorName: 'Pham Van Kien',
    partGroup: 'CP/SG Part 2',
    createdAt: '2026-10-28',
    ebomPendingMapping: false,
    agingInterlockFlag: 'N',
    vendorConfirmDate: '2026-11-04',
    etaDate: '2026-11-08',
    monthlyAllocations: [
      { month: '2026-11', qty: 8, amount: 680 }
    ],
    prvNo: 'PRV-2610-850',
    poNo: 'PO-2610-310'
  },
  {
    id: 'PR-2611-0087',
    qCode: 'QCAD55421',
    isTempCode: false,
    partName: 'Đầu gia nhiệt gốm sứ Ceramic Heater',
    maker: 'Kyocera',
    model: 'CH-400W-24V',
    quantity: 3,
    unit: 'EA',
    estimatedUnitPrice: 420,
    unitPriceFlag: 'N',
    demandType: 'BREAKDOWN',
    machineFriendlyName: 'Tape Automated Bonder (TAB-01)',
    lineName: 'Line #201',
    mechanismFriendlyName: 'Cụm Bàn Nhiệt Ép (Bonding Heat Stage)',
    emNo: 'HWBMTL21EC0401',
    status: 'INTERLOCK_CHECK',
    planClassification: 'OVER',
    overReasonCode: 'OVR-06',
    workOrderNo: 'WO-248926115',
    requestorName: 'Le Hoang Quan',
    partGroup: 'CP/SG Part 1',
    createdAt: '2026-11-04',
    ebomPendingMapping: false,
    agingInterlockFlag: 'N'
  }
];

export const initialTasks: PersistentTask[] = [
  {
    id: 'TASK-INTER-STOCK-QCAD38190',
    type: 'INTER_TEAM_BORROW',
    title: 'Cảnh báo tồn kho liên Team: Ưu tiên mượn Team 1 trước khi mua mới',
    qCode: 'QCAD38190',
    partName: 'Xy lanh dẫn hướng 2 ty MXQ16 (Dual-Rod Cylinder)',
    engineerName: 'Le Hoang Quan',
    deadline: '2026-11-06',
    status: 'ACTIVE',
    details: 'Đang có sẵn 6 EA tồn kho tại Kho H1-2F thuộc quản lý của PO Module Tech Team 1. Kỹ sư phải làm thủ tục mượn/chuyển giao nội bộ. Tác vụ chỉ tự động giải phóng khi EMS xác nhận cờ tồn kho = N.',
    emsAutoResolvable: true
  },
  {
    id: 'TASK-AGING-JUSTIFY-QDAB03583',
    type: 'AGING_JUSTIFICATION',
    title: 'Giải trình tồn kho chậm luân chuyển đầu tháng (>30 Ngày)',
    qCode: 'QDAB03583',
    partName: 'Cảm biến quang vuông (Square Photoelectric Sensor)',
    engineerName: 'Nguyen Van Thang',
    deadline: '2026-11-05',
    status: 'ACTIVE',
    details: 'Tồn kho 5 EA chưa xuất dùng từ tháng 10. Kỹ sư nhập văn bản giải trình lý do kỹ thuật và cam kết kế hoạch sử dụng để phục vụ phiên thẩm định với Quản lý Chi phí.',
    emsAutoResolvable: false,
    justificationText: 'Linh kiện dự phòng đợt bảo dưỡng PM tháng 10 bị lùi lịch do xưởng ưu tiên chạy sản lượng Model D111. Cam kết thay thế toàn bộ trong kỳ PM ngày 15/11/2026.'
  },
  {
    id: 'TASK-EBOM-MAPPING-TMP0105',
    type: 'EBOM_LATE_DECLARATION',
    title: 'Khai báo muộn EBOM: Gán đồ gá Chuck Jig vào Slot máy DB-01',
    qCode: 'TMP-HW-0105',
    partName: 'Tấm đồ gá Chuck kẹp phôi tùy biến',
    engineerName: 'Nguyen Van Thang',
    deadline: '2026-11-10',
    status: 'ACTIVE',
    details: 'Yêu cầu mua khẩn cấp chưa có slot EBOM. Vui lòng mở cây EBOM kéo-thả để gán vào cụm cơ cấu phụ của Die Bonder 01 trong vòng 7 ngày.',
    emsAutoResolvable: false
  }
];

export const initialClarifications: ClarificationInquiry[] = [
  {
    id: 'INQ-2611-001',
    requisitionId: 'PR-2611-0082',
    qCode: 'QDAD12236',
    partName: 'Bo mạch nguồn CPX V4 Trumpf ($3,150)',
    reviewerQuestion: 'Bộ phận Quản lý Chi phí: Mục Over sự cố dừng chuyền giá trị cao ($3,150). Yêu cầu bổ sung hình ảnh giám định cháy tụ C14 và trích lục nhật ký ca đêm gắn mã WO-248926091.',
    lecNote: 'LEC (Phạm Đức Long): Thắng đính kèm ảnh chụp mạch hỏng và biên bản có chữ ký trưởng ca nhé.',
    engineerResponse: 'Kỹ sư (Nguyễn Văn Thắng): Đã tải lên ảnh chụp phóng đại tụ C14 bị đánh thủng do sét lan truyền và bản scan nhật ký ca dừng máy 45 phút.',
    status: 'ENGINEER_REPLIED',
    createdAt: '2026-11-03 09:30',
    updatedAt: '2026-11-03 16:45',
    costImpactUsd: 3150
  },
  {
    id: 'INQ-2611-002',
    requisitionId: 'PR-2611-0083',
    qCode: 'QCAD38190',
    partName: 'Xy lanh dẫn hướng MXQ16 SMC ($220)',
    reviewerQuestion: 'Bộ phận Quản lý Chi phí: Tại sao kho Team 1 có sẵn 6 EA mà chỉ mượn 2 EA và vẫn xin mua thêm 4 EA?',
    lecNote: 'LEC (Phạm Đức Long): Quân kiểm tra lại với LEC Team 1 xem họ có cho mượn hết cả 6 EA không để hủy mua mới.',
    status: 'PENDING_ENGINEER',
    createdAt: '2026-11-04 08:15',
    updatedAt: '2026-11-04 08:30',
    costImpactUsd: 880
  }
];

export const initialQCodeSubmissions: QCodeSubmission[] = [
  {
    id: 'SUB-2611-001',
    tempCode: 'TMP-HW-0105',
    partName: 'Tấm đồ gá Chuck kẹp phôi tùy biến',
    maker: 'Local Machining Co.',
    model: 'JIG-SW-D222',
    specDescription: 'Đồ gá nhôm 6061 mạ Anodized, độ chính xác gia công dung sai +/- 0.005mm cho dòng sản phẩm Smart Watch D222.',
    files: [
      { name: '2D_Drawing_Chuck_Plate_RevB.dwg', size: '4.2 MB', type: 'CAD' },
      { name: 'Technical_Specsheet_Anodized.pdf', size: '1.1 MB', type: 'PDF' },
      { name: 'Actual_Sample_Photo_TopView.png', size: '2.8 MB', type: 'IMAGE' }
    ],
    requestorName: 'Nguyen Van Thang',
    partGroup: 'CP/SG Part 1',
    machineFriendlyName: 'Die Bonder 01 (DB-01)',
    submittedAt: '2026-11-04 09:10',
    status: 'PENDING_LEC_REGISTRATION'
  },
  {
    id: 'SUB-2610-098',
    tempCode: 'TMP-HW-0098',
    partName: 'Vòi hút chân không siêu mảnh Tungsten Carbide Nozzle',
    maker: 'DISCO Japan',
    model: 'NZ-TC-012',
    specDescription: 'Vòi hút chip siêu nhỏ đường kính đầu hút 0.12mm chống tích điện ESD.',
    files: [
      { name: 'DISCO_Nozzle_Catalog_P12.pdf', size: '2.5 MB', type: 'PDF' },
      { name: 'CAD_Profile_Tip.dxf', size: '1.8 MB', type: 'CAD' }
    ],
    requestorName: 'Le Hoang Quan',
    partGroup: 'CP/SG Part 1',
    machineFriendlyName: 'Tape Automated Bonder (TAB-02)',
    submittedAt: '2026-10-30 14:20',
    status: 'OFFICIALLY_REGISTERED',
    officialQCode: 'QDAC77219',
    registeredAt: '2026-11-01 10:15'
  }
];

export const initialAgingJustifications: AgingJustificationRecord[] = [
  {
    id: 'AJ-2611-01',
    taskId: 'TASK-AGING-JUSTIFY-QDAB03583',
    qCode: 'QDAB03583',
    partName: 'Cảm biến quang vuông (Square Photoelectric Sensor)',
    lotNo: 'LOT-202609-P10',
    inventoryAgeDays: 48,
    stockQty: 5,
    unit: 'EA',
    engineerName: 'Nguyen Van Thang',
    partGroup: 'CP/SG Part 1',
    justificationReason: 'Linh kiện dự phòng đợt bảo dưỡng PM tháng 10 bị hoãn vì xưởng phải tăng sản lượng Model D111 gấp cho đơn hàng xuất khẩu.',
    actionPlan: 'Thay thế định kỳ bảo dưỡng tuần 2 tháng 11 cho toàn bộ 5 máy Die Bonder chuyền 201.',
    targetUsageDate: '2026-11-15',
    status: 'SUBMITTED',
    submittedAt: '2026-11-03 14:00'
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
        partName: 'Cảm biến quang vuông CN-73-C2',
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
        partName: 'Bo mạch nguồn cao tần CPX V4',
        maker: 'Trumpf',
        model: '2912146',
        stdQty: 1,
        unit: 'EA',
        replacementLifespan: '40,000h'
      },
      {
        partCode: 'QCAD38190',
        partName: 'Xy lanh dẫn hướng 2 ty MXQ16-100B',
        maker: 'SMC',
        model: 'MXQ16-100B',
        stdQty: 2,
        unit: 'EA',
        replacementLifespan: '15,000h'
      }
    ]
  },
  {
    mechanismId: 'MECH-TAB02-CUT-01',
    friendlyName: 'Tape Cut Mechanism (Cụm Dao Cắt Băng Băng Dính)',
    unitCode: '01',
    assemblyCode: '01',
    emNo: 'HWBMTL22EC0101',
    machineId: 'TAB-02',
    boundParts: [
      {
        partCode: 'QDAC77219',
        partName: 'Vòi hút chân không Carbide Nozzle',
        maker: 'DISCO',
        model: 'NZ-TC-012',
        stdQty: 4,
        unit: 'EA',
        replacementLifespan: '8,000h'
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

export const initialCostClearance: CostClearanceRecord = {
  periodMonth: '2026-11',
  auditorName: 'Tran Thi Huong (Cost Mgmt Reviewer)',
  clearedAt: '2026-11-04 10:00',
  totalItemsAudited: 6,
  totalTargetSpend: 122000,
  totalOverSpend: 26200,
  status: 'PENDING_CLARIFICATION',
  stampCode: 'CC-HW-202611-PASS'
};
