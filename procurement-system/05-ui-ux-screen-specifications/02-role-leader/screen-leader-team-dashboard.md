# Giao Diện Dành Riêng Cho Vai Trò: Leader Quản Lý (Team / Part Leader)
> **Mã Giao Diện: UI-ROLE-02 — Leader Team Monitoring Dashboard**  
> *Dành riêng cho: Cấp quản lý Part Leader và Team Leader giám sát tiến độ mua sắm nội bộ nhà máy HW (Smart Watch).*  
> *Nguyên tắc cốt lõi: Không phân chia công đoạn (kỹ sư ngang hàng trong Part), Bỏ qua các nút phê duyệt trên hệ thống (mọi phê duyệt thực hiện trên EMS - hệ thống này CHỈ KIỂM SOÁT TIẾN ĐỘ), giám sát tiến độ giải trình tồn kho và phân bổ chi phí.*

---

## 1. Tổng Quan Không Gian Làm Việc Của Leader (Workspace Anatomy)

Giao diện Leader Dashboard được thiết kế chuyên biệt để cấp quản lý nắm bắt toàn diện bức tranh chi tiêu mua sắm nội bộ theo đúng phân cấp tổ chức thực tế:

$$\mathbf{Team\ (Ph\grave{o}ng\ Ban)} \Longrightarrow \mathbf{Part\ (Ph\hat{a}n\ Ban)} \Longrightarrow \mathbf{K\tilde{y}\ S\u{u}\ Hi\hat{e}n\ Tr\u{o}\grave{n}g\ (Ngang\ h\grave{a}ng\ nhau)}$$

Cấu trúc giao diện gồm **3 Tab chức năng trọng tâm**:
1.  **Tab 1: 📊 Toàn Cảnh Mua Sắm & Ngân Sách Team (Team Spend Overview)**: Thẻ đồng hồ đo tỷ lệ cam kết ngân sách SG tháng, tỷ trọng **🟢 TRONG TARGET (Định mức)** vs **🔴 OVER PHÁT SINH (Sự cố bất thường)** do LEC phân loại, và bảng xếp hạng tiến độ mua sắm theo từng dây chuyền (`Line #201` ~ `#210`, `#601`, `#604`).
2.  **Tab 2: 📋 Bàn Giám Sát Tiến Độ Mua Sắm Nội Bộ Team (Procurement Progress Monitor)**: Danh sách toàn bộ yêu cầu mua của các kỹ sư thuộc quyền quản lý, theo dõi tiến độ qua các mốc: *Chuẩn bị data QCode $\rightarrow$ Chờ thẩm định đầu tháng $\rightarrow$ Đang RFQ $\rightarrow$ Đã lên EMS $\rightarrow$ Chờ hàng về*. Tích hợp cửa sổ **Xem Chi Tiết Dữ Liệu Kỹ Thuật & Sự Cố** *(Tuyệt đối không có nút duyệt đơn; phê duyệt chính thức diễn ra trên EMS)*.
3.  **Tab 3: 📈 Giám Sát Tiến Độ Giải Trình Tồn Kho & Cảnh Báo Tồn Kho Team Khác**: 
    *   Theo dõi tiến độ hoàn thành các **Task Giải Trình Tồn Kho Đầu Tháng** của kỹ sư trước Deadline do LEC thiết lập.
    *   Giám sát các **Task Mượn/Xuất Tồn Kho Team Khác (`agingInterlockFlag`)** chưa hoàn tất thủ tục trên EMS.

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  BÀN ĐIỀU KHIỂN LEADER — THEO DÕI TIẾN ĐỘ MUA SẮM NỘI BỘ TEAM         [🔔 3 Cần Đôn Đốc]  [👤 Tran Van B (Part Leader)] │
│ Phạm Vi: PO Module Tech Team 2 > CP/SG Part 1                                     Nhà máy: Factory HW = Smart Watch (SW)           │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CÁC TAB CHỨC NĂNG CỦA LEADER:                                                                                                    │
│ [📊 TAB 1: TOÀN CẢNH TIẾN ĐỘ & NGÂN SÁCH]  [📋 TAB 2: GIÁM SÁT TIẾN ĐỘ YÊU CẦU]  [📈 TAB 3: ĐÔN ĐỐC TASK TỒN KHO (3)]             │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📌 ĐANG HIỂN THỊ: TAB 2 — BÀN GIÁM SÁT TIẾN ĐỘ MUA SẮM NỘI BỘ TEAM (CHỈ KIỂM SOÁT TIẾN ĐỘ - KHÔNG DUYỆT)                         │
│                                                                                                                                  │
│ 2.1. THANH BỘ LỌC THEO PHẠM VI QUẢN LÝ (SCOPE FILTERS):                                                                          │
│  Part: [ CP/SG Part 1 ▼ ]  Line: [ Tất Cả Line (#201..#205) ▼ ]  Máy: [ Tất Cả Máy Thân Thiện ▼ ]                                │
│  Kỹ Sư: [ Tất Cả Kỹ Sư Trong Part ▼ ]  Phân Loại LEC: [ Tất Cả (Target & Over) ▼ ]  Mốc Tiến Độ: [ Tất Cả Các Mốc ▼ ]            │
│                                                                                                                                  │
│ 2.2. BẢNG THEO DÕI TIẾN ĐỘ CHI TIẾT CỦA CÁC KỸ SƯ TRONG PART:                                                                    │
│ ┌───┬───────────┬──────────────┬──────────────┬─────────────┬──────┬──────────┬──────────────┬──────────────────┬──────────────┐ │
│ │STT│ Kỹ Sư Tạo │ Định Vị Máy  │ Phụ Tùng &   │ Maker & Quy │ Số   │ Đơn Giá  │ Phân Loại    │ Mốc Tiến Độ      │ Hành Động    │ │
│ │   │ (Eng Name)│ (Line/Máy)   │ Mã QCode     │ Cách Model  │ Lượng│ Dự Kiến  │ Kế Hoạch LEC │ Thực Tế          │ Theo Dõi     │ │
│ ├───┼───────────┼──────────────┼──────────────┼─────────────┼──────┼──────────┼──────────────┼──────────────────┼──────────────┤ │
│ │ 1 │ Nguyen V.A│ Line #201    │ QDAD12236    │ TRUMPF      │ 1 EA │$3,150.00 │ 🔴 OVER      │ ⏳ Chờ Thẩm Định │ [👁️ Xem Chi │ │
│ │   │ (ID:87021)│ Die Bonder 01│ Board nguồn  │ Model2912146│      │          │ Mã: OVR-01   │    ĐẦU THÁNG     │    Tiết Kỹ   │ │
│ │   │           │              │ CPX V4 Trumpf│ (Loại: SPR) │      │          │ (LEC Đánh Dấu│ (Cost Management)│    Thuật]    │ │
│ ├───┼───────────┼──────────────┼──────────────┼─────────────┼──────┼──────────┼──────────────┼──────────────────┼──────────────┤ │
│ │ 2 │ Le Thi C  │ Line #202    │ QDAB03583    │ PANASONIC   │ 4 EA │$6.39     │ 🟢 TRONG     │ 🚚 Vendor Confirm│ [👁️ Xem Chi │ │
│ │   │ (ID:87025)│ Tester 02    │ Cảm biến     │ CN-73-C2    │      │          │    TARGET    │    Giao 12/11    │    Tiết Hàng │ │
│ │   │           │              │ quang vuông  │             │      │          │ (LEC Đánh Dấu│ (PO-2611-0089)   │    Về]       │ │
│ ├───┼───────────┼──────────────┼──────────────┼─────────────┼──────┼──────────┼──────────────┼──────────────────┼──────────────┤ │
│ │ 3 │ Tran V. D │ Line #201    │ TMP-HW-0104  │ SMC (Japan) │ 2 EA │$220.00   │ —            │ 📁 Đang Chuẩn Bị │ [👁️ Xem Chi │ │
│ │   │ (ID:87028)│ Die Bonder 01│ Xylanh trượt │ MXQ16-100B  │      │(Chờ RFQ) │ (Chưa xét    │    Dữ Liệu QCode │    Tiết Data │ │
│ │   │           │              │ kép Precision│ (Mã tạm mới)│      │          │ Target/Over) │ (Chờ Đăng Ký ERP)│    Folder]   │ │
│ └───┴───────────┴──────────────┴──────────────┴─────────────┴──────┴──────────┴──────────────┴──────────────────┴──────────────┘ │
│  ↳ Lưu ý hệ thống: Mọi phê duyệt chính thức diễn ra trên EMS. Bàn điều khiển Leader chỉ phục vụ kiểm soát tiến độ nội bộ.        │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Cửa Sổ Modal Xem Chi Tiết Kỹ Thuật & Dữ Liệu Sự Cố (Không Có Nút Duyệt)

Khi Leader bấm nút **`[👁️ Xem Chi Tiết Kỹ Thuật]`** tại dòng số 1:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔍 THÔNG TIN CHI TIẾT TIẾN ĐỘ & DỮ LIỆU KỸ THUẬT — YÊU CẦU MUA REQ-2611-0012                                │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ THÔNG TIN MÁY & SỰ CỐ DO KỸ SƯ CUNG CẤP:                                                                   │
│ • Vị Trí Thiết Bị:  Line #201 (Tầng 2F) > Máy Die Bonder DB-01 > Cụm Đầu Gắp Bonding Head                   │
│ • Mã Work Order:    WO-248926091 (Tạo lúc: 2026-11-02 21:15:00 bởi Kỹ sư Nguyen Van A)                      │
│ • Lỗi Hệ Thống:     ALARM E-502: MAIN_POWER_SUPPLY_FAILURE (Cháy nguồn cấp nhiệt)                          │
│ • Tình Trạng Lắp:   Đã gắn mã quản lý thiết bị: HWBMTL21EC0101 (Phân loại: SPR)                             │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ĐỐI CHIẾU HÌNH ẢNH HIỆN TRƯỜNG & HỒ SƠ KỸ THUẬT:                                                           │
│ ┌──────────────────────────────────────┬────────────────────────────────────────────────────────────────┐  │
│ │ [ẢNH CHỤP HIỆN TRƯỜNG BOARD CHÁY]    │ [BẢN VẼ FDM CAD CHI TIẾT LẮP ĐẶT]                              │  │
│ │ 🖼️ Vết nổ đen tại tụ điện C14,       │ 📐 Vị trí lắp đặt: Cụm Bonding Head Unit 01, sau nắp bảo vệ số 3│  │
│ │ dây cáp tín hiệu bị quá nhiệt sun mép│ Link CAD: fdm.lgdisplay.com/drawings/QDAD12236.dwg             │  │
│ └──────────────────────────────────────┴────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ THÔNG TIN XỬ LÝ CỦA LEC & TIẾN ĐỘ:                                                                         │
│ • Phân Loại Kế Hoạch:  🔴 OVER PHÁT SINH (Lý do: OVR-01 - Sự cố máy bất thường Breakdown)                  │
│ • Tiến Độ Thẩm Định:   Đã đưa vào danh sách Thẩm Định Đầu Tháng với Cost Management (1 người)              │
│ • Cờ Giá Hợp Đồng:     unitPriceFlag = Y (Đơn giá ServeOne: $3,150.00 USD)                                 │
│ • Ghi chú của Leader:  [ Đã kiểm tra hiện trường ca đêm, đồng ý kỹ sư chuẩn bị hồ sơ giải trình thẩm định ]│
│                                                                                                            │
│ [💬 Nhắn Tin Cho Kỹ Sư]                   [💬 Trao Đổi Với LEC]                   [✖️ Đóng Cửa Sổ]         │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Bảng Phân Quyền Giám Sát Của Cấp Leader

| Cấp Quản Lý | Phạm Vi Xem (Data Scope) | Thẩm Quyền Thao Tác |
| :--- | :--- | :--- |
| **Part Leader** | Giám sát toàn bộ tiến độ mua sắm của các Kỹ sư trong Part (ví dụ: `CP/SG Part 1`). Kỹ sư trong Part ngang hàng, không phân chia công đoạn. | Theo dõi tiến độ kỹ thuật, đôn đốc kỹ sư giải trình tồn kho đầu tháng và mượn tồn kho Team khác. *(Không duyệt trên app)*. |
| **Team Leader** | Xem toàn diện tiến độ của tất cả các Part trong Team (`PO Module Technology Team 2`) và nhóm LEC. | Kiểm soát tổng trần ngân sách SG tháng ($33\%-33\%-34\%$ - No Rollover), theo dõi kế hoạch phân bổ chi phí hàng tháng. *(Không duyệt trên app)*. |
