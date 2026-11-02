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

