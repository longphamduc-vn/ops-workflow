# Role-Specific Workspace: Requestor (Field Engineer)
> **Screen ID: UI-ROLE-01 — Requestor Unified Engineering Portal**  
> *Dedicated to: Field Engineers directly responsible for machinery across Smart Watch production lines at Factory HW (Peer engineers within Part/Team, no process hierarchy).*

---

## 1. Engineer Workspace Anatomy

The Requestor Portal is a dedicated workspace designed to provide maximum support for Field Engineers:
- **Friendly Name Principle**: Engineers work 100% with friendly machine names, line names, and mechanism unit names (`Line #201`, `Die Bonder DB-01`, `Bonding Head Unit`), without the burden of memorizing 14-character technical equipment identifiers (`EM No`: `HWBMTL21EC0101`).
- **Instant Cross-Team Stock Warning (`agingInterlockFlag`)**: As soon as an engineer selects a part code for which the system detects aging inventory (even stock owned by another team), the system **immediately displays an orange-yellow alert banner directly on the requisition form** and **automatically generates a Mandatory Task**. The engineer must contact and borrow/issue this existing stock before purchasing new items. This task **persists continuously on the screen** and cannot be manually closed until an EMS sync confirms the flag has turned to `'N'`.
- **Full Folder Upload for QCode Data Preparation**: Drag and drop an entire folder containing CAD files, PDF catalogs, datasheets, and photos $\rightarrow$ the system auto-generates a grid table for the engineer to fill preliminary specifications and submit technical data to LEC for QCode registration on ERP/EMS (this is data preparation, **not cost appraisal**).
- **Justification & Current Status**: The engineer provides breakdown status and justification (Incident Work Order, proposed OVR code); **LEC will evaluate and officially mark `[WITHIN TARGET]` or `[INCIDENTAL OVER]` manually**.
- **3-Party Clarification Bridge**: Receive clarification requests from the Cost Management Reviewer (routed via LEC) and reply directly with technical evidence.

The interface consists of **4 Functional Tabs**:
1.  **Tab 1: 📝 Part Requisition Registration**: Select machine by friendly name, 50ms instant stock lookup, immediate cross-team stock warning, input breakdown status, and submit to LEC.
2.  **Tab 2: 📁 QCode Registration Data Preparation (Folder & Excel Onboarding)**: Drag and drop an entire CAD/Doc/Photo folder or paste an Excel table, auto-extract documentation, and transfer to LEC for QCode issuance on ERP/EMS.
3.  **Tab 3: 🌳 Visual Drag-and-Drop EBOM Slot Mapper**: Drag parts and drop them into machine mechanism slots; complete "Post-Declaration" mechanisms.
4.  **Tab 4: 📋 My Requisitions, 3-Party Clarification & Inventory Tasks**: Track requisition progress, respond to LEC clarification inquiries, execute cross-team stock borrowing tasks (persisting until EMS='N'), and complete Beginning-of-Month inventory aging justification tasks before LEC deadlines.

---

## 2. Detailed ASCII UI Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  FIELD ENGINEER PORTAL — FACTORY HW (SMART WATCH)                    [🔔 1 Stock Alert] [👤 Nguyen Van A (Engineer)]  │
│ Context: Factory HW (Smart Watch) > Line #201 (2F) > Part: CP/SG Part 1         Role: Requestor (Peer Engineer)                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ FUNCTIONAL TABS:                                                                                                                 │
│ [🔵 TAB 1: CREATE PART REQUISITION] [📁 TAB 2: PREPARE QCODE DATA] [🌳 TAB 3: DRAG-DROP EBOM] [💬 TAB 4: TRACKING & TASKS (2)]  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📌 ACTIVE TAB: TAB 1 — CREATE PART REQUISITION (BY FRIENDLY MACHINE NAME)                                                        │
│                                                                                                                                  │
│ 1.1. FRIENDLY MECHANISM SELECTOR:                                                                                                │
│  Line: [ Line #201 (Smart Watch Line 1 - 2F)    ▼ ]   Machine: [ Die Bonder 01 (DB-01)                 ▼ ]                       │
│  Installation Mechanism Details:                                                                                                 │
│  (🔘) Select Existing EBOM Mechanism: [ 02. Bonding Head > Mech 01: Workpiece Gripper Cylinder (Linked EM No: HWBMTL21EC0101)  ▼ ] │
│  ( ) Mechanism Not Yet in EBOM (Post-Declaration): [ Enter descriptive name of ad-hoc field mechanism...                       ] │
│      ↳ 💡 System Notice: Requisitions are NOT BLOCKED! Flag EBOM_PENDING_MAPPING will be raised to allow mapping within 7 days.   │
│                                                                                                                                  │
│ 1.2. PART INFORMATION & INSTANT INVENTORY RECONCILIATION:                                                                        │
│  Part Code: [ QCAD38190                 ▼ ]  [ Or select temp code: TMP-HW-xxxx ]  [📂 Select from Machine EBOM Tree]            │
│  Part Description: Pneumatic Gripper Cylinder SMC      Manufacturer: SMC (Japan)       Model: MHZ2-16D                           │
│  Order Quantity: [ 2 ] EA               Contract Unit Price: $45.00 USD (unitPriceFlag: Y)   Est Total: $90.00 USD               │
│  ┌──────────────────────┬──────────────────────┬──────────────────────┬────────────────────┬──────────────────────────────────┐  │
│  │ Available HW Stock   │ Incoming PO Remained │ Standby PO Awaiting  │ Standard Target    │ Minimum Order Quantity           │  │
│  │                      │                      │ Approval             │ Stock              │                                  │  │
│  │        0 EA          │         0 EA         │         0 EA         │        2 EA        │ MOQ: 1 EA  |  Pack Size: 1 EA    │  │
│  └──────────────────────┴──────────────────────┴──────────────────────┴────────────────────┴──────────────────────────────────┘  │
│                                                                                                                                  │
│  ⚠️ INSTANT WARNING — CROSS-TEAM AGING STOCK DETECTED (agingInterlockFlag = Y):                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 🔔 SYSTEM ALERT: This spare part has AGING STOCK at [PO Module Tech Team 1 - Warehouse HW2] (Quantity: 4 EA).             │  │
│  │ ↳ MANDATORY REQUIREMENT: You MUST CONTACT AND BORROW / ISSUE THIS EXISTING STOCK BEFORE REQUESTING A NEW PURCHASE!        │  │
│  │ ↳ The system has automatically generated a [Cross-Team Stock Borrowing Task]. This task will PERSIST CONTINUOUSLY until  │  │
│  │   data re-synced from Nexacro EMS confirms the flag has turned to 'N'. (No written justification required).               │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                                  │
│ 1.3. MACHINE STATUS & PROPOSED REASON (LEC OFFICIALLY MARKS TARGET / OVER):                                                      │
│  Order Mode:         ( ) Periodic Replenishment / Safety Stock Buffer   (•) IMMEDIATE BREAKDOWN REPAIR                           │
│  Incident Work Order: [ WO-248926091                ]  Proposed Reason: [ OVR-01: Machine breakdown / failure (Breakdown) ▼ ]    │
│  Machine Status & Encountered Problem:                                                                                           │
│  [ Gripper cylinder has leaking piston seal; clamping stroke is loose, dropping workpieces. Immediate replacement needed.        ]│
│  Field Photos: [ 🖼️ cylinder_air_leak.jpg (1.8MB) ❌ ] [ ➕ Drag & drop additional incident photos... ]                            │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [💾 Save Draft]                     [👁️ Review Dossier]                     [🚀 SUBMIT REQUISITION TO LEC (Ctrl+Enter)]       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tab 2 Details: QCode Registration Data Preparation (Technical Folder Upload)

When engineers need to onboard new spare parts from Vendor fabrication packages or R&D documents:
> *Important Note: This step prepares the technical dossier for LEC to register the QCode on ERP/EMS. Items at this stage carry temporary codes `TMP-HW-xxxx` and are **strictly ineligible for the Beginning-of-Month cost appraisal**.*

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📁 TAB 2: PREPARE QCODE REGISTRATION DATA VIA TECHNICAL FOLDER UPLOAD                                                            │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CAD / TECHNICAL DOCUMENTATION DROP ZONE:                                                                                         │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│ │                 📁 DRAG & DROP ENTIRE FOLDER HERE OR [ CLICK TO BROWSE FOLDER FROM PC ]                                    │  │
│ │           (Supports automatic recursive scanning: CAD drawings .dwg/.step, Catalog PDF, Datasheets, Field photos)          │  │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│ ↳ SCANNED: Folder 'Setup_DB01_Jig' (Contains 8 files: 2 CAD drawings, 2 PDF catalogs, 4 detail photos)                           │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ AUTO-GENERATED SPECIFICATION GRID (ENGINEER ENTERS PRELIMINARY DATA):                                                            │
│ ┌────┬─────────────┬──────────────────────────┬──────────────┬─────────────┬───────────┬─────────────┬─────────────────┬─────────┐ │
│ │No. │Gen Temp Code│Part Description          │Maker         │Model        │Machine Loc│Usage Qty    │Linked Files     │Status   │ │
│ ├────┼─────────────┼──────────────────────────┼──────────────┼─────────────┼───────────┼─────────────┼─────────────────┼─────────┤ │
│ │ 1  │TMP-HW-0101  │Slide rail cylinder       │SMC           │MXQ16-100B   │DB-01      │2 EA         │📄 Catalog_SMC   │🟢 Files │ │
│ │    │             │                          │              │             │           │             │🖼️ Photo_01.jpg  │   Ready │ │
│ │ 2  │TMP-HW-0102  │Machined fixture jig      │INTERNAL      │MECH-FIX-V1  │DB-01      │1 EA         │📐 CAD_Fix_01.dwg│🟢 CAD   │ │
│ │    │             │                          │              │             │           │             │                 │   Ready │ │
│ └────┴─────────────┴──────────────────────────┴──────────────┴─────────────┴───────────┴─────────────┴─────────────────┴─────────┘ │
│                                                                                                                                  │
│  ➔ ACTIONS:  [➕ Add Row]  [📋 Paste from Excel]  [🚀 SUBMIT DATA FOR LEC QCODE ERP/EMS REGISTRATION]                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Tab 4 Details: Order Tracking, 3-Party Clarification & Mandatory Inventory Tasks

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 💬 TAB 4: REQUISITION TRACKING, 3-PARTY CLARIFICATION & MANDATORY INVENTORY TASKS                                                │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. PERSISTENT MANDATORY OPEN TASKS:                                                                                              │
│                                                                                                                                  │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│ │ 📌 TASK 1 (MANDATORY - CANNOT CLOSE): BORROW / USE PEER TEAM AGING STOCK (QCode: QCAD38190)                                │  │
│ │ • Item: Pneumatic Gripper Cylinder SMC (Requisition ID: REQ-2611-008).                                                     │  │
│ │ • Current Status: 4 EA aging in stock at Team 1 (Warehouse HW2).                                                           │  │
│ │ • Instructions: Contact Engineer Nguyen Van B (Team 1 - Ext: 2210) to complete loan/issuance procedures on EMS.            │  │
│ │ • 🔒 Task Status: OPEN (Persists continuously until system reads EMS data confirming agingInterlock flag turns to 'N')     │  │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                                  │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│ │ 📅 TASK 2: BEGINNING-OF-MONTH UNUSED INVENTORY AGING JUSTIFICATION (LEC-Configured Deadline: 03/11 - 17:00)                │  │
│ │ • Item: Optical Sensor Panasonic QDAB03583 (Received at warehouse 32 days ago; not yet issued for assembly).               │  │
│ │ • Unused Reason: [ PM maintenance postponed to Week 2 due to overtime production on Smart Watch Model D111                ]│  │
│ │ • Committed Issuance Date: [ 10/11/2026 ]   [ Submit Justification to LEC ]                                                │  │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. 3-PARTY CLARIFICATION BRIDGE — CLARIFY INFORMATION WITH REVIEWER (COST MANAGEMENT) VIA LEC:                                   │
│                                                                                                                                  │
│ [💬 CLARIFICATION REQUEST DIALOG FROM LEC]:                                                                                      │
│ ↳ 👤 Pham Duc Long (LEC) [10:15]: "The Cost Management Reviewer requests clarification on the reason for purchasing a new CPX  │
│   V4 Power Supply Board (QDAD12236) since this item is flagged as OVER (OVR-01). Please provide the power surge incident report  │
│   and confirm whether repairs on the old board were attempted."                                                                  │
│                                                                                                                                  │
│ ↳ ✍️ Engineer reply to LEC:                                                                                                      │
│   [ Attached night-shift maintenance inspection report: The board experienced an exploded primary capacitor and multilayer PCB   │
│     cracking; TRUMPF confirmed it cannot be repaired on-site. Attached report: Incident_Report_2489.pdf (1.2MB).                 ]│
│   [📎 Attach File]   [🚀 Send Response to LEC for Reviewer Submission]                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
