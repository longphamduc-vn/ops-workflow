# 02. Hợp Đồng API REST v1 & Schemas Kỹ Thuật
> *Đặc tả hợp đồng API REST v1 cho Hệ thống Mua sắm & Tối ưu Tồn kho Factory HW*  
> *Hỗ trợ luồng thẩm định đầu tháng, kiểm soát tiến độ nhập hàng thủ công (Vendor confirm, ETA, phân bổ chi phí), luồng phản hồi 3 bên, và cờ agingInterlock tồn kho khác Team.*

---

## 1. Cấu Trúc Các Endpoint Mới (REST API v1 Contract)

Tất cả các endpoint phục vụ giao diện người dùng được cung cấp bởi `ops-workflow` (FastAPI cổng `8000`):

```
POST /api/v1/master/batch-qcode-onboard              # Nhập hàng loạt data kỹ thuật QCode từ folder/bảng & mã tạm
POST /api/v1/master/media/bulk-upload               # Tải lên hàng loạt hình ảnh & auto-matching
GET  /api/v1/ebom/tree                              # Lấy cây Machine > Unit > Line (Tên thân thiện)
POST /api/v1/procurement/requisitions               # Tạo yêu cầu mua (Bắt buộc QCode cho thẩm định)
GET  /api/v1/procurement/team-requisitions          # Leader & Kỹ sư xem tiến độ mua nội bộ team
POST /api/v1/procurement/requisitions/{id}/shipping-progress # LEC nhập thủ công: Vendor confirm, ETA, Phân bổ chi phí
POST /api/v1/procurement/requisitions/{id}/purchase # LEC cập nhật tiến độ báo giá RFQ với Purchase
POST /api/v1/procurement/interlocks/resolve-batch   # Đánh giá Interlock Y/N & CheckDisuse
GET  /api/v1/inventory/cross-team-alerts            # Danh sách cờ agingInterlockFlag tồn kho Team khác & persistent tasks
POST /api/v1/monthly-cycles/deadlines               # LEC cấu hình hạn Deadline giải trình & chốt thẩm định
POST /api/v1/monthly-cycles/{cycle_id}/close        # LEC chốt hồ sơ thẩm định ĐẦU THÁNG (Có QCode)
GET  /api/v1/monthly-cycles/{cycle_id}/audit-package# Xuất file báo cáo thẩm định đầu tháng
POST /api/v1/monthly-cycles/{cycle_id}/inquiries    # Reviewer Cost Management gửi yêu cầu làm rõ cho LEC
POST /api/v1/monthly-cycles/{cycle_id}/inquiries/{id}/assign  # LEC điều phối câu hỏi cho Kỹ sư
POST /api/v1/monthly-cycles/{cycle_id}/inquiries/{id}/respond # Kỹ sư nộp bằng chứng phản hồi cho LEC/Reviewer
POST /api/v1/monthly-cycles/{cycle_id}/confirm-scan # LEC tải file scan biên bản duyệt giấy sau thẩm định
GET  /api/v1/settings/calculation-rules             # Lấy cấu hình công thức cho 5 loại nhu cầu
PUT  /api/v1/settings/calculation-rules             # Cập nhật công thức tính số lượng mua
GET  /api/v1/settings/plant-line-hierarchy          # Lấy cấu hình nhà xưởng, tòa, tầng, line (Left(Line,1)=Floor)
PUT  /api/v1/settings/plant-line-hierarchy          # Cập nhật cấu hình nhà xưởng & quy tắc line
GET  /api/v1/settings/organization-rbac             # Lấy cây tổ chức 3 cấp (Team => Part => Peers)
PUT  /api/v1/settings/organization-rbac             # Cập nhật phân quyền & chỉ định LEC
GET  /api/v1/settings/sg-budget-parameters          # Lấy tham số ngân sách SG No-Rollover & deadlines
PUT  /api/v1/settings/sg-budget-parameters          # Cập nhật hạn mức ngân sách SG tháng thủ công
GET  /api/v1/settings/ems-gateway-config            # Lấy tham số kết nối Nexacro Gateway
PUT  /api/v1/settings/ems-gateway-config            # Cập nhật tham số kết nối & Rate limiting
POST /api/v1/settings/ems-gateway/test-ping         # Kiểm thử kết nối ping tức thì sang EMS
GET  /api/v1/settings/dictionaries                  # Lấy danh mục 6 mã Over (OVR-01..06) & quy tắc mã tạm
PUT  /api/v1/settings/dictionaries                  # Cập nhật danh mục chuẩn hóa
```

---

## 2. Chi Tiết Schemas Payload Tiêu Biểu

### 2.1. Đăng Ký Hàng Loạt Dữ Liệu QCode Từ Folder/Bảng (`POST /api/v1/master/batch-qcode-onboard`)
```json
{
  "operator_id": "658359",
  "folder_name": "Setup_DB01_Jig",
  "items": [
    {
      "temp_code": "TMP-HW-0101",
      "official_qcode": null,
      "item_name": "Board Nguồn CPX V4 Trumpf Controls",
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

### 2.2. Nhập Tiến Độ Nhập Hàng Thủ Công (`POST /api/v1/procurement/requisitions/{id}/shipping-progress`)
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
      "notes": "Lắp thay thế ngay cho máy DB-01"
    }
  ]
}
```

### 2.3. Cầu Nối Phản Hồi 3 Bên: Reviewer Tạo Yêu Cầu Làm Rõ (`POST /api/v1/monthly-cycles/{cycle_id}/inquiries`)
```json
{
  "reviewer_id": "89012",
  "reviewer_name": "Nguyen Thi Mai (Cost Management Reviewer)",
  "requisition_id": "REQ-2611-0012",
  "qcode": "QDAD12236",
  "inquiry_type": "OVER_EXPLANATION",
  "question": "Mã này báo OVR-01 sự cố máy, yêu cầu cung cấp báo cáo kỹ thuật xác nhận không thể sửa chữa bo mạch cũ và biên bản sự cố ca đêm."
}
```

### 2.4. Kỹ Sư / LEC Phản Hồi Làm Rõ Cho Reviewer (`POST /api/v1/monthly-cycles/{cycle_id}/inquiries/{id}/respond`)
```json
{
  "respondent_id": "87021",
  "respondent_role": "REQUESTOR",
  "lec_reviewer_id": "658359",
  "answer": "Đã đính kèm biên bản sự cố chập nổ tụ C14 và email hãng TRUMPF từ chối sửa chữa bo mạch nhiều lớp.",
  "attachments": [
    "/uploads/inquiries/BB_su_co_2489.pdf",
    "/uploads/inquiries/Email_Trumpf_Reject_Repair.pdf"
  ]
}
```

### 2.5. Tạo Đơn Mua Với Cảnh Báo Tồn Kho Khác Team (`POST /api/v1/procurement/requisitions`)
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
    "/emsspareparts/sp105/sp180Nav/EmergencyPoList",
    "/emsspareparts/sp130/sp130Nav/retrieveBuyMainList"
  ]
}
```
