# 02. Hợp Đồng API REST v1 & Schemas Kỹ Thuật

## 1. Cấu Trúc Các Endpoint Mới (REST API v1 Contract)

Tất cả các endpoint phục vụ giao diện người dùng được cung cấp bởi `ops-workflow` (FastAPI cổng `8000`):

```
POST /api/v1/master/batch-qcode-onboard              # Nhập hàng loạt QCode từ bảng & mã tạm
POST /api/v1/master/media/bulk-upload               # Tải lên hàng loạt hình ảnh & auto-matching
GET  /api/v1/ebom/tree                              # Lấy cây Process > Machine > Unit > Line
POST /api/v1/procurement/requisitions               # Tạo đơn mua (Đơn lẻ & Paste lưới)
GET  /api/v1/procurement/team-requisitions          # Leader xem đơn mua nội bộ team
POST /api/v1/procurement/requisitions/{id}/purchase # LEC cập nhật tiến độ báo giá Purchase
POST /api/v1/procurement/interlocks/resolve-batch   # Đánh giá Interlock Y/N & CheckDisuse
POST /api/v1/monthly-cycles/{cycle_id}/close        # LEC chốt kỳ tháng ngày 25
GET  /api/v1/monthly-cycles/{cycle_id}/audit-package# Xuất file báo cáo thẩm định Offline
POST /api/v1/monthly-cycles/{cycle_id}/confirm-scan # LEC tải file scan biên bản duyệt giấy
GET  /api/v1/settings/calculation-rules             # Lấy cấu hình công thức cho 5 loại nhu cầu
PUT  /api/v1/settings/calculation-rules             # Cập nhật công thức tính số lượng mua
GET  /api/v1/settings/plant-line-hierarchy          # Lấy cấu hình nhà xưởng, tòa, tầng, line
PUT  /api/v1/settings/plant-line-hierarchy          # Cập nhật cấu hình nhà xưởng & quy tắc line
GET  /api/v1/settings/organization-rbac             # Lấy cây tổ chức & phân quyền người dùng
PUT  /api/v1/settings/organization-rbac             # Cập nhật phân quyền & chỉ định LEC
GET  /api/v1/settings/sg-budget-parameters          # Lấy tỷ lệ ngân sách 33-33-34 & ngày 25
PUT  /api/v1/settings/sg-budget-parameters          # Cập nhật hạn mức ngân sách SG & SLA
GET  /api/v1/settings/ems-gateway-config            # Lấy tham số kết nối Nexacro Gateway
PUT  /api/v1/settings/ems-gateway-config            # Cập nhật tham số kết nối & Rate limiting
POST /api/v1/settings/ems-gateway/test-ping         # Kiểm thử kết nối ping tức thì sang EMS
GET  /api/v1/settings/dictionaries                  # Lấy danh mục 6 mã Over & quy tắc mã tạm
PUT  /api/v1/settings/dictionaries                  # Cập nhật danh mục chuẩn hóa
```

---

## 2. Chi Tiết Schemas Payload Tiêu Biểu

### 2.1. Đăng Ký Hàng Loạt QCode & Thuộc Tính Từ Bảng (`POST /api/v1/master/batch-qcode-onboard`)
```json
{
  "operator_id": "658359",
  "items": [
    {
      "temp_code": "TMP-HW-0101",
      "qcode": null,
      "item_name": "Board Nguồn CPX V4 Trumpf Controls",
      "maker": "TRUMPF",
      "model": "2912146",
      "buy_item_type": "SPR",
      "uom": "EA",
      "moq": 1,
      "pack_size": 1,
      "target_stock_qty": 2,
      "ebom_location": {
        "process": "DB",
        "machine_code": "DB-01",
        "unit_code": "HEAD-01",
        "line_no": "#201"
      }
    }
  ]
}
```

### 2.2. Tải Lên Hình Ảnh Hàng Loạt (`POST /api/v1/master/media/bulk-upload`)
*   **Content-Type**: `multipart/form-data`
*   **Body**:
    *   `files`: Danh sách 10-100 tệp hình ảnh (`.jpg`, `.png`, `.webp`, `.dwg`)
    *   `auto_match_by_filename`: `true` (Tự động regex trích xuất QCode/Mã tạm từ tên tệp để gán vào Master Item tương ứng).

### 2.3. Tạo Đơn Mua Với Nhãn Phân Loại Kế Hoạch (`POST /api/v1/procurement/requisitions`)
```json
{
  "requestor_id": "87021",
  "requestor_name": "Nguyen Van A",
  "team_code": "DB",
  "line_no": "#201",
  "order_type": "Ready-to-use",
  "work_order_no": "WO-248926091",
  "items": [
    {
      "item_id": "item_uuid_101",
      "qcode": "QDAD12236",
      "request_qty": 1,
      "plan_classification": "OVER_UNPLANNED",
      "over_reason_code": "OVR-01",
      "over_reason_detail": "Cháy board nguồn DB-01 do xung sét ca đêm",
      "image_urls": ["/uploads/2026/11/board_burned_01.webp"]
    }
  ]
}
```

### 2.4. Xác Nhận Phê Duyệt Offline Với Scan Kèm Theo (`POST /api/v1/monthly-cycles/{cycle_id}/confirm-scan`)
*   **Content-Type**: `multipart/form-data`
*   **Body**:
    *   `operator_id`: `658359` (Pham Duc Long)
    *   `reviewer_name`: "Bui Van Minh (Management Reviewer)"
    *   `approval_date`: `2026-11-26`
    *   `signed_file`: *(Tệp PDF scan biên bản họp có chữ ký)*
    *   `management_notes`: "Đồng ý phê duyệt phát sinh Over $15,000 cho sự cố máy DB-01"

### 2.5. Cấu Hình Công Thức Logic Mua Hàng (`PUT /api/v1/settings/calculation-rules`)
```json
{
  "updated_by": "658359",
  "rules": [
    {
      "rule_code": "REORDER_LOGIC_PM",
      "need_type": "PM",
      "default_classification": "IN_TARGET",
      "formula": "ceil((Plan_Output / MTBF_Norm) * Machine_Install_Qty) + Safety_Buffer - (Onhand + PO_Remained)",
      "allow_manual_override": true,
      "max_override_percent": 10.0,
      "require_schedule_date": true
    },
    {
      "rule_code": "REORDER_LOGIC_BREAKDOWN",
      "need_type": "BREAKDOWN",
      "default_classification": "OVER_UNPLANNED",
      "formula": "Actual_Damaged_Qty",
      "allow_manual_override": false,
      "require_work_order": true,
      "require_photos": true
    }
  ]
}
```

### 2.6. Cấu Hình Tham Số Kết Nối EMS Gateway (`PUT /api/v1/settings/ems-gateway-config`)
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
    "/emsspareparts/sp105/sp180Nav/EmergencyPoList"
  ]
}
```

