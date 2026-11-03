# 03. Process Workflow: RFQ Tracking, Exception Handling & Goods Receipt Progress Monitoring
> *Standardized Operational Boundaries: Purchase Negotiates Pricing with Suppliers, LEC Tracks RFQ Progress, Handles Email Exceptions, and Manually Enters Inbound Progress Milestones (Vendor Confirm Date, ETA, Monthly Expense Allocation Plan; Physical Goods Receipt Checked on EMS)*

---

## 1. Detailed Flowchart: Quotation Lifecycle & Inbound Progress Monitoring

```mermaid
flowchart TD
    subgraph S1["1. Requisition Initiation & Price Flag Check (unitPriceFlag)"]
        Req["Field engineer creates purchase requisition (Official QCode mandatory)"] --> PriceCheck{"Price Flag unitPriceFlag (Y/N)?"}
        PriceCheck -->|"Y (Contract unit price exists)"| DonePrice["ServeOne / Contract price available\n➔ Ready for LEC Target/Over classification"]
        PriceCheck -->|"N (No contract price)"| RFQ_Init["System updates status: ⏳ AWAITING RFQ QUOTATION"]
    end

    subgraph S2["2. Commercial Negotiation Phase (Purchase Department)"]
        RFQ_Init --> PurAction["Purchase specialist sends RFQ to external vendor\n(ServeOne, SMC, Keyence, Trumpf...)"]
        PurAction --> VenResponse{"Vendor Response"}
    end

    subgraph S3["3. Branching: Standard Quotation vs. Email-Reported Exception"]
        VenResponse -->|"Standard quotation"| NormalFlow["Purchase updates agreed unit price into EMS"]
        NormalFlow --> DonePrice
        
        VenResponse -->|"EXCEPTION DETECTED\n(EOL / Price surge / Lead time > 120 days)"| ExMail["Purchase sends exception alert email to LEC"]
    end

    subgraph S4["4. Technical Exception Handling (Executed by LEC)"]
        ExMail --> LEC_Input["LEC opens 'RFQ Exception Handling' form on system:\n• Quotes email content from Purchase\n• Attaches email / quotation file\n• Selects resolution: Substitute part code / SPR repair"]
        LEC_Input --> SysAlert["System transitions status: ⚠️ RFQ_EXCEPTION\nDispatches clarification prompt to Engineer"]
        SysAlert --> ReqAction{"Engineer Response"}
        ReqAction -->|"Accept substitute code"| UpdateOrder["Update to new spare part code"]
        ReqAction -->|"Retain original & provide technical justification"| ReExplain["Resubmit technical rationale to LEC & Purchase"]
        UpdateOrder --> DonePrice
    end

    subgraph S5["5. Beginning-of-Month Audit & Manual Inbound Progress Tracking"]
        DonePrice --> AuditMonth["BEGINNING-OF-MONTH Cost Audit Meeting with Cost Management (1 person)\n(LEC manually classifies [TARGET] or [OVER UNPLANNED])"]
        AuditMonth --> EMS_PO["LEC creates PRV on EMS ➔ Approvers sign off ➔ EMS issues PO"]
        
        EMS_PO --> ManualTracking["LEC MANUALLY ENTERS PROGRESS MILESTONES ON SYSTEM:\n1. 📅 Vendor Confirm Estimated Dispatch Date\n2. 🚚 Estimated Time of Arrival (ETA) at factory\n3. 📊 Monthly Expense Allocation Plan (Expense distribution)"]
        
        ManualTracking --> EMS_Receipt["CHECK PHYSICAL GOODS RECEIPT ON EMS:\n(Goods Receipt completed on EMS ➔ Synced automatically into system)"]
    end
```

---

## 2. Business Specifications & Progress Monitoring

1.  **Clear Boundary on Quotations**:
    - The LEC does not handle commercial pricing duties in place of Purchase. All supplier negotiations, quotations, and volume discounts are the sole responsibility of the Purchasing department. The LEC only monitors the `unitPriceFlag` status in the system.
2.  **Transparency for Email-Reported Exceptions**:
    - When unexpected delays or roadblocks occur (manufacturer End-of-Life [EOL], abnormal lead times), the LEC quotes the verbatim email received from Purchase into the system so engineers have immediate visibility, eliminating misunderstandings or suspicion of administrative delays.
3.  **Manual Inbound Progress Monitoring**:
    - **Final Goods Receipt Verification**: Inspected and verified directly on Core EMS; once the warehouse completes physical goods receipt, the status is automatically synchronized into the system.
    - **Intermediate Milestones Prior to Arrival**: Because EMS does not record upstream manufacturer milestones, the LEC **manually enters them in this system**:
      * **Vendor Confirm Estimated Dispatch Date**: The date the vendor officially confirms outbound shipment from their manufacturing facility.
      * **Estimated Time of Arrival (ETA)**: Projected arrival date at port or delivery at the HW factory floor.
      * **Monthly Expense Allocation Plan**: Schedule dividing projected material usage across calendar months to balance SG budget expense allocations and prevent single-month budget cap overruns.
