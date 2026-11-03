# 02. Process Workflow: Inter-Entity Transactions (Inventory Transfer & Lowest-Cost Proxy Purchase)
> *Standardizing 2 Inter-Entity Transaction Branches, Y/N Confirmation Mechanism, Mandatory Official QCode Prerequisite & Execution Post Beginning-of-Month Audit*

---

## 1. Detailed Flowchart: 2 Inter-Entity Transaction Branches

```mermaid
flowchart TD
    Start["Item Requiring Inter-Entity Handling\n(Triggered when Interlock check stopPoFlag == 'Y')"] --> HasQCode{"Official QCode Exists?"}
    
    HasQCode -->|"Missing (Temporary TMP Code)"| HoldData["Data Preparation: CAD/Doc/Images\nLEC registers ERP QCode first"]
    HoldData --> HasQCode
    
    HasQCode -->|"Standard QCode Verified"| SelectRoute{"Select Transaction Route"}
    
    SelectRoute -->|"Route 1: Inventory Transfer"| TransferRoute["Request Idle Inventory Transfer\n(LGD HQ, Nanjing, Guangzhou...)"]
    SelectRoute -->|"Route 2: Lowest-Cost Proxy Purchase"| BuyCheapRoute["Delegate Sister Entity to Purchase\n(Framework contract with lowest price)"]
    
    TransferRoute --> SendReq1["Send Request via API retPartsTransferReqList"]
    BuyCheapRoute --> SendReq2["Send Request via API retOtherSitePoRevReqList\n(If locked: handled identically to Transfer)"]
    
    SendReq1 --> StatusWait["Transition status:\n⏳ PENDING_OTHER_ENTITY_CONFIRMATION\n(SLA Countdown Timer: 48 business hours)"]
    SendReq2 --> StatusWait
    
    StatusWait --> WaitConfirm{"Peer Entity Response (Y/N)?"}
    
    WaitConfirm -->|"1. Confirmed successfully ('Y')"| PassHold["Item queued into Audit Pending List\n(Beginning-of-Month Audit Meeting with Cost Management)"]
    
    WaitConfirm -->|"2. Unavailable / Procedural obstacle ('N')"| StepNext["ADVANCE TO NEXT INTERLOCK STEP\n(Check Disuse Parts ➔ Check SPR Repair)"]
    
    WaitConfirm -->|"3. SLA 48h Expired"| Timeout["SLA Breach Warning\nLEC logs justification and unlocks step progression"]
    
    PassHold --> AuditEarlyMonth{"Passed Beginning-of-Month Audit?"}
    
    AuditEarlyMonth -->|"Approved in Audit"| ExecAction["LEC CREATES PRV ON EMS FOR FORMAL APPROVAL SIGN-OFF\n(Dispatched/transported only after EMS approval)"]
    AuditEarlyMonth -->|"Rejected / Deferred"| CancelAction["Cancelled or rescheduled for subsequent cycle"]
```

---

## 2. Business Specifications & Sequential Constraints

### 2.1. Clear Distinction Between the Two Branches
1.  **Inventory Transfer**:
    - Applied when spare parts are already available in a peer entity's warehouse as excess safety stock or idle inventory.
    - Saves 100% of the cost of purchasing new parts from external suppliers.
2.  **Lowest-Cost Proxy Purchase from Peer Entity**:
    - Applied when an external supplier provides the identical component to LGD Korea or China at a lower unit contract price than quoted for LGD Vietnam.
    - If the purchase channel via the peer entity is also system-locked: Process identically to a Transfer order (dispatch request for partner confirmation, await response within 48 hours).

### 2.2. Mandatory Trigger Condition: After Beginning-of-Month Audit
> ⚠️ **APPROVAL & LEGAL CONSTRAINT**:  
> Even if the peer entity confirms agreement to transfer or purchase on our behalf (`status == 'CONFIRMED'`), **strictly no warehouse issuance orders or purchase orders may be issued prior to the Beginning-of-Month Audit review with the Cost Management department (Reviewer & Assistant is 1 single person)**.  
> Only after passing the offline audit will the LEC proceed to create a PRV on EMS for official management approval sign-off. Any transaction takes legal and financial effect only when EMS approval is fully completed.
