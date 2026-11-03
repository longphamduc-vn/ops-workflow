# Role-Specific Interface: Cost Management
> **Screen Code: UI-ROLE-06 — Cost Management Audit Portal**  
> *Dedicated to: Cost Management Department — Reviewer & Assistant IS 1 SINGLE PERSON (Cost Audit Specialist / Cost Controller, NOT the Board of Directors or Executive Leadership)*

---

## 1. Cost Management Workspace Anatomy

According to standardized operating principles:
> *"Cost Management is the dedicated department responsible for cost control, SG budget monitoring, and inventory aging audits. At the beginning of each month, the Reviewer (Cost Management) conducts offline audit meetings with LECs to scrutinize unconsumed aging stock and unbudgeted Over expenditures. Following the offline audit, if additional clarification is needed, the Reviewer inputs inquiries into the system to forward to the LEC; the LEC dispatches them to the responsible Engineer for feedback, and routes the responses back to the Reviewer. Upon completion of cost clearance, official approval takes place on the EMS system."*

The **Cost Management Audit Portal** interface functions as a **Cost Control & Digitalized Clarification Bridge**:
- Cost audits and inventory aging reviews conducted at the **BEGINNING OF EACH MONTH**.
- Scrutinize 100% of line items incurred as **Unbudgeted Over** (distinguishing Over from Procurement vs. Over from Warehouse Issuance synced from EMS).
- Review **Unconsumed Inventory Justification Tasks (>30 days)** assigned to field engineers to prevent spare part hoarding.
- **Input requests for additional information** to dispatch to the LEC for engineering clarification.
- Cross-check and verify records prior to executing official approval on the external EMS system.

The interface architecture comprises **3 Specialized Views**:
1.  **View 1: 📑 Beginning-of-Month Cost & Inventory Audit Dossier**: Compares monthly SG budget ceilings (manually entered, No-Rollover) against Within-Target commitments and unbudgeted Over lists (`OVR-01..06`).
2.  **View 2: 💬 Clarification Request Management**: Input inquiries and justification demands to dispatch to the LEC for engineer response.
3.  **View 3: 📂 Minutes Archive & EMS Cross-Check**: Stores digitized scans of audit meeting minutes and cross-references PRV/PO tracking codes verified from EMS.

---

## 2. Detailed UI Wireframe (ASCII)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [OPS LOGO]  COST MANAGEMENT AUDIT PORTAL — FACTORY HW                           [🔔 2 Clarifications Pending] [👤 Reviewer (Cost)]│
│ Scope: Factory HW Entire Facility (Display Module Plant 1)                      Audit Period: BEGINNING OF MONTH 11/2026         │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ COST MANAGEMENT AUDIT VIEWS:                                                                                                     │
│ [📑 VIEW 1: BEG-OF-MONTH COST AUDIT]   [💬 VIEW 2: CLARIFICATION REQUESTS (TO LEC)]   [📂 VIEW 3: MINUTES ARCHIVE & EMS CROSS-CHECK]│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📌 ACTIVE VIEW: VIEW 1 — COST & INVENTORY AUDIT DOSSIER (NOVEMBER 2026)                                                          │
│                                                                                                                                  │
│ 1.1. NOVEMBER SG PROCUREMENT BUDGET BALANCE (STRICT NO-ROLLOVER):                                                                │
│ ┌────────────────────────────────────────┬───────────────────────────────────────┬─────────────────────────────────────────────┐ │
│ │ November SG Cap (Manually Entered)     │ Total Committed Proposed Within-Target│ Total Unbudgeted Over Purchases Incurred    │ │
│ │              $150,000 USD              │      $122,000 USD (81.3% of budget)   │         $28,000 USD (18.7% of budget)       │ │
│ └────────────────────────────────────────┴───────────────────────────────────────┴─────────────────────────────────────────────┘ │
│ • Monthly Budget Status: 🟢 Total proposed expenditure ($150,000 USD) exactly matches the allocated November budget ceiling.      │
│                                                                                                                                  │
│ 1.2. AUDIT LINE ITEMS: UNBUDGETED OVER REQUISITIONS REQUIRING SCRUTINY (OVR-01 TO OVR-06):                                      │
│ ┌──┬────────────┬─────────────────────────────┬───────────┬─────────────┬─────────────┬──────────┬──────────────┬──────────────────┐ │
│ │No│ QCode /    │ Spare Part Name & Maker     │ Machine & │ Order       │ Estimated   │ Over     │ Work Order   │ Reviewer Action  │ │
│ │. │ Temp Code  │                             │ Line Loc  │ Qty         │ Total Amount│ Code     │ (WO Number)  │                  │ │
│ ├──┼────────────┼─────────────────────────────┼───────────┼─────────────┼─────────────┼──────────┼──────────────┼──────────────────┤ │
│ │1 │ QDAD12236  │ CPX V4 Trumpf Power Board   │ DB-01/#201│ 1 EA        │ $3,150.00   │ OVR-01   │ WO-248926091 │[❓ Request Info  │ │
│ │  │            │ ↳ Engineer reason: Board burned from night shift lightning surge, line down DB-01   │   Send to LEC]   │ │
│ ├──┼────────────┼─────────────────────────────┼───────────┼─────────────┼─────────────┼──────────┼──────────────┼──────────────────┤ │
│ │2 │ QCAD38190  │ Dual Slide Cylinder MXQ16   │ TAB-02/#20│ 2 EA        │ $440.00     │ OVR-03   │ WO-248926098 │[✅ Endorse Line] │ │
│ │  │            │ ↳ Engineer reason: LGD Korea transfer delayed; urgent purchase to prevent stoppage  │                  │ │
│ └──┴────────────┴─────────────────────────────┴───────────┴─────────────┴─────────────┴──────────┴──────────────┴──────────────────┘ │
│                                                                                                                                  │
│  [📥 EXPORT FIXED-FORMAT EXCEL REPORT]      [✍️ SIGN COST CLEARANCE MINUTES]     [↗️ PROCEED TO OFFICIAL APPROVAL ON EMS]        │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. View 2 Detail: Sending Requests for Additional Information to LEC

When the Reviewer detects an expenditure line lacking adequate evidence or requiring scrutiny:
1. The Reviewer clicks **`[❓ Request Info Send to LEC]`**.
2. A modal dialog opens:
   - The Reviewer enters the inquiry (e.g., *"Provide damaged component inspection report and clarify why Team 1 spare stock was not borrowed/transferred?"*).
3. The system dispatches this inquiry directly to the `Reviewer Clarification Bridge` tab on the LEC Master Workbench.
4. Once the Engineer responds and the LEC consolidates and resubmits, the Reviewer receives a notification to finalize verification.
