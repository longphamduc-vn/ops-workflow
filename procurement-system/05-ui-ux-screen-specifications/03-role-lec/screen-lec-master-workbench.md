# Giao Diện Dành Riêng Cho Vai Trò: LEC Trong Team (Line Equipment Coordinator)
> **Mã Giao Diện: UI-ROLE-03 — LEC Master Engineering, Sourcing & Budget Workbench**  
> *Dành riêng cho: Kỹ sư Quản trị Thiết bị (Line Equipment Coordinator - Multi-LEC) trong Team*

---

## 1. Tổng Quan Không Gian Làm Việc Của LEC (Workspace Anatomy)

Giao diện **LEC Master Workbench** là trung tâm điều phối kỹ thuật, quản lý thiết bị, kiểm soát Interlock và quản trị ngân sách cốt lõi của toàn Team:
1.  **Gom & Xử Lý Đồng Loạt Theo Trạng Thái (Status-based Batch Grouping)**: Gom toàn bộ hạng mục đăng ký từ các Kỹ sư Quy trình (`Engineer Process`) thuộc các công đoạn trong Team (`POL`, `TAB`, `DIP`, `LT`, `DB`, `BD`), tự động nhóm theo trạng thái đồng nhất để xử lý hàng loạt.
2.  **Gom Nhóm "Có Thể Mua" Đưa Vào Thẩm Định Ngày 25**: Tách riêng các mã đủ điều kiện mua (`stopPoFlag == 'N'`) để gom lại thành hồ sơ Thẩm định Offline ngày 25 với Ban Quản Lý. Mua bán và chuyển giao chỉ được kích hoạt sau khi Thẩm định thông qua.
3.  **Theo Dõi Báo Giá RFQ & Xử Lý Bất Thường Từ Email**: LEC không làm giá chi tiết mà chỉ theo dõi tiến độ RFQ. Khi nhận được email bất thường từ Purchase (hết hàng, lead-time quá dài, tăng giá, đổi model...), LEC nhập vào hệ thống để phản hồi Requestor và cập nhật hướng xử lý.
4.  **Hai Nhánh Giao Dịch Liên Pháp Nhân**: (1) Chuyển giao tồn kho nhàn rỗi (Transfer) hoặc (2) Mua với giá thấp nhất từ pháp nhân bạn.
5.  **Phân Loại Hàng Ngừng Sản Xuất (EOL)**: Khi EMS vẫn báo `ACTIVE` nhưng hãng thực tế đã ngừng sản xuất, LEC có quyền gắn nhãn `Ngừng sản xuất (EOL)` và phản hồi kỹ sư đổi mã tương đương.
6.  **Đăng Ký EM No & Ánh Xạ Tên Thân Thiện**: Requestor làm việc bằng tên thân thiện; LEC đăng ký mã chuẩn 14 ký tự `EM No` (`HWBMTL21EC0101`) kèm mô tả ánh xạ chi tiết.
7.  **Hoàn Thiện Hồ Sơ QCode 2 Giai Đoạn**: Nhận thư mục kỹ thuật từ Requestor $\rightarrow$ Giai đoạn 1: Đăng ký ngoài trên ERP/EMS rồi cập nhật QCode lên hệ thống $\rightarrow$ Giai đoạn 2: Gọi API đăng ký tự động.
8.  **Đánh Dấu Phân Loại Kế Hoạch**: LEC là người chính thức bấm chọn `TRONG TARGET` hay `OVER NGOÀI KẾ HOẠCH` dựa trên lý do kỹ sư cung cấp và trần ngân sách.
9.  **Nhập Ngân Sách Thủ Công Hàng Tháng & Tuyệt Đối Không Cộng Dồn (No Rollover)**: Nhập hạn mức SG Budget mỗi tháng, tháng nào khóa sổ tháng đó, không cộng dồn số dư.
10. **Khả Năng Áp Dụng Đa Nhà Máy (Multi-Plant Applicability)**: Dễ dàng cấu hình cho Nhà máy TV, Auto Display...

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  BÀN LÀM VIỆC ĐIỀU PHỐI LEC — FACTORY HW (SMART WATCH)               [🔔 8 Bất Thường Email] [👤 Pham Duc Long (LEC)] │
│ Đơn vị: PO Module Tech Team 2 | Vai trò: LEC Master (Multi-LEC enabled)        Cấu hình: No-Rollover Budget | Phase 1 EMS Sync   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CÁC PHÂN HỆ CÔNG VIỆC CỦA LEC:                                                                                                   │
│ [📥 TAB 1: GOM & PHÂN NHÓM TRẠNG THÁI]  [⚡ TAB 2: GIẢI TỎA INTERLOCK & EOL]  [📞 TAB 3: THEO DÕI RFQ & MAIL]  [💰 TAB 4: BUDGET & THẨM ĐỊNH]│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📌 ĐANG HIỂN THỊ: TAB 1 — GOM HẠNG MỤC TỪ KỸ SƯ PROCESS & PHÂN NHÓM TRẠNG THÁI ĐỒNG LOẠT                                         │
│                                                                                                                                  │
│ 1.1. BỘ LỌC PHÂN NHÓM TRẠNG THÁI HỆ THỐNG:                                                                                       │
│  [🔘 TẤT CẢ (184)]   [⏳ MỚI ĐĂNG KÝ (42)]   [🟢 CÓ THỂ MUA (95)]   [🌐 LIÊN PHÁP NHÂN (31)]   [⚠️ EOL / CHECKDISUSE (16)]        │
│                                                                                                                                  │
│ 1.2. BẢNG DANH SÁCH GOM NHÓM ĐỒNG LOẠT:                                                                                          │
│ ┌──┬───┬──────────────┬──────────────┬─────────────┬──────────┬──────────┬──────────┬──────────┬─────────────────────────────┐ │
│ │☑ │STT│ Tên Máy &    │ Mã QCode     │ Phụ Tùng &  │ Cờ Chặn  │ Trạng    │ Đánh Dấu │ Lộ Trình │ Hành Động Xử Lý             │ │
│ │  │   │ Cơ Cấu (EMNo)│ / Mã Tạm     │ Kỹ Sư Tạo   │ (stopPo) │ Thái     │ Target/Ov│ Kế Tiếp  │ Của LEC                     │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 1 │ DB-01 / Mech │ QDAB03583    │ Cảm biến    │ 🟢 N     │🟢 CÓ THỂ │[🔘 TRONG │Thẩm Định │[📦 GOM VÀO BÁO CÁO          │ │
│ │  │   │ HWBMTL21EC010│ PANASONIC    │ N.V.Thắng DB│          │   MUA    │  TARGET] │Ngày 25   │   THẨM ĐỊNH NGÀY 25]        │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 2 │ DB-01 / Head │ QDAD12236    │ Board nguồn │ 🟢 Đã mở │🟢 CÓ THỂ │[🔘 OVER  │Thẩm Định │[📦 GOM VÀO BÁO CÁO          │ │
│ │  │   │ HWBMTL21EC020│ TRUMPF (SPR) │ N.V.Thắng DB│   khóa   │   MUA    │ NGOÀI KH]│kèm OVR-01│   THẨM ĐỊNH NGÀY 25]        │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 3 │ TAB-02 / Cut │ QCAD38190    │ Xylanh đôi  │ 🔴 Y     │🌐 LIÊN PN│[🔘 TRONG │Nhánh Mua │[📤 Gửi Lệnh Mua Qua PN Bạn] │ │
│ │  │   │ HWBMTL22EC010│ SMC (SP)     │ L.H.Quân TAB│          │ (Chờ x/n)│  TARGET] │giá rẻ HQ │(Chờ Thẩm định 25 duyệt)     │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 4 │ POL-01 / In  │ QCAB99120    │ Driver Servo│ ⚪ N     │⚠️ HÃNG ĐÃ│—         │Phản hồi  │[🏷️ ĐỔI SANG EOL & BẮN       │ │
│ │  │   │ HWBMTL26EC010│ OMRON        │ T.Đ.Minh POL│(EMS: Act)│   EOL    │          │đổi mã    │   PHẢN HỒI CHO REQUESTOR]   │ │
│ └──┴───┴──────────────┴──────────────┴─────────────┴──────────┴──────────┴──────────┴──────────┴─────────────────────────────┘ │
│  THAO TÁC HÀNG LOẠT:                                                                                                             │
│  [📦 GOM TOÀN BỘ 95 MÃ 'CÓ THỂ MUA' CHUYỂN BÀN THẨM ĐỊNH NGÀY 25]   [⚡ ĐÁNH DẤU TRONG TARGET HÀNG LOẠT]  [🏷️ PHÂN LOẠI EOL HÀNG LOẠT]│
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tab 3 Chi Tiết: Theo Dõi Báo Giá RFQ & Xử Lý Bất Thường Từ Email

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📞 TAB 3: THEO DÕI TRẠNG THÁI RFQ & XỬ LÝ BẤT THƯỜNG NHẬN TỪ EMAIL PURCHASE                                                      │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ BẢNG THEO DÕI TIẾN ĐỘ BÁO GIÁ:                                                                                                   │
│ ┌────┬─────────────┬──────────────────────────┬──────────────┬─────────────┬─────────────┬─────────────────┬───────────────────┐ │
│ │STT │Mã Yêu Cầu   │Tên Phụ Tùng & Model      │Kỹ Sư Yêu Cầu │Trạng Thái   │Deadline Trả │Giá Sơ Bộ (USD)  │Bất Thường Từ Email│ │
│ ├────┼─────────────┼──────────────────────────┼──────────────┼─────────────┼─────────────┼─────────────────┼───────────────────┤ │
│ │ 1  │PR-2611-0082 │Xylanh đôi MXQ16-100B     │L.H.Quân TAB  │🟢 ĐÃ CÓ GIÁ │2026-11-08   │$220.00 USD      │⚪ Không có         │ │
│ ├────┼─────────────┼──────────────────────────┼──────────────┼─────────────┼─────────────┼─────────────────┼───────────────────┤ │
│ │ 2  │PR-2611-0089 │Board nguồn CPX V4 Trumpf │N.V.Thắng DB  │⚠️ BẤT THƯỜNG│2026-11-05   │—                │🔴 Mail: Hãng ngưng│ │
│ │    │             │Model: 2912146            │              │(Chờ REQ đổi)│             │                 │   sản xuất (EOL)  │ │
│ │    │             │                          │              │             │             │                 │[⚠️ Xem & Phản Hồi]│ │
│ └────┴─────────────┴──────────────────────────┴──────────────┴─────────────┴─────────────┴─────────────────┴───────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Khi bấm **`[⚠️ Xem & Phản Hồi]`**, popup mở ra cho phép LEC xem trích dẫn email từ Purchase, chọn mã thay thế đề xuất và gửi phản hồi 2 chiều tức thì đến màn hình của Kỹ sư Requestor.

---

## 4. Tab 4 Chi Tiết: Quản Trị Ngân Sách Hàng Tháng (No Rollover) & Thẩm Định Ngày 25

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 💰 TAB 4: CẤU HÌNH NGÂN SÁCH THÁNG (NO-ROLLOVER) & BÀN THẨM ĐỊNH NGÀY 25                                                         │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4.1. KHUNG NHẬP NGÂN SÁCH HÀNG THÁNG CỦA LEC:                                                                                    │
│  Tháng Kế Toán: [ Tháng 11/2026 ▼ ]   Cost Center: [ 87321 - Module Tech Team 2 ▼ ]   Tài Khoản: [ CP/SG Part 1 (Tồn kho & Mua)▼]│
│  Hạn Mức Ngân Sách Nhập Mới Tháng Này: [ $250,000.00 USD           ] [💾 LƯU NGÂN SÁCH THÁNG]                                    │
│  ⚠️ NGUYÊN TẮC: TUYỆT ĐỐI KHÔNG CỘNG DỒN SỐ DƯ (NO ROLLOVER). Hạn mức chưa dùng của tháng trước đã tự động hủy bỏ.                │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4.2. BÀN THẨM ĐỊNH OFFLINE NGÀY 25 (HỒ SƠ GOM TỪ NHÓM CÓ THỂ MUA):                                                               │
│  Tổng Số Hạng Mục Đủ Điều Kiện: 95 mã   |   Trong Target: 81 mã ($182,500)   |   Over Ngoài Kế Hoạch: 14 mã ($54,200)             │
│  Tình Trạng Ngân Sách Dự Kiến: Đạt 94.6% trần ngân sách ($236,700 / $250,000) 🟢 AN TOÀN TRONG HẠN MỨC                          │
│                                                                                                                                  │
│  ➔ HÀNH ĐỘNG KHÓA SỔ:                                                                                                            │
│  [🔒 KHÓA SỔ KỲ THÁNG (17:00 NGÀY 25)]   [📄 XUẤT HỒ SƠ THẨM ĐỊNH EXCEL]   [🔗 ĐỒNG BỘ MÃ PRV TỪ EMS (PHASE 1)]                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Khóa sổ ngày 25**: Hệ thống đóng băng trạng thái của 95 mã. Không ai được thêm/sửa đơn mua của kỳ này.
- **Sau khi Thẩm định thông qua**: Lãnh đạo ký duyệt biên bản thẩm định $\rightarrow$ LEC thao tác tạo đơn trên EMS $\rightarrow$ Quay lại bấm `[🔗 Đồng Bộ Mã PRV Từ EMS]` nhập mã đơn để mở khóa xuất kho và phát hành PO chính thức.
