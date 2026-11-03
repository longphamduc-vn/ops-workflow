# 03. LEC Status-Based Batch Aggregation & Interlock Resolution Tool (Batch Interlock Resolver)
> *Consolidating Items from Peer Engineers across the Team, Interlock Scanning, Configuring Deadlines, Filtering Eligible Codes (MANDATORY Official QCode) for Beginning-of-Month Audit & Manual Target/Over Tagging by LEC*

---

## 1. Operational Requirements & Batch Aggregation Architecture

During each procurement cycle at the Smart Watch production facility (Factory HW), the Line Equipment Controller (LEC) within the Team (Pham Duc Long - 658359) handles hundreds of spare part demands raised by field shop-floor engineers across the Team (peer engineers operating without hierarchical process-leader boundaries).

The system provides a **Status-Based Batch Aggregator & Resolver Module** built upon key operational principles:
1. **Aggregating All Demands Across the Team**: Centralizes all spare parts requested by peer engineers into a unified queue for the Team.
2. **Automated Status-Based Grouping**:
   - *Group 1: Newly Registered (Requires 4-step Interlock scan)*.
   - *Group 2: Aging Stock Alert (`agingInterlockFlag == 'Y'`)*: Stagnant inventory alert (potentially idle stock held by another peer team). The engineer must borrow or consume this stock prior to purchasing; this mandatory task persists continuously and auto-closes only when an EMS sync confirms `'N'`.
   - *Group 3: Price Verification (`unitPriceFlag`)*: Segregates items with active contract pricing (`Y`) from unpriced items (`N` — awaiting RFQ quotation by the Purchase Department).
   - *Group 4: Eligible for Beginning-of-Month Audit (Purchasable)* $\rightarrow$ **MANDATORY to possess an official registered QCode** (temporary codes like `TMP-HW-xxxx` are strictly held in the technical data preparation queue; folder uploads represent engineering data prep for QCode registration, not audit admission).
   - *Group 5: Awaiting Inter-Entity Confirmation*: Intra-group stock transfer or lowest-cost purchase via LGD Headquarters (Korea) or Guangzhou.
   - *Group 6: Anomalies / Discontinued (EOL)* $\rightarrow$ LEC reviews technical feasibility, assigns substitute codes, and provides engineering feedback.
3. **LEC-Configured Operational Deadlines**:
   - Deadline for engineers to complete beginning-of-month aging stock justification tasks.
   - Deadline for closing dossiers for the Beginning-of-Month Audit.
4. **LEC Manual Classification Authority (Strictly NO Auto-Classification)**:
   - The LEC personally examines each demand and **manually tags `[IN TARGET]` or `[UNPLANNED OVER]`**. The system strictly refrains from automated classification.

---

## 2. Multi-LEC Batch Processing Console Interface

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  MULTI-LEC WORKBENCH: STATUS-BASED BATCH PROCESSING & RESOLUTION                  [Team: HW Smart Watch 1]   [⚡ SCAN INTERLOCK]   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  OPERATIONAL DEADLINE CONFIGURATION (CONFIGURED BY LEC):                                                                         │
│  📅 Engineer Stock Justification Deadline: [ 03rd Monthly - 17:00 ]   📅 Audit Dossier Closure Deadline: [ 05th Monthly - 12:00 ]│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  STATUS GROUP TABS:                                                                                                              │
│  [🔘 All (184)] [⏳ New (42)] [⚠️ Aging Alert (18)] [🟢 Audit Ready (85)] [🌐 Inter-Entity (23)] [🏷️ EOL (16)]                 │
├────┬────────────┬─────────────────────────────┬───────────┬──────────────┬─────────────┬──────────────┬─────────────┬──────────────┤
│No. │Item Code   │Part Description & Maker     │Equipment  │System Status │Interlock &  │LEC Classify  │Next Route   │LEC Batch     │
│    │/ QCode     │(Created by Field Engineer)  │Line / Pos │              │Stock/Price  │(Manual)      │             │Action        │
├────┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ 1  │PR-2611-001 │Square photoelectric sensor  │Line #201  │🟢 AUDIT READY│agingFlag: N │[🔘 IN        │Submit to    │[✅ Add to     │
│    │QDAB03583   │Maker: Panasonic / Model: CN │Die Bonder │(Official     │unitPrice: Y │ TARGET]      │BEGINNING-OF-│ Audit Batch] │
│    │(Valid QCode│Engineer: Nguyen Van Thang   │           │ QCode)       │(Priced)     │              │MONTH Audit  │              │
├────┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ 2  │PR-2611-002 │CPX V4 Power Control Board   │Line #202  │🟢 AUDIT READY│agingFlag: N │[🔘 UNPLANNED │Submit to    │[✅ Add to     │
│    │QDAD12236   │Maker: Trumpf / Model: 291214│Laser Cut  │(Official     │unitPrice: Y │ OVER]        │BEGINNING-OF-│ Audit Batch] │
│    │(Valid QCode│Engineer: Tran Duc Minh      │           │ QCode)       │(Priced)     │Reason: OVR-01│MONTH Audit  │              │
│    │            │↳ Engineer note: Blown by grid voltage surge (WO-248926091) ➔ LEC tags OVER due to exceeding wear baseline    │
├────┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ 3  │PR-2611-003 │SMC Pneumatic Gripper        │Line #201  │⚠️ AGING STOCK│agingFlag: Y │—             │Engineer must│[🔔 Remind    │
│    │QCAD38190   │Maker: SMC / Model: MHZ2-16D │Tester     │   ALERT      │(Team 2 Stock│(Pending LEC  │borrow peer  │ Peer Stock   │
│    │(Valid QCode│Engineer: Le Hoang Quan      │           │(Peer Team)   │unitPrice: Y │ Target/Over) │team stock   │ Borrow]      │
├────┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ 4  │PR-2611-004 │Motor Driver Speed Controller│Line #203  │⏳ AWAITING   │agingFlag: N │—             │LEC submits  │[📤 Register  │
│    │TMP-HW-0105 │Maker: Omron / Model: R88D   │Bonding    │   QCODE      │unitPrice: N │(Pending LEC  │tech dossier │ ERP QCode]   │
│    │(TEMP CODE) │Engineer: Vu Quoc Huy (CAD)  │           │AUDIT BLOCKED │(Pending RFQ)│ Target/Over) │to ERP/EMS   │              │
└────┴────────────┴─────────────────────────────┴───────────┴──────────────┴─────────────┴──────────────┴─────────────┴──────────────┘
  ➔ Batch operations on selected records:
  [📦 BATCH CONSOLIDATE ALL 85 ELIGIBLE CODES TO BEGINNING-OF-MONTH AUDIT]  [⚡ TAG IN TARGET]  [🔔 DISPATCH AGING STOCK TASK]
```

---

## 3. Three-Step Batch Workflow for "Audit-Ready" Items

1. **Step 1: Status Filtering & Strict Prerequisites**:
   - The LEC selects the `[🟢 Audit Ready]` tab.
   - **Non-Negotiable Rule**: Items **MUST possess an official registered QCode** in the ERP/EMS master. Any item bearing a temporary code (`TMP-HW-xxxx`) is strictly blocked from the audit list and held in the technical preparation queue for QCode creation.
   - The item must not be blocked by procurement interlocks (`stopPoFlag == 'N'`).
   - If an aging stock alert exists (`agingInterlockFlag == 'Y'`), the engineer must first borrow/consume the existing peer team stock; only after EMS re-syncs the flag to `'N'` can new purchase authorization proceed.

2. **Step 2: Budget Reconciliation & Manual Tagging by LEC**:
   - The LEC inspects each spare part individually:
     * Regular wear-and-tear consumables planned within normal maintenance quotas: The LEC marks `[IN TARGET]`.
     * Unscheduled machine breakdowns, sudden demand increases, or items breaching budget thresholds: The LEC marks `[UNPLANNED OVER]` and assigns an appropriate root-cause code (`OVR-01` through `OVR-06`).
   - The LEC inspects `unitPriceFlag`: If `'N'` (unpriced), the LEC notes that a parallel RFQ quotation from Purchase is required.

3. **Step 3: Packaging Dossier for Beginning-of-Month Audit (Cost Management Review)**:
   - At the LEC-configured deadline (Days 01–05 of each month), the LEC clicks `[📦 BATCH CONSOLIDATE INTO BEGINNING-OF-MONTH AUDIT]`.
   - The system freezes the dataset for this batch, locks temporary edits, and exports the audit package to the **Cost Management Portal (where Reviewer & Assistant is 1 single person)**.
   - If the Reviewer requests clarification, the 3-party clarification loop is engaged: Reviewer $\rightarrow$ LEC $\rightarrow$ Requestor Engineer $\rightarrow$ LEC $\rightarrow$ Reviewer. Upon final cost clearance, formal PRV/PO creation proceeds on EMS (no approval buttons on the new system).