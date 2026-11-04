# 01. End-to-End Procurement Progress Workflow
> *Procurement progress tracking architecture for Factory HW (Smart Watch) spare parts*  
> *Core Principles: The new system tracks progress ONLY (NO APPROVALS); All financial budget sign-offs occur exclusively on Nexacro EMS Core; No Warehouse Portal (issuance synced from EMS); Peer engineers in Part/Team; BEGINNING-OF-MONTH audit with Cost Management (1 single person); 3-party clarification loop; Mandatory official QCode for audit; 3-Tier waterfall execution (Transfer -> Internal PO -> External PO).*

---

## 1. Swimlane Sequence Diagram (9-Step Lifecycle)

```mermaid
sequenceDiagram
    autonumber
    actor REQ as 1. Field Engineer (Requestor)
    actor LEC as 2. Equipment Coordinator (LEC - Mediator)
    actor PUR as 3. Procurement Dept (Purchase)
    actor CST as 4. Cost Management (Single Reviewer)
    participant SYS as Operational Tracking Platform
    participant EMS as 5. Core LG Display Nexacro EMS
    actor SISTER as 6. Sister Entity / Peer Plant Warehouse

    %% Step 1: Equipment Hierarchy & Template
    REQ->>SYS: Step 1: Select 4-tier hierarchy (Line > Machine > Unit > Assembly)
    Note over REQ,SYS: Left(Line,1)=Floor • Master Machine Template clone

    %% Step 2: Item Registration (Existing vs New TMP)
    alt Step 2A: Existing Item in Master Catalog
        REQ->>SYS: Scan/Search QCode via Omni-Search typeahead
        SYS-->>REQ: Auto-populate Description, Maker, Model, Contract Price UP001, Stock, CAD link
    else Step 2B: New Item Registration (No QCode)
        REQ->>SYS: Enter Category & Item Description + Drag-and-drop CAD/Spec folder
        SYS-->>REQ: Issue temporary code TMP-HW-xxxx (LOCK: costBlocked = true)
        SYS-->>LEC: Transmit data package for LEC to register official QCode on ERP
    end

    %% Step 3 & 4: Requisition Context & Automated 4-Dimension Interlock Scan
    REQ->>SYS: Step 3: Enter Request Qty, Usage Reason (Setup/CIP/Breakdown/PM), Logic & Urgent Flag
    SYS->>SYS: Step 4: Automated 4-Dimension Interlock Scan (<50ms)
    Note over SYS: 1. Price UP001/UP004 | 2. Aging Stock >30d | 3. Sister Entity Stock | 4. Price Disparity

    %% Step 5: Collaborative Dialogue (LEC <-> Requestor)
    SYS-->>LEC: Step 5: Route Requisition & Interlock Dashboard (UI-LEC-01)
    LEC->>REQ: Open 2-way dialogue: question quantity, downtime severity, aging stock
    REQ-->>LEC: Provide failure photos, incident report, spec incompatibility justification

    %% Step 6: Technical Evaluation, Batching & Financial Tagging
    alt Meets technical compliance?
        LEC->>SYS: Step 6: Qualify request (LEC_QUALIFIED) & Batch for monthly review
        LEC->>SYS: Assign 14-char EM No (HWBMTL21EC0101)
        LEC->>SYS: Manual Financial Tagging: [TARGET] vs. [OVER] (Mandatory OVR-01..06 & Work Order)
    else Non-compliant
        LEC->>REQ: Reject & return for revision or cancel
    end

    %% Step 7: Monthly Offline Audit & LEC Mediation (Days 01-05)
    Note over LEC,CST: BEGINNING OF MONTH (DAYS 01-05): OFFLINE COST AUDIT
    CST->>SYS: Step 7: Convene Offline Audit (UI-CST-01)
    alt Item bears temporary code TMP-HW-xxxx?
        SYS-->>CST: 🛑 HARD-BLOCK GATE TRIGGERED: Audit Rejection!
        CST-->>LEC: Reject audit until official ERP QCode is assigned
    else Formal QCode verified
        opt Reviewer raises cost or OVER inquiries
            CST->>LEC: Dispatch inquiry ticket via 3-party mediation bridge
            LEC->>REQ: Coordinate supplemental engineering justification & test logs
            REQ-->>LEC: Submit evidence
            LEC-->>CST: Submit synthesized technical defense report
        end
        CST->>SYS: Confirm offline audit completion
    end

    %% Step 8: Purchase List Clearance & Cost Clearance Certificate
    CST->>SYS: Step 8: Finalize procurement roster & issue Cost Clearance (CC-HW-YYYYMM-PASS)
    Note over SYS: Freeze monthly list • Strict No-Rollover Policy (surplus resets to $0)

    %% Step 9: 3-Tier Waterfall Interlock Resolution
    rect rgb(240, 253, 244)
        Note over LEC,EMS: STEP 9: 3-TIER WATERFALL INTERLOCK RESOLUTION
        alt TIER 1: Inter-Entity Transfer (Priority 1)
            SYS->>SISTER: Request idle inventory transfer
            alt Sister Entity Approves
                SISTER-->>SYS: Issue warehouse transfer voucher
                SYS-->>REQ: Physical parts received at plant (Zero CAPEX) -> COMPLETED
            else Sister Entity Rejects (Stock reserved)
                SYS->>SYS: Fall through to Tier 2
            end
        end
        
        alt TIER 2: Inter-Company Purchase Order (Internal PO - Priority 2)
            SYS->>SISTER: Issue Internal PO under group framework contract
            alt Corporate Finance Approves
                SISTER-->>SYS: Issue internal invoice & freight shipment -> COMPLETED
            else Corporate Finance Rejects
                SYS->>SYS: Fall through to Tier 3
            end
        end

        alt TIER 3: External Purchase Order via Nexacro EMS Core (Priority 3)
            PUR->>SYS: Negotiate lowest qualified market quotation
            SYS->>EMS: Interface requisition data -> Create PRV on EMS Core
            Note over EMS: Leadership signs electronic approval 100% ON NEXACRO EMS CORE
            EMS-->>SYS: Synchronize official Purchase Order (PO-99xxx)
            LEC->>SYS: Track 3 Inbound Milestones: Vendor Confirm Date, Port ETA, Customs Clearance
            EMS-->>SYS: Warehouse receives goods on EMS
            REQ->>EMS: Draw parts and install on machine under Work Order (WO-xxxx)
            EMS-->>SYS: Synchronize warehouse issue log (ds_Inv) -> Cost posted to manufacturing accounting
        end
    end
```

---

## 2. Requisition Lifecycle State Machine

The system tracks progress across transparent operational states:

```mermaid
stateDiagram-v2
    [*] --> DRAFT_TMP : New part without QCode (costBlocked = true)
    [*] --> DRAFT_ACTIVE : Existing part with QCode
    
    DRAFT_TMP --> DRAFT_ACTIVE : LEC registers official QCode on ERP
    DRAFT_ACTIVE --> CROSS_TEAM_STOCK : Aging / Peer Stock Interlock triggered
    DRAFT_ACTIVE --> RFQ_WAITING : No contract price (UP004)
    DRAFT_ACTIVE --> LEC_QUALIFIED : Scan passed & technical review qualified
    
    CROSS_TEAM_STOCK --> LEC_QUALIFIED : Borrow task completed or unlocked
    RFQ_WAITING --> LEC_QUALIFIED : Quoted & price confirmed
    
    LEC_QUALIFIED --> COST_AUDIT : Batched into Monthly Audit (Days 01-05)
    COST_AUDIT --> CLEARED : Passed Audit & Cost Clearance Certificate issued (CC-HW-PASS)
    COST_AUDIT --> DRAFT_ACTIVE : Inquiry clarification required / rejected
    
    CLEARED --> TRANSFER_PENDING : Tier 1: Inter-Entity Transfer
    TRANSFER_PENDING --> ISSUED : Transfer approved & parts installed
    TRANSFER_PENDING --> INTERNAL_PO_PENDING : Transfer rejected -> Tier 2
    
    INTERNAL_PO_PENDING --> ISSUED : Internal PO approved & parts installed
    INTERNAL_PO_PENDING --> EMS_APPROVED : Internal PO rejected -> Tier 3 External PO
    
    EMS_APPROVED --> INBOUND_TRACKING : PO-99xxx issued on Nexacro EMS
    INBOUND_TRACKING --> ISSUED : Goods received & ds_Inv synchronized
    
    ISSUED --> FREEZE_CLOSED : Month-end close (Surplus = $0, No-Rollover)
    FREEZE_CLOSED --> [*]
```

---

## 3. Sequential Architectural Rules

1. **No PO Release for Temporary Codes (`TMP-HW-xxxx`)**:
   - Requisitions bearing temporary codes remain strictly in `DRAFT_TMP` with `costBlocked = true`.
   - Cannot enter Step 7 Cost Audit nor generate EMS PRVs.
2. **Dedicated LEC Mediation Bridge**:
   - Reviewer never interacts directly with field engineers during the audit. All inquiry dispatches route through LEC.
3. **Execution strictly follows the 3-Tier Waterfall**:
   - $\text{Tier 1: Transfer} \xrightarrow{\text{Reject}} \text{Tier 2: Internal PO} \xrightarrow{\text{Reject}} \text{Tier 3: External PO on Nexacro Core}$.
4. **All Financial Approvals 100% on Nexacro EMS Core**:
   - The web platform provides intelligence, progress tracking, and audit collaboration, but PRV/PO approvals take place exclusively within the Nexacro EMS Core binary.
