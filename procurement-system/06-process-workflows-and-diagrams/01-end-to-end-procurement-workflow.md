# 01. End-to-End Procurement Progress Workflow
> *Procurement progress tracking architecture for Factory HW (Smart Watch) spare parts*  
> *Core Principles: The new system tracks progress ONLY (NO APPROVALS); All financial budget sign-offs occur exclusively on EMS; No Warehouse Portal (issuance synced from EMS); Peer engineers in Part/Team; BEGINNING-OF-MONTH audit with Cost Management (1 single person); 3-party clarification loop; Mandatory official QCode for audit; Manual entry for Vendor Confirm Date / ETA tracking.*

---

## 1. Swimlane Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor REQ as 1. Field Engineers (Peers)
    actor LDR as 2. Part / Team Leader
    actor LEC as 3. Spare Parts LEC (Pham Duc Long)
    actor PUR as 4. Purchase Specialist
    actor CST as 5. Cost Management (Single Reviewer)
    participant SYS as New Progress Tracking System
    participant EMS as 6. Core LG Display EMS

    %% Phase 1: Data Preparation & Requisition Creation
    opt New spare part registration without QCode
        REQ->>SYS: Drag & drop CAD/Doc/Image folder -> Enter preliminary specs (Temporary code TMP-HW-xxxx)
        SYS-->>LEC: Forward technical data for LEC to register QCode on ERP/EMS
        LEC->>EMS: Register official QCode externally on ERP/EMS
        LEC->>SYS: Update official QCode replacing temporary TMP code
    end

    REQ->>SYS: Create purchase request (Friendly machine name, standard QCode, quantity, Work Order)
    alt Cross-team aging stock detected (agingInterlockFlag == 'Y')
        SYS-->>REQ: ⚠️ Trigger INSTANT WARNING Banner & Open Mandatory Task to borrow/use existing stock
        Note over REQ,SYS: Stock borrow task PERSISTS MANDATORILY until EMS re-sync confirms 'N'
    end

    %% Phase 2: Leader Monitoring & LEC Requisition Consolidation
    SYS-->>LDR: Display internal Part/Team procurement progress (Monitoring only, no approval buttons)
    SYS-->>LEC: Team-wide consolidation queue & 4-step Interlock scan
    LEC->>SYS: Set justification deadlines & manually flag [IN TARGET] or [OVER UNPLANNED]

    %% Phase 3: RFQ Coordination with Purchase
    alt unitPriceFlag == 'N' (No contract price available)
        LEC->>PUR: Send technical specs requesting RFQ
        PUR-->>LEC: Negotiate with vendor, return quotation
        LEC->>SYS: Update preliminary unit price & RFQ progress
    end

    %% Phase 4: Beginning-of-Month Audit & 3-Party Clarification Loop
    Note over LEC,CST: BEGINNING OF MONTH (DAYS 01-05): COST MANAGEMENT AUDIT
    LEC->>SYS: Close beginning-of-month audit dossier (Consolidate ONLY items with OFFICIAL QCODE)
    LEC->>CST: Offline cost audit review (Review SG budget No-Rollover & Over list)
    opt Cost Management Reviewer requires clarification
        CST->>SYS: Enter clarification request on Audit interface
        SYS-->>LEC: Notify clarification request from Reviewer
        LEC->>SYS: Assign & coordinate task to machine-responsible Engineer
        SYS-->>REQ: Receive clarification query on Tab 4
        REQ->>SYS: Update technical evidence (photos, incident reports)
        SYS-->>LEC: Engineer responded
        LEC->>SYS: Consolidate documentation & Resubmit to Cost Management Reviewer
        CST->>SYS: Reviewer confirms offline audit completion
    end

    %% Phase 5: Official Approval & PO Issuance on EMS
    LEC->>EMS: Create PRV No on EMS (Attach audit minutes)
    Note over EMS: Cost Management (Reviewer - 1 single person) signs off official approval ON EMS
    LEC->>SYS: Enter PRV No into system to begin progress synchronization
    EMS-->>SYS: Synchronize issued PO No status

    %% Phase 6: Delivery Tracking & Warehouse Issuance
    LEC->>SYS: Manually enter tracking milestones: Vendor Confirm delivery date, Factory ETA, Expense allocation plan
    EMS-->>SYS: Read actual goods receipt data (Goods Receipt completed on EMS)
    REQ->>EMS: Engineer completes warehouse issuance procedure on EMS to draw parts for machine installation
    EMS-->>SYS: Automatically synchronize warehouse issuance data (Issue Expense) & Record actual costs
```

---

## 2. Requisition Lifecycle State Machine

The system tracks progress across 8 transparent states:

```mermaid
stateDiagram-v2
    [*] --> DRAFT_DATA_PREPARATION: Engineer submits CAD/Doc/Image folder (Temporary code TMP-HW-xxxx)
    DRAFT_DATA_PREPARATION --> QCODE_REGISTERED: LEC registers official QCode on ERP/EMS
    
    QCODE_REGISTERED --> INTERLOCK_SCANNING: Run Interlock scan, evaluate agingInterlock & unitPrice flags
    
    state INTERLOCK_SCANNING {
        [*] --> HAS_OTHER_TEAM_STOCK: agingInterlockFlag = Y
        HAS_OTHER_TEAM_STOCK --> PERSISTENT_TASK_BORROW: Open mandatory stock borrow task (Blocked until EMS = 'N')
        PERSISTENT_TASK_BORROW --> READY_FOR_AUDIT: EMS updates to 'N'
        [*] --> READY_FOR_AUDIT: agingInterlockFlag = N
    }
    
    READY_FOR_AUDIT --> MONTHLY_AUDIT_PENDING: LEC consolidates list & manually classifies Target/Over
    MONTHLY_AUDIT_PENDING --> THREE_WAY_CLARIFICATION: Cost Management Reviewer requests clarification
    THREE_WAY_CLARIFICATION --> MONTHLY_AUDIT_PENDING: Engineer responds via LEC
    
    MONTHLY_AUDIT_PENDING --> EMS_PRV_PROCESSING: Beginning-of-month audit completed -> LEC creates PRV on EMS
    EMS_PRV_PROCESSING --> PO_TRACKING_PROGRESS: PRV/PO approved on EMS -> LEC enters Vendor Confirm & ETA
    PO_TRACKING_PROGRESS --> RECEIVED_IN_EMS: Goods received (Synced from EMS)
    RECEIVED_IN_EMS --> ISSUED_FROM_EMS: Engineer issues parts from warehouse (Issue synced from EMS)
    ISSUED_FROM_EMS --> [*]
```

---

## 3. Immutable Operational Principles

1. **Strictly No Approvals on the New System**:
   - The new system serves solely as a "Progress Tracking & Technical Data Control Dashboard". All legal, administrative, and financial approvals must take place on **LG Display Nexacro EMS**.
2. **Complete Elimination of Warehouse Portal**:
   - Warehouse personnel do not use this application. Inventory movements, physical receipts, and material issuance are read automatically through EMS integration APIs.
3. **Mandatory Prerequisite for Cost Audit**:
   - Requisitions strictly require an **Official QCode**. Any new spare parts retaining temporary codes (`TMP-HW-xxxx`) remain in the data preparation stage and are strictly excluded from the beginning-of-month audit.
4. **Cross-Team Aging Stock Warning is a Mandatory Task**:
   - While engineers do not need to submit delayed issuance justifications, they are mandated to prioritize borrowing and utilizing stock available in peer teams. This task cannot be closed manually; it automatically resolves only when the system re-syncs with EMS and confirms the flag is `'N'`.
