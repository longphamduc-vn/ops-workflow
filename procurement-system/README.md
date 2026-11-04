# Spare Parts Procurement Progress & Tracking System
> **Parallel Operational Architecture with EMS (LG Display Nexacro Platform)**  
> *Target Division: Smart Watch (SW) | Plant: Factory HW (Display Module Plant 1)*

---

## 1. Business Context & Core Operational Principles

This system is engineered for the production lines of Smart Watch display modules at **Factory HW** (Display Module Plant 1 - Org ID: `28753`). It operates as an **operational engagement layer for progress tracking, engineering coordination, milestone monitoring (Vendor Confirmation, ETA, Monthly Expense Allocation), and inventory aging justification**, running in parallel with the corporate Nexacro EMS. **All official approvals take place strictly on EMS.**

```
Corporation / Enterprise (Multi-Entity & Multi-Plant)
 └── Factory HW (Display Module Plant 1 - Smart Watch Division) / Factory TV / Auto Display
       │
       ├── Cost Management Team (Cost Controller / Reviewer & Assistant is ONE Single Person)
       │     ├── Offline Beginning-of-Month Cost Audit & Inventory Aging Review
       │     └── Issues clarification requests for LEC to coordinate engineer responses
       │
       ├── Requestor Team (e.g., PO Module Technology Team 2 - Dept Code: 87321)
       │     │
       │     ├── Team LEC Group (Multi-LEC: Pham Duc Long - 658359 and Colleagues)
       │     │     ├── Configures deadlines for inventory justification & monthly audit
       │     │     ├── Aggregates items by status; MANUALLY classifies Target vs. Over (NO auto-classification)
       │     │     ├── Audit prerequisite: MANDATORY official QCode (TMP temporary codes blocked)
       │     │     ├── Milestone management: Vendor Confirm Date, ETA, Monthly Expense Allocation
       │     │     ├── 3-Party Clarification Bridge: Reviewer <-> LEC <-> Requestor Engineer
       │     │     └── Enters monthly SG budget manually (STRICT NO-ROLLOVER POLICY)
       │     │
       │     └── Part (Sub-group, e.g., CP/SG Part 1)
       │           │
       │           └── Field Engineers (PEER ENGINEERS - NO PROCESS HIERARCHY)
       │                 ├── Work directly with friendly names (Machine, Line, Mechanism)
       │                 ├── Receive immediate cross-team stock warnings; PERSISTENT MANDATORY TASK until EMS = 'N'
       │                 ├── Prepare data package (Folder upload CAD/Catalog) for LEC QCode registration
       │                 └── Submit inventory justification tasks before LEC-configured deadline
       │
       └── Corporate Procurement Dept (Purchase)
             └── Independent commercial negotiation with external suppliers
```

### 10 Core Operational Principles:

1. **No System Approvals — Approvals On EMS Only; New System Tracks Progress Only**:
   - All official PRV approvals, budgeting signatures, and PO issuances are executed on **LG Display Core EMS**.
   - The new system governs **procurement pipeline milestones, SG budget caps, inventory aging justification, and engineering coordination**.
2. **No Process Hierarchy Field — Field Engineers are Peer Colleagues**:
   - Eliminates process classification hierarchy (no grouping by POL, TAB, DIP, LT, DB, BD, and no Process Leader approval role).
   - All engineers within a Part/Team are **peer colleagues**, directly submitting purchase requisitions and justifying inventory for their assigned machines.
3. **Borrowing/Using Stock from Other Teams: Immediate Alert & Persistent Mandatory Task**:
   - When an engineer creates a requisition or selects a part, if `agingInterlockFlag == 'Y'` (or idle inventory exists in other teams at Factory HW):
     - An **immediate visual warning banner** alerts the Requestor.
     - The system activates a **Persistent Required Task**: *"Must borrow/use idle stock from peer team prior to new purchase"*.
     - This task **remains permanently active on both Engineer and LEC workbenches, cannot be manually dismissed, and only closes automatically when EMS re-sync confirms the flag has turned to `'N'`** (physical issuance completed on EMS).
4. **Progress Milestones: Physical Receiving Synced from EMS; New System Manages Vendor Confirm, ETA & Expense Allocation**:
   - **Goods Receipt / Inbound Delivery**: Directly read and verified against EMS (`po_remained_qty` / `notReceivingQty`). No redundant warehouse inbound portal.
   - **The new system controls critical pre-delivery milestones**:
     * **Vendor Confirmation Date**: Formal supplier order acceptance and committed ship date.
     * **ETA (Estimated Time of Arrival)**: Expected arrival date at Factory HW docks.
     * **Monthly Expense Allocation Planning**: Scheduled monthly issuance distribution to **smooth actual machine cost impact across monthly accounting cycles**.
5. **Prerequisite for Monthly Audit: MANDATORY Official QCode**:
   - Items with temporary identifiers (`TMP-HW-xxxx`) are **STRICTLY BLOCKED from cost audit submission**.
   - Engineers must prepare complete documentation $\rightarrow$ LEC registers and obtains an official EMS QCode before the item can be included in the Beginning-of-Month Audit dossier.
6. **LEC Manually Classifies Target vs. Over — STRICTLY NO AUTOMATION**:
   - The system **never auto-classifies** items into `Within Target` or `Over Budget`.
   - **The LEC manually evaluates and tags each item** based on technical diagnosis, equipment breakdown reports, and monthly budget limits.
7. **Beginning-of-Month Audit & Aging Review — DEADLINE SET BY LEC**:
   - The offline cost audit and inventory aging review take place at the **BEGINNING OF EACH MONTH** (Days 01–05).
   - **Submission deadlines for engineer justifications and dossier lock are dynamically configured by the LEC** based on operational schedules.
8. **3-Party Clarification Loop Following Offline Audit**:
   - Reviewer (Cost Management - 1 single person) conducts offline audit with LECs.
   - If Reviewer requests clarification $\rightarrow$ Reviewer notifies LEC $\rightarrow$ **LEC enters inquiry into system for Engineer** $\rightarrow$ **Engineer submits response to LEC** $\rightarrow$ **LEC reviews and returns finalized dossier to Reviewer**.
9. **No Warehouse Portal — Issuance Expense Read Directly from EMS**:
   - Warehouse keepers do not use this application. Parts issuance and machine expense records are automatically extracted from EMS transactional tables.
10. **SG Budget: Manual Entry & STRICT NO-ROLLOVER POLICY**:
    - LEC manually enters the team's SG budget cap at the start of each month. Unused balances expire at month-end; **surplus never rolls over to subsequent months**.

---

## 2. Task-Based Documentation Map

```
procurement-system/
│
├── 01-master-data-and-ebom/                    # TASK 1: Master Data, EBOM Tree & QCode Preparation
│   ├── 01-organization-and-plant-hierarchy.md  # Factory HW, Multi-Team, Peer Engineers, Cost Management (1 person)
│   ├── 02-ebom-structure-and-equipment-tree.md # Friendly Names vs. 14-char EM No, Drag-and-Drop Slot Mapper, Late Declaration
│   └── 03-batch-qcode-registration-and-media.md# Folder Upload -> Data preparation for LEC QCode registration (Mandatory QCode gate)
│
├── 02-requestor-and-leader-portal/             # TASK 2: Requestor Portal & Team Monitoring Dashboard
│   ├── 01-requestor-requisition-workbench.md   # Immediate cross-team stock alert, Persistent task until EMS = 'N'
│   ├── 02-leader-team-monitoring-dashboard.md  # Leader progress monitoring by Team => Part (No system approvals)
│   └── 03-auto-requisition-engine.md           # Smart Watch production volume & MTBF demand estimation engine
│
├── 03-lec-workbench-and-interlock/             # TASK 3: LEC Workbench, Quotation & Interlock Resolution
│   ├── 01-interlock-resolution-process.md      # agingInterlockFlag (Cross-team stock reuse, persistent task), EOL reclassification
│   ├── 02-purchase-quotation-coordination.md   # RFQ tracking, Vendor Confirm, ETA, Monthly Expense Allocation
│   └── 03-batch-interlock-resolver.md          # LEC manual Target/Over tagging, LEC-configured audit deadlines
│
├── 04-budget-cost-and-over-management/         # TASK 4: SG Budget, Purchase vs. Issuance Costs & Over Handling
│   ├── 01-sg-budget-and-cost-accounting.md     # Monthly SG budget manual input, STRICT NO-ROLLOVER, PO Commit vs. Issue Expense
│   ├── 02-unplanned-over-budget-tracking.md    # LEC manual Over tagging, 6 standardized OVR root-cause codes
│   └── 03-monthly-offline-management-audit.md  # Beginning-of-Month Cost Audit & Aging Review (LEC-set deadlines)
│
├── 05-ui-ux-screen-specifications/             # TASK 5: V2 Standardized UI/UX Screen Specifications (10 Screens)
│   ├── README.md                               # Screen architecture summary, UI design tokens, navigation matrix
│   ├── 00-tong-quan-kien-truc-he-thong-man-hinh.md # UI-ARCH-00: Layout shell, 5-role permission matrix, theme & shortcuts
│   ├── 01-man-hinh-dang-ky-hang-muc-mua-hang.md    # UI-ROLE-01-REQ: 4-tier tree, Floor rule, Omni-search, instant interlock
│   ├── 02-man-hinh-onboarding-qcode-va-tai-folder.md # UI-ROLE-01-QCODE: Folder upload, CAD/Catalog extract, TMP-HW lock
│   ├── 03-man-hinh-hop-thu-tac-vu-va-giai-trinh-ton-kho.md # UI-ROLE-01-TASK: Persistent borrow tasks, aging justification
│   ├── 04-man-hinh-ebom-keo-tha-co-cau.md          # UI-ROLE-04-EBOM: Drag-and-drop slot mapping, Master Machine Template
│   ├── 05-man-hinh-dieu-phoi-lec-master-workbench.md # UI-ROLE-03-LEC: Batch processing, Target/Over tagging, 3-party bridge
│   ├── 06-man-hinh-giam-sat-leader-va-work-order.md # UI-ROLE-02-LEAD: Team/Part monitoring, aging completion, zero approvals
│   ├── 07-man-hinh-tham-dinh-chi-phi-dau-thang.md   # UI-ROLE-06-AUDIT: Reviewer audit (Days 01-05), Cost Clearance CC-HW-PASS
│   ├── 08-man-hinh-dashboard-tong-quan-toan-xuan.md # UI-COMMON-08-DASH: 7-stage funnel, 3-axis SG budget, Over distribution
│   └── 09-man-hinh-cai-dat-he-thong-va-gateway-ems.md # UI-ADMIN-09-SYS: Organization, Floor rule, Token Bucket EMS gateway
│
├── 06-process-workflows-and-diagrams/          # TASK 6: End-to-End Process Workflows & Sequence Diagrams
│   ├── 01-end-to-end-procurement-workflow.md   # End-to-end swimlane workflow across all actors
│   ├── 02-inter-entity-transfer-workflow.md    # 3-Tier Waterfall Interlock Resolution & Transfer vs. Buy
│   ├── 03-rfq-and-purchase-tracking-flow.md    # Vendor confirm, ETA & monthly expense allocation sequence
│   ├── 04-target-vs-over-evaluation-flow.md    # Decision tree for LEC manual classification (Target vs. Over)
│   ├── 05-monthly-offline-audit-workflow.md    # Beginning-of-Month audit process, aging review & 3-party clarification loop
│   └── 06-chi-tiet-flow-tien-do-tung-cong-doan.md # Definitive 9-Step detailed progression specification
│
└── 07-integration-and-api-specs/               # TASK 7: EMS Nexacro Integration & REST API v1 Contracts
    ├── 01-ems-nexacro-integration-strategy.md  # Nexacro protocol, holdReasonContent, Phase 1 & 2 rollout
    └── 02-ops-workflow-api-contracts.md        # REST API v1 OpenAPI contracts, JSON schemas & Docker setup
```

---

## 3. Core Workflow Architecture & Visual Deliverables

| Deliverable Asset | File Path | Format & Description |
| :--- | :--- | :--- |
| **English Master PlantUML Diagram** | [`procurement-item-registration-flow.puml`](file:///home/longp/projects/company/ops-workflow/procurement-item-registration-flow.puml) | Definitive 9-step activity diagram across 5 swimlanes (Modern PlantUML syntax) |
| **Real-time PlantUML Generator CLI** | [`scripts/generate_puml.py`](file:///home/longp/projects/company/ops-workflow/scripts/generate_puml.py) | Python CLI tool (`--watch` mode) generating instant SVG and PNG renders |
| **Real-time Interactive Flow Viewer** | [`procurement-flow-viewer.html`](file:///home/longp/projects/company/ops-workflow/procurement-flow-viewer.html) | Standalone interactive web viewer (UML flowchart + SVG switcher + PNG download) |
| **Rendered Vector Graphic** | [`procurement-item-registration-flow.svg`](file:///home/longp/projects/company/ops-workflow/procurement-item-registration-flow.svg) | High-definition scalable vector graphic of the 9-step procurement flow |
| **Rendered High-Res Graphic** | [`procurement-item-registration-flow.png`](file:///home/longp/projects/company/ops-workflow/procurement-item-registration-flow.png) | High-resolution raster image for print & offline distribution |
| **Master System Architecture** | [`MASTER-SYSTEM-SPECIFICATION.md`](file:///home/longp/projects/company/ops-workflow/procurement-system/MASTER-SYSTEM-SPECIFICATION.md) | Single Source of Truth architecture and system specifications |
