# 03. Periodic Auto-Requisition Engine (Auto-Requisition Engine)

> *Specification for Spare Parts Demand Suggestion Engine (Auto-Requisition Engine)*  
> *Core Principles: Serves Beginning-of-Month audit; Strictly NO automated Target/Over classification (LEC manually evaluates and classifies); Peer engineers within Part (no process/stage division); Progress tracking and data preparation.*

---

## 1. Periodic Execution Mechanism

The auto-requisition engine executes periodically at month-end to calculate consumable spare parts replenishment requirements, preparing data ready for the **BEGINNING-OF-MONTH cost review/audit session** between the LEC and the Cost Management department:

```mermaid
flowchart TD
    subgraph Inputs["Automated Input Data"]
        P_Plan["Upcoming month Smart Watch production plan\n(Models D111, D222, D333)"]
        EBOM_Norm["EBOM Tree: Consumption quota / MTBF\nby Machine & Unit"]
        Stock["Onhand inventory in HW warehouse + incoming PO Remained\n(From ops-workflow Read-Model)"]
    end

    subgraph Calculation["Calculation Engine"]
        Step1["Calculate theoretical consumable demand (BOM Demand)"]
        Step2["Deduct available stock: Net_Need = BOM Demand - (Onhand + PO Remained)"]
        Step3["Compare against Target Stock buffer & Vendor MOQ"]
    end

    subgraph Output["Suggested Output & Processing"]
        Draft["Automatically generate Suggested Draft Requisitions\n(Strictly requires official QCode)"]
        LECEval["LEC manually reviews and classifies:\n[TARGET] or [OVER BUDGET]"]
        Notify["Displayed on Engineer & Part Leader dashboard for progress review"]
    end

    P_Plan & EBOM_Norm --> Step1
    Stock --> Step2
    Step1 --> Step2 --> Step3 --> Draft --> LECEval --> Notify
```

---

## 2. Detailed Mathematical Formula

$$\text{Replenishment Demand} = \max\left(0, \left(\sum_{\text{Model}} \frac{\text{Projected Production Volume}}{\text{Spare Part Life Expectancy Quota}} \times \text{Installed Qty/Machine}\right) + \text{Target Buffer} - (\text{Onhand} + \text{PO Remained})\right)$$

*   If the result is $> 0$: Round up to the nearest **Minimum Order Quantity (MOQ)** or **Packaging Unit (Pack Size)**.
*   **Audit Prerequisite**: Only line items with **Official QCodes** are eligible for inclusion in the beginning-of-month audit package. Temporary codes (`TMP-HW-xxxx`) must complete technical documentation submission so the LEC can register official QCodes first.
*   **Strictly No Automated Classification**: The system solely outputs calculated demand suggestions. **The LEC directly evaluates and manually classifies** each item as either `TARGET` (within expense plan) or `OVER` (exceeding plan, requiring justification).
*   **Progress Tracking**: Machine engineers preview suggested line items and submit feedback regarding physical equipment conditions to the LEC ahead of the deadline configured by the LEC.
