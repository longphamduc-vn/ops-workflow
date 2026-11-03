# Universal Screen: Universal Progress & Analytics Dashboard
> **Screen ID: UI-COMMON-00 — Universal Progress & Operations Analytics Dashboard**  
> *Shared operational screen across Factory HW (Smart Watch): Team Leader, Part Leader, LEC, Cost Management, and Engineers (with role-scoped data views).*

---

## 1. Objective & Dashboard Anatomy

The Universal Progress Dashboard serves as the **real-time operations intelligence control tower**, unifying information across all stages: Demand registration, Beginning-of-Month cost appraisal, Inter-entity transfer coordination, Purchase quotation, Manual goods receipt, EMS warehouse issuance, and SG budget accounting.

The interface is structured into **5 Critical Analytic Blocks**:
1.  **Block 1: Procurement Pipeline & Progress Funnel**:
    *   Tracks the entire lifecycle progress: `Demand Registration` $\rightarrow$ `LEC Batching & Interlock Processing` $\rightarrow$ `BEGINNING-OF-MONTH COST APPRAISAL` $\rightarrow$ `EMS Approval` $\rightarrow$ `PO Issuance / Purchase Quotation` $\rightarrow$ `HW Goods Receipt (Manual Update)` $\rightarrow$ `Machine Assembly Issuance (EMS Sync)`.
    *   Key Metrics: Average cycle time (Cycle Time: days), On-Time Delivery rate (OTD %), and bottleneck alerts.
2.  **Block 2: Inventory KPIs & Aging Audit**:
    *   Total available inventory value at HW warehouse.
    *   Inventory Aging breakdown: `< 30 days`, `30 - 60 days`, `> 60 days (Dead stock warning)`.
    *   Completion rate of Field Engineers' **Beginning-of-Month Inventory Justification Tasks**.
3.  **Block 3: 3-Way SG Budget Balance (Budget vs Actual Spend - STRICTLY NO ROLLOVER)**:
    *   Visual 3-axis comparison: **Monthly Budget Allocation (LEC Manual Entry)** vs. **PO Commit Spend** vs. **Actual Issue Expense (from EMS)**.
    *   Reinforcing the core principle: Monthly allowances are strictly closed each month with no carryover of remaining balance.
4.  **Block 4: Over Root Cause Breakdown**:
    *   Within Target vs Unplanned Over ratio (Doughnut chart).
    *   Breakdown of the 6 Over reason codes (`OVR-01: Machine breakdown`, `OVR-02: Production volume surge`, `OVR-03: Transfer bottleneck`, `OVR-04: Model setup`, `OVR-05: Vendor price fluctuation`, `OVR-06: Handling error`).
5.  **Block 5: Detailed Over Contribution Matrix**:
    *   **PO Spend Over**: Specific list of newly purchased parts causing monthly committed spend to exceed the budget.
    *   **Issue Expense Over**: Specific list of parts issued for machine assembly exceeding standard consumption quotas (data read from EMS).

---

## 2. Detailed ASCII UI Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  OPERATIONS PROGRESS & ANALYTICS DASHBOARD — FACTORY HW (SMART WATCH)    [📅 Nov 2026] [👤 Pham Duc Long (LEC)]      │
│ Context: Factory HW (Smart Watch) > PO Module Tech Team 2 | Buildings: H1, H2, H3 | Production Lines: Line #201..#210, #601, #604      │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ MULTI-DIMENSIONAL FILTER TOOLBAR (OMNI-FILTERS):                                                                                 │
│ Month Period: [ Nov 2026 ▼ ]  Team: [ PO Module Tech Team 2 ▼ ]  Line: [ All (#201..#604) ▼ ]  Classification: [ All ▼ ]       │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. PROCUREMENT PROGRESS & FUNNEL CYCLE (PROCUREMENT FUNNEL & PROGRESS PIPELINE):                                                 │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 📥 Requisitions (64) ➔ ⚡ Interlock (58) ➔ ⚖️ MONTH-START AUDIT (52) ➔ 🛒 EMS Approved (48) ➔ 📦 Receipt (36) ➔ ⚙️ Issuance (28)  │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ • Average Cycle Time: 9.4 days (Target: <= 12 days)   • On-Time Delivery Rate (OTD): 92.8%                                     │
│ • Bottleneck Alerts: 🟡 4 orders awaiting Purchase price finalization (unitPriceFlag = N) | 🔴 2 inter-entity transfers overdue > 48h │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. INVENTORY KPIS & MONTH-START AGING AUDIT:                     │ 3. SG BUDGET RECONCILIATION (STRICTLY NO ROLLOVER):           │
│ • Total HW Available Inventory Value: $286,400 USD (Warehouses)  │ • Nov Purchase Budget (LEC Manual Input):       $150,000 USD │
│ • Inventory Aging Distribution:                                  │ • Committed PO Spend (PO Commit):          $148,200 USD (98.8%)│
│   ┌────────────────────────┬──────────────────────┬────────────┐ │   [██████████████████████████████████████░] Within monthly cap│
│   │ < 30 Days (Fast Moving)│ 30 - 60 Days (Monitor│ > 60 Days  │ │ • Actual Inventory Issue Expense (from EMS):  $118,450 USD   │
│   │ $214,000 USD (74.7%)   │ $54,200 USD (18.9%)  │ $18,200 USD│ │   (Auto-synced from EMS issuance records, machine cost)       │
│   └────────────────────────┴──────────────────────┴────────────┘ │ • Budget Status:                                              │
│ • Engineer Month-Start Aging Justification: 14/16 Tasks (87.5%)  │   🟢 Within Target: $122,000 USD | 🔴 Incurred Over: $26,200 USD│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. IN-DEPTH OVER ROOT CAUSE BREAKDOWN (TOTAL OVER AMOUNT: $26,200 USD):                                                          │
│ ┌────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────┐ │
│ │ 6 OVER REASON CODES BREAKDOWN (PIE / BAR BREAKDOWN):       │ OVER SOURCE SEGREGATION (PURCHASE VS. STOCK ISSUANCE):          │ │
│ │ • OVR-01 (Unexpected Machine Breakdown):          $13,500 │ • PO COMMIT OVER (New Purchases):     $17,400 USD (66.4%)        │ │
│ │ • OVR-02 (Surge in Smart Watch Production Volume): $5,800 │   ↳ Unplanned new parts purchased due to line machine breakdowns │ │
│ │ • OVR-03 (Inter-Entity Transfer Delay/Bottleneck): $3,900 │ • ISSUE EXPENSE OVER (Stock Issuance):  $8,800 USD (33.6%)       │ │
│ │ • OVR-04 (New Model Setup D111 -> D222):           $1,800 │   ↳ Replacement parts issued exceeding machine quotas (from EMS)│ │
│ │ • OVR-05 (Vendor Unit Price Fluctuations):           $750 │                                                                 │ │
│ │ • OVR-06 (Handling & Assembly Damage):               $450 │                                                                 │ │
│ └────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. DETAILED OVER CONTRIBUTION MATRIX (DETAILED OVER CONTRIBUTION LIST):                                                          │
│ [🔘 All Over Items (11)]  [🛒 PO Spend Over Only (7)]  [⚙️ Issue Expense Over Only (4)]  [📥 Export Excel Report]                  │
│ ┌──┬────────────┬─────────────────────────────┬───────────┬──────────────┬─────────────┬──────────┬──────────┬────────┬────────────┐ │
│ │No│ QCode /    │ Detailed Part Description   │ Location  │ Machine Code │ Qty & Est   │ Over     │ Origin   │ Over   │ Work Order │ │
│ │  │ Temp Code  │                             │ & Line    │ (14-char EM) │ Unit Price  │ Amount   │ Source   │ Code   │ Number     │ │
│ ├──┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────┼──────────┼────────┼────────────┤ │
│ │1 │ QDAD12236  │ Power Supply Board CPX V4   │ Line #201 │ HWBMTL21EC010│ 1 EA @$3,150│ $3,150.00│ 🛒 PO Sp │ OVR-01 │WO-248926091│ │
│ │  │            │ ↳ Detail: Blown C14 capacitor from night lightning surge on DB-01; urgent replacement required        [👁️ View WO] │ │
│ ├──┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────┼──────────┼────────┼────────────┤ │
│ │2 │ QCAD38190  │ Dual Rod Slide Cylinder MXQ │ Line #202 │ HWBMTL22EC010│ 4 EA @$220  │   $880.00│ ⚙️ Iss Exp│ OVR-01 │WO-248926094│ │
│ │  │            │ ↳ Detail: TAB-02 gripper jammed stroke cracked piston rod; stock issue exceeded quota by 2 EA          [👁️ View WO] │ │
│ └──┴────────────┴─────────────────────────────┴───────────┴──────────────┴─────────────┴──────────┴──────────┴────────┴────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
