# 06. MÀN HÌNH THÔNG TIN THẨM ĐỊNH QUẢN LÝ CHI PHÍ ĐẦU THÁNG & BÁO CÁO 4 SHEET

> **Mã màn hình**: `UI-INFO-05`  
> **Tên màn hình**: Cost Management Monthly Audit, Over Inquiry & Fixed 4-Sheet Report Information Screen  
> **Vai trò người dùng**: Chuyên viên Quản lý Chi phí (Cost Management Department) — **Reviewer & Assistant hợp nhất thành 1 cá nhân duy nhất (Trần Thị Hường)**.  
> **Thời điểm thẩm định (Nguyên tắc vàng #4)**: Định kỳ diễn ra vào **ĐẦU MỖI THÁNG (TỪ NGÀY 01 ĐẾN 05)**.  
> **Điều kiện tiên quyết (Nguyên tắc vàng #5)**: **BẮT BUỘC PHẢI CÓ MÃ QCODE CHÍNH THỨC**. Toàn bộ mã tạm `TMP-HW-xxxx` bị khóa khỏi phiên thẩm định.

---

## 1. CẤU TRÚC BỐ CỤC KHÔNG GIAN THÔNG TIN (LAYOUT ANATOMY)

Màn hình được thiết kế theo cấu trúc Tab 3 phân hệ thẩm tra tài chính:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Cổng Thẩm Định Ban Quản Lý Chi Phí | Chuyên viên: Trần Thị Hường | Kỳ Thẩm Định: Tháng 11/2026 │
│ 📅 LỊCH THẨM ĐỊNH: Ngày 01-05 Đầu Tháng | Trạng thái: Đang thẩm tra danh mục Target/Over & Tồn kho >30d│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ĐIỀU HƯỚNG 3 PHÂN HỆ THẨM TRA (3 AUDIT TABS):                                                          │
│ [ TAB 1: Danh Mục Thẩm Định Đầu Tháng ] [ TAB 2: Kiểm Thảo Tồn Kho >30 Ngày ] [ TAB 3: Cấp Clearance & Xuất Excel 4 Sheet ] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 1: HỒ SƠ ĐỦ ĐIỀU KIỆN THẨM ĐỊNH ĐẦU THÁNG (BẮT BUỘC MÃ QCODE CHÍNH THỨC)]               │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ⚠️ BẢO VỆ CHUẨN THẨM ĐỊNH: ĐÃ CHẶN 1 HẠNG MỤC MÃ TẠM (TMP-HW-0105)!                                │ │
│ │ Theo Nguyên tắc vàng #5: Chỉ các hạng mục đã được cấp QCode chính thức mới được đưa vào thẩm tra.  │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ Bảng Danh Mục Mua Sắm Chính Thức Cần Thẩm Định (52 Hạng Mục):                                          │
│ ┌───┬─────────────┬─────────────┬─────────────┬──────────┬───────────┬──────────┬────────────────────┐ │
│ │STT│Mã PR / QCode│Tên Phụ Tùng │Thiết Bị     │Phân Loại │Mã WO      │Thành Tiền│Hành Động Thẩm Định │ │
│ ├───┼─────────────┼─────────────┼─────────────┼──────────┼───────────┼──────────┼────────────────────┤ │
│ │ 1 │PR-2611-0081 │Cảm biến CN73│Die Bonder 01│TARGET    │-          │$450 USD  │🟢 Đạt định mức PM  │ │
│ │ 2 │PR-2611-0082 │Board CPX V4 │Die Bonder 01│OVER(OVR01│WO-24892601│$3,150 USD│[💬 Gửi Thắc Mắc]   │ │
│ └───┴─────────────┴─────────────┴─────────────┴──────────┴───────────┴──────────┴────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 2: KIỂM THẢO GIẢI TRÌNH TỒN KHO CHẬM LUÂN CHUYỂN (>30 NGÀY)]                             │
│ Danh sách các linh kiện tồn kho lâu ngày đã được kỹ sư nộp văn bản giải trình:                         │
│ • Mã QDAB03583 | Tồn kho: 5 EA (Tuổi tồn: 48 ngày) | Kỹ sư: Nguyễn Văn Thắng (Part 1).                │
│   ↳ Lý do kỹ thuật: Ưu tiên sản lượng Model D111 nên lùi lịch PM sang tuần tới.                       │
│   ↳ Kế hoạch hành động: Thay thế toàn bộ cụm gắp trong đợt bảo dưỡng ngày 15/11.                       │
│   ↳ Hạn cam kết dùng hết: 2026-11-15 🟢 Hợp lý, chấp thuận đưa vào biên bản kiểm thảo.                 │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 3: CẤP CHỨNG CHỈ THẨM DUYỆT (COST CLEARANCE) & KẾT XUẤT EXCEL 4 SHEET TIÊU CHUẨN]        │
│ 1. Khung Ký Cấp Phê Chuẩn (Cost Clearance Certificate):                                                │
│    • Trạng thái: [ ĐÃ CẤP CHỨNG NHẬN (CLEARED) ] • Mã chứng thực: CC-HW-202611-PASS                    │
│    • Số lượng hạng mục thông qua: 52 mục • Người ký: Trần Thị Hường (Cost Management)                  │
│    • Ý nghĩa: Mở khóa để LEC thao tác ký PRV/PO trên EMS và kích hoạt xuất kho chuyển giao.            │
│ 2. Xem Trước Trực Quan & Tải Xuống File Báo Cáo Excel Chuẩn 4 Sheet:                                   │
│    [Sheet 1: KPI Dashboard] [Sheet 2: Target Requisitions] [Sheet 3: Over Items] [Sheet 4: Aging Stock]│
│    Nút: [📥 Tải File Excel Báo Cáo Ban Giám Đốc (.xlsx / .csv UTF-8)]                                  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ĐẶC TẢ CHI TIẾT 3 PHÂN HỆ THẨM ĐỊNH

### 2.1. Tab 1: Danh Mục Đủ Điều Kiện Thẩm Định & Công Cụ Phát Hành Thắc Mắc Cho LEC
* **Bộ lọc kiểm soát điều kiện tiên quyết (Prerequisite Gate)**:
  * Hệ thống áp dụng bộ lọc tự động: Chỉ hiển thị các hạng mục có `isTempCode = false` (đã có QCode chính thức) và đã được LEC đánh dấu phân loại (`planClassification != 'UNCLASSIFIED'`).
  * Các mã tạm mang tiền tố `TMP-HW-` bị gom vào danh sách cảnh báo màu vàng để nhắc nhở LEC khẩn trương hoàn thiện đăng ký QCode trên ERP.
* **Công cụ phát hành thắc mắc thẩm tra (Inquiry Dispatch Tool)**:
  * Khi Reviewer phát hiện hạng mục có dấu hiệu bất thường (ví dụ: linh kiện Over giá trị cao `$3,150 USD`, hoặc mã WO sự cố ghi chưa rõ ràng):
  * Reviewer nhấn nút **[Gửi Thắc Mắc]** trên dòng tương ứng để mở Hộp thoại soạn câu hỏi.
  * Nhập nội dung: *"Yêu cầu bổ sung hình ảnh giám định cháy tụ vi mạch ca đêm và chữ ký xác nhận của trưởng ca đối với mã WO-248926091"*.
  * Câu hỏi được đẩy thẳng về Bàn làm việc LEC Master Workbench ở trạng thái `PENDING_LEC`.

### 2.2. Tab 2: Kiểm Thảo Giải Trình Tồn Kho Chậm Luân Chuyển (>30 Ngày)
* **Ý nghĩa quản trị chi phí ứ đọng**:
  * Kiểm soát dòng vốn tồn kho phụ tùng tại phân xưởng Smart Watch, ngăn chặn tình trạng kỹ sư tiếp tục xin mua mới trong khi linh kiện cùng loại vẫn nằm im trong kho quá 30 ngày.
* **Cơ chế thẩm tra giải trình**:
  * Reviewer đọc 3 trường thông tin bắt buộc do kỹ sư hiện trường cung cấp:
    1. **Lý do kỹ thuật chưa xuất dùng**: Đánh giá xem nguyên nhân trì hoãn bảo dưỡng có chính đáng không (ví dụ: nhà máy ưu tiên chạy sản lượng cho đơn hàng xuất khẩu khẩn cấp).
    2. **Kế hoạch hành động (Action Plan)**: Phương án cụ thể để thay thế vào máy.
    3. **Ngày cam kết sử dụng hết (Target Usage Date)**: Mốc thời gian chốt để Cost Management kiểm tra lại.
  * Nếu giải trình thỏa đáng, Reviewer đánh dấu xác nhận để đưa vào **Sheet 4 của Báo cáo Excel Thẩm định**.

### 2.3. Tab 3: Cấp Chứng Chỉ Cost Clearance & Xuất File Excel 4 Sheet
* **Cấp Chứng Chỉ Thẩm Duyệt Chi Phí (Cost Clearance Issuance)**:
  * Đóng vai trò là quyết định chốt sổ của phiên thẩm định chi phí đầu tháng.
  * Sau khi Reviewer bấm **[Ký Phát Hành Cost Clearance]**:
    * Hệ thống sinh mã chứng thực số (e.g. `CC-HW-202611-PASS`).
    * Trạng thái hồ sơ toàn team chuyển sang `CLEARED`.
    * Hệ thống bật thông báo cho LEC biết hồ sơ đã thông qua để bắt đầu tạo đơn PRV/PO trên Nexacro EMS và kích hoạt các thủ tục xuất kho/chuyển giao liên pháp nhân.
* **Quy Chuẩn File Báo Cáo Excel Duy Nhất 4 Sheet Chuẩn Hóa**:
  * Hệ thống kết xuất duy nhất 1 file Excel theo biểu mẫu cố định phục vụ Ban Giám Đốc:
    * **Sheet 1: `KPI_Summary`**: Bảng điều khiển tài chính tổng thể (Trần ngân sách SG \$150k, Thực chi PO cam kết \$148.2k, Chi phí xuất kho EMS \$118.45k, Số dư chuyển sang tháng sau = \$0).
    * **Sheet 2: `Target_Requisitions`**: Danh mục toàn bộ các linh kiện Trong Kế Hoạch (`TARGET`).
    * **Sheet 3: `Over_Requisitions`**: Danh mục các linh kiện Ngoài Kế Hoạch (`OVER`), tách bạch rõ Over do Mua sắm vs. Over do Xuất kho, kèm mã `OVR-01..06` và mã Work Order.
    * **Sheet 4: `Aging_Stock_Justifications`**: Toàn văn bảng giải trình lý do chưa xuất dùng linh kiện tồn kho lâu ngày kèm ngày cam kết sử dụng hết.

---

## 3. TỪ ĐIỂN TRƯỜNG THÔNG TIN THẨM ĐỊNH CHI PHÍ

| Tên Trường Hiển Thị | Mã Trường | Kiểu | Ý Nghĩa Thẩm Tra |
| :--- | :--- | :---: | :--- |
| **Kỳ Thẩm Định Chi Phí**| `periodMonth` | String | Tháng hạch toán chi phí: e.g. `2026-11` |
| **Chuyên Viên Thẩm Tra**| `auditorName` | String | `Tran Thi Huong (Cost Management Reviewer)` |
| **Tổng Số Hạng Mục Hợp Lệ**| `totalItemsAudited`| Number | Số lượng mã chính thức đã thẩm định (Loại trừ mã tạm) |
| **Chi Phí Trong Định Mức**| `totalTargetSpend` | Currency | Tổng giá trị các mã Target đã thông qua |
| **Chi Phí Ngoài Kế Hoạch**| `totalOverSpend` | Currency | Tổng giá trị các mã Over đã chấp thuận kèm mã WO |
| **Mã Chứng Thực Phê Chuẩn**| `stampCode` | String | Mã số xác thực số: `CC-HW-202611-PASS` |
| **Trạng Thái Phê Chuẩn**| `clearanceStatus` | Enum | `CLEARED` (Đã phê chuẩn) \| `PENDING_CLARIFICATION` (Chờ giải trình) |
| **Thời Điểm Ký Cấp** | `clearedAt` | DateTime | Dấu thời gian ký cấp chứng chỉ (e.g. `2026-11-04 10:00`) |
| **Câu Hỏi Thắc Mắc Thẩm Tra**| `reviewerQuestion` | Textarea | Nội dung chất vấn gửi cho LEC điều phối |
| **Độ Tuổi Tồn Kho (Ngày)**| `inventoryAgeDays`| Number | Số ngày linh kiện lưu kho chưa xuất dùng (>30 ngày) |
| **Ngày Cam Kết Sử Dụng**| `targetUsageDate` | Date | Hạn chót kỹ sư cam kết đưa linh kiện vào máy |
