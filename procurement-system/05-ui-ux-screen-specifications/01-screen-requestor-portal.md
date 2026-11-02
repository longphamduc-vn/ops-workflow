# 01. Đặc Tả Giao Diện Chi Tiết: Màn Hình Kỹ Sư Requestor Portal
> *Thiết kế đầy đủ thành phần: Bộ giải mã EM No (HWBMTL21EC0101), Cây EBOM, Phân loại Trong Target vs Over*

---

## 1. Tổng Quan Kiến Trúc Giao Diện (Layout Anatomy)

Màn hình Kỹ sư Requestor được chia thành 4 phân vùng chức năng chuẩn công nghiệp:
1.  **Header & Breadcrumbs**: Hiển thị ngữ cảnh nhà máy `Factory HW (Smart Watch)`, đơn vị `Team => Part => Process` và thông tin kỹ sư.
2.  **Bộ Giải Mã Thiết Bị EM No Thông Minh (Smart EM No Resolver Card)**: Tích hợp giải mã 14 ký tự `HWBMTL21EC0101` với cơ chế chọn tương hỗ 2 chiều.
3.  **Khung Thông Tin Phụ Tùng & Snapshot Tồn Kho Tức Thời**: Hiển thị Master Item, QCode hoặc Mã tạm `TMP-HW-xxxx`, thông số kỹ thuật, bản vẽ CAD và 5 chỉ số tồn kho từ Read-Model.
4.  **Khung Định Tuyến Kế Hoạch & Biện Giải (Target vs Over Evaluator)**: Tự động phân loại `🟢 TRONG TARGET` hoặc `🔴 OVER NGOÀI KẾ HOẠCH` kèm 6 mã lý do và mã lệnh `Work Order`.

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  HỆ THỐNG MUA BÁN PHỤ TÙNG SMART WATCH — FACTORY HW                 [🔔 3 Thông báo]  [👤 Nguyen Van A (Eng Process)] │
│ Ngữ cảnh: Factory HW (Smart Watch) > PO Module Tech Team 2 > CP/SG Part 1 > Process: DB (Die Bonding)          Vai trò: Requestor│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB ĐIỀU HƯỚNG:  [🔵 TẠO ĐƠN MỚI (F2)]   [📋 ĐƠN CỦA TÔI (14)]   [🌳 DUYỆT CÂY EBOM]   [⚡ ĐĂNG KÝ HÀNG LOẠT (EXCEL)]             │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. BỘ ĐỊNH DANH VỊ TRÍ THIẾT BỊ 14 KÝ TỰ (SMART EM NO RESOLVER)                                                                   │
│  Nhập nhanh mã EM No: [ HWBMTL21EC0101                ] [📷 Quét Barcode] [🔍 Kiểm tra vị trí]                                   │
│  ↳ HIỂN THỊ PHÂN TÁCH TRỰC QUAN 14 KÝ TỰ (COLOR-CODED CHIPS):                                                                    │
│     ┌─────────────┬─────────────────┬──────────┬──────────┬─────────────┬─────────────┬─────────────┐                            │
│     │ [HW]        │ [BMTL]          │ [2]      │ [1]      │ [EC]        │ [01]        │ [01]        │                            │
│     │ Factory HW  │ Module Tech Line│ Floor 2F │ Line #201│ Machine EC  │ Unit 01     │ Assembly 01 │                            │
│     │ (SmartWatch)│ (Phân hệ dây ch)│ (Tầng 2) │ (Hexa: 1)│ (Máy gắp chip (Cụm đầu gắp)│ (Cụm xilanh)│                            │
│     └─────────────┴─────────────────┴──────────┴──────────┴─────────────┴─────────────┴─────────────┘                            │
│  Hoặc chọn phân cấp thủ công:                                                                                                    │
│  Factory: [ HW (Smart Watch) ▼ ]  Tầng: [ 2F ▼ ]  Line: [ #201 (Hex: 1) ▼ ]  Machine: [ EC ▼ ]  Unit: [ 01 ▼ ]  Assy: [ 01 ▼ ]   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. CHẾ ĐỘ ĐẶT HÀNG & LỆNH BẢO TRÌ SẢN XUẤT (ORDER TYPE & WORK ORDER)                                                             │
│  Chế độ đặt hàng:                                                                                                                │
│    ( ) Bổ sung định kỳ / Bù tồn an toàn (In-Plan Replenishment)                                                                  │
│    (•) KHẨN CẤP / DÙNG NGAY TRÊN DÂY CHUYỀN (즉사용 - Ready-to-use Emergency)                                                       │
│                                                                                                                                  │
│  Mã Lệnh Sửa Máy (Work Order No): [ WO-248926091                ]  * Bắt buộc cho đơn dùng ngay                                  │
│  Mã Thực Thể Thiết Bị (WIP Entity):[ WIP-EC-LINE201-08           ]  Ngày yêu cầu có mặt tại line: [ 2026-11-08 📅 ]               │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. THÔNG TIN PHỤ TÙNG & DỮ LIỆU TỒN KHO TỨC THỜI (READ-MODEL SNAPSHOT)                                                           │
│  Mã Phụ Tùng: [ QDAD12236                 ▼ ]  [ Hoặc cấp mã tạm: TMP-HW-xxxx ]  [📂 Mở thư viện EBOM]                           │
│  Tên Chi Tiết: Board Nguồn Điều Khiển CPX Controls V4       Nhà Sản Xuất: TRUMPF (Đức)         Quy cách: Model 2912146          │
│  Nhóm Mua:     [ SPR - Phụ tùng phục hồi/sửa chữa ]         Đơn Vị Tính:  [ EA - Chiếc ]       Bản vẽ CAD: [ 📐 FDM_QDAD12236.dwg]│
│  ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  │
│  THANH ĐỐI SOÁT TỒN KHO NỘI BỘ (Đồng bộ tức thời từ ops-workflow Read-Model):                                                   │
│  ┌──────────────────────┬──────────────────────┬──────────────────────┬────────────────────┬──────────────────────────────────┐  │
│  │  Tồn Kho Khả Dụng HW │  PO Remained Đang Về │  PO Standby Chờ Duyệt│  Target Stock Chuẩn│  Số Lượng Đặt Hàng Tối Thiểu     │  │
│  │        0 EA          │         1 EA         │         0 EA         │        2 EA        │  MOQ: 1 EA  |  Pack Size: 1 EA   │  │
│  └──────────────────────┴──────────────────────┴──────────────────────┴────────────────────┴──────────────────────────────────┘  │
│                                                                                                                                  │
│  Số Lượng Cần Mua: [ 1 ] EA               Đơn Giá Ước Tính: $3,150.00 USD          Thành Tiền Dự Kiến: $3,150.00 USD             │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. ĐÁNH GIÁ KẾ HOẠCH & GIẢI TRÌNH (PLAN EVALUATION & JUSTIFICATION)                                                             │
│  Hệ Thống Tự Động Phân Loại Kế Hoạch:                                                                                            │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 🔴 OVER NGOÀI KẾ HOẠCH (OVER_UNPLANNED)                                                                                    │  │
│  │ ↳ Căn cứ: Yêu cầu thuộc chế độ "Dùng ngay khẩn cấp" do sự cố dừng máy Line #201, không nằm trong lịch bảo dưỡng định kỳ     │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                                  │
│  Mã Nguyên Nhân Over (Bắt buộc): [ OVR-01: Sự cố máy hỏng bất thường (Machine Breakdown)                                  ▼ ]   │
│  Mô tả sự cố & Lý do: [ Cháy nổ bo mạch công suất do xung sét ca đêm, máy EC trên Line #201 dừng hoạt động hoàn toàn.      ]    │
│  Vấn đề & Hậu quả:    [ Nếu không có board thay trong 48h, toàn bộ dây chuyền Smart Watch D111 bị chậm tiến độ giao hàng.  ]    │
│  Hiện trạng máy:      [ Máy EC báo lỗi Alarm E-502, cầu chì nguồn F1 bị đứt, cuộn cảm biến nhiệt độ quá ngưỡng an toàn.   ]    │
│  Hình ảnh hiện trường:[ 🖼️ board_chay_01.jpg (1.8MB) ❌ ] [ 🖼️ error_screen_E502.png (850KB) ❌ ] [ ➕ Kéo thả thêm ảnh... ]      │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [💾 Lưu Bản Nháp (Draft)]       [👁️ Xem Trước Phiếu PRV]       [🚀 GỬI DUYỆT SANG LEADER CÔNG ĐOẠN & LEC TRONG TEAM (Ctrl+Enter)] │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Bảng Đặc Tả Chi Tiết Từng Phần Tử Giao Diện (Field Specification Matrix)

| Tên trường / Thành phần | Loại UI Component | Quy tắc dữ liệu & Ràng buộc Validation | Nguồn dữ liệu & Xử lý sự kiện |
| :--- | :--- | :--- | :--- |
| **`emNo` Input** | Text Search & Barcode Button | Chuỗi đúng 14 ký tự alphanumeric (`^[A-Z0-9]{14}$`). | Nhập xong kích hoạt parser phân tích: Fac, Floor, Line, Machine, Unit, Assembly. |
| **Color-coded Chips** | Visual Badges Component | 7 thẻ màu: HW (Xanh dương), BMTL (Xám), Floor (Tím), Line (Cam), EC (Xanh lá), Unit (Vàng), Assy (Đỏ). | Tự động đổi màu và tooltip giải thích khi gõ mã EM No. |
| **Order Type Radio** | Radio Group | 2 tùy chọn: `IN_PLAN_REPLENISHMENT` hoặc `READY_TO_USE`. | Chọn `READY_TO_USE` $\rightarrow$ Ép buộc hiển thị các trường Work Order và mã `OVR-01`. |
| **Work Order No** | Text Autocomplete | Bắt đầu bằng `WO-` kèm 9 chữ số. | Kiểm tra tính hợp lệ qua API `/emscom/woSearchNav/retrieveWipEntity.lgdn`. |
| **Item Search** | Async Combobox | Cho phép gõ tìm theo: QCode, Tên, Maker, Model, hoặc Mã tạm `TMP-HW-xxxx`. | Tra cứu trực tiếp từ bảng Read-Model `procurement_stock_optimization`. |
| **Stock Snapshot Bar** | 5-Cell Metric Card | Read-only. Cập nhật số liệu tồn kho on-hand, PO remained, target stock trong 50ms. | Gọi REST API `/api/v1/datasets/procurement_stock_optimization_dataset`. |
| **Plan Badge** | Dynamic Badge Banner | `🟢 TRONG TARGET` (Xanh lá) hoặc `🔴 OVER NGOÀI KẾ HOẠCH` (Đỏ đậm). | Đánh giá tự động theo: Loại đơn, hạn mức Target Stock, và chênh lệch tồn khả dụng. |
| **Over Reason Dropdown**| Single Select Dropdown | Bắt buộc chọn khi badge là `OVER`. Danh sách: `OVR-01` đến `OVR-06`. | Lưu vào trường `over_reason_code` để xuất hồ sơ thẩm định offline. |
| **Dropzone Đính Kèm** | Drag-and-Drop Area | Hỗ trợ JPG, PNG, WEBP, PDF, DWG. Kích thước tối đa 10MB/tệp. Tối đa 5 tệp. | Tự động tạo ảnh thumbnail và lưu vào kho lưu trữ media. |

---

## 4. Các Trạng Thái Giao Diện & Thông Báo Lỗi (UI States & Error Feedback)

1.  **Trạng thái Quét EM No Không Hợp Lệ (Invalid EM No Format)**:
    *   *Điều kiện*: Người dùng nhập chuỗi ít hơn hoặc nhiều hơn 14 ký tự (ví dụ `HWBMTL21EC01`).
    *   *Hiển thị*: Khung viền ô biến thành màu đỏ, thanh chip hiển thị cảnh báo: *"⚠️ Định dạng mã EM No không hợp lệ (Phải đúng 14 ký tự: Factory(2) + BMTL(4) + Floor(1) + LineHex(1) + Machine(2) + Unit(2) + Assembly(2))"*.
2.  **Trạng thái Thiếu Lệnh Máy Khi Chọn Dùng Ngay**:
    *   *Điều kiện*: Người dùng chọn "Khẩn cấp / Dùng ngay" nhưng bỏ trống trường `Work Order No`.
    *   *Hiển thị*: Focus tự động vào ô Work Order kèm tooltip màu đỏ nhấp nháy: *"Bắt buộc nhập mã Work Order hợp lệ khi lập đơn mua dùng ngay ngoài kế hoạch"*.
3.  **Trạng thái Gửi Thành Công**:
    *   *Hiển thị*: Hiển thị Toast thông báo màu xanh góc phải trên: *"✅ Đã gửi thành công đơn mua PRV-[Mã] đến Leader công đoạn DB và LEC Pham Duc Long"*. Chuyển hướng người dùng sang tab *Đơn của tôi*.
