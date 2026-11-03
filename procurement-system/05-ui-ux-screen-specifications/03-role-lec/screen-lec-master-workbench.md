# Giao Diện Dành Riêng Cho Vai Trò: LEC Trong Team (Line Equipment Coordinator)
> **Mã Giao Diện: UI-ROLE-03 — LEC Master Engineering, Sourcing & Progress Workbench**  
> *Dành riêng cho: Kỹ sư Quản trị Thiết bị (Line Equipment Coordinator - Multi-LEC: Pham Duc Long - 658359 cùng đồng sự) trong Team*

---

## 1. Tổng Quan Không Gian Làm Việc Của LEC (Workspace Anatomy)

Giao diện **LEC Master Workbench** là trung tâm điều phối kỹ thuật, quản lý thiết bị, kiểm soát Interlock và theo dõi tiến độ mua sắm cốt lõi của toàn Team:
1.  **Gom & Xử Lý Đồng Loạt Theo Trạng Thái (Status-based Batch Grouping)**: Gom toàn bộ hạng mục đăng ký từ các Kỹ sư hiện trường trong Team (ngang hàng nhau, không phân chia công đoạn), tự động nhóm theo trạng thái đồng nhất để xử lý hàng loạt.
2.  **Cầu Nối Làm Rõ Thông Tin 3 Bên Sau Thẩm Định Đầu Tháng**: Tiếp nhận các yêu cầu cần thêm thông tin từ Reviewer (Cost Management) $\rightarrow$ nhập vào hệ thống gửi Kỹ sư $\rightarrow$ nhận phản hồi từ Kỹ sư $\rightarrow$ tổng hợp gửi lại Reviewer để hoàn tất thẩm định chi phí.
3.  **Kiểm Soát & Cập Nhật Thủ Công Tiến Độ Nhập Hàng**: Theo dõi số lượng linh kiện PO đang về (`po_remained_qty` / `notReceivingQty` từ EMS) và **nhập thủ công tiến độ hàng về thực tế** (ngày nhận hàng, số lượng thực nhận, tình trạng hàng).
4.  **Điều Phối Interlock & Xử Lý Cờ `agingInterlockFlag`**:
    - Khi `agingInterlockFlag == 'Y'`: Cảnh báo có tồn kho lâu ngày, **nhưng có thể là tồn kho của Team khác** $\rightarrow$ Không bắt Kỹ sư giải trình, mà **ưu tiên kích hoạt lệnh xuất sử dụng tồn kho này trước khi mua mới**.
    - Cờ `unitPriceFlag`: Kiểm tra mã hàng đã có giá hiệu lực (`Y`) hay chưa có giá (`N`).
5.  **Phân Loại Hàng Ngừng Sản Xuất (EOL)**: Khi EMS vẫn báo `ACTIVE` nhưng hãng thực tế đã ngừng sản xuất, LEC có quyền gắn nhãn `Ngừng sản xuất (EOL)` và phản hồi kỹ sư đổi mã tương đương.
6.  **Đăng Ký EM No 14 Ký Tự & Tiếp Nhận Dữ Liệu QCode**: Kỹ sư nộp gói data folder CAD/Doc $\rightarrow$ LEC lấy data đi đăng ký QCode trên ERP/EMS ngoài rồi cập nhật mã QCode chính thức lên hệ thống (Giai đoạn 1).
7.  **Đánh Dấu Phân Loại Kế Hoạch**: LEC là người chính thức bấm chọn `🟢 TRONG TARGET` hay `🔴 OVER NGOÀI KẾ HOẠCH` dựa trên lý do kỹ sư cung cấp và trần ngân sách.
8.  **Nhập Ngân Sách Thủ Công Hàng Tháng & Tuyệt Đối Không Cộng Dồn (No Rollover)**: Nhập hạn mức SG Budget đầu mỗi tháng, tháng nào khóa sổ tháng đó, không cộng dồn số dư.
9.  **Bỏ Qua Hệ Thống Duyệt Nội Bộ**: Duyệt chính thức thực hiện trên EMS, hệ thống này chỉ kiểm soát tiến độ.

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  BÀN LÀM VIỆC ĐIỀU PHỐI LEC — FACTORY HW (SMART WATCH)               [🔔 3 Cần Phản Hồi Reviewer] [👤 Pham Duc Long] │
│ Đơn vị: PO Module Tech Team 2 | Vai trò: LEC Master (Multi-LEC enabled)        Cấu hình: No-Rollover Budget | Thẩm định ĐẦU THÁNG │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CÁC PHÂN HỆ CÔNG VIỆC CỦA LEC:                                                                                                   │
│ [📥 TAB 1: GOM & PHÂN NHÓM TRẠNG THÁI]  [⚡ TAB 2: INTERLOCK & TỒN TEAM BẠN]  [💬 TAB 3: CẦU NỐI REVIEWER-KỸ SƯ]  [📦 TAB 4: NHẬP HÀNG THỦ CÔNG]│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📌 ĐANG HIỂN THỊ: TAB 1 — GOM HẠNG MỤC TỪ KỸ SƯ & PHÂN NHÓM TRẠNG THÁI ĐỒNG LOẠT                                                 │
│                                                                                                                                  │
│ 1.1. BỘ LỌC PHÂN NHÓM TRẠNG THÁI HỆ THỐNG:                                                                                       │
│  [🔘 TẤT CẢ (184)]   [⏳ MỚI ĐĂNG KÝ (42)]   [🟢 CÓ THỂ MUA (95)]   [🌐 TỒN TEAM BẠN / LIÊN PN (31)]   [⚠️ EOL / DISUSE (16)]     │
│                                                                                                                                  │
│ 1.2. BẢNG DANH SÁCH GOM NHÓM ĐỒNG LOẠT:                                                                                          │
│ ┌──┬───┬──────────────┬──────────────┬─────────────┬──────────┬──────────┬──────────┬──────────┬─────────────────────────────┐ │
│ │☑ │STT│ Tên Máy &    │ Mã QCode     │ Phụ Tùng &  │ Cờ Chặn  │ Trạng    │ Đánh Dấu │ Lộ Trình │ Hành Động Xử Lý             │ │
│ │  │   │ Cơ Cấu (EMNo)│ / Mã Tạm     │ Kỹ Sư Tạo   │ (stopPo) │ Thái     │ Target/Ov│ Kế Tiếp  │ Của LEC                     │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 1 │ DB-01 / Mech │ QDAB03583    │ Cảm biến    │ 🟢 N     │🟢 CÓ THỂ │[🔘 TRONG │Thẩm Định │[📦 GOM VÀO BÁO CÁO          │ │
│ │  │   │ HWBMTL21EC010│ PANASONIC    │ N.V.Thắng   │ (Price:Y)│   MUA    │  TARGET] │Đầu Tháng │   THẨM ĐỊNH ĐẦU THÁNG]      │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 2 │ DB-01 / Head │ QDAD12236    │ Board nguồn │ 🟢 Đã mở │🟢 CÓ THỂ │[🔘 OVER  │Thẩm Định │[📦 GOM VÀO BÁO CÁO          │ │
│ │  │   │ HWBMTL21EC020│ TRUMPF (SPR) │ N.V.Thắng   │   khóa   │   MUA    │ NGOÀI KH]│kèm OVR-01│   THẨM ĐỊNH ĐẦU THÁNG]      │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 3 │ TAB-02 / Cut │ QCAD38190    │ Xylanh đôi  │ 🟡 aging │⚠️ TỒN KHO│—         │Ưu tiên   │[🔄 Tạo Phiếu Mượn Xuất Kho  │ │
│ │  │   │ HWBMTL22EC010│ SMC          │ L.H.Quân    │  Interlock   TEAM BẠN│          │dùng trước│   Dùng Tồn Của Team 1]      │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 4 │ POL-01 / In  │ QCAB99120    │ Driver Servo│ ⚪ N     │⚠️ HÃNG ĐÃ│—         │Phản hồi  │[🏷️ ĐỔI SANG EOL & BẮN       │ │
│ │  │   │ HWBMTL26EC010│ OMRON        │ T.Đ.Minh    │(EMS: Act)│   EOL    │          │đổi mã    │   PHẢN HỒI CHO KỸ SƯ]       │ │
│ └──┴───┴──────────────┴──────────────┴─────────────┴──────────┴──────────┴──────────┴──────────┴─────────────────────────────┘ │
│  THAO TÁC HÀNG LOẠT:                                                                                                             │
│  [📦 GOM TOÀN BỘ 95 MÃ 'CÓ THỂ MUA' CHUYỂN BÀN THẨM ĐỊNH ĐẦU THÁNG]   [⚡ ĐÁNH DẤU TRONG TARGET HÀNG LOẠT]  [🏷️ PHÂN LOẠI EOL]    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tab 3 Chi Tiết: Cầu Nối Phản Hồi 3 Bên (Cost Management <-> LEC <-> Kỹ Sư)

Sau cuộc họp thẩm định đầu tháng, nếu Reviewer Cost Management cần thêm thông tin giải trình:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 💬 TAB 3: TIẾP NHẬN YÊU CẦU LÀM RÕ TỪ COST MANAGEMENT & ĐIỀU PHỐI KỸ SƯ PHẢN HỒI                                                 │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ DANH SÁCH 3 HẠNG MỤC REVIEWER YÊU CẦU LÀM RÕ BỔ SUNG:                                                                            │
│ ┌────┬─────────────┬──────────────────────────┬──────────────┬────────────────────────────┬───────────────┬────────────────────┐ │
│ │STT │Mã Hạng Mục  │Tên Phụ Tùng              │Kỹ Sư Phụ Trác│Yêu Cầu Từ Reviewer (Cost)  │Tình Trạng     │Thao Tác Của LEC    │ │
│ ├────┼─────────────┼──────────────────────────┼──────────────┼────────────────────────────┼───────────────┼────────────────────┤ │
│ │ 1  │PR-2611-0089 │Board nguồn CPX V4 Trumpf │Nguyễn Văn Thắ│"Cần bổ sung biên bản giám  │🟢 Kỹ sư đã nộp│[👁️ Xem & Gửi Lại  │ │
│ │    │QDAD12236    │(Máy DB-01 - Over $3,150) │(Part 1)      │ định xung sét ca đêm & ảnh"│   bổ sung     │   Cho Reviewer]    │ │
│ ├────┼─────────────┼──────────────────────────┼──────────────┼────────────────────────────┼───────────────┼────────────────────┤ │
│ │ 2  │PR-2611-0094 │Xylanh trượt MXQ16-100B   │Lê Hoàng Quân │"Giải trình tại sao không   │⏳ Đang chờ    │[🔔 Nhắc Kỹ Sư      │ │
│ │    │QCAD38190    │(Máy TAB-02 - $220)       │(Part 1)      │ mượn tồn kho kho Team 1?"  │   Kỹ sư trả lời   Trả Lời Gấp]     │ │
│ └────┴─────────────┴──────────────────────────┴──────────────┴────────────────────────────┴───────────────┴────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Tab 4 Chi Tiết: Kiểm Soát & Cập Nhật Thủ Công Tiến Độ Nhập Hàng (Manual Receiving Progress)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📦 TAB 4: THEO DÕI & CẬP NHẬT THỦ CÔNG TIẾN ĐỘ NHẬP HÀNG (MANUAL GOODS RECEIPT TRACKING)                                         │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ BẢNG THEO DÕI TIẾN ĐỘ GIAO HÀNG TỪ NHÀ CUNG CẤP (ĐỐI CHIẾU NOT_RECEIVING_QTY TỪ EMS):                                            │
│ ┌────┬─────────────┬───────────┬──────────────┬────────────┬─────────────┬─────────────┬─────────────┬───────────────────────────┐ │
│ │STT │Mã PO / PRV  │Mã QCode   │Tên Phụ Tùng  │SL Đã Đặt   │PO Remained  │Số Lượng Đã  │Ngày Hàng Về │Thao Tác Cập Nhật Tiến Độ  │ │
│ │    │(Từ EMS)     │           │              │(Order Qty) │(Chưa về EMS)│Nhập Thực Tế │Thực Tế      │Của LEC / Kỹ Sư            │ │
│ ├────┼─────────────┼───────────┼──────────────┼────────────┼─────────────┼─────────────┼─────────────┼───────────────────────────┤ │
│ │ 1  │854730-1-1   │QDAD12236  │Board nguồn   │1 EA        │1 EA         │[ 1 ] EA     │[ 2026-11-04]│[💾 Lưu Cập Nhật Tiến Độ]  │ │
│ │    │PO Khẩn cấp  │           │CPX Trumpf    │            │             │             │             │↳ Đã về kho HW (H1-Tầng 2F)│ │
│ ├────┼─────────────┼───────────┼──────────────┼────────────┼─────────────┼─────────────┼─────────────┼───────────────────────────┤ │
│ │ 2  │854812-1-2   │QDAB03583  │Cảm biến quang│10 EA       │10 EA        │[ 6 ] EA     │[ 2026-11-03]│[💾 Lưu Cập Nhật Tiến Độ]  │ │
│ │    │PO Định mức  │           │Panasonic     │            │             │             │             │↳ NCC giao đợt 1 (Thiếu 4) │ │
│ └────┴─────────────┴───────────┴──────────────┴────────────┴─────────────┴─────────────┴─────────────┴───────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
