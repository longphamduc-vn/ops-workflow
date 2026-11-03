# Giao Diện Dành Riêng Cho Vai Trò: Requestor (Kỹ Sư Công Đoạn)
> **Mã Giao Diện: UI-ROLE-01 — Requestor Unified Engineering Portal**  
> *Dành riêng cho: Engineer Process trực tiếp vận hành máy trên các dây chuyền sản xuất Smart Watch tại Factory HW (dễ dàng mở rộng cho Factory TV, Auto Display)*

---

## 1. Tổng Quan Không Gian Làm Việc Của Kỹ Sư (Workspace Anatomy)

Giao diện Requestor Portal là một không gian làm việc chuyên biệt, hỗ trợ tối đa cho Kỹ sư Quy trình (`Engineer Process`) tại hiện trường:
- **Nguyên tắc tên thân thiện**: Kỹ sư làm việc 100% bằng tên máy, tên chuyền, tên cụm cơ cấu thân thiện (`Line #201`, `Máy Die Bonder DB-01`, `Cụm Đầu Gắp Bonding Head`), không bị áp lực phải nhớ chuỗi mã kỹ thuật 14 ký tự `EM No` (`HWBMTL21EC0101`).
- **Late Declaration (Khai báo cơ cấu sau)**: Phụ tùng mua bắt buộc matching với chi tiết cơ cấu, nhưng nếu cơ cấu máy chưa kịp khai báo trong EBOM, kỹ sư được quyền chọn *"Khai báo sau"* để không bị gián đoạn đơn mua.
- **Upload cả Thư mục để đăng ký QCode**: Kéo thả toàn bộ thư mục chứa CAD, catalog PDF, datasheet và ảnh $\rightarrow$ hệ thống tự động sinh bảng lưới để kỹ sư điền thông tin ban đầu rồi submit cho LEC hoàn thiện.
- **Lý do & Hiện trạng**: Kỹ sư cung cấp hiện trạng hỏng hóc và lý do (Work Order sự cố, mã đề xuất OVR); **LEC sẽ là người thẩm định và chính thức đánh dấu `TRONG TARGET` hay `OVER NGOÀI KẾ HOẠCH`**.

Cấu trúc giao diện gồm **4 Tab chức năng chuyên biệt**:
1.  **Tab 1: 📝 Đăng Ký Hạng Mục Mua Phụ Tùng (Requisition Registration)**: Chọn máy & cơ cấu bằng tên thân thiện, đối soát tồn kho tức thời 50ms, nhập hiện trạng sự cố và submit cho LEC.
2.  **Tab 2: 📁 Đăng Ký QCode Bằng Upload Cả Folder & Nhập Lưới Excel**: Kéo thả nguyên thư mục tài liệu kỹ thuật hoặc copy-paste bảng Excel kiểm kê ca, tự động bóc tách tài liệu và chuyển giao LEC cấp mã.
3.  **Tab 3: 🌳 Bàn Kéo - Thả EBOM Trực Quan (Drag-and-Drop EBOM Slot Mapper)**: Kéo linh kiện thả vào slot cơ cấu máy, hoàn thiện các cơ cấu "Khai báo sau".
4.  **Tab 4: 📋 Đơn Của Tôi, Phản Hồi 2 Chiều Với LEC & Task Giải Trình Tồn Kho**: Theo dõi tiến độ đơn, phản hồi khi LEC đề xuất đổi mã hoặc cảnh báo EOL/bất thường báo giá từ email, thực hiện Task giải trình tồn kho chưa dùng phục vụ kiểm thảo ngày 25.

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  CỔNG KỸ SƯ CÔNG ĐOẠN — FACTORY HW (SMART WATCH)                     [🔔 2 Cần Phản Hồi] [👤 Nguyen Van A (Eng Process)]│
│ Ngữ cảnh: Factory HW (Smart Watch) > Line #201 > Process: DB (Die Bonding)                      Vai trò: Requestor / Engineer     │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CÁC TAB CHỨC NĂNG CỦA KỸ SƯ:                                                                                                     │
│ [🔵 TAB 1: TẠO ĐƠN MUA PHỤ TÙNG]  [📁 TAB 2: UPLOAD FOLDER ĐĂNG KÝ QCODE]  [🌳 TAB 3: KÉO-THẢ EBOM]  [💬 TAB 4: ĐƠN CỦA TÔI & PHẢN HỒI (2)]│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📌 ĐANG HIỂN THỊ: TAB 1 — TẠO ĐƠN MUA PHỤ TÙNG (THEO TÊN MÁY THÂN THIỆN)                                                         │
│                                                                                                                                  │
│ 1.1. CHỌN VỊ TRÍ LẮP ĐẶT BẰNG TÊN THÂN THIỆN (FRIENDLY MECHANISM SELECTOR):                                                      │
│  Dây Chuyền (Line): [ Line #201 (Smart Watch Line 1 - 2F)    ▼ ]   Máy (Machine): [ Máy Die Bonder 01 (DB-01)                 ▼ ] │
│  Chi Tiết Cơ Cấu Lắp:                                                                                                            │
│  (🔘) Chọn Cơ Cấu Đã Có Trong EBOM: [ 02. Bonding Head > Mech 01: Xylanh gắp phôi (Đã gắn EM No: HWBMTL21EC0101)             ▼ ] │
│  ( ) Cơ Cấu Chưa Có Trong EBOM (Khai Báo Sau): [ Gõ tên mô tả cơ cấu phát sinh ngoài hiện trường...                          ]   │
│      ↳ 💡 Thông báo: Hệ thống KHÔNG CHẶN đơn mua! Cờ EBOM_PENDING_MAPPING sẽ được bật để bổ sung trong 7 ngày.                   │
│                                                                                                                                  │
│ 1.2. THÔNG TIN PHỤ TÙNG & ĐỐI SOÁT TỒN KHO TỨC THỜI:                                                                             │
│  Mã Phụ Tùng: [ QDAD12236                 ▼ ]  [ Hoặc cấp mã tạm: TMP-HW-xxxx ]  [📂 Chọn từ Cây EBOM Máy]                     │
│  Tên Chi Tiết: Board Nguồn Điều Khiển CPX Controls V4       Nhà Sản Xuất: TRUMPF (Đức)         Model: 2912146                    │
│  Số Lượng Cần Mua: [ 1 ] EA               Đơn Giá Ước Tính: $3,150.00 USD          Thành Tiền Dự Kiến: $3,150.00 USD             │
│  ┌──────────────────────┬──────────────────────┬──────────────────────┬────────────────────┬──────────────────────────────────┐  │
│  │  Tồn Kho Khả Dụng HW │  PO Remained Đang Về │  PO Standby Chờ Duyệt│  Target Stock Chuẩn│  Số Lượng Đặt Hàng Tối Thiểu     │  │
│  │        0 EA          │         1 EA         │         0 EA         │        2 EA        │  MOQ: 1 EA  |  Pack Size: 1 EA   │  │
│  └──────────────────────┴──────────────────────┴──────────────────────┴────────────────────┴──────────────────────────────────┘  │
│                                                                                                                                  │
│ 1.3. CUNG CẤP HIỆN TRẠNG MÁY & ĐỀ XUẤT LÝ DO (LEC SẼ CHÍNH THỨC ĐÁNH DẤU TARGET / OVER):                                        │
│  Chế độ đặt hàng:      ( ) Bổ sung định kỳ / Bù tồn an toàn       (•) DÙNG NGAY DO SỰ CỐ MÁY (Breakdown Repair)                  │
│  Mã Lệnh Sự Cố (Work Order): [ WO-248926091                ]  Đề Xuất Mã Lý Do: [ OVR-01: Sự cố máy hỏng bất thường (Breakdown)▼ ]│
│  Hiện Trạng Máy & Vấn Đề Gặp Phải:                                                                                               │
│  [ Máy Die Bonder DB-01 bị chập cháy board nguồn do xung sét ca đêm. Báo lỗi Alarm E-502, dừng dây chuyền từ 02:15 sáng.         │
│    Cần board thay thế gấp để phục hồi chuyền Smart Watch D111.                                                                  ]│
│  Hình ảnh hiện trường: [ 🖼️ board_chay_01.jpg (1.8MB) ❌ ] [ 🖼️ alarm_E502.png (850KB) ❌ ] [ ➕ Kéo thả thêm ảnh sự cố... ]       │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [💾 Lưu Bản Nháp]                     [👁️ Xem Lại Hồ Sơ]                     [🚀 SUBMIT CHO LEC KIỂM TRA INTERLOCK (Ctrl+Enter)] │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tab 2 Chi Tiết: Đăng Ký QCode Bằng Upload Cả Folder

Khi kỹ sư cần đăng ký phụ tùng mới từ hồ sơ kỹ thuật của nhà sản xuất hoặc phòng chế tạo:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📁 TAB 2: ĐĂNG KÝ QCODE BẰNG UPLOAD THƯ MỤC TÀI LIỆU KỸ THUẬT (FOLDER ONBOARDING)                                                │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ KHUNG THẢ FOLDER:                                                                                                                │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│ │                 📁 KÉO THẢ NGUYÊN FOLDER VÀO ĐÂY HOẶC [ BẤM ĐỂ CHỌN THƯ MỤC TỪ MÁY TÍNH ]                                  │  │
│ │           (Hỗ trợ đệ quy: Thư mục chứa CAD .dwg/.step, Catalog PDF, Datasheet thông số, Ảnh chụp hiện trường)             │  │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│ ↳ ĐÃ QUÉT ĐƯỢC: Folder 'Setup_DB01_Pack' (Gồm 8 tệp: 2 bản vẽ CAD, 2 catalog PDF, 4 ảnh chi tiết)                               │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ BẢNG LƯỚI THÔNG TIN CẦN ĐIỀN TỰ ĐỘNG SINH RA:                                                                                    │
│ ┌────┬─────────────┬──────────────────────────┬──────────────┬─────────────┬───────────┬─────────────┬─────────────────┬─────────┐ │
│ │STT │Mã Tạm       │Tên Phụ Tùng              │Maker         │Model        │Vị Trí Máy │Số Lượng Dùng│Tệp Đã Khớp Nối  │Hồ Sơ    │ │
│ ├────┼─────────────┼──────────────────────────┼──────────────┼─────────────┼───────────┼─────────────┼─────────────────┼─────────┤ │
│ │ 1  │TMP-2611-001 │Xylanh dẫn hướng đôi 16mm │SMC           │MXQ16-100B   │DB-01      │2 EA         │📄 Catalog_SMC   │🟢 Đủ file│
│ │    │             │                          │              │             │           │             │🖼️ Anh_01.jpg    │         │ │
│ │ 2  │TMP-2611-002 │Cụm gá kẹp gia công cơ    │NỘI BỘ        │MECH-FIX-V1  │DB-01      │1 EA         │📐 CAD_Fix_01.dwg│🟢 Đủ CAD │ │
│ └────┴─────────────┴──────────────────────────┴──────────────┴─────────────┴───────────┴─────────────┴─────────────────┴─────────┘ │
│                                                                                                                                  │
│  ➔ HÀNH ĐỘNG:  [➕ Thêm Dòng Thủ Công]   [📋 Paste Dữ Liệu Từ Excel]   [🚀 SUBMIT TOÀN BỘ CHO LEC TIẾN HÀNH HOÀN THIỆN MASTER]   │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- Kỹ sư chỉ cần điền các thông tin kỹ thuật cơ bản và bấm `SUBMIT TOÀN BỘ CHO LEC`.
- LEC sẽ nhận hồ sơ, đối chiếu và thực hiện đăng ký ngoài trên ERP/EMS (Giai đoạn 1) hoặc bấm nút đăng ký tự động qua API (Giai đoạn 2).

---

## 4. Tab 4 Chi Tiết: Nhận Cảnh Báo EOL / Bất Thường Từ Email & Giải Trình Tồn Kho

### 4.1. Kênh Nhận Phản Hồi Khi Hàng Bị EOL Hoặc Bất Thường Báo Giá
Khi LEC phân loại lại mã hàng thành `Ngừng sản xuất (EOL)` hoặc tiếp nhận thông tin bất thường qua email từ Purchase Dept:
- Hệ thống gửi chuông cảnh báo nổi bật kèm nội dung trích xuất nguyên văn email của NCC/Purchase:
  > ⚠️ **CẢNH BÁO TỪ LEC**: *"Phụ tùng Board nguồn CPX V4 (QDAD12236) đã bị hãng Trumpf ngừng sản xuất thực tế (dù EMS vẫn báo Active). Purchase thông báo leadtime kéo dài 180 ngày. LEC đề xuất chuyển sang mã thay thế CPX V5 (Model: 3019882) với thời gian giao 3 tuần."*
- Kỹ sư có 2 lựa chọn xử lý ngay:
  - `[✅ Đồng Ý Đổi Sang Mã Thay Thế CPX V5]`: Hệ thống tự động cập nhật đơn mua mà không cần làm lại từ đầu.
  - `[↩️ Giải Trình Kỹ Thuật Lại Với LEC]`: Gửi ý kiến phản hồi phương án khác.

### 4.2. Bàn Task Giải Trình Tồn Kho Chưa Sử Dụng (Kiểm Thảo Ngày 25)
- Định kỳ hàng tháng, hệ thống liệt kê các phụ tùng kỹ sư đã yêu cầu mua về kho nhưng sau 30 ngày chưa xuất ra máy.
- Kỹ sư mở Task trên Tab 4, chọn lý do chưa dùng (máy chạy tốt chưa hỏng, lùi lịch PM, thay đổi kế hoạch sản xuất...), cam kết ngày xuất kho dự kiến và submit để phục vụ phiên Kiểm thảo Thẩm định ngày 25 của Ban Quản Lý.
