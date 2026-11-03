# 02. REST API v1 Contracts & Technical Schemas
> *REST API v1 Contract Specification for the Factory HW Spare Parts Procurement & Inventory Optimization System*  
> *Supports beginning-of-month audit workflow, manual inbound progress tracking (Vendor confirm, ETA, monthly expense allocation plan), 3-party clarification loop, and cross-team agingInterlock inventory flags.*

---

## 1. Endpoint Structure (REST API v1 Contract)

All endpoints serving the user interface are hosted by `ops-workflow` (FastAPI on port `8000`):

```
POST /api/v1/master/batch-qcode-onboard              # Bulk onboarding of QCode technical data from folder/spreadsheet & temp codes
POST /api/v1/master/media/bulk-upload               # Bulk image upload & auto-matching
GET  /api/v1/ebom/tree                              # Retrieve Machine > Unit > Line tree (Friendly machine names)
POST /api/v1/procurement/requisitions               # Create purchase requisition (Official QCode mandatory for audit)
GET  /api/v1/procurement/team-requisitions          # Leaders & Engineers view internal team procurement progress
POST /api/v1/procurement/requisitions/{id}/shipping-progress # LEC manual entry: Vendor confirm, ETA, Monthly expense allocation
POST /api/v1/procurement/requisitions/{id}/purchase # LEC updates RFQ quotation progress with Purchase
POST /api/v1/procurement/interlocks/resolve-batch   # Evaluate Interlock Y/N flags & CheckDisuse
GET  /api/v1/inventory/cross-team-alerts            # List cross-team agingInterlockFlag alerts & persistent tasks
POST /api/v1/monthly-cycles/deadlines               # LEC configures justification deadlines & audit closing cutoff
POST /api/v1/monthly-cycles/{cycle_id}/close        # LEC locks BEGINNING-OF-MONTH audit dossier (Items with QCode only)
GET  /api/v1/monthly-cycles/{cycle_id}/audit-package# Export beginning-of-month audit report dossier
POST /api/v1/monthly-cycles/{cycle_id}/inquiries    # Cost Management Reviewer submits clarification request to LEC
POST /api/v1/monthly-cycles/{cycle_id}/inquiries/{id}/assign  # LEC routes clarification query to responsible Engineer
POST /api/v1/monthly-cycles/{cycle_id}/inquiries/{id}/respond # Engineer submits clarification evidence to LEC/Reviewer
POST /api/v1/monthly-cycles/{cycle_id}/confirm-scan # LEC uploads scanned signed minutes post-audit
GET  /api/v1/settings/calculation-rules             # Retrieve calculation formula configuration across 5 demand types
PUT  /api/v1/settings/calculation-rules             # Update purchase quantity calculation formulas
GET  /api/v1/settings/plant-line-hierarchy          # Retrieve plant, building, floor, line hierarchy (Left(Line,1)=Floor)
PUT  /api/v1/settings/plant-line-hierarchy          # Update plant layout & line mapping rules
GET  /api/v1/settings/organization-rbac             # Retrieve 3-tier organizational hierarchy (Team => Part => Peers)
PUT  /api/v1/settings/organization-rbac             # Update RBAC permissions & assign LEC
GET  /api/v1/settings/sg-budget-parameters          # Retrieve SG budget parameters (Strict No-Rollover) & deadlines
PUT  /api/v1/settings/sg-budget-parameters          # Update monthly SG budget ceiling manually
GET  /api/v1/settings/ems-gateway-config            # Retrieve Nexacro Gateway connection parameters
PUT  /api/v1/settings/ems-gateway-config            # Update connection parameters & Rate limiting
POST /api/v1/settings/ems-gateway/test-ping         # Instant ping test to EMS gateway
GET  /api/v1/settings/dictionaries                  # Retrieve 6 Over cause codes (OVR-01..06) & temporary code formats
PUT  /api/v1/settings/dictionaries                  # Update standardized dictionary taxonomies
```

---

## 2. Representative Payload Schemas

### 2.1. Bulk QCode Data Onboarding from Folder/Spreadsheet (`POST /api/v1/master/batch-qcode-onboard`)
```json
{
  "operator_id": "658359",
  "folder_name": "Setup_DB01_Jig",
  "items": [
    {
      "temp_code": "TMP-HW-0101",
      "official_qcode": null,
      "item_name": "Trumpf Controls CPX V4 Power Board",
      "maker": "TRUMPF",
      "model": "2912146",
      "buy_item_type": "SPR",
      "uom": "EA",
      "moq": 1,
      "pack_size": 1,
      "target_stock_qty": 2,
      "ebom_location": {
        "machine_code": "DB-01",
        "unit_code": "HEAD-01",
        "line_no": "#201"
      },
      "attached_files": ["CAD_Fix_01.dwg", "Catalog_Trumpf.pdf"]
    }
  ]
}
```

### 2.2. Manual Inbound Progress Milestone Entry (`POST /api/v1/procurement/requisitions/{id}/shipping-progress`)
```json
{
  "operator_id": "658359",
  "vendor_confirmed_delivery_date": "2026-11-20",
  "estimated_time_of_arrival": "2026-11-25",
  "monthly_expense_allocation": [
    {
      "month": "2026-11",
      "allocated_qty": 1,
      "allocated_amount_usd": 3150.00,
      "notes": "Immediate replacement installation for DB-01 machine"
    }
  ]
}
```

### 2.3. 3-Party Clarification Bridge: Reviewer Creates Clarification Request (`POST /api/v1/monthly-cycles/{cycle_id}/inquiries`)
```json
{
  "reviewer_id": "89012",
  "reviewer_name": "Nguyen Thi Mai (Cost Management Reviewer)",
  "requisition_id": "REQ-2611-0012",
  "qcode": "QDAD12236",
  "inquiry_type": "OVER_EXPLANATION",
  "question": "This item was tagged OVR-01 machine breakdown; submit technical report confirming old board is unrepairable along with night shift incident log."
}
```

### 2.4. Engineer / LEC Responds to Reviewer Query (`POST /api/v1/monthly-cycles/{cycle_id}/inquiries/{id}/respond`)
```json
{
  "respondent_id": "87021",
  "respondent_role": "REQUESTOR",
  "lec_reviewer_id": "658359",
  "answer": "Attached failure report for shorted capacitor C14 and official TRUMPF email declining multilayer PCB repair.",
  "attachments": [
    "/uploads/inquiries/Incident_Report_2489.pdf",
    "/uploads/inquiries/Email_Trumpf_Reject_Repair.pdf"
  ]
}
```

### 2.5. Create Purchase Requisition with Cross-Team Aging Stock Alert (`POST /api/v1/procurement/requisitions`)
```json
{
  "requestor_id": "87021",
  "requestor_name": "Nguyen Van A",
  "part_code": "CP/SG Part 1",
  "line_no": "#201",
  "order_type": "Breakdown Repair",
  "work_order_no": "WO-248926091",
  "items": [
    {
      "item_id": "item_uuid_101",
      "qcode": "QCAD38190",
      "request_qty": 2,
      "aging_interlock_flag": "Y",
      "holding_team_name": "PO Module Tech Team 1",
      "persistent_task_created": true,
      "unit_price_flag": "Y",
      "estimated_unit_price": 45.00
    }
  ]
}
```

### 2.6. EMS Gateway Connection Parameters Configuration (`PUT /api/v1/settings/ems-gateway-config`)
```json
{
  "updated_by": "admin",
  "gateway_url": "http://ems.lgdisplay.com:9000",
  "organization_id": "28753",
  "default_lec_user_id": "658359",
  "rate_limiting": {
    "max_concurrent_requests": 3,
    "min_interval_ms": 100,
    "request_timeout_seconds": 30
  },
  "session_management": {
    "auto_relogin_on_timeout": true,
    "keepalive_interval_minutes": 15
  },
  "allowed_services": [
    "/emsspareparts/sp302/sp330Nav/TargetStockSearchList",
    "/emsspareparts/sp40/sp401Nav/retPartsTransferReqList",
    "/emsspareparts/sp40/sp405Nav/retOtherSitePoRevReqList",
    "/emscom/popupNav/retrieveItemPoStatusList",
    "/emsspareparts/sp102/sp130Nav/save130PrvData",
    "/emsspareparts/sp102/sp135Nav/retrieveItemInfoDetail",
    "/emsspareparts/sp105/sp180Nav/EmergencyPoList",
    "/emsspareparts/sp130/sp130Nav/retrieveBuyMainList"
  ]
}
```
