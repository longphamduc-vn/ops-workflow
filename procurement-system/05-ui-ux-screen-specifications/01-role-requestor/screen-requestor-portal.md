# Giao Diện Dành Riêng Cho Vai Trò: Requestor (Kỹ Sư Hiện Trường)
> **Mã Giao Diện: UI-ROLE-01 — Requestor Unified Engineering Portal**  
> *Dành riêng cho: Kỹ Sư Hiện Trường trực tiếp phụ trách máy móc trên các dây chuyền sản xuất Smart Watch tại Factory HW (Kỹ sư ngang hàng trong Part/Team, không phân chia cấp bậc công đoạn).*

---

## 1. Tổng Quan Không Gian Làm Việc Của Kỹ Sư (Workspace Anatomy)

Giao diện Requestor Portal là không gian làm việc chuyên biệt, hỗ trợ tối đa cho Kỹ sư Hiện Trường:
- **Nguyên tắc tên thân thiện**: Kỹ sư làm việc 100% bằng tên máy, tên chuyền, tên vị trí thân thiện (`Line #201`, `Máy Die Bonder DB-01`, `Cụm Đầu Gắp Bonding Head`), không bị áp lực phải nhớ chuỗi mã kỹ thuật 14 ký tự `EM No` (`HWBMTL21EC0101`).
- **Cảnh báo tức thời tồn kho của Team khác (`agingInterlockFlag`)**: Ngay khi kỹ sư chọn mã phụ tùng mà hệ thống phát hiện có tồn kho lâu ngày (kể cả tồn kho thuộc quyền sở hữu của Team khác), hệ thống **lập tức bắn Banner cảnh báo màu vàng cam ngay trên form tạo đơn** và **tự động sinh một Task Bắt Buộc**. Kỹ sư phải làm thủ tục liên hệ mượn/xuất dùng tồn kho này trước khi mua mới. Task này **luôn luôn duy trì trên màn hình**, không thể đóng thủ công cho đến khi EMS đồng bộ lại trạng thái cờ chuyển sang `'N'`.
- **Upload cả Thư mục để chuẩn bị dữ liệu QCode**: Kéo thả nguyên thư mục chứa CAD, catalog PDF, datasheet và ảnh $\rightarrow$ hệ thống tự động sinh bảng lưới để kỹ sư điền thông số ban đầu rồi nộp dữ liệu kỹ thuật cho LEC đăng ký QCode trên ERP/EMS (đây là bước chuẩn bị dữ liệu, **không phải thẩm định chi phí**).
- **Lý do & Hiện trạng**: Kỹ sư cung cấp hiện trạng hỏng hóc và lý do (Work Order sự cố, mã đề xuất OVR); **LEC sẽ là người thẩm định và chính thức đánh dấu thủ công `[TRONG TARGET]` hay `[OVER PHÁT SINH]`**.
- **Cầu nối phản hồi 3 bên**: Tiếp nhận yêu cầu bổ sung thông tin từ Reviewer Cost Management (thông qua LEC), phản hồi trực tiếp kèm bằng chứng kỹ thuật.

Cấu trúc giao diện gồm **4 Tab chức năng**:
1.  **Tab 1: 📝 Đăng Ký Yêu Cầu Mua Phụ Tùng (Requisition Registration)**: Chọn máy bằng tên thân thiện, đối soát tồn kho tức thời 50ms, hiển thị cảnh báo tồn kho Team khác ngay lập tức, nhập hiện trạng sự cố và gửi LEC.
2.  **Tab 2: 📁 Chuẩn Bị Dữ Liệu Đăng Ký QCode (Folder & Excel Onboarding)**: Kéo thả nguyên thư mục CAD/Doc/Ảnh hoặc dán bảng Excel, tự động bóc tách tài liệu và chuyển giao LEC cấp mã QCode trên ERP/EMS.
3.  **Tab 3: 🌳 Bàn Kéo - Thả EBOM Trực Quan (Drag-and-Drop EBOM Slot Mapper)**: Kéo linh kiện thả vào slot cơ cấu máy, hoàn thiện các cơ cấu "Khai báo sau".
4.  **Tab 4: 📋 Danh Sách Của Tôi, Phản Hồi 3 Bên & Task Tồn Kho**: Theo dõi tiến độ đơn, phản hồi làm rõ thông tin với LEC, thực hiện Task mượn tồn kho Team khác (treo đến khi EMS='N') và Task giải trình tồn kho đầu tháng trước Deadline của LEC.

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  CỔNG KỸ SƯ HIỆN TRƯỜNG — FACTORY HW (SMART WATCH)                    [🔔 1 Cảnh Báo Tồn] [👤 Nguyen Van A (Kỹ Sư)]  │
│ Ngữ cảnh: Factory HW (Smart Watch) > Line #201 (2F) > Part: CP/SG Part 1         Vai trò: Requestor (Kỹ Sư Ngang Hàng)         │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CÁC TAB CHỨC NĂNG CỦA KỸ SƯ:                                                                                                     │
│ [🔵 TAB 1: TẠO YÊU CẦU MUA PHỤ TÙNG] [📁 TAB 2: CHUẨN BỊ DATA QCODE] [🌳 TAB 3: KÉO-THẢ EBOM] [💬 TAB 4: THEO DÕI & TASKS (2)]  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📌 ĐANG HIỂN THỊ: TAB 1 — TẠO YÊU CẦU MUA PHỤ TÙNG (THEO TÊN MÁY THÂN THIỆN)                                                    │
│                                                                                                                                  │
│ 1.1. CHỌN VỊ TRÍ LẮP ĐẶT BẰNG TÊN THÂN THIỆN (FRIENDLY MECHANISM SELECTOR):                                                      │
│  Dây Chuyền (Line): [ Line #201 (Smart Watch Line 1 - 2F)    ▼ ]   Máy (Machine): [ Máy Die Bonder 01 (DB-01)                 ▼ ] │
│  Chi Tiết Cơ Cấu Lắp:                                                                                                            │
│  (🔘) Chọn Cơ Cấu Đã Có Trong EBOM: [ 02. Bonding Head > Mech 01: Xylanh gắp phôi (Đã gắn EM No: HWBMTL21EC0101)             ▼ ] │
│  ( ) Cơ Cấu Chưa Có Trong EBOM (Khai Báo Sau): [ Gõ tên mô tả cơ cấu phát sinh ngoài hiện trường...                          ]   │
│      ↳ 💡 Thông báo: Hệ thống KHÔNG CHẶN đơn mua! Cờ EBOM_PENDING_MAPPING sẽ được bật để bổ sung trong 7 ngày.                   │
│                                                                                                                                  │
│ 1.2. THÔNG TIN PHỤ TÙNG & ĐỐI SOÁT TỒN KHO TỨC THỜI:                                                                             │
│  Mã Phụ Tùng: [ QCAD38190                 ▼ ]  [ Hoặc chọn mã tạm: TMP-HW-xxxx ]  [📂 Chọn từ Cây EBOM Máy]                     │
│  Tên Chi Tiết: Xylanh kẹp SMC khí nén                       Nhà Sản Xuất: SMC (Nhật Bản)       Model: MHZ2-16D                    │
│  Số Lượng Cần Mua: [ 2 ] EA               Đơn Giá Hợp Đồng: $45.00 USD (unitPriceFlag: Y)    Thành Tiền Dự Kiến: $90.00 USD      │
│  ┌──────────────────────┬──────────────────────┬──────────────────────┬────────────────────┬──────────────────────────────────┐  │
│  │  Tồn Kho Khả Dụng HW │  PO Remained Đang Về │  PO Standby Chờ Duyệt│  Target Stock Chuẩn│  Số Lượng Đặt Hàng Tối Thiểu     │  │
│  │        0 EA          │         0 EA         │         0 EA         │        2 EA        │  MOQ: 1 EA  |  Pack Size: 1 EA   │  │
│  └──────────────────────┴──────────────────────┴──────────────────────┴────────────────────┴──────────────────────────────────┘  │
│                                                                                                                                  │
│  ⚠️ CẢNH BÁO TỨC THỜI — PHÁT HIỆN TỒN KHO CỦA TEAM KHÁC (agingInterlockFlag = Y):                                                │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 🔔 HỆ THỐNG CẢNH BÁO: Phụ tùng này đang có TỒN KHO LÂU NGÀY tại [PO Module Tech Team 1 - Kho HW2] (Số lượng: 4 EA).        │  │
│  │ ↳ QUY ĐỊNH BẮT BUỘC: Bạn PHẢI LIÊN HỆ MƯỢN / XUẤT SỬ DỤNG TỒN KHO NÀY TRƯỚC KHI YÊU CẦU MUA MỚI!                             │  │
│  │ ↳ Hệ thống đã tự động tạo một [Task Mượn Tồn Kho Team Khác]. Task này sẽ LUÔN LUÔN DUY TRÌ cho đến khi hệ thống đồng bộ lại│  │
│  │   dữ liệu từ Nexacro EMS xác nhận cờ đã chuyển sang 'N'. (Không yêu cầu giải trình lý do).                                │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                                  │
│ 1.3. CUNG CẤP HIỆN TRẠNG MÁY & ĐỀ XUẤT LÝ DO (LEC SẼ CHÍNH THỨC ĐÁNH DẤU TARGET / OVER):                                        │
│  Chế độ đặt hàng:      ( ) Bổ sung định kỳ / Bù tồn an toàn       (•) DÙNG NGAY DO SỰ CỐ MÁY (Breakdown Repair)                  │
│  Mã Lệnh Sự Cố (Work Order): [ WO-248926091                ]  Đề Xuất Mã Lý Do: [ OVR-01: Sự cố máy hỏng bất thường (Breakdown)▼ ]│
│  Hiện Trạng Máy & Vấn Đề Gặp Phải:                                                                                               │
│  [ Xylanh kẹp bị rò khí gioăng, hành trình kẹp không khít gây lỗi gắp phôi. Cần thay mới phục hồi máy.                         ]│
│  Hình ảnh hiện trường: [ 🖼️ xylanh_ro_khi.jpg (1.8MB) ❌ ] [ ➕ Kéo thả thêm ảnh sự cố... ]                                      │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [💾 Lưu Bản Nháp]                     [👁️ Xem Lại Hồ Sơ]                     [🚀 GỬI YÊU CẦU CHO LEC RÀ SOÁT (Ctrl+Enter)]       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tab 2 Chi Tiết: Chuẩn Bị Dữ Liệu Đăng Ký QCode (Upload Folder Kỹ Thuật)

Khi kỹ sư cần đăng ký mã phụ tùng mới từ tài liệu chế tạo của Vendor hoặc phòng R&D:
> *Lưu ý quan trọng: Đây là bước chuẩn bị hồ sơ kỹ thuật để LEC đăng ký QCode trên ERP/EMS. Hạng mục ở bước này mang mã tạm `TMP-HW-xxxx` và **chưa đủ điều kiện tham gia thẩm định chi phí đầu tháng**.*

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📁 TAB 2: CHUẨN BỊ DỮ LIỆU ĐĂNG KÝ QCODE BẰNG UPLOAD THƯ MỤC KỸ THUẬT                                                            │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ KHUNG THẢ FOLDER CAD / TÀI LIỆU:                                                                                                 │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│ │                 📁 KÉO THẢ NGUYÊN FOLDER VÀO ĐÂY HOẶC [ BẤM ĐỂ CHỌN THƯ MỤC TỪ MÁY TÍNH ]                                  │  │
│ │           (Hỗ trợ tự động quét đệ quy: Bản vẽ CAD .dwg/.step, Catalog PDF, Datasheet, Ảnh hiện trường)                     │  │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│ ↳ ĐÃ QUÉT ĐƯỢC: Folder 'Setup_DB01_Jig' (Gồm 8 tệp: 2 bản vẽ CAD, 2 catalog PDF, 4 ảnh chi tiết)                                 │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ BẢNG LƯỚI THÔNG SỐ TỰ ĐỘNG SINH RA (KỸ SƯ ĐIỀN THÔNG SỐ SƠ BỘ):                                                                  │
│ ┌────┬─────────────┬──────────────────────────┬──────────────┬─────────────┬───────────┬─────────────┬─────────────────┬─────────┐ │
│ │STT │Mã Tạm Sinh  │Tên Phụ Tùng              │Maker         │Model        │Vị Trí Máy │Số Lượng Dùng│Tệp Đã Khớp Nối  │Hồ Sơ    │ │
│ ├────┼─────────────┼──────────────────────────┼──────────────┼─────────────┼───────────┼─────────────┼─────────────────┼─────────┤ │
│ │ 1  │TMP-HW-0101  │Xylanh trượt thanh ray    │SMC           │MXQ16-100B   │DB-01      │2 EA         │📄 Catalog_SMC   │🟢 Đủ file│ │
│ │    │             │                          │              │             │           │             │🖼️ Anh_01.jpg    │         │ │
│ │ 2  │TMP-HW-0102  │Cụm đồ gá gia công cơ khí │NỘI BỘ        │MECH-FIX-V1  │DB-01      │1 EA         │📐 CAD_Fix_01.dwg│🟢 Đủ CAD │ │
│ └────┴─────────────┴──────────────────────────┴──────────────┴─────────────┴───────────┴─────────────┴─────────────────┴─────────┘ │
│                                                                                                                                  │
│  ➔ HÀNH ĐỘNG:  [➕ Thêm Dòng]  [📋 Paste Từ Excel]  [🚀 NỘP DỮ LIỆU ĐỂ LEC ĐĂNG KÝ QCODE TRÊN ERP/EMS]                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Tab 4 Chi Tiết: Theo Dõi Đơn, Phản Hồi 3 Bên & Quản Lý Task Tồn Kho

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 💬 TAB 4: THEO DÕI ĐƠN HÀNG, PHẢN HỒI LÀM RÕ & DANH SÁCH TASKS BẮT BUỘC                                                          │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. KHUNG TASKS BẮT BUỘC ĐANG MỞ (PERSISTENT REQUIRED TASKS):                                                                     │
│                                                                                                                                  │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│ │ 📌 TASK 1 (BẮT BUỘC - KHÔNG THỂ ĐÓNG): MƯỢN / XUẤT DÙNG TỒN KHO CỦA TEAM KHÁC (QCode: QCAD38190)                          │  │
│ │ • Hạng mục: Xylanh kẹp SMC khí nén (Mã yêu cầu: REQ-2611-008).                                                             │  │
│ │ • Hiện trạng: Có 4 EA tồn kho lâu ngày tại Team 1 (Kho HW2).                                                               │  │
│ │ • Chỉ dẫn: Liên hệ Kỹ sư Nguyễn Văn B (Team 1 - Ext: 2210) để làm thủ tục mượn/xuất kho trên EMS.                          │  │
│ │ • 🔒 Trạng thái Task: ĐANG MỞ (Luôn duy trì cho đến khi hệ thống đọc dữ liệu EMS xác nhận cờ agingInterlock chuyển sang 'N')│  │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                                  │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│ │ 📅 TASK 2: GIẢI TRÌNH TỒN KHO CHƯA SỬ DỤNG ĐẦU THÁNG (Hạn Chót Do LEC Cấu Hình: 03/11 - 17:00)                              │  │
│ │ • Hạng mục: Cảm biến quang Panasomic QDAB03583 (Đã về kho 32 ngày trước nhưng chưa xuất lắp máy).                           │  │
│ │ • Lý do chưa dùng: [ Đã dời lịch bảo dưỡng PM sang tuần 2 do chuyền tăng ca sản xuất Smart Watch Model D111              ]│  │
│ │ • Cam kết ngày xuất: [ 10/11/2026 ]   [ Gửi Giải Trình Cho LEC ]                                                            │  │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. CẦU NỐI PHẢN HỒI 3 BÊN — LÀM RÕ THÔNG TIN VỚI REVIEWER (COST MANAGEMENT) QUA LEC:                                            │
│                                                                                                                                  │
│ [💬 HỘP THOẠI YÊU CẦU BỔ SUNG THÔNG TIN TỪ LEC]:                                                                                 │
│ ↳ 👤 Pham Duc Long (LEC) [10:15]: "Reviewer Cost Management yêu cầu làm rõ lý do mua mới Board nguồn CPX V4 (QDAD12236)         │
│   vì mã này được đánh dấu OVER (OVR-01). Bạn vui lòng bổ sung báo cáo sự cố điện lưới và xác nhận đã kiểm tra sửa chữa board cũ."│
│                                                                                                                                  │
│ ↳ ✍️ Kỹ sư trả lời LEC:                                                                                                          │
│   [ Đã gửi kèm biên bản kiểm tra của bảo trì ca đêm: Board bị nổ tụ nguồn chính và nứt mạch in nhiều lớp, hãng TRUMPF xác nhận   │
│     không thể phục hồi tại chỗ. Đính kèm biên bản: BB_su_co_2489.pdf (1.2MB).                                                 ]  │
│   [📎 Đính kèm tệp]   [🚀 Gửi Phản Hồi Cho LEC Để Nộp Reviewer]                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
