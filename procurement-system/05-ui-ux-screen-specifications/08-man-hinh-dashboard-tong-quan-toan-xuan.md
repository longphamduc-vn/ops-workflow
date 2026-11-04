# 08. MÀN HÌNH DASHBOARD TỔNG QUAN VẬN HÀNH & PHÂN TÍCH TOÀN XƯỞNG (UNIVERSAL OPERATIONS & ANALYTICS DASHBOARD)

> **Mã màn hình**: `UI-DASH-01`  
> **Tên màn hình**: Universal Operations, Procurement Funnel, Multi-Month Target/Over Comparison & Historical Purchase Analytics  
> **Phạm vi hiển thị (Visibility Scope)**: Toàn bộ phân xưởng Smart Watch (Factory HW - Org ID: 28753), tự động phân quyền dữ liệu theo vai trò đăng nhập.  
> **Mục tiêu cốt lõi**: Trung tâm thông tin điều hành toàn diện: Phễu tiến độ 7 giai đoạn thời gian thực; kiểm soát 3 trục ngân sách SG (không lũy kế); **truy vấn danh mục chi tiết gây Over (cả mua sắm và xuất kho EMS theo 6 mã OVR)**; **tra cứu toàn diện lịch sử mua hàng theo mã QCode/máy**; **so sánh chỉ số Target mua và phân tích xu hướng nguyên nhân Over giữa các tháng liên tiếp**; kết xuất báo cáo Excel 4 Sheet phục vụ Ban Giám Đốc.

---

## 1. NGUYÊN TẮC THIẾT KẾ & ĐỐI SOÁT NGÂN SÁCH

1. **Đối soát 3 Trục Ngân Sách SG (Strict No-Rollover Policy)**:
   - **Trục 1: Trần Ngân sách SG ($B_{\text{alloc}}$)**: Nhập thủ công từ LEC, số dư cuối tháng bị hủy về 0 (`Carryover Surplus = $0`).
   - **Trục 2: Thực chi PO Cam kết ($S_{\text{PO}}$)**: Tổng giá trị các đơn mua đã ký PO trên EMS.
   - **Trục 3: Chi phí Xuất kho Thực tế ($E_{\text{EMS}}$)**: Đồng bộ tự động từ bảng kê `ds_Inv` của EMS khi thủ kho phát phụ tùng lên chuyền.
2. **Phễu Tiến Độ Mua Sắm 7 Giai Đoạn (7-Stage Clickable Pipeline)**:
   - Nhấp vào bất kỳ giai đoạn nào trên phễu sẽ tự động lọc danh sách bảng dữ liệu bên dưới:
     * *Giai đoạn 1: Chuẩn bị QCode & Folder CAD (`TMP-`)*.
     * *Giai đoạn 2: Quét & Phân tích Interlock*.
     * *Giai đoạn 3: Chờ Báo Giá RFQ (Email Purchasing)*.
     * *Giai đoạn 4: Thẩm Định Chi Phí & Ký Duyệt EMS*.
     * *Giai đoạn 5: NCC Xác Nhận Đơn Hàng (Vendor Confirm)*.
     * *Giai đoạn 6: Hàng Về Cảng / Kho Nhà Máy (ETA Date)*.
     * *Giai đoạn 7: Xuất Lắp Đặt Vào Máy (Ghi nhận `ds_Inv`)*.
3. **Phân Tích Chuyên Sâu Danh Mục Gây Over (Over-Budget Deep Dive Analyzer)**:
   - Bóc tách theo **6 mã sự cố chuẩn (`OVR-01` đến `OVR-06`)** và phân loại tách bạch giữa Over Mua Sắm Mới vs. Over Xuất Kho Dây Chuyền.
4. **Tra Cứu Lịch Sử Mua Hàng & So Sánh Target / Over Đa Tháng (Multi-Month Analytics)**:
   - **Tra cứu lịch sử mua (Historical Purchase Lookup)**: Tra cứu nhanh theo mã QCode, theo máy hoặc theo nhà cung cấp trong 3, 6, 12 tháng gần nhất (Số lượng mua, đơn giá biến động qua từng đợt, số PO EMS, ngày nhận hàng, tỷ lệ hỏng hóc thực tế so với tuổi thọ EBOM).
   - **So sánh Target giữa các tháng (Cross-Month Target Comparison)**: So sánh hạn mức kế hoạch Target được duyệt, tỷ lệ hoàn thành kế hoạch Target, và tỷ lệ chuyển dịch giữa Target vs Over qua các tháng ($T-2$, $T-1$, $T$).
   - **Theo dõi xu hướng lý do Over đa tháng**: Biểu đồ phân tích biến động 6 mã Over qua các tháng; cảnh báo danh mục **Hạng mục Over lặp lại nhiều tháng (Chronic Over Items)** để kỹ sư xử lý triệt để nguyên nhân gốc.

---

## 2. BỐ CỤC KHÔNG GIAN GIAO DIỆN DASHBOARD (LAYOUT ANATOMY)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER: DASHBOARD ĐIỀU HÀNH TOÀN XƯỞNG | Phân Xưởng: Factory HW (Smart Watch) | Kỳ: 2026-11 | Cổng EMS: 🟢 Online│
│ Omni-Filter: [Kỳ: Tháng 11/2026 ▼] [Team: Tất Cả (PO 1, PO 2) ▼] [Chuyền: Line #201..#301 ▼] [Target/Over: Tất Cả]│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ PHÂN VÙNG 1: ĐỐI SOÁT NGÂN SÁCH SG 3 TRỤC (THREE-AXIS SG BUDGET DIALS)                                           │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬─────────────────────────────────────────┐ │
│ │ 1. Trần Ngân Sách SG │ 2. Thực Chi Cam Kết  │ 3. Chi Phí Xuất Kho  │ 4. Tổng Chi Phí Vượt Mức (Over Total)   │ │
│ │    $150,000 USD      │    $148,200 USD      │    $118,450 USD      │    $26,200 USD (Chiếm 17.7% tổng ngân)  │ │
│ │ • Hạn mức LEC nhập   │ • Đã ký PO trên EMS  │ • Đồng bộ từ ds_Inv  │ • Over Mua Mới: $17,400 USD (66.4%)     │ │
│ │ • Carryover = $0     │ • Đạt 98.8% trần     │ • Vật tư đã lên máy  │ • Over Xuất Kho: $8,800 USD (33.6%)     │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴─────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ PHÂN VÙNG 2: PHỄU TIẾN ĐỘ MUA SẮM 7 GIAI ĐOẠN TƯƠNG TÁC (7-STAGE CLICKABLE PIPELINE FUNNEL)                      │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ [1.Chuẩn Bị QCode] ➔ [2.Quét Interlock] ➔ [3.Chờ Báo Giá RFQ] ➔ [4.Thẩm Định & Duyệt EMS]                    │ │
│ │   (2 Hồ sơ - $370)     (3 Đơn - $1,760)     (4 Đơn - $3,450)        (52 Đơn - $148,200)                      │ │
│ │ ➔ [5.NCC Xác Nhận] ➔ [6.Hàng Về Kho HW] ➔ [7.Xuất Lắp Máy (ds_Inv)]                                         │ │
│ │   (18 Đơn - $42,500)   (12 Đơn - $31,000)   (45 Đơn - $118,450)                                              │ │
│ │ • Chu kỳ bình quân (Lead Time): 9.4 Ngày | Tỷ lệ giao đúng hạn (OTD): 92.8% | Nhấn giai đoạn để lọc bảng dưới │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ PHÂN VÙNG 3: TRUY VẤN CHUYÊN SÂU DANH MỤC GÂY OVER (OVER-BUDGET DEEP DIVE ANALYZER)                              │
│ Nhấp chọn nguyên nhân để hiển thị danh sách các hạng mục chi tiết gây Over:                                     │
│ [🔘 Tất Cả Over ($26.2k)] [🔴 OVR-01: Line Stop ($13.5k)] [🔴 OVR-02: Sản Lượng ($5.8k)] [🔴 OVR-03: Trễ TF ($3.9k)]│
│ [🔴 OVR-04: Model Mới ($1.8k)] [🔴 OVR-05: Biến Động Giá ($750)] [🔴 OVR-06: Lắp Đặt ($450)]                   │
│ ┌───┬─────────────┬─────────────┬──────────────────────────┬──────────┬──────────┬──────────┬────────────────────┐ │
│ │STT│Mã PR / QCode│Tên Phụ Tùng │Thiết Bị / Chuyền         │Nguồn Gốc │Mã Sự Cố  │Thành Tiền│Lý Do Chi Tiết &    │ │
│ │   │             │             │                          │Over      │& WorkOrder(USD)     │Kế Hoạch Khắc Phục  │ │
│ ├───┼─────────────┼─────────────┼──────────────────────────┼──────────┼──────────┼──────────┼────────────────────┤ │
│ │ 1 │PR-2611-0082 │Board Trumpf │Tape Bonder 01 - Line 201 │MUA MỚI   │OVR-01    │$3,150 USD│Chập tụ nguồn do biến│ │
│ │   │QCAD55421    │400W         │Cụm Heat Stage            │(PO Commit│WO-2489260│(1 EA)    │áp chập chờn ca đêm │ │
│ ├───┼─────────────┼─────────────┼──────────────────────────┼──────────┼──────────┼──────────┼────────────────────┤ │
│ │ 2 │INV-2611-041 │Driver Servo │Die Bonder 02 - Line 201  │XUẤT KHO  │OVR-01    │$2,400 USD│Hỏng encoder do kẹt │ │
│ │   │QCAB99120    │Omron R88D   │Cụm Băng tải cấp phôi     │(ds_Inv)  │WO-2489115│(2 EA)    │băng tải chuyền     │ │
│ ├───┼─────────────┼─────────────┼──────────────────────────┼──────────┼──────────┼──────────┼────────────────────┤ │
│ │ 3 │PR-2611-0086 │Xylanh kẹp   │Polarizer 01 - Line 301   │MUA MỚI   │OVR-04    │$1,820 USD│Thay đồ gá chạy sản │ │
│ │   │QDAD12236    │SMC MHZ2-16D │Cụm Kẹp kính LCD          │(PO Commit│WO-2489991│(4 EA)    │phẩm Smart Watch D2 │ │
│ └───┴─────────────┴─────────────┴──────────────────────────┴──────────┴──────────┴──────────┴────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ PHÂN VÙNG 4: TRA CỨU LỊCH SỬ MUA HÀNG & SO SÁNH TARGET / OVER ĐA THÁNG (MULTI-MONTH PROCUREMENT ANALYTICS)        │
│ ┌────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────┐ │
│ │ 1. TRA CỨU LỊCH SỬ MUA THEO MÃ QCODE / TÊN MÁY:            │ 2. SO SÁNH TARGET MUA GIỮA CÁC THÁNG (TREND):   │ │
│ │ 🔎 Nhập QCode: [ QCAD38190           ] [ 🔍 Tra Cứu ]      │ • Tháng 09/2026: Target: $118k | Over: $18.5k   │ │
│ │ • Lịch sử mua 6 tháng:                                     │ • Tháng 10/2026: Target: $125k | Over: $22.1k   │ │
│ │   - 2026-10-12: PO-99120 (4 EA x $220 USD) - Line 201      │ • Tháng 11/2026: Target: $122k | Over: $26.2k   │ │
│ │   - 2026-08-05: PO-97541 (2 EA x $225 USD) - Line 202      │ • Tháng 12/2026 (Dự kiến): Target: $130k        │ │
│ │ • Đơn giá bình quân: $221.5 USD | NCC chính: SMC Vietnam   │ ↳ Tỷ lệ Target đạt chuẩn bình quân: 83.5%       │ │
│ │ • Chu kỳ thay thực tế: 14,200h (Đạt 94.6% định mức EBOM)   │ ↳ Xu hướng Over tăng +18.5% do chạy Model D2    │ │
│ ├────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────┤ │
│ │ 3. MA TRẬN PHÂN TÍCH BIẾN ĐỘNG NGUYÊN NHÂN OVER QUA CÁC THÁNG (6 MÃ OVR TREND):                              │ │
│ │ ┌────────────┬──────────────────────────────────┬──────────────┬──────────────┬──────────────┬─────────────┐ │ │
│ │ │Mã Sự Cố    │Ý Nghĩa Nguyên Nhân Gốc           │Tháng 09/2026 │Tháng 10/2026 │Tháng 11/2026 │Đánh Giá     │ │ │
│ │ ├────────────┼──────────────────────────────────┼──────────────┼──────────────┼──────────────┼─────────────┤ │ │
│ │ │OVR-01      │Đột xuất dừng chuyền (Line Stop)  │$6,200 (33.5%)│$8,400 (38.0%)│$13,500(51.5%)│🔴 Tăng mạnh │ │ │
│ │ │OVR-02      │Tăng sản lượng đột biến           │$4,100 (22.2%)│$7,200 (32.6%)│$5,800 (22.1%)│🟡 Giảm nhẹ  │ │ │
│ │ │OVR-03      │Chậm trễ chuyển giao kho bạn      │$2,800 (15.1%)│$3,100 (14.0%)│$3,900 (14.9%)│🟡 Ổn định   │ │ │
│ │ │OVR-04      │Setup model mới (NPI)             │$4,500 (24.3%)│$2,400 (10.9%)│$1,800 (6.9%) │🟢 Giảm tốt  │ │ │
│ │ │OVR-05/06   │Biến động giá & Hư hỏng lắp đặt   │$900 (4.9%)   │$1,000 (4.5%) │$1,200 (4.6%) │🟢 Kiểm soát │ │ │
│ │ └────────────┴──────────────────────────────────┴──────────────┴──────────────┴──────────────┴─────────────┘ │ │
│ │ ⚠️ CẢNH BÁO MÃ GÂY OVER LẶP LẠI (CHRONIC OVER): Bo mạch QCAD55421 bị Over 2 tháng liên tiếp do nguồn điện Line201│ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ PHÂN VÙNG 5: XUẤT BÁO CÁO TỔNG HỢP EXCEL 4 SHEET TIÊU CHUẨN (NGÀY 25 HÀNG THÁNG)                                │
│ Báo cáo Form cố định 4 Sheet chuẩn hóa phục vụ họp Ban Giám Đốc và Kiểm Thảo:                                   │
│ [Sheet 1: Ngân Sách SG & Kho] [Sheet 2: Danh Mục Gây Over] [Sheet 3: Mốc Inbound] [Sheet 4: Tồn Kho & Giải Trình]│
│ [ 📥 Tải File Excel 4 Sheet (.xlsx) ]   [ 🖨️ In Báo Cáo Phân Tích ]                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. ĐẶC TẢ TÍNH NĂNG TRUY VẤN DANH MỤC GÂY OVER (OVER DRILLDOWN)

Khi Quản lý Chi phí, Leader hoặc Giám Đốc bấm vào bất kỳ chỉ số Over nào (hoặc nhấn nút bóc tách trên Khối 3), hệ thống kích hoạt bộ lọc trả về dữ liệu đa chiều:

```mermaid
flowchart TD
    OverTotal["TỔNG CHI PHÍ VƯỢT MỨC (OVER TOTAL): $26,200 USD"] --> SplitSource{"Phân Tách Theo Nguồn Gốc?"}
    
    SplitSource -- Mua Sắm Mới (66.4%) --> POMvc["OVER MUA MỚI (PO COMMIT OVER): $17,400 USD\n• Các đơn mua phát sinh đột xuất ngoài danh mục định mức\n• Kèm mã PR, QCode, Đơn giá và Nhà cung cấp"]
    SplitSource -- Xuất Kho Thực Tế (33.6%) --> EMSvc["OVER XUẤT KHO (EMS ds_Inv OVER): $8,800 USD\n• Xuất phụ tùng dự phòng từ kho vượt định mức tháng\n• Do máy hỏng nhiều ca đêm, đồng bộ từ phiếu kho EMS"]

    POMvc --> OVRFilter["BÓC TÁCH THEO 6 MÃ NGUYÊN NHÂN CHUẨN:"]
    EMSvc --> OVRFilter

    OVRFilter --> O1["OVR-01: Line Stop (Dừng máy khẩn) - $13,500 USD (51.5%)"]
    OVRFilter --> O2["OVR-02: Production Surge (Tăng sản lượng) - $5,800 USD (22.1%)"]
    OVRFilter --> O3["OVR-03: Transfer Delay (Chậm liên pháp nhân) - $3,900 USD (14.9%)"]
    OVRFilter --> O4["OVR-04: Model Setup (Cải tạo model mới) - $1,800 USD (6.9%)"]
    OVRFilter --> O5["OVR-05: Price Surge (Tăng giá ngoại tệ) - $750 USD (2.9%)"]
    OVRFilter --> O6["OVR-06: Alignment Error (Hư hỏng lắp đặt) - $450 USD (1.7%)"]
```

---

## 4. MA TRẬN TRƯỜNG DỮ LIỆU HIỂN THỊ DASHBOARD

| Thuộc Tính Hiển Thị | Tên Trường Dữ Liệu | Kiểu Dữ Liệu | Ý Nghĩa Điều Hành |
| :--- | :--- | :---: | :--- |
| **Trần Ngân Sách SG Tháng** | `sgMonthlyCapUsd` | Currency | Ngân sách được duyệt của Team do LEC cấu hình (Không cộng dồn số dư). |
| **Thực Chi PO Cam Kết** | `committedPoTotalUsd`| Currency | Tổng giá trị đơn mua đã phát hành PO chính thức. |
| **Chi Phí Xuất Kho EMS** | `actualIssuedEmsUsd` | Currency | Chi phí vật tư đã phát lên chuyền từ bảng kê `ds_Inv`. |
| **Tổng Chi Phí Over** | `overTotalUsd` | Currency | Tổng số tiền phát sinh ngoài kế hoạch (`$26,200 USD`). |
| **Over Mua Mới** | `overPurchaseUsd` | Currency | Tiền mua phụ tùng mới gây Over (`$17,400 USD`). |
| **Over Xuất Kho** | `overWarehouseIssueUsd`| Currency | Tiền linh kiện xuất kho vượt định mức (`$8,800 USD`). |
| **Mã Sự Cố Over** | `overReasonCode` | Enum | 1 trong 6 mã chuẩn `OVR-01` đến `OVR-06`. |
| **Mã Work Order** | `workOrderNo` | String | Phiếu bảo trì sự cố liên kết để đối soát hiện trường. |
| **Phễu 7 Giai Đoạn** | `stageCounts` | Array[Object]| Số lượng và số tiền ở từng giai đoạn trong 7 bước. |
| **Lịch Sử Đơn Hàng Cũ** | `historicalPurchases`| Array[Object]| Danh sách các PO trong quá khứ theo từng mã QCode (Ngày, Giá, NCC, Số lượng). |
| **Target Giữa Các Tháng** | `monthlyTargetTrends`| Array[Object]| Chuỗi giá trị Target và Over của các tháng $T-2$, $T-1$, $T$, $T+1$. |
| **Cảnh Báo Over Lặp Lại** | `chronicOverFlag` | Boolean | `true` nếu mã phụ tùng bị đánh dấu Over từ 2 tháng liên tiếp trở lên. |
