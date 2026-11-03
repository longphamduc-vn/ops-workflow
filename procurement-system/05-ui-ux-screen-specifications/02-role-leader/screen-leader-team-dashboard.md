# Giao Diện Dành Riêng Cho Vai Trò: Leader Quản Lý (Process / Part / Team Leader)
> **Mã Giao Diện: UI-ROLE-02 — Leader Team Monitoring Dashboard**  
> *Dành riêng cho: Cấp quản lý kỹ thuật trực tiếp tại xưởng: Process Leader, Part Leader và Team Leader*

---

## 1. Tổng Quan Không Gian Làm Việc Của Leader (Workspace Anatomy)

Giao diện Leader Dashboard được thiết kế chuyên biệt để cấp quản lý nắm bắt toàn diện bức tranh chi tiêu mua sắm nội bộ theo đúng cấu trúc:

$$\mathbf{Team\ (Ph\grave{o}ng\ Ban)} \Longrightarrow \mathbf{Part\ (Ph\hat{a}n\ Ban)} \Longrightarrow \mathbf{Process\ (C\hat{o}ng\ \text{đ}o\text{ạ}n)} \Longrightarrow \mathbf{Engineer\ Process\ (K\tilde{y}\ S\u{)}\}$$

Cấu trúc giao diện gồm **3 Tab chức năng trọng tâm**:
1.  **Tab 1: 📊 Toàn Cảnh Mua Sắm & Ngân Sách Team (Team Spend Overview)**: Thẻ đồng hồ đo tỷ lệ cam kết ngân sách SG tháng, biểu đồ cơ cấu chi tiêu **🟢 TRONG TARGET (Bù định mức)** vs **🔴 OVER NGOÀI KẾ HOẠCH (Sự cố bất thường)**, và bảng xếp hạng phát sinh chi phí theo từng dây chuyền (`#201` ~ `#210`, `#601`, `#604`).
2.  **Tab 2: 📋 Bàn Thẩm Tra & Xác Nhận Nội Bộ (Requisition Review & Endorsement)**: Danh sách toàn bộ yêu cầu mua của các kỹ sư thuộc quyền quản lý, lọc đa chiều theo trạng thái duyệt và nhãn kế hoạch. Tích hợp cửa sổ **Modal Thẩm Tra Chi Tiết Work Order** (đối chiếu ảnh chụp máy hỏng, mã lỗi Alarm E-xxx, bản vẽ FDM CAD và lịch sử dừng máy) trước khi bấm `[Xác Nhận Nội Bộ]` hoặc `[Trả Lại Yêu Cầu]`.
    *   *Nguyên tắc bất biến*: **Mọi hoạt động Mua Bán (phát hành PO) và Chuyển Giao (Transfer) BẮT BUỘC phải diễn ra SAU KHI ĐƯỢC THẨM ĐỊNH PHÊ DUYỆT**. Leader chỉ xác nhận sơ bộ để chuyển hồ sơ lên hội đồng thẩm định.
3.  **Tab 3: 📈 Báo Cáo Chi Phí Công Đoạn & Thẩm Tra Task Giải Trình Tồn Kho**: 
    *   Thống kê chi phí phụ tùng thực tế đã xuất kho lắp vào máy tại các công đoạn (`POL`, `TAB`, `DIP`, `LT`, `DB`, `BD`).
    *   **Thẩm tra các Task Giải Trình Tồn Kho Chưa Sử Dụng**: Rà soát các giải trình của Kỹ sư công đoạn về các phụ tùng lưu kho quá 30 ngày chưa xuất máy, ký xác nhận tính xác thực trước khi đưa vào hồ sơ kiểm thảo hàng tháng.

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  BÀN ĐIỀU KHIỂN LEADER — CÔNG ĐOẠN: DB (DIE BONDING)               [🔔 5 Chờ Duyệt]  [👤 Tran Van B (Process Leader)] │
│ Phạm Vi: PO Module Tech Team 2 > CP/SG Part 1 > Process: DB                     Nhà máy: Factory HW = Smart Watch (SW)           │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CÁC TAB CHỨC NĂNG CỦA LEADER:                                                                                                    │
│ [📊 TAB 1: TOÀN CẢNH MUA SẮM & NGÂN SÁCH]  [📋 TAB 2: THẨM TRA & DUYỆT ĐƠN (5)]  [📈 TAB 3: BÁO CÁO CHI PHÍ CÔNG ĐOẠN]           │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📌 ĐANG HIỂN THỊ: TAB 2 — BÀN THẨM TRA & XÁC NHẬN NỘI BỘ TEAM                                                                    │
│                                                                                                                                  │
│ 2.1. THANH BỘ LỌC TÌM KIẾM THEO PHẠM VI QUẢN LÝ (SCOPE FILTERS):                                                                │
│  Part: [ CP/SG Part 1 ▼ ]  Process: [ DB (Die Bonding) ▼ ]  Line: [ Tất Cả Line (#201..#205) ▼ ]  Machine: [ Tất Cả Máy (EC..) ▼ ]│
│  Kỹ Sư Tạo: [ Tất Cả Kỹ Sư ▼ ]  Kế Hoạch: [ 🔴 Chỉ Hiện Over Ngoài Kế Hoạch (8) ▼ ]  Trạng Thái: [ Chờ Leader Xác Nhận (5) ▼ ] │
│                                                                                                                                  │
│ 2.2. BẢNG DANH SÁCH MUA SẮM PHỤ TÙNG CỦA CÁC KỸ SƯ TRONG TEAM:                                                                   │
│ ┌──┬───┬───────────┬──────────────┬──────────────┬─────────────┬──────┬──────────┬──────────────┬──────────────┬───────────────┐ │
│ │☑ │STT│ Kỹ Sư Tạo │ Số Quản Lý EM│ Phụ Tùng &   │ Maker & Quy │ Số   │ Đơn Giá  │ Phân Loại KH │ Trạng Thái   │ Hành Động     │ │
│ │  │   │ (Eng Name)│ (14 Ký Tự)   │ Tên Chi Tiết │ Cách Model  │ Lượng│ Dự Kiến  │ & Lý Do Over │ Quy Trình    │ Xử Lý         │ │
│ ├──┼───┼───────────┼──────────────┼──────────────┼─────────────┼──────┼──────────┼──────────────┼──────────────┼───────────────┤ │
│ │☑ │ 1 │ Nguyen V.A│ HWBMTL21EC010│ QDAD12236    │ TRUMPF      │ 1 EA │$3,150.00 │ 🔴 OVER      │ Chờ Leader   │ [✅ Xác Nhận] │ │
│ │  │   │ (ID:87021)│ (Line#201/EC)│ Board nguồn  │ Model2912146│      │          │ Mã: OVR-01   │ Xác Nhận     │ [👁️ Thẩm Tra] │ │
│ │  │   │           │              │ CPX V4 Trumpf│ (Loại: SPR) │      │          │ (WO-24892609)│              │ [💬 Nhắn Tin] │ │
│ ├──┼───┼───────────┼──────────────┼──────────────┼─────────────┼──────┼──────────┼──────────────┼──────────────┼───────────────┤ │
│ │☐ │ 2 │ Le Thi C  │ HWBMTL22EC010│ QDAB03583    │ PANASONIC   │ 4 EA │$6.39     │ 🟢 TRONG     │ Đã chuyển sang│ [👁️ Xem Tiến]│ │
│ │  │   │ (ID:87025)│ (Line#202/EC)│ Cảm biến quang CN-73-C2    │      │          │ TARGET       │ LEC & Purchase│               │ │
│ ├──┼───┼───────────┼──────────────┼──────────────┼─────────────┼──────┼──────────┼──────────────┼──────────────┼───────────────┤ │
│ │☑ │ 3 │ Tran V. D │ HWBMTL21EC020│ TMP-HW-0104  │ SMC (Japan) │ 2 EA │$220.00   │ 🔴 OVER      │ Chờ Leader   │ [✅ Xác Nhận] │ │
│ │  │   │ (ID:87028)│ (Line#201/EC)│ Xylanh trượt │ MXQ16-100B  │      │          │ Mã: OVR-03   │ Xác Nhận     │ [👁️ Thẩm Tra] │ │
│ │  │   │           │              │ kép Precision│ (Mã tạm mới)│      │          │ (LGD Korea c)│              │ [💬 Nhắn Tin] │ │
│ └──┴───┴───────────┴──────────────┴──────────────┴─────────────┴──────┴──────────┴──────────────┴──────────────┴───────────────┘ │
│  Hành động chọn hàng loạt (2 dòng đã chọn):                                                                                      │
│  [✅ XÁC NHẬN NỘI BỘ HÀNG LOẠT (ENDORSE)]    [↩️ TRẢ LẠI CHỈNH SỬA (REJECT)]    [📤 CHUYỂN SANG CHO LEC (PHAM DUC LONG)]         │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Cửa Sổ Modal Thẩm Tra Chi Tiết Work Order & Hiện Trường Sự Cố

Khi Leader bấm nút **`[👁️ Thẩm Tra]`** tại dòng số 1:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔍 THẨM TRA NỘI BỘ YÊU CẦU MUA NGOÀI KẾ HOẠCH (OVER OVR-01) — WO-248926091                                 │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ THÔNG TIN MÁY & LỆNH BẢO TRÌ SẢN XUẤT:                                                                     │
│ • Vị Trí Thiết Bị:  HWBMTL21EC0101 (Factory HW > Tầng 2F > Line #201 > Machine EC > Unit 01 > Assy 01)     │
│ • Mã Work Order:    WO-248926091 (Tạo lúc: 2026-11-02 21:15:00 bởi Ca Đêm - Kỹ sư Nguyen Van A)           │
│ • Lỗi Hệ Thống:     ALARM E-502: MAIN_POWER_SUPPLY_FAILURE (Mất nguồn cấp đầu gia nhiệt chip)              │
│ • Lịch Sử Sự Cố:    Máy EC này đã dừng 2 lần trong 30 ngày qua (Tổng thời gian dừng máy: 4.5 giờ)          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ĐỐI CHIẾU HÌNH ẢNH HIỆN TRƯỜNG & BẢN VẼ KỸ THUẬT:                                                         │
│ ┌──────────────────────────────────────┬────────────────────────────────────────────────────────────────┐  │
│ │ [ẢNH CHỤP HIỆN TRƯỜNG BOARD CHÁY]    │ [BẢN VẼ FDM CAD CHI TIẾT LẮP ĐẶT]                              │  │
│ │ 🖼️ Vết nổ đen tại tụ điện C14,       │ 📐 Vị trí lắp đặt: Cụm Bonding Head Unit 01, sau nắp bảo vệ số 3│  │
│ │ dây cáp tín hiệu bị quá nhiệt sun mép│ Link CAD: fdm.lgdisplay.com/drawings/QDAD12236.dwg             │  │
│ └──────────────────────────────────────┴────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Ý KIẾN THẨM TRA CỦA LEADER:                                                                                │
│ [ Xác nhận board nguồn cháy thật do xung điện ca đêm. Đã kiểm tra tủ điện nguồn. Đồng ý đề xuất mua khẩn. ] │
│                                                                                                            │
│ [↩️ Yêu Cầu Kỹ Sư Giải Trình Thêm]            [❌ HỦY YÊU CẦU]            [✅ XÁC NHẬN HỢP LÝ & GỬI CHO LEC] │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Bảng Phân Quyền Giám Sát Của Cấp Leader

| Cấp Quản Lý | Phạm Vi Xem (Data Scope) | Thẩm Quyền Thao Tác |
| :--- | :--- | :--- |
| **Process Leader** | Chỉ xem các đơn hàng của Kỹ sư thuộc Công đoạn của mình (ví dụ: Leader DB giám sát máy EC trên các Line #201..#205). | Thẩm tra Work Order, ký xác nhận công đoạn, trả lại yêu cầu kèm lý do. |
| **Part Leader** | Xem tổng hợp tất cả các Process trực thuộc Part (ví dụ: `CP/SG Part 1` chứa các công đoạn DB, BD, LT). | Kiểm soát cân đối tiêu hao giữa các công đoạn trong phân ban. |
| **Team Leader** | Xem toàn diện toàn bộ Team (`PO Module Technology Team 2`). | Kiểm soát tổng trần ngân sách SG quý ($33\%-33\%-34\%$) trước khi LEC xuất hồ sơ trình Management. |

