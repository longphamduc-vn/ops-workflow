# 07. Detailed Screen Specification: Visual Drag-and-Drop EBOM Slot Mapper
> **Screen Code: UI-EBOM-01 | Friendly Names vs. EM No Separation, Drag-and-Drop Spare Parts into Machine Mechanisms & Late Declaration Architecture**

---

## 1. Design Philosophy & Complexity Reduction Strategy

In conventional maintenance and procurement systems, declaring equipment breakdown structures (EBOM) is often treated as a burdensome administrative chore, leading engineers to avoid updates or input erroneous data.
The **UI-EBOM-01** screen is redesigned from the ground up to achieve 4 key objectives:
1.  **Working Exclusively with Friendly Names**: Engineers interact only with intuitive, familiar Line Names, Machine Names, and Mechanism Unit Names (e.g., *Line #201, Die Bonder DB-01, Bonding Head Unit*). The 14-character technical `EM No` (`HWBMTL21EC0101`) is automatically synthesized in the background based on LEC Master Data configurations.
2.  **Intuitive Drag-and-Drop User Experience**: Seamlessly drag spare part cards from the inventory tray and drop them directly into machine mechanism slots.
3.  **Late Declaration Architecture**: Enables creating procurement requisitions even when machine mechanisms have not yet been fully indexed in the EBOM, preventing production delays.
4.  **Multi-Plant Scalability (Multi-Plant Selector)**: Supports instantaneous switching between Smart Watch Plant (HW), TV, Auto Display, and other facilities.

---

## 2. Detailed UI Wireframe (ASCII)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [OPS LOGO]  VISUAL DRAG-AND-DROP EBOM SLOT MAPPER                                            [Plant: 🏭 HW Smart Watch 1 ▼]      │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔍 QUICK SEARCH:       [ Enter Machine Name / Mechanism / QCode / EM No...                 ] [⚡ FIND & LOCATE]                  │
├───────────────────────────────────┬──────────────────────────────────────────────────┬───────────────────────────────────────────┤
│ PANE 1: MACHINE MECHANISM TREE    │ PANE 2: MECHANISM CANVAS (SLOT SCHEMATIC)        │ PANE 3: UNBOUND SPARE PARTS TRAY          │
│ (INTUITIVE HIERARCHICAL VIEW)     │ Active Machine: 🤖 Die Bonder 01 (DB-01)         │ (DRAG-AND-DROP PARTS PALETTE)             │
├───────────────────────────────────┼──────────────────────────────────────────────────┼───────────────────────────────────────────┤
│ ▼ 🏭 Factory HW (Smart Watch 1)   │ Location: Line #201 (2F) | Part: CP/SG Part 1    │ [🔍 Filter by Maker / QCode / Name...]    │
│   ▼ 🌐 Line #201 (Smart Watch L1) │ Master Tracking Code: HWBMTL21EC0000 (LEC Reg)   │                                           │
│     ▼ 🤖 Machine DB-01 (Die Bonder│ ──────────────────────────────────────────────── │ ┌───────────────────────────────────────┐ │
│       ├── 📂 Unit 01: Feeder Mech │ 🧩 MECHANISM 01: FEEDER LINEAR GUIDE RAIL        │ │ ▧ QDAB03583 - Square Photo Sensor     │ │
│       │   ├── 📌 Mech 01: Guide   │    Slot Code: MECH-DB01-FEED-01                  │ │   Maker: Panasonic | Model: CN-73-C2  │ │
│       │   └── 📌 Mech 02: Clamp   │ ┌──────────────────────────────────────────────┐ │ │   [✋ DRAG INTO CANVAS SLOT ➔]       │ │
│       ├── 📂 Unit 02: Bonding Head│ │ • Part Slot 1:                               │ │ └───────────────────────────────────────┘ │
│       │   ├── 📌 Mech 01: Arm     │ │   [ QDAB03583 - Square Photo Sensor (1 EA) ] │ │ ┌───────────────────────────────────────┐ │
│       │   └── 📌 Mech 02: Nozzle  │ │   Lifespan: 20,000h | Type: Wear & Tear      │ │ │ ▧ QCAD38190 - SMC Dual Cylinder 16-100│ │
│       └── ⚠️ 1 Late-Decl Mechanism│ ├──────────────────────────────────────────────┤ │ │   Maker: SMC | Model: MXQ16-100B      │ │
│     ► 🤖 Machine DB-02            │ │ • Part Slot 2:                               │ │ │   [✋ DRAG INTO CANVAS SLOT ➔]       │ │
│     ► 🤖 Machine EC-01            │ │   [ ➕ DRAG & DROP SPARE PART FROM TRAY HERE ]│ │ └───────────────────────────────────────┘ │
│   ► 🌐 Line #202                  │ └──────────────────────────────────────────────┘ │ ┌───────────────────────────────────────┐ │
│   ► 🌐 Line #203                  │                                                  │ │ ▧ QDAD12236 - CPX V4 Trumpf Pwr Board │ │
│ ───────────────────────────────── │ 🧩 MECHANISM 02: BONDING NOZZLE ASSEMBLY         │ │   Maker: Trumpf | Model: 2912146       │ │
│ ⚠️ LATE DECLARATION QUEUE:        │    Slot Code: MECH-DB01-HEAD-02                  │ │   [✋ DRAG INTO CANVAS SLOT ➔]       │ │
│ • PR-2611-0089: Slag Scraper DB-01│ ┌──────────────────────────────────────────────┐ │ └───────────────────────────────────────┘ │
│   [⚡ Drag into tree to map]       │ │ • Part Slot 1:                               │ │ ┌───────────────────────────────────────┐ │
│                                   │ │   [ QCAD38190 - SMC Dual Cylinder (2 EA) ]   │ │ │ ▧ TMP-HW-0105 - Custom Jig Fixture   │ │
│                                   │ │ • Part Slot 2:                               │ │ │   (External machined, drawing ok)     │ │
│                                   │ │   [ ➕ DRAG & DROP SPARE PART FROM TRAY HERE ]│ │ │   [✋ DRAG INTO CANVAS SLOT ➔]       │ │
│                                   │ └──────────────────────────────────────────────┘ │ └───────────────────────────────────────┘ │
├───────────────────────────────────┴──────────────────────────────────────────────────┴───────────────────────────────────────────┤
│  ACTIONS:  [➕ ADD MECHANISM TO MACHINE]   [📐 VIEW ASSEMBLY CAD]   [💾 SAVE EBOM CONFIG]   [📤 EXPORT TREE TO EXCEL]             │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Operational Workflows

### 3.1. Drag-and-Drop Slot Binding
- When an Engineer or LEC selects machine `DB-01`, Pane 2 displays the list of Mechanism Units configured for that equipment.
- The user drags a spare part card (e.g., `QCAD38190`) from the right-hand spare parts palette and drops it into `[➕ DRAG & DROP SPARE PART FROM TRAY HERE]`.
- The system immediately displays a standard configuration modal:
  - *Quantity mounted on this mechanism*: `2 EA`.
  - *Expected replacement lifecycle*: `1,000,000 cycles` (or `180 days`).
  - *Technical notes*: *"Installed at Z-axis sliding cylinder stroke"*.
- Clicking `Confirm` persists the record directly to the EBOM database without requiring manual code entry.

### 3.2. Late Declaration Queue Processing
- When a Field Engineer creates a procurement requisition for an emerging mechanism not yet mapped in the EBOM:
  - The requisition proceeds unhindered with the flag `EBOM_PENDING_MAPPING = true` to avoid blocking production.
  - The item automatically enters the **`⚠️ LATE DECLARATION QUEUE`** at the bottom of Pane 1.
- To complete the formal equipment record:
  1. The engineer clicks on the pending item in the queue.
  2. Clicks `[➕ Add Mechanism to Machine]`, enters a friendly Mechanism Name (e.g., *"Night-Shift Slag Scraper"*).
  3. Drags the corresponding spare part card and drops it into the newly created mechanism slot.
  4. The system clears `EBOM_PENDING_MAPPING` and logs the audit trail for the original purchase requisition.

### 3.3. Interaction Between Friendly Names and EM No
- Requestors never have to manually construct or type `HWBMTL21EC0101`.
- When the LEC clicks `[💾 Save EBOM Config]`:
  - The system parses the hierarchy: Factory = `HW`, Floor = `2`, Line = `1`, Machine = `EC`, Unit = `01`, Assembly = `01`.
  - Synthesizes the standardized code: `HWBMTL21EC0101` and stores it in the `em_no` field.
  - Displays side-by-side: `"Friendly Name: Feeder Assembly (HWBMTL21EC0101)"`.

---

## 4. Frontend State Schema

```typescript
interface EbomMechanismSlot {
  mechanismId: string;         // 'MECH-DB01-FEED-01'
  friendlyName: string;        // 'Feeder linear guide rail'
  unitCode: string;            // '01'
  assemblyCode: string;        // '01'
  emNoGenerated: string;       // 'HWBMTL21EC0101'
  boundParts: Array<{
    partCode: string;          // 'QDAB03583' or 'TMP-HW-0101'
    partName: string;
    maker: string;
    model: string;
    standardQty: number;       // 1
    unit: string;              // 'EA'
    replacementLifespan: string;
  }>;
  status: 'ACTIVE' | 'PENDING_LATE_DECLARATION';
}
```
