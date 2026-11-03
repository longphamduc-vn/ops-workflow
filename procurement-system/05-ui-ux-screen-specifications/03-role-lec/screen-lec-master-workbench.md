# Role-Specific Interface: Line Equipment Coordinator (LEC) within Team
> **Screen Code: UI-ROLE-03 — LEC Master Engineering, Sourcing & Progress Workbench**  
> *Dedicated to: Equipment Management Engineers (Line Equipment Coordinator - Multi-LEC: Pham Duc Long - 658359 and peers) within the Team*

---

## 1. LEC Workspace Anatomy

The **LEC Master Workbench** interface serves as the central hub for engineering coordination, equipment management, interlock verification, and procurement progress tracking across the entire Team:
1.  **Status-Based Batch Grouping**: Aggregates all registered line items from field engineers across the Team (peer engineers, no process/stage hierarchy), automatically grouping items by uniform status for efficient batch processing.
2.  **3-Party Clarification Bridge Post Beginning-of-Month Audit**: Receives clarification inquiries from the Reviewer (Cost Management) $\rightarrow$ inputs requests into the system to dispatch to the responsible Engineer $\rightarrow$ collects feedback and evidence from the Engineer $\rightarrow$ consolidates and submits back to the Reviewer to finalize cost verification.
3.  **Manual Receiving & Inbound Delivery Progress Control**: Monitors inbound PO part quantities (`po_remained_qty` / `notReceivingQty` from EMS) and **manually logs actual physical delivery progress** (vendor confirmation date, ETA, actual receipt date, received quantity, and physical condition). Note that physical receipt validation is tracked on EMS; this system monitors Vendor Confirm Date, ETA, and Monthly Expense Allocation Plans.
4.  **Interlock Coordination & `agingInterlockFlag` Resolution**:
    - When `agingInterlockFlag == 'Y'`: Warns of long-term aging inventory, **which may belong to a peer team** $\rightarrow$ Does not demand justification from the engineer, but **prioritizes issuing an inventory transfer/borrow request to consume this peer stock before purchasing new**. The system maintains a persistent mandatory task to borrow/use peer team stock before purchasing; it auto-closes only when an EMS re-sync confirms the flag is `'N'`.
    - `unitPriceFlag`: Verifies whether the part has an active contracted price (`Y`) or lacks valid pricing (`N`, pending RFQ).
5.  **End-of-Life (EOL) Classification**: When EMS still indicates `ACTIVE` but the manufacturer has actually discontinued production, the LEC has the authority to tag the item as `Discontinued / End of Life (EOL)` and feedback the engineer to select an equivalent replacement part.
6.  **14-Character EM No Registration & QCode Data Intake**: Engineers submit CAD/Doc/image technical data packages $\rightarrow$ LEC retrieves the package to register the official QCode on external ERP/EMS systems, then updates the official QCode back to the system (Stage 1). (MANDATORY official QCode for Beginning-of-Month Audit; temporary `TMP-HW-xxxx` codes are strictly blocked from audit. Folder upload is data-prep for QCode registration, not audit).
7.  **Procurement Plan Classification Tagging**: The LEC manually assigns `🟢 WITHIN TARGET` or `🔴 OVER UNBUDGET` based on engineer justifications and budget ceilings (strictly NO auto-classification).
8.  **Monthly Manual SG Budget Entry & Strict No-Rollover Policy**: Manually enters the SG Budget cap at the beginning of each month; each month is closed individually, with strictly no rollover of unused balances.
9.  **Bypassing Internal Approval Workflows**: Official approvals are executed exclusively on EMS; this application strictly manages progress tracking (no approval buttons on this system).

---

## 2. Detailed UI Wireframe (ASCII)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [OPS LOGO]  LEC COORDINATION WORKBENCH — FACTORY HW (SMART WATCH)         [🔔 3 Pending Reviewer Clarifications] [👤 Pham Duc Long] │
│ Unit: PO Module Tech Team 2 | Role: LEC Master (Multi-LEC enabled)       Config: No-Rollover Budget | Audit: BEGINNING OF MONTH  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ LEC WORKBENCH MODULES:                                                                                                           │
│ [📥 TAB 1: BATCH GROUPING & STATUS]  [⚡ TAB 2: INTERLOCK & PEER TEAM STOCK]  [💬 TAB 3: REVIEWER-ENGINEER BRIDGE]  [📦 TAB 4: MANUAL RECEIVING PROGRESS]│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📌 ACTIVE VIEW: TAB 1 — REQUISITION BATCH GROUPING & UNIFORM STATUS PROCESSING                                                   │
│                                                                                                                                  │
│ 1.1. SYSTEM STATUS BATCH FILTERS:                                                                                                │
│  [🔘 ALL (184)]   [⏳ NEW REGISTRATIONS (42)]   [🟢 READY TO ORDER (95)]   [🌐 PEER TEAM / CROSS-PN STOCK (31)]   [⚠️ EOL / DISUSED (16)]│
│                                                                                                                                  │
│ 1.2. BATCH GROUPING LINE ITEM TABLE:                                                                                             │
│ ┌──┬───┬──────────────┬──────────────┬─────────────┬──────────┬──────────┬──────────┬──────────┬─────────────────────────────┐ │
│ │☑ │No.│ Machine &    │ QCode /      │ Spare Part  │ Block    │ Status   │ Plan Tag │ Next     │ LEC Action                  │ │
│ │  │   │ Mech (EMNo)  │ Temp Code    │ & Requestor │ (stopPo) │          │ Target/Ov│ Step     │ Handling                    │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 1 │ DB-01 / Mech │ QDAB03583    │ Photo Sensor│ 🟢 N     │🟢 READY  │[🔘 WITHIN│Beg-of-Mo │[📦 CONSOLIDATE INTO AUDIT   │ │
│ │  │   │ HWBMTL21EC010│ PANASONIC    │ N.V.Thang   │ (Price:Y)│ TO ORDER │  TARGET] │Audit     │   REPORT (BEG-OF-MONTH)]    │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 2 │ DB-01 / Head │ QDAD12236    │ Power Board │ 🟢 Active│🟢 READY  │[🔘 OVER  │Audit w/  │[📦 CONSOLIDATE INTO AUDIT   │ │
│ │  │   │ HWBMTL21EC020│ TRUMPF (SPR) │ N.V.Thang   │ Unlocked │ TO ORDER │ UNBUDGET]│  OVR-01  │   REPORT (BEG-OF-MONTH)]    │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 3 │ TAB-02 / Cut │ QCAD38190    │ Dual Cylinder│🟡 aging │⚠️ PEER   │—         │Prioritize│[🔄 Create Borrow/Transfer   │ │
│ │  │   │ HWBMTL22EC010│ SMC          │ L.H.Quan    │ Interlock│TEAM STOCK│          │use stock │   Slip for Team 1 Stock]    │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 4 │ POL-01 / In  │ QCAB99120    │ Servo Driver│ ⚪ N     │⚠️ MAKER  │—         │Feedback  │[🏷️ TAG AS EOL & SEND        │ │
│ │  │   │ HWBMTL26EC010│ OMRON        │ T.D.Minh    │(EMS: Act)│   EOL    │          │for alt   │   FEEDBACK TO ENGINEER]     │ │
│ └──┴───┴──────────────┴──────────────┴─────────────┴──────────┴──────────┴──────────┴──────────┴─────────────────────────────┘ │
│  BATCH ACTIONS:                                                                                                                  │
│  [📦 CONSOLIDATE ALL 95 'READY TO ORDER' ITEMS TO AUDIT WORKBENCH]   [⚡ BATCH MARK AS WITHIN TARGET]   [🏷️ CLASSIFY AS EOL]        │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tab 3 Detail: 3-Party Clarification Bridge (Cost Management <-> LEC <-> Engineer)

Following the beginning-of-month audit meeting, if the Reviewer (Cost Management) requests additional justification or documentation:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 💬 TAB 3: RECEIVE CLARIFICATION REQUESTS FROM COST MANAGEMENT & COORDINATE ENGINEER FEEDBACK                                     │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ LIST OF 3 ITEMS REQUIRING CLARIFICATION FROM REVIEWER:                                                                           │
│ ┌────┬─────────────┬──────────────────────────┬──────────────┬────────────────────────────┬───────────────┬────────────────────┐ │
│ │No. │Item / PR ID │Spare Part Name           │Responsible   │Reviewer Inquiry            │Status         │LEC Action          │ │
│ │    │             │                          │Engineer      │(Cost Management)           │               │                    │ │
│ ├────┼─────────────┼──────────────────────────┼──────────────┼────────────────────────────┼───────────────┼────────────────────┤ │
│ │ 1  │PR-2611-0089 │CPX V4 Trumpf Power Board │Nguyen Van    │"Provide night-shift        │🟢 Engineer has│[👁️ Review & Forward│ │
│ │    │QDAD12236    │(Machine DB-01 - Over     │Thang (Part 1)│ lightning surge damage     │   submitted   │   to Reviewer]     │ │
│ │    │             │ $3,150)                  │              │ inspection report & photos"│   evidence    │                    │ │
│ ├────┼─────────────┼──────────────────────────┼──────────────┼────────────────────────────┼───────────────┼────────────────────┤ │
│ │ 2  │PR-2611-0094 │MXQ16-100B Slide Cylinder │Le Hoang Quan │"Explain why Team 1 spare   │⏳ Pending     │[🔔 Urge Engineer   │ │
│ │    │QCAD38190    │(Machine TAB-02 - $220)   │(Part 1)      │ inventory was not borrowed/│   engineer    │   for Urgent Reply]│ │
│ │    │             │                          │              │ transferred?"              │   response    │                    │ │
│ └────┴─────────────┴──────────────────────────┴──────────────┴────────────────────────────┴───────────────┴────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Tab 4 Detail: Manual Receiving & Inbound Delivery Progress Control (Manual Receiving Progress)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📦 TAB 4: MANUAL GOODS RECEIPT & DELIVERY PROGRESS TRACKING                                                                      │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ VENDOR DELIVERY PROGRESS TRACKING TABLE (RECONCILED WITH NOT_RECEIVING_QTY FROM EMS):                                            │
│ ┌────┬─────────────┬───────────┬──────────────┬────────────┬─────────────┬─────────────┬─────────────┬───────────────────────────┐ │
│ │No. │PO / PRV Code│QCode      │Spare Part    │Ordered Qty │PO Remained  │Actual       │Actual       │Receiving Progress Update  │ │
│ │    │(From EMS)   │           │Name          │(Order Qty) │(Unreceived) │Received Qty │Arrival Date │Action (LEC / Requestor)   │ │
│ ├────┼─────────────┼───────────┼──────────────┼────────────┼─────────────┼─────────────┼─────────────┼───────────────────────────┤ │
│ │ 1  │854730-1-1   │QDAD12236  │Power Board   │1 EA        │1 EA         │[ 1 ] EA     │[ 2026-11-04]│[💾 Save Progress Update]  │ │
│ │    │Emergency PO │           │CPX Trumpf    │            │             │             │             │↳ Delivered to HW Whse (H1-2F)│
│ ├────┼─────────────┼───────────┼──────────────┼────────────┼─────────────┼─────────────┼─────────────┼───────────────────────────┤ │
│ │ 2  │854812-1-2   │QDAB03583  │Photo Sensor  │10 EA       │10 EA        │[ 6 ] EA     │[ 2026-11-03]│[💾 Save Progress Update]  │ │
│ │    │Standard PO  │           │Panasonic     │            │             │             │             │↳ Vendor Batch 1 (4 bal.)  │ │
│ └────┴─────────────┴───────────┴──────────────┴────────────┴─────────────┴─────────────┴─────────────┴───────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
