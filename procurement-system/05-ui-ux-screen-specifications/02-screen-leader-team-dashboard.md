# 02. Đặc Tả Giao Diện Chi Tiết: Màn Hình Giám Sát Của Leader (Team Dashboard)
> *Phân cấp phạm vi Team => Part => Process, Giám sát Trong Target vs Over và Thẩm tra Work Order*

---

## 1. Tổng Quan Kiến Trúc Bàn Điều Khiển Leader (Team Scope)

Giao diện phục vụ các cấp quản lý kỹ thuật trực tiếp:
*   **Team Leader** (Trưởng phòng ban - ví dụ: *PO Module Technology Team 2*).
*   **Part Leader** (Trưởng phân ban - ví dụ: *CP/SG Part 1*).
*   **Process Leader** (Trưởng công đoạn - ví dụ: *Leader DB, Leader POL...*).

### Nguyên tắc hiển thị dữ liệu:
- Mọi dữ liệu mua sắm được đóng gói chặt chẽ trong phạm vi quản lý của Leader. Leader công đoạn DB chỉ xem được các yêu cầu liên quan đến các máy DB (`EC`, `DB-01`...) thuộc công đoạn của mình.
- Tách bạch tuyệt đối giữa **Yêu Cầu Trong Target** và **Yêu Cầu Over Ngoài Kế Hoạch** để kiểm soát chi tiêu trước khi chuyển tiếp cho LEC trong Team.

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  BÀN ĐIỀU KHIỂN LEADER — CÔNG ĐOẠN: DB (DIE BONDING)               [🔔 5 Chờ Duyệt]  [👤 Tran Van B (Process Leader)] │
│ Phạm Vi: PO Module Tech Team 2 > CP/SG Part 1 > Process: DB                     Nhà máy: Factory HW = Smart Watch (SW)           │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. THẺ ĐỒNG HỒ ĐIỀU HÀNH NGÂN SÁCH & KẾ HOẠCH NỘI BỘ TEAM THÁNG 11/2026:                                                         │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬─────────────────────────────────────────────────────────┐ │
│ │ Tổng Hạng Mục Đã Tạo │ 🟢 Trong Target (Bù) │ 🔴 Over Ngoài Kế Hoạch│ Hạn Mức Ngân Sách Phân Bổ / Đã Cam Kết Mua (PO Spend)   │ │
│ │       42 Mục         │    34 Mục (81.0%)    │     8 Mục (19.0%) ⚠️ │ [██████████████████████████████░░] $42,500 / $45,000 USD│ │
│ │                      │                      │ (Bắt buộc giải trình)│ Tỷ Lệ Sử Dụng: 94.4% (🟡 Mức Cảnh Báo)                  │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴─────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. THANH BỘ LỌC TÌM KIẾM ĐA NĂNG NỘI BỘ TEAM:                                                                                    │
│  Part: [ CP/SG Part 1 ▼ ]  Process: [ DB (Die Bonding) ▼ ]  Line: [ Tất Cả Line (#201..#205) ▼ ]  Machine: [ Tất Cả Máy (EC..) ▼ ]│
│  Kỹ Sư Tạo: [ Tất Cả Kỹ Sư ▼ ]  Kế Hoạch: [ 🔴 Chỉ Hiện Over Ngoài Kế Hoạch (8) ▼ ]  Trạng Thái: [ Chờ Leader Xác Nhận (5) ▼ ] │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. BẢNG DANH SÁCH MUA SẮM PHỤ TÙNG CỦA CÁC KỸ SƯ TRONG TEAM:                                                                     │
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

## 3. Cửa Sổ Thẩm Tra Chi Tiết Work Order & Hiện Trường (Verification Modal)

Khi Leader bấm nút **`[👁️ Thẩm Tra]`** tại dòng số 1 (Mã OVR-01):

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔍 THẨM TRA NỘI BỘ YÊU CẦU MUA NGOÀI KẾ HOẠCH (OVER OVR-01) — WO-248926091                                 │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ THÔNG TIN MÁY & LỆNH BẢO TRÌ:                                                                              │
│ • Vị Trí Thiết Bị:  HWBMTL21EC0101 (Factory HW > Tầng 2F > Line #201 > Machine EC > Unit 01 > Assy 01)     │
│ • Mã Work Order:    WO-248926091 (Tạo lúc: 2026-11-02 21:15:00 bởi Ca Đêm)                                 │
│ • Lỗi Hệ Thống:     ALARM E-502: MAIN_POWER_SUPPLY_FAILURE (Mất nguồn cấp đầu gia nhiệt chip)              │
│ • Lịch Sử Sự Cố:    Máy EC này đã dừng 2 lần trong 30 ngày qua (Tổng thời gian dừng máy: 4.5 giờ)          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ĐỐI CHIẾU HÌNH ẢNH HIỆN TRƯỜNG & BẢN VẼ:                                                                   │
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
