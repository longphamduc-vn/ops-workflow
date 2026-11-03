# 00. Role-Based Screen Matrix
> *Navigation architecture and access control matrix: Warehouse Portal eliminated (warehouse staff do not use this system; inventory issuance is automatically synced from EMS), Approval system eliminated (approvals take place on EMS; this system strictly controls progress), Peer engineers with no process hierarchy, Cost Management (Reviewer & Assistant is a single person).*

---

## 1. 5 Core User Role Architecture

The system is designed following the Principle of Least Privilege & Scoped Visibility. **Each role possesses an independent, dedicated workspace**:

```mermaid
graph TD
    subgraph Roles["5 Independent Role-Based Workspaces"]
        R1["1. REQUESTOR PORTAL\n(Field Engineers - Peer-level)"]
        R2["2. LEADER DASHBOARD\n(Team / Part Leader - Progress Tracking)"]
        R3["3. LEC MASTER WORKBENCH\n(Spare Part Coordinator - Pham Duc Long)"]
        R5["4. ADMIN CONSOLE\n(System Administrator & Settings)"]
        R6["5. COST MANAGEMENT PORTAL\n(Cost Management Department - 1 Person)"]
    end

    subgraph Scope["Visibility Scope & Operations"]
        S_Mach["By machine & friendly unit name (no process hierarchy)"]
        S_Team["Full team procurement progress (Team => Part)"]
        S_LEC["Batching, Interlocks, manual goods receipt tracking, Reviewer-Engineer bridge"]
        S_ADM["All configuration parameters, permissions, Gateway connections"]
        S_CST["SG budget overview, inventory audit & BEGINNING-OF-MONTH expense appraisal"]
    end

    R1 --> S_Mach
    R2 --> S_Team
    R3 --> S_LEC
    R5 --> S_ADM
    R6 --> S_CST
```

### Directory of Role-Based Workspaces & Universal Screens:
0. [**Universal Screen: Universal Progress & Analytics Dashboard (UI-COMMON-00)**](file:///wsl.localhost/Ubuntu/home/longp/projects/ops-workflow/procurement-system/05-ui-ux-screen-specifications/00-common-dashboard/screen-universal-analytics-dashboard.md): Real-time operations intelligence control tower: Procurement progress funnel, inventory KPIs & aging audit tasks, 3-way budget reconciliation, analysis of 6 Over codes (segregated into PO Spend Over vs. Issue Expense Over from EMS).
1. [**Field Engineer Workspace (Requestor Portal - UI-ROLE-01)**](file:///wsl.localhost/Ubuntu/home/longp/projects/ops-workflow/procurement-system/05-ui-ux-screen-specifications/01-role-requestor/screen-requestor-portal.md): Create requests by friendly machine names, inventory snapshots, Excel grids, visual EBOM tree, **CAD folder data preparation for LEC QCode registration**, 3-party clarification responses with LEC, and **Beginning-of-Month Inventory Justification Tasks**.
2. [**Team / Part Management Workspace (Leader Dashboard - UI-ROLE-02)**](file:///wsl.localhost/Ubuntu/home/longp/projects/ops-workflow/procurement-system/05-ui-ux-screen-specifications/02-role-leader/screen-leader-team-dashboard.md): Monitor procurement progress hierarchical breakdown by `Team => Part`, preliminary review of Over reasons, and follow up on engineer inventory justification tasks *(Strictly no approvals; approvals take place on EMS)*.
3. [**Team LEC Workspace (LEC Master Workbench - UI-ROLE-03)**](file:///wsl.localhost/Ubuntu/home/longp/projects/ops-workflow/procurement-system/05-ui-ux-screen-specifications/03-role-lec/screen-lec-master-workbench.md): Multi-LEC batching across the entire team, 4-step Interlocks (processing `agingInterlockFlag` to borrow/use peer team stock, `unitPriceFlag`), EOL reclassification, RFQ tracking, **manual goods receipt progress tracking**, and serving as the **3-party clarification bridge** with the Cost Management Reviewer.
4. [**System Admin Workspace (Admin Settings Console - UI-ROLE-05)**](file:///wsl.localhost/Ubuntu/home/longp/projects/ops-workflow/procurement-system/05-ui-ux-screen-specifications/05-role-admin/screen-admin-settings-portal.md): 6 configuration tabs: 5-demand logic formulas, factory plants, Line hierarchy `Left(Line,1)=Floor`, Multi-Team Tree (eliminated process hierarchy; peer engineers), SG Budget No-Rollover, and Nexacro Gateway Rate Limiting.
5. [**Cost Management Workspace (Cost Management Portal - UI-ROLE-06)**](file:///wsl.localhost/Ubuntu/home/longp/projects/ops-workflow/procurement-system/05-ui-ux-screen-specifications/06-role-management/screen-management-audit-portal.md): Dedicated to the **Reviewer & Assistant (a single individual)**: Cost appraisal and inventory aging justification review at the BEGINNING OF THE MONTH, Over item audit, **input clarification requests sent to LEC** *(Official approval takes place on EMS)*.

---

## 2. Screen Authorization Matrix

| Functional Workspace | Field Engineer (Requestor) | Team / Part Leader | Team LEC | Cost Management (1 Person) | System Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **00. Universal Progress Dashboard** | 👁️ Machine scope | 👁️ Team/Part scope | 👁️ Full Team scope | 👁️ Plant-wide scope | **Full Access** |
| **01. Requestor Portal**<br>• Create requests with friendly names<br>• Prepare QCode data folder<br>• Clarification feedback loop<br>• Beginning-of-month aging tasks | **Full Access**<br>(Create, Edit draft, Submit data) | 👁️ Read-only (Tracking) | 👁️ View & Assist | 🚫 No Access | **Full Access**<br>(Tech Support) |
| **02. Leader Monitoring Dashboard**<br>• Monitor progress Team => Part<br>• Follow up on aging tasks<br>• *(No approvals)* | 🚫 No Access | **Full Access (Tracking)**<br>(Internal notes) | 👁️ Cross-view | 👁️ Cross-audit view | **Full Access** |
| **03. LEC Master Workbench**<br>• Batch orders by status<br>• Mark Target vs Over manually<br>• Release Interlocks & EOL<br>• Reviewer-Engineer info bridge<br>• Manual goods receipt entry | 🚫 No Access | 👁️ View progress only | **Full Coordination Access**<br>(Process, Unlock, Receipt) | 👁️ View prepared dossiers | **Full Access** |
| **04. Cost Management Portal**<br>• BEGINNING-OF-MONTH cost appraisal<br>• Inventory aging audit review<br>• Send clarification requests to LEC<br>• EMS reconciliation lookup | 🚫 No Access | 🚫 No Access | 👁️ View clarification requests | **Full Control Access**<br>(Clarification request, Clearance) | **Full Access** |
| **05. System Settings Console**<br>• Configure 5-demand formulas<br>• Multi-Team Tree (peer engineers)<br>• Gateway EMS Rate Limiting | 🚫 No Access | 🚫 No Access | ⚙️ Team budget settings | 🚫 No Access | **Full Config Access** |
| **06. Machine EBOM Drag & Drop** | 👁️ Lookup & Select | 👁️ Lookup | **Full Mapping Access** | 👁️ Structure Lookup | **Full Access** |
