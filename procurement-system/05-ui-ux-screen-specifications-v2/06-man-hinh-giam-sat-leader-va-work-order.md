# 06. MÀN HÌNH GIÁM SÁT TRƯỞNG NHÓM / PART & ĐỐI SOÁT WORK ORDER (LEADER OVERSIGHT & WORK ORDER VERIFICATION)

> **Mã màn hình**: `UI-LEAD-01`  
> **Tên màn hình**: Leader Team & Part Monitoring, Aging Compliance & Work Order Verification Portal  
> **Vai trò người dùng chính**: Trưởng nhóm / Trưởng Part (Team Leader & Part Leader) — Quản lý kỹ thuật và giám sát vận hành chuyền.  
> **Nguyên tắc cốt lõi bất biến (Golden Rule #1)**: **TUYỆT ĐỐI KHÔNG CÓ NÚT PHÊ DUYỆT TRÊN HỆ THỐNG NÀY**. Toàn bộ phê duyệt PRV và ký duyệt ngân sách thực hiện 100% trên phần mềm EMS Nexacro của tập đoàn. Màn hình này phục vụ thuần túy công tác giám sát tiến độ, đôn đốc kỹ sư giải trình tồn kho đúng hạn và đối soát hồ sơ Work Order phục vụ kiểm thảo chi phí.

---

## 1. NGUYÊN TẮC NGHIỆP VỤ & PHẠM VI GIÁM SÁT

1. **Giám sát Phân cấp Team $\rightarrow$ Part $\rightarrow$ Kỹ sư đồng nghiệp (Peer Engineers)**:
   - Dữ liệu tự động thu hẹp theo phạm vi phụ trách: Part Leader chỉ thấy các kỹ sư trong Part của mình (Part 1 - Tầng 2F hoặc Part 2 - Tầng 3F); Team Leader bao quát toàn bộ các Part trong Team.
   - Nhìn rõ tiến độ của từng kỹ sư: ai đang có nhiều đơn mua, ai bị vướng tồn kho chậm luân chuyển, ai chưa hoàn thành khai báo EBOM.
2. **Đôn đốc nộp giải trình tồn kho trước ngày 05 (Aging Compliance)**:
   - Tồn kho chậm luân chuyển là chỉ số KPI then chốt của Trưởng nhóm.
   - Leader theo dõi tiến độ nộp giải trình của các kỹ sư trong Part để kịp thời đôn đốc trước hạn chót ngày 05 của LEC, tránh việc Team bị Quản lý Chi phí phê bình hoặc cắt giảm hạn mức ngân sách tháng sau.
3. **Đối soát hồ sơ Work Order (WO Verification Modal)**:
   - Các hạng mục mua sắm đột xuất (`OVER`) bắt buộc phải gắn mã Work Order sự cố.
   - Leader mở cửa sổ Modal kiểm tra chi tiết: *Mã sự cố, máy phát sinh, thời gian dừng chuyền thực tế, linh kiện bị hỏng, ảnh chụp hiện trường* để đảm bảo tính xác thực trước kỳ kiểm thảo đầu tháng.

---

## 2. BỐ CỤC KHÔNG GIAN GIAO DIỆN GIÁM SÁT (LAYOUT ANATOMY)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER: CỔNG GIÁM SÁT TRƯỞNG NHÓM / PART | Leader: Trần Văn Hùng | Team: PO Module Technology Team 2 (HW)         │
│ ⚠️ NGUYÊN TẮC VÀNG #1: Giao diện này không có nút duyệt • Phê duyệt PRV chính thức thực hiện trên EMS Nexacro    │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ PHÂN VÙNG 1: 4 THẺ CHỈ SỐ GIÁM SÁT NHANH (TEAM KPI SUMMARY CARDS)                                                │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬─────────────────────────────────────────┐ │
│ │ Tổng Hạng Mục Mua    │ Ngân Sách Target     │ Ngân Sách Over       │ Tác Vụ Giải Trình Cần Đôn Đốc           │ │
│ │ 64 Hạng Mục          │ $122,000 USD (82.3%) │ $26,200 USD (17.7%)  │ 3 Tác Vụ Còn Mở (Hạn chót: 2026-11-05)  │ │
│ │ • Part 1: 38 (Line201)│ • Trong định mức     │ • 6 mã sự cố         │ • Part 1: 2 task (Thắng)                │ │
│ │ • Part 2: 26 (Line202)│ • Đã có giá hợp đồng │ • Đã gắn mã WO       │ • Part 2: 1 task (Quân)                 │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴─────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ PHÂN VÙNG 2: ĐIỀU HƯỚNG 3 PHÂN HỆ GIÁM SÁT (3 MONITORING TABS)                                                   │
│ [ TAB 1: Giám Sát Tiến Độ Team => Part ] [ TAB 2: Tiến Độ Nộp Giải Trình Tồn Kho ] [ TAB 3: Đối Soát Mã WO ]    │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 1: MA TRẬN KỸ SƯ ĐỒNG NGHIỆP & BẢNG THEO DÕI YÊU CẦU MUA]                                          │
│ Thẻ Trực Quan Từng Kỹ Sư:                                                                                        │
│ ┌──────────────────────────┬──────────────────────────┬──────────────────────────┬───────────────────────────┐ │
│ │ Nguyễn Văn Thắng (Part 1)│ Lê Hoàng Quân (Part 1)   │ Trần Đức Minh (Part 2)   │ Phạm Văn Kiên (Part 2)    │ │
│ │ • Đơn mua: 18 hạng mục   │ • Đơn mua: 12 hạng mục   │ • Đơn mua: 15 hạng mục   │ • Đơn mua: 19 hạng mục    │ │
│ │ • Đang vướng: 2 Task ⚠️  │ • Đang vướng: 1 Task ⚠️  │ • Đang vướng: 0 Task 🟢  │ • Đang vướng: 0 Task 🟢   │ │
│ │ • Giá trị: $18,450 USD   │ • Giá trị: $12,300 USD   │ • Giá trị: $15,800 USD   │ • Giá trị: $21,200 USD    │ │
│ └──────────────────────────┴──────────────────────────┴──────────────────────────┴───────────────────────────┘ │
│ Bảng Chi Tiết Yêu Cầu Mua Của Team (Lọc: [Tất Cả Part ▼] [Tất Cả Kỹ Sư ▼] [Chờ Duyệt EMS ▼]):                    │
│ ┌───┬─────────────┬─────────────┬──────────────────────────┬──────────┬──────────┬──────────────┬────────────┐ │
│ │STT│Mã Đơn Mua   │Mã QCode     │Tên Phụ Tùng & Maker      │Thiết Bị  │Kỹ Sư     │Thành Tiền    │Trạng Thái  │ │
│ ├───┼───┼─────────────┼─────────────┼──────────────────────────┼──────────┼──────────┼──────────────┼────────────┤ │
│ │ 1 │PR-2611-0081 │QDAB03583    │Cảm biến quang Panasonic  │DB-01/201 │Thắng     │$450 USD      │Chờ Ký EMS  │ │
│ │ 2 │PR-2611-0082 │QCAD55421    │Bo nguồn Trumpf 400W      │TAB-01/201│Quân      │$3,150 USD    │[Soát WO 🔍]│ │
│ └───┴───┴─────────────┴─────────────┴──────────────────────────┴──────────┴──────────┴──────────────┴────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 2: ĐÔN ĐỐC NỘP GIẢI TRÌNH TỒN KHO ĐẦU THÁNG (AGING COMPLIANCE TRACKER)]                            │
│ ┌──────────────┬────────────┬──────────────────┬──────────┬──────────────────┬─────────────────────────────────┐ │
│ │Mã Tác Vụ     │Mã Linh Kiện│Kỹ Sư Phụ Trách   │Hạn Chót  │Tình Trạng Nộp    │Trích Yếu Giải Trình Kỹ Sư       │ │
│ ├──────────────┼────────────┼──────────────────┼──────────┼──────────────────┼─────────────────────────────────┤ │
│ │TASK-AGE-0042 │QDAB03583   │Nguyễn Văn Thắng  │2026-11-05│🟡 Chưa Nộp       │Cần đôn đốc nộp trước ca chiều   │ │
│ │              │(Tồn 48 ngày│(Part 1 - Line201)│          │(Cận hạn 1 ngày)  │                                 │ │
│ │TASK-AGE-0043 │QCAD55421   │Lê Hoàng Quân     │2026-11-05│🟢 Đã Nộp         │Đại tu máy định kỳ tuần 3 tháng11│ │
│ └──────────────┴────────────┴──────────────────┴──────────┴──────────────────┴─────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. CỬA SỔ MODAL ĐỐI SOÁT WORK ORDER (WORK ORDER INSPECTOR MODAL)

Khi Leader nhấn nút `[Soát WO 🔍]` trên một hạng mục mua ngoài kế hoạch (`OVER`), một Modal chi tiết xuất hiện:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔍 ĐỐI SOÁT HỒ SƠ WORK ORDER SỰ CỐ DỪNG MÁY | Đơn mua: PR-2611-0082                                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. THÔNG TIN PHIẾU WORK ORDER TỪ HỆ THỐNG BẢO TRÌ EMS:                                               │
│ • Mã Work Order: WO-248926091 (Thời gian phát sinh sự cố: 2026-11-02 02:15 - Ca đêm)               │
│ • Thiết Bị: Tape Automated Bonder 01 (TAB-01) | Dây chuyền: Line #201 (Tầng 2F)                     │
│ • Cụm Cơ Cấu Hư Hỏng: Heating Stage (Bàn nhiệt ép tinh thể)                                          │
│ • Thời Gian Dừng Chuyền (Downtime): 185 phút (Ảnh hưởng sản lượng: Thiệt hại 1,200 tấm kính màn hình) │
│ • Mô Tả Hiện Trường: Bo mạch nguồn Trumpf bị chập tụ lọc nguồn do biến áp cấp chập chờn              │
├──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. ĐỐI SOÁT HẠNG MỤC MUA THAY THẾ:                                                                   │
│ • Linh Kiện Xin Mua: QCAD55421 - Board nguồn xung Trumpf 400W | Số lượng: 1 EA | Đơn giá: $3,150 USD │
│ • Phân Loại Của LEC: OVER (Ngoài kế hoạch) | Mã nguyên nhân: OVR-01 (Line Stop - Dừng chuyền đột xuất)│
│ • Bằng chứng đính kèm: [ 📷 Anh_Chup_Bo_Mach_Chay_Tu.jpg ] [ 📄 Nhat_Ky_Dung_May_Line201.pdf ]      │
├──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ⚠️ XÁC NHẬN CỦA LEADER: "Đã đối soát khớp hồ sơ dừng chuyền thực tế, sẵn sàng trình kiểm thảo chi phí"│
│ [ 🔙 Đóng Cửa Sổ ]      [ 🖨️ In Phiếu Đối Soát Hồ Sơ ]                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. TỪ ĐIỂN DỮ LIỆU GIÁM SÁT LEADER

| Tên Thuộc Tính | Mã Trường | Kiểu | Mô Tả & Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :---: | :--- |
| `leaderPartScope` | Phân vùng Part | Enum | `'PART_1_2F'` \| `'PART_2_3F'` \| `'ALL_TEAM_PARTS'`. |
| `peerEngineersList` | Danh sách kỹ sư | Array | Danh sách hồ sơ các kỹ sư trong Part kèm số lượng đơn mua và tác vụ tồn đọng. |
| `overWorkOrderNo` | Mã Work Order | String | Số phiếu bảo trì sự cố (e.g. `WO-248926091`). |
| `downtimeMinutes` | Thời gian dừng máy | Number | Số phút dừng chuyền ghi nhận từ hệ thống MES/EMS. |
| `agingTaskComplianceRate`| Tỷ lệ nộp giải trình | Percentage | Phần trăm tác vụ giải trình tồn kho đã nộp trước hạn ngày 05. |
