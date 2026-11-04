# LG Display Factory HW — Spare Parts Procurement Portal (Demo Project)
> **Component 2: Operations Web Portal & Dashboard (Standalone Prototype)**  
> *Operating in parallel with Core Nexacro EMS without requiring the backend `ops-workflow` engine.*

---

## 🚀 Quick Start

Run directly with Node.js / Vite:

```bash
# In WSL or Linux terminal:
cd services/procurement-portal
npm install
npm run dev
```

Open your browser at: `http://localhost:3000`

---

## 🎯 Architecture & Implemented Screens

This demo project implements the complete UI/UX specifications detailed in `procurement-system/05-ui-ux-screen-specifications/`:

| Screen Code | Role & Title | Key Features Demonstrated |
| :--- | :--- | :--- |
| **`UI-COMMON-00`** | **Universal Operations Dashboard** | 7-step procurement pipeline funnel, inventory aging tiers (&lt;30d, 30-60d, &gt;60d), 3-axis SG budget balance (Monthly Allocation, PO Commit, EMS Issue Expense), 6 Over root-cause breakdown (`OVR-01` to `OVR-06`). |
| **`UI-ROLE-01`** | **Requestor Portal (Field Engineer)** | Friendly machine selection (Line #201, DB-01, Feeder Unit), instant cross-team aging stock warning banner (`agingInterlockFlag == 'Y'`), drag-and-drop CAD folder data preparation for QCode registration (temporary `TMP-HW-xxxx`), 3-party clarification response tab, and aging justification tasks. |
| **`UI-ROLE-02`** | **Leader Monitoring Dashboard** | Hierarchical monitoring across `Team => Part => Peer Engineers`, incident inspection drawer, and zero in-app approval buttons (approvals executed on EMS). |
| **`UI-ROLE-03`** | **LEC Master Workbench** | Status-based batch grouping, manual Target vs. Over marking (`[IN TARGET]`, `[UNPLANNED OVER]`), inbound delivery milestones tracking (Vendor Confirm Date, ETA, 3-month expense allocation), 3-party bridge console, and dynamic deadline configuration. |
| **`UI-ROLE-06`** | **Cost Management Audit Portal** | Dedicated for Cost Management (Reviewer & Assistant is ONE single person), Beginning-of-Month Cost Audit (Days 01–05), fixed-template Excel export (4 sheets), clarification inquiry dispatch to LEC, and cost clearance slip generation. |
| **`UI-EBOM-01`** | **Drag-and-Drop EBOM Slot Mapper** | 3-column interactive layout: Friendly Machine Tree, Slot Schematic Canvas with auto-generated 14-char EM No (`HWBMTL21EC0101`), Spare Parts Tray (click/drag to bind), and Late Declaration Queue resolution. |
| **`UI-ROLE-05`** | **Admin Settings Console** | 6 configuration tabs: Reorder logic formulas, Plant & Line topology (`Left(Line, 1) = Floor`), Multi-team RBAC (no warehouse portal), SG Budget with Strict No-Rollover, and EMS Gateway rate-limiting. |

---

## ⚙️ Interactive Live Demonstrations

1. **Persistent Cross-Team Stock Task & Auto-Resolution**:
   - Creating a requisition for `QCAD38190` triggers `agingInterlockFlag == 'Y'`, generating a persistent task warning of 6 idle units at Team 1.
   - Click the top banner button **"⚡ Simulate EMS Stock Issuance ('N')"** to simulate EMS issuing the stock, which reactively auto-closes the persistent task across all portals!
2. **3-Party Clarification Loop**:
   - Cost Management Reviewer creates an inquiry on an Over breakdown item (`QDAD12236`).
   - The inquiry appears on the **LEC Workbench** under the "3-Party Bridge" tab.
   - The LEC reviews and forwards it to Field Engineer **Nguyen Van Thang**.
   - The engineer provides breakdown photos & Work Order `WO-248926091` in the **Requestor Portal**.
   - The LEC verifies and returns the finalized evidence to the Cost Management Reviewer.
3. **Beginning-of-Month Audit & Strict No-Rollover**:
   - View the 3-axis SG Budget Balance where surplus from October is strictly retired and zero carryover is enforced.
   - Adjust deadlines dynamically on the LEC Workbench and see them synchronize to the Engineer and Leader portals.
4. **Drag-and-Drop EBOM Late Declaration**:
   - `TMP-HW-0105` sits in the Late Declaration queue (`EBOM_PENDING_MAPPING = true`).
   - Click to bind it into the `Die Bonder 01 (DB-01)` slot to automatically clear the pending mapping flag.
