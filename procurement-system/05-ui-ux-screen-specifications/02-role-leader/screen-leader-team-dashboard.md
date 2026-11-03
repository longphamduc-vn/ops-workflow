# Role-Specific Workspace: Management Leader (Team / Part Leader)
> **Screen ID: UI-ROLE-02 — Leader Team Monitoring Dashboard**  
> *Dedicated to: Part Leaders and Team Leaders overseeing internal procurement progress within Factory HW (Smart Watch).*  
> *Core Principles: No process hierarchy (peer engineers within Part), Elimination of system approval buttons (all approvals occur on EMS — this system STRICTLY MONITORS PROGRESS), monitoring of inventory aging justification progress and expense allocation.*

---

## 1. Leader Workspace Anatomy

The Leader Dashboard is specially designed for management to gain a comprehensive overview of internal procurement spend following the actual organizational hierarchy:

$$\mathbf{Team\ (Department)} \Longrightarrow \mathbf{Part\ (Section)} \Longrightarrow \mathbf{Field\ Engineers\ (Peers)}$$

The interface consists of **3 Core Functional Tabs**:
1.  **Tab 1: 📊 Team Spend & Budget Overview**: Monthly SG budget commitment gauge, ratio of **🟢 WITHIN TARGET (Standard Quota)** vs **🔴 INCIDENTAL OVER (Breakdowns / Abnormal)** classified manually by LEC, and procurement progress ranking across production lines (`Line #201` ~ `#210`, `#601`, `#604`).
2.  **Tab 2: 📋 Internal Team Procurement Progress Monitor**: Comprehensive list of purchase requests from supervised engineers, tracking milestones: *QCode Data Prep $\rightarrow$ Awaiting Month-Start Appraisal $\rightarrow$ RFQ in Progress $\rightarrow$ Submitted to EMS $\rightarrow$ Awaiting Delivery*. Integrated modal for **Viewing Technical Details & Incident Data** *(Strictly no approval buttons; official approvals take place on EMS)*.
3.  **Tab 3: 📈 Inventory Justification Progress & Cross-Team Stock Alerts**: 
    *   Track completion progress of engineers' **Beginning-of-Month Inventory Justification Tasks** prior to the LEC-configured deadline.
    *   Supervise **Cross-Team Stock Borrowing Tasks (`agingInterlockFlag`)** pending procedure completion on EMS.

---

## 2. Detailed ASCII UI Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  LEADER CONTROL CONSOLE — INTERNAL TEAM PROCUREMENT PROGRESS MONITOR   [🔔 3 Follow-ups Needed]  [👤 Tran Van B (Part Leader)]│
│ Scope: PO Module Tech Team 2 > CP/SG Part 1                                      Plant: Factory HW = Smart Watch (SW)           │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ FUNCTIONAL TABS:                                                                                                                 │
│ [📊 TAB 1: PROGRESS & BUDGET OVERVIEW]  [📋 TAB 2: REQUISITION PROGRESS MONITOR]  [📈 TAB 3: AGING TASKS FOLLOW-UP (3)]             │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📌 ACTIVE TAB: TAB 2 — INTERNAL TEAM PROCUREMENT PROGRESS MONITOR (PROGRESS TRACKING ONLY - NO APPROVALS)                         │
│                                                                                                                                  │
│ 2.1. SCOPE FILTERS:                                                                                                              │
│  Part: [ CP/SG Part 1 ▼ ]  Line: [ All Lines (#201..#205) ▼ ]  Machine: [ All Friendly Machines ▼ ]                              │
│  Engineer: [ All Engineers in Part ▼ ]  LEC Classification: [ All (Target & Over) ▼ ]  Milestone: [ All Milestones ▼ ]          │
│                                                                                                                                  │
│ 2.2. DETAILED PROGRESS MONITORING TABLE:                                                                                         │
│ ┌───┬───────────┬──────────────┬──────────────┬─────────────┬──────┬──────────┬──────────────┬──────────────────┬──────────────┐ │
│ │No.│ Requestor │ Machine Loc  │ Part &       │ Maker &     │ Qty  │ Est Unit │ LEC Plan     │ Actual Progress  │ Tracking     │ │
│ │   │ (Eng Name)│ (Line/Mach)  │ QCode        │ Model Spec  │      │ Price    │ Classify     │ Milestone        │ Action       │ │
│ ├───┼───────────┼──────────────┼──────────────┼─────────────┼──────┼──────────┼──────────────┼──────────────────┼──────────────┤ │
│ │ 1 │ Nguyen V.A│ Line #201    │ QDAD12236    │ TRUMPF      │ 1 EA │$3,150.00 │ 🔴 OVER      │ ⏳ Awaiting      │ [👁️ View Tech│ │
│ │   │ (ID:87021)│ Die Bonder 01│ Power Board  │ Model2912146│      │          │ Code: OVR-01 │   MONTH-START    │    Details]  │ │
│ │   │           │              │ CPX V4 Trumpf│ (Type: SPR) │      │          │ (LEC Marked) │   APPRAISAL      │              │ │
│ │   │           │              │              │             │      │          │              │ (Cost Management)│              │ │
│ ├───┼───────────┼──────────────┼──────────────┼─────────────┼──────┼──────────┼──────────────┼──────────────────┼──────────────┤ │
│ │ 2 │ Le Thi C  │ Line #202    │ QDAB03583    │ PANASONIC   │ 4 EA │$6.39     │ 🟢 WITHIN    │ 🚚 Vendor Confirm│ [👁️ View     │ │
│ │   │ (ID:87025)│ Tester 02    │ Optical      │ CN-73-C2    │      │          │    TARGET    │    Delivery 12/11│    Delivery] │ │
│ │   │           │              │ Sensor       │             │      │          │ (LEC Marked) │ (PO-2611-0089)   │              │ │
│ ├───┼───────────┼──────────────┼──────────────┼─────────────┼──────┼──────────┼──────────────┼──────────────────┼──────────────┤ │
│ │ 3 │ Tran V. D │ Line #201    │ TMP-HW-0104  │ SMC (Japan) │ 2 EA │$220.00   │ —            │ 📁 Preparing     │ [👁️ View     │ │
│ │   │ (ID:87028)│ Die Bonder 01│ Precision    │ MXQ16-100B  │      │(Awaiting │ (Target/Over │    QCode Data    │    Folder    │ │
│ │   │           │              │ Dual Slide   │ (Temp code) │      │ RFQ)     │  Not Assessed│ (Wait ERP Reg)   │    Data]     │ │
│ └───┴───────────┴──────────────┴──────────────┴─────────────┴──────┴──────────┴──────────────┴──────────────────┴──────────────┘ │
│  ↳ System Notice: All official approvals take place on EMS. The Leader Dashboard strictly serves internal progress control.        │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modal Window: Technical Details & Incident Data (No Approval Buttons)

When the Leader clicks **`[👁️ View Tech Details]`** on row 1:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔍 PROGRESS DETAILS & TECHNICAL DATA — PURCHASE REQUISITION REQ-2611-0012                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ MACHINE & INCIDENT INFORMATION PROVIDED BY ENGINEER:                                                       │
│ • Equipment Location:  Line #201 (Floor 2F) > Die Bonder DB-01 > Bonding Head Unit                         │
│ • Work Order No.:      WO-248926091 (Created: 2026-11-02 21:15:00 by Engineer Nguyen Van A)                │
│ • System Error:        ALARM E-502: MAIN_POWER_SUPPLY_FAILURE (Heating power supply burnout)                │
│ • Equipment Code:      Linked Equipment Management ID: HWBMTL21EC0101 (Classification: SPR)               │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ FIELD PHOTOS & TECHNICAL DOSSIER RECONCILIATION:                                                           │
│ ┌──────────────────────────────────────┬────────────────────────────────────────────────────────────────┐  │
│ │ [FIELD PHOTO OF BURNT BOARD]         │ [FDM CAD ASSEMBLY DRAWING]                                     │  │
│ │ 🖼️ Black scorch mark at capacitor    │ 📐 Installation location: Bonding Head Unit 01, behind cover #3│  │
│ │   C14; signal cable melted at edge   │ CAD Link: fdm.lgdisplay.com/drawings/QDAD12236.dwg             │  │
│ └──────────────────────────────────────┴────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ LEC PROCESSING INFORMATION & PROGRESS:                                                                     │
│ • Plan Classification:  🔴 INCIDENTAL OVER (Reason: OVR-01 - Unexpected machine breakdown)                 │
│ • Appraisal Progress:   Included in Beginning-of-Month Appraisal list with Cost Management (1 person)     │
│ • Contract Price Flag:  unitPriceFlag = Y (ServeOne contract unit price: $3,150.00 USD)                    │
│ • Leader Internal Note: [ Night shift inspected; agree with engineer preparing appraisal justification ]   │
│                                                                                                            │
│ [💬 Message Engineer]                   [💬 Discuss with LEC]                   [✖️ Close Window]          │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Leader Supervision Permission Matrix

| Management Level | Data Scope | Operational Authority |
| :--- | :--- | :--- |
| **Part Leader** | Monitors all procurement progress of Engineers within the Part (e.g., `CP/SG Part 1`). Engineers in Part are peers without process hierarchy. | Track technical progress, urge engineers to complete beginning-of-month aging justifications and cross-team stock borrowing tasks. *(No approvals on app)*. |
| **Team Leader** | Comprehensive view of progress across all Parts in the Team (`PO Module Technology Team 2`) and the LEC group. | Supervise total monthly SG budget ceiling ($33\%-33\%-34\%$ - No Rollover), monitor monthly expense allocation plans. *(No approvals on app)*. |
