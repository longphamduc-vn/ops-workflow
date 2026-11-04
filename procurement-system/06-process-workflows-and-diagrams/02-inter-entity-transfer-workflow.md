# 02. Process Workflow: 3-Tier Waterfall Interlock Resolution & Inter-Entity Execution
> *Standardizing the 3-Tier Waterfall Resolution: Tier 1 Transfer -> Tier 2 Internal PO -> Tier 3 External Market Purchase via Nexacro EMS Core*

---

## 1. Detailed Flowchart: 3-Tier Waterfall Procurement Execution

```mermaid
flowchart TD
    Start["Item Requiring Interlock Procurement\n(Cleared with Cost Clearance CC-HW-YYYYMM-PASS)"] --> CheckInterEntity{"Does idle inventory exist at\nsister entity/plant?"}
    
    %% TIER 1: INTER-ENTITY TRANSFER
    subgraph TIER1["TIER 1: INTER-ENTITY TRANSFER (PRIORITY 1)"]
        CheckInterEntity -- "YES (Stock Available)" --> ReqTransfer["Submit Inter-Entity Inventory Transfer Request\n(Entity B / Plant 2 / Central Hub)"]
        ReqTransfer --> RespTransfer{"Sister Entity Response\n(Transfer Approval)?"}
        RespTransfer -- "APPROVE" --> SlipTransfer["Issue Warehouse Inter-Company Transfer Slip\nTransport parts to Factory HW"]
        SlipTransfer --> RecvTransfer["Receive parts into local inventory\n(Zero new capital expenditure)"]
        RecvTransfer --> InstallTransfer["Install on machine under Work Order\nSync ds_Inv -> COMPLETED"]
    end
    
    %% TIER 2: INTERNAL PO
    subgraph TIER2["TIER 2: INTER-COMPANY PURCHASE ORDER (PRIORITY 2)"]
        RespTransfer -- "REJECT (Reserved for safety buffer)" --> ReqInternalPO["Escalate to Tier 2: Initiate Internal PO Requisition\n(Under Corporate Inter-Company Pricing Framework)"]
        ReqInternalPO --> RespInternalPO{"Corporate Finance Response\n(Internal PO Approval)?"}
        RespInternalPO -- "APPROVE" --> InvoiceInternal["Issue Internal Commercial Invoice\n& Freight Logistics Shipment"]
        InvoiceInternal --> RecvInternal["Receive items into plant warehouse"]
        RecvInternal --> InstallInternal["Install on machine under Work Order\nSync ds_Inv -> COMPLETED"]
    end
    
    %% TIER 3: EXTERNAL MARKET PURCHASE
    subgraph TIER3["TIER 3: EXTERNAL PURCHASE ORDER VIA NEXACRO EMS (PRIORITY 3)"]
        CheckInterEntity -- "NO (No Group Stock)" --> RouteTier3["Route directly to Tier 3 External PO"]
        RespInternalPO -- "REJECT (Billing/Tax constraint)" --> RouteTier3
        RouteTier3 --> NegPrice["Procurement negotiates lowest qualified commercial price"]
        NegPrice --> InterfaceEMS["Interface requisition data into Nexacro EMS Core\nGenerate Purchase Requisition Voucher (PRV)"]
        InterfaceEMS --> SignEMS["Executive Leadership signs electronic approval\n100% ON NEXACRO EMS CORE (PO-99xxx)"]
        SignEMS --> Inbound3["Track 3 Inbound Milestones:\n1. Vendor Confirm Date | 2. ETA Port/Hub | 3. Customs"]
        Inbound3 --> RecvFactory["Physical goods arrive at Factory HW cleanroom warehouse\nWarehouse Keeper executes receiving inspection on EMS"]
        RecvFactory --> IssueMachine["Field Engineer issues parts and installs on machine (WO-xxxx)\nNexacro EMS synchronizes warehouse issue log ds_Inv"]
    end

    InstallTransfer --> EndWorkflow["All steps logged into Audit Trail & QCode Master"]
    InstallInternal --> EndWorkflow
    IssueMachine --> EndWorkflow
```

---

## 2. Business Specifications & Priority Ranking

### 2.1. The 3 Tiers Defined

1. **Tier 1: Inter-Entity Inventory Transfer (Chuyển Giao Kho Liên Pháp Nhân)**:
   - **Trigger**: Interlock scan detects surplus or idle components at sister factories (Entity B, Plant 2, Central Hub).
   - **Cost Impact**: **Zero new capital outflow**. Utilizes previously capitalized inventory.
   - **Action if Approved**: Generates warehouse transfer slip, moves stock between entity sub-inventories.
   - **Action if Rejected**: Sister plant reserves parts for their own emergency buffer $\rightarrow$ Automatically escalates to Tier 2.

2. **Tier 2: Inter-Company Purchase Order (Mua Hàng Nội Bộ - Internal PO)**:
   - **Trigger**: Transfer is rejected, but sister entity is willing to sell component via inter-company commercial agreement.
   - **Cost Impact**: Group-internal transfer pricing (typically lower than open market spot quotes).
   - **Action if Approved**: Internal purchase order released, cross-entity billing executed.
   - **Action if Rejected**: Inter-company budget exhaustion, cross-border customs restrictions, or tax tariff constraints $\rightarrow$ Automatically escalates to Tier 3.

3. **Tier 3: External Market Purchase via Nexacro EMS Core (Mua Thường Cục Bộ Giá Thấp Nhất)**:
   - **Trigger**: Neither transfer nor internal purchase is viable. External market procurement is mandatory.
   - **Governance**: Procurement department solicits competitive quotations to identify the lowest qualified market price.
   - **Approval Rule**: Requisition is interfaced into **LG Display Nexacro EMS Core**. Executive leadership signs PRV and PO **100% on Nexacro EMS Core**. The web platform is read-only for PO approval.
   - **Execution**: Official PO (`PO-99xxx`) released to external vendor. LEC tracks 3 Inbound milestones (`Vendor Confirm Date`, `ETA Port`, `Customs Clearance`). Parts received, installed under Work Order, and synchronized via `ds_Inv` into manufacturing product cost accounting.

---

## 3. Sequential Architectural Rules

1. **Mandatory Prerequisite: Cost Clearance Certificate (`CC-HW-YYYYMM-PASS`)**:
   - Strictly no Tier 1, Tier 2, or Tier 3 actions may proceed before the Cost Management Team formally approves the Beginning-of-Month Audit (Days 01–05) and issues the Cost Clearance Certificate.
2. **Deterministic Fall-Through**:
   - The system strictly enforces the sequential priority waterfall: $\text{Tier 1} \xrightarrow{\text{Reject}} \text{Tier 2} \xrightarrow{\text{Reject}} \text{Tier 3}$. No arbitrary bypassing of Tier 1 or Tier 2 is permitted.
