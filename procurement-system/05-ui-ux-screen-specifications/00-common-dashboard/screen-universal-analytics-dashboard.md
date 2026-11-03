# Màn Hình Chung: Dashboard Báo Cáo & Phân Tích Tổng Hợp (Universal Analytics & Executive Reporting Dashboard)
> **Mã Giao Diện: UI-COMMON-00 — Universal Analytics & Executive Operations Dashboard**  
> *Màn hình điều hành dùng chung cho toàn bộ nhà máy Factory HW (Smart Watch): Ban Giám Đốc, Team Leader, Part Leader, Process Leader, LEC và Kỹ Sư (với góc nhìn phân quyền dữ liệu tương ứng)*

---

## 1. Mục Đích & Kiến Trúc Phân Vùng Tổng Thể (Dashboard Anatomy)

Dashboard Báo Cáo Tổng Hợp là **bộ chỉ huy dữ liệu thời gian thực (Real-time Operations Intelligence)**, hợp nhất toàn bộ thông tin từ các khâu: Đăng ký nhu cầu, Thẩm định phê duyệt, Điều phối chuyển giao, Báo giá Purchase, Nhập - Xuất kho và Kế toán chi phí SG.

Giao diện được cấu trúc thành **5 Khối Phân Tích Trọng Yếu**:
1.  **Khối 1: Tổng Hợp Tiến Độ Mua Hàng & Phễu Chu Kỳ (Procurement Pipeline & Progress Funnel)**:
    *   Theo dõi toàn bộ vòng đời phụ tùng: `Đăng ký` $\rightarrow$ `Leader thẩm tra` $\rightarrow$ `THẨM ĐỊNH PHÊ DUYỆT` $\rightarrow$ `Kích hoạt Chuyển giao / Mua mới` $\rightarrow$ `Báo giá Purchase` $\rightarrow$ `PO EMS` $\rightarrow$ `Hàng về kho HW` $\rightarrow$ `Xuất máy`.
    *   Các chỉ số đo lường: Thời gian chu kỳ trung bình (Cycle Time: ngày), Tỷ lệ nhà cung cấp giao hàng đúng hạn (On-Time Delivery - OTD %), và số lượng đơn đang tắc nghẽn theo từng bước.
2.  **Khối 2: Bộ Chỉ Số Hiệu Suất Tồn Kho & Giải Trình (Inventory KPIs & Aging Audit)**:
    *   Tổng giá trị tồn kho khả dụng tại kho HW.
    *   Cơ cấu tuổi thọ tồn kho (Inventory Aging): `< 30 ngày`, `30 - 60 ngày`, `> 60 ngày (Cảnh báo tồn kho chết)`.
    *   Tỷ lệ hoàn thành **Task Giải Trình Tồn Kho Không Sử Dụng** của các Kỹ sư công đoạn.
3.  **Khối 3: Cân Đối Ngân Sách SG 3 Chiều (Budget vs Actual Spend)**:
    *   So sánh trực quan giữa 3 trục: **Ngân Sách Phân Bổ (Allocated SG 33-33-34)** vs **Chi Phí Cam Kết Mua (PO Commit Spend)** vs **Chi Phí Xuất Kho Thực Tế (Issue Expense)**.
    *   Theo dõi hạn mức dồn số dư Rollover từ tháng trước.
4.  **Khối 4: Phân Tích Sâu Nguyên Nhân Over (Over Root Cause Breakdown)**:
    *   Tỷ lệ Trong Target vs Over Ngoài Kế Hoạch (Biểu đồ Doughnut).
    *   Cơ cấu 6 mã lý do Over (`OVR-01: Sự cố`, `OVR-02: Tăng sản lượng`, `OVR-03: Vướng chuyển giao`, `OVR-04: Setup model`, `OVR-05: Biến động giá`, `OVR-06: Thao tác`).
5.  **Khối 5: Danh Sách Chi Tiết Các Hạng Mục Gây Over (Detailed Over Contribution Matrix)**:
    *   **Over do Mua Hàng (PO Spend Over)**: Danh sách cụ thể các mã linh kiện mua mới làm vượt ngân sách cam kết tháng.
    *   **Over do Xuất Kho (Issue Expense Over)**: Danh sách cụ thể các mã linh kiện xuất kho lắp máy vượt định mức tiêu hao kế hoạch của từng công đoạn/dây chuyền.

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  DASHBOARD ĐIỀU HÀNH & PHÂN TÍCH TỔNG HỢP — FACTORY HW (SMART WATCH)   [📅 Tháng 11/2026] [👤 Pham Duc Long (LEC/Admin)]│
│ Ngữ cảnh: Factory HW (Smart Watch) > PO Module Tech Team 2 | Tòa Nhà: H1, H2, H3 | Dây chuyền: Line #201..#210, #601, #604      │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ THANH CÔNG CỤ LỌC ĐA CHIỀU (OMNI-FILTERS):                                                                                       │
│ Kỳ Tháng: [ Tháng 11/2026 ▼ ]  Công Đoạn: [ Tất Cả Process (POL..BD) ▼ ]  Line: [ Tất Cả (#201..#604) ▼ ]  Phân Loại: [ Tất Cả ▼ ]│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. TIẾN ĐỘ MUA HÀNG & PHỄU CHU KỲ (PROCUREMENT FUNNEL & PIPELINE):                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 📥 Đăng Ký (64) ➔ 🔍 Leader Duyệt (58) ➔ ⚖️ ĐÃ THẨM ĐỊNH (52) ➔ 🔄 Chuyển Giao (8) / 🛒 Mua EMS (44) ➔ 📦 Về Kho (36) ➔ ⚙️ Lắp (28) │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ • Thời gian chu kỳ trung bình (Avg Cycle Time): 9.4 ngày (Target: <= 12 ngày)   • Tỷ lệ giao hàng đúng hạn (OTD): 92.8%          │
│ • Cảnh báo tắc nghẽn (Bottleneck Alerts): 🟡 6 đơn chờ Purchase chốt giá (> 5 ngày) | 🔴 2 đơn chuyển giao quá hạn SLA 48h       │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. CHỈ SỐ TỒN KHO & GIẢI TRÌNH (INVENTORY & TASK AUDIT):         │ 3. CÂN ĐỐI NGÂN SÁCH SG (BUDGET 33-33-34):                    │
│ • Tổng Giá Trị Tồn Kho Khả Dụng HW: $286,400 USD (Kho H1, H2, H3)│ • Hạn Mức Mua Tháng 11 (33% Quý + Dồn M1): $152,700 USD       │
│ • Cơ Cấu Tuổi Thọ Tồn Kho (Aging Distribution):                  │ • Chi Phí Cam Kết Mua (PO Commit):        $152,700 USD (100%) │
│   ┌────────────────────────┬──────────────────────┬────────────┐ │   [████████████████████████████████████████] Đạt trần ngân sách│
│   │ < 30 Ngày (Lưu động tốt│ 30 - 60 Ngày (Cần theo│ > 60 Ngày  │ │ • Chi Phí Xuất Kho Thực Tế (Issue Exp):  $118,450 USD         │
│   │ $214,000 USD (74.7%)   │ $54,200 USD (18.9%)  │ $18,200 USD│ │   (Chính thức ghi nhận vào giá thành máy khi kỹ sư xuất linh k)│
│   └────────────────────────┴──────────────────────┴────────────┘ │ • Tình Trạng Ngân Sách:                                        │
│ • Tiến Độ Kỹ Sư Giải Trình Tồn Kho Chưa Dùng: 14/16 Task (87.5%) │   🟢 Trong Target: $124,500 USD | 🔴 Phát Sinh Over: $28,200 USD│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. PHÂN TÍCH SÂU NGUYÊN NHÂN OVER (OVER ROOT CAUSE BREAKDOWN — TỔNG TIỀN OVER: $28,200 USD):                                     │
│ ┌────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────┐ │
│ │ CƠ CẤU 6 MÃ NGUYÊN NHÂN OVER (PIE / BAR BREAKDOWN):        │ PHÂN TÁCH NGUỒN PHÁT SINH OVER (COMMIT VS ISSUE):               │ │
│ │ • OVR-01 (Sự cố máy hỏng đột xuất / Breakdown):  $14,500 (51.4%)│ • Over do MUA HÀNG (PO Commit Over):  $18,400 USD (65.2%)       │ │
│ │ • OVR-02 (Tăng sản lượng Smart Watch đột biến):   $6,200 (22.0%)│   ↳ Linh kiện mua mới ngoài kế hoạch đầu tháng do sự cố ca đêm  │ │
│ │ • OVR-03 (Pháp nhân khác chậm/vướng chuyển giao): $4,100 (14.5%)│ • Over do XUẤT KHO (Issue Exp Over): $9,800 USD (34.8%)        │ │
│ │ • OVR-04 (Setup Model mới D111 -> D222):          $2,100  (7.5%)│   ↳ Xuất thay thế vượt định mức tiêu hao BOM của máy trên line  │ │
│ │ • OVR-05 (Biến động đơn giá nhà cung cấp):          $800  (2.8%)│   ↳ Kỹ sư giải trình nguyên nhân qua mã Work Order bảo trì máy  │ │
│ │ • OVR-06 (Hư hại trong thao tác lắp đặt):           $500  (1.8%)│                                                                 │ │
│ └────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. MA TRẬN CHI TIẾT CÁC HẠNG MỤC GÂY OVER (DETAILED OVER CONTRIBUTION LIST):                                                     │
│ [🔘 Tất Cả Hạng Mục Over (12)]  [🛒 Chỉ Hiện Over Do Mua Hàng (8)]  [⚙️ Chỉ Hiện Over Do Xuất Kho (4)]  [📥 Xuất Báo Cáo Excel]     │
│ ┌──┬────────────┬─────────────────────────────┬───────────┬──────────────┬─────────────┬──────────┬──────────┬────────┬────────────┐ │
│ │ST│ Mã QCode   │ Tên Phụ Tùng Chi Tiết       │ Công Đoạn │ Vị Trí Máy   │ Số Lượng &  │ Thành    │ Nguồn    │ Mã Lý  │ Mã Lệnh    │ │
│ │T │ / Mã Tạm   │                             │ & Line    │ (EM No 14 Ký)│ Đơn Giá Dự K│ Tiền Over│ Phát Sinh│ Do Over│ Work Order │ │
│ ├──┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────┼──────────┼────────┼────────────┤ │
│ │1 │ QDAD12236  │ Board Nguồn CPX V4 Trumpf   │ DB / #201 │ HWBMTL21EC010│ 1 EA @$3,150│ $3,150.00│ 🛒 Mua H │ OVR-01 │WO-248926091│ │
│ │  │            │ ↳ Chi tiết: Cháy tụ C14 do xung sét ca đêm máy DB-01, bắt buộc mua khẩn cấp thay thế                    [👁️ Xem WO] │ │
│ ├──┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────┼──────────┼────────┼────────────┤ │
│ │2 │ QCAD38190  │ Xylanh trượt kép MXQ16 SMC  │ TAB/ #202 │ HWBMTL22EC010│ 4 EA @$220  │   $880.00│ ⚙️ Xuất K│ OVR-01 │WO-248926094│ │
│ │  │            │ ↳ Chi tiết: Đầu gắp TAB-02 kẹt hành trình gãy pít-tông, xuất kho vượt định mức tháng 2 chiếc           [👁️ Xem WO] │ │
│ ├──┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────┼──────────┼────────┼────────────┤ │
│ │3 │ TMP-HW-0104│ Cáp Encoder động cơ Yaskawa │ DB / #201 │ HWBMTL21EC020│ 2 EA @$145  │   $290.00│ 🛒 Mua H │ OVR-03 │WO-248926102│ │
│ │  │            │ ↳ Chi tiết: LGD China vướng thủ tục xuất khẩu liên quốc gia không chuyển giao kịp                       [👁️ Xem WO] │ │
│ └──┴────────────┴─────────────────────────────┴───────────┴──────────────┴─────────────┴──────────┴──────────┴────────┴────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Cửa Sổ Modal Drill-Down: Xem Chi Tiết Hạng Mục Gây Over

Khi người dùng bấm **`[👁️ Xem WO]`** tại dòng số 1 (Mã `QDAD12236`):

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔍 PHÂN TÍCH NGUYÊN NHÂN HẠNG MỤC GÂY OVER CHI PHÍ — QDAD12236                                             │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ THÔNG TIN HẠNG MỤC:                                                                                        │
│ • Mã Phụ Tùng:    QDAD12236 (Board Nguồn CPX V4 Trumpf Controls) — Maker: TRUMPF (Germany)                 │
│ • Vị Trí Máy Lắp: HWBMTL21EC0101 (Factory HW > Tầng 2F > Line #201 > Machine EC > Unit 01 > Assy 01)       │
│ • Công Đoạn Chịu Phí: Process DB (Die Bonding) | Phòng ban: PO Module Technology Team 2                    │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ BẢN CHẤT PHÁT SINH OVER:                                                                                   │
│ • Loại Hình Over:       🔴 OVER DO MUA HÀNG (PO Commit Over-Budget)                                         │
│ • Số Tiền Gây Vượt:     $3,150.00 USD (Số lượng: 1 EA)                                                     │
│ • Mã Nguyên Nhân:       OVR-01: Sự Cố Máy Hỏng Bất Thường (Machine Breakdown)                              │
│ • Căn Cứ Thẩm Tra:      Mã Lệnh Máy: WO-248926091 (Alarm E-502: MAIN_POWER_SUPPLY_FAILURE)                 │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ BẰNG CHỨNG HIỆN TRƯỜNG & GIẢI TRÌNH:                                                                       │
│ • Kỹ sư báo cáo:        Nguyen Van A (Ca đêm 02/11/2026)                                                   │
│ • Trưởng ca xác nhận:   Tran Van B (Process Leader DB - Đã thẩm tra hiện trường nổ tụ điện C14)           │
│ • Đính kèm hình ảnh:    [ 🖼️ board_chay_01.jpg ]  [ 📋 error_log_E502.pdf ]  [ 📐 fdm_drawing.dwg ]         │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TÌNH TRẠNG KIỂM THẢO & THẨM ĐỊNH:                                                                          │
│ • Tình Trạng Thẩm Định:  ✅ ĐÃ THẨM ĐỊNH PHÊ DUYỆT (Hội đồng thẩm định ngày 25 thông qua)                   │
│ • Trạng Thái Kích Hoạt:  🛒 Đã chuyển sang phát hành PO trên hệ thống EMS (Mã PRV: PRV-28753-202611-0082)  │
│                                                                                                            │
│                                                                                [↩️ ĐÓNG CỬA SỔ PHÂN TÍCH] │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Bảng Đặc Tả Dữ Liệu Các Chỉ Số Dashboard (Metrics Specification Matrix)

| Chỉ số / Trường hiển thị | Loại dữ liệu | Công thức / Nguồn tính toán | Ý nghĩa điều hành |
| :--- | :---: | :--- | :--- |
| **`procurement_pipeline_funnel`** | Stage Counts | Đếm số lượng đơn tại từng trạng thái: `DRAFT` $\rightarrow$ `REVIEW` $\rightarrow$ `AUDITED` $\rightarrow$ `TRANSFER/PO` $\rightarrow$ `RECEIVED` $\rightarrow$ `ISSUED`. | Giám sát toàn cảnh dòng chảy vật tư, phát hiện tức thì điểm nghẽn. |
| **`avg_cycle_time_days`** | Float (Ngày) | $\text{Avg}(\text{Received\_Date} - \text{Created\_Date})$. | Đánh giá năng lực đáp ứng của chuỗi cung ứng nội bộ và Purchase. |
| **`on_time_delivery_rate`** | Percentage (%) | $\frac{\text{Số đơn giao đúng hạn ETA}}{\text{Tổng số đơn PO đã giao}} \times 100\%$. | Đánh giá hiệu suất thực hiện hợp đồng của các nhà cung cấp ngoài. |
| **`aging_stock_summary`** | Currency (USD) | Tính tổng giá trị tồn kho theo 3 dải ngày nhập: $<30\text{d}$, $30-60\text{d}$, $>60\text{d}$. | Kiểm soát rủi ro tồn kho chết và tối ưu hóa vốn lưu động. |
| **`unused_stock_task_rate`**| Percentage (%) | $\frac{\text{Số Task giải trình kỹ sư đã nộp}}{\text{Tổng số Task giải trình đã phát hành}} \times 100\%$. | Đo lường kỷ luật báo cáo của các kỹ sư công đoạn đối với linh kiện lưu kho lâu ngày. |
| **`po_commit_over_total`** | Currency (USD) | $\sum (\text{Giá trị các đơn mua ngoài kế hoạch OVR-01..06})$. | Báo cáo chính xác phần ngân sách mua vượt trần kế hoạch. |
| **`issue_expense_over_total`**| Currency (USD) | $\sum (\text{Giá trị phụ tùng xuất kho vượt định mức BOM chuẩn})$. | Phản ánh chi phí sửa chữa máy đột xuất làm đội giá thành sản phẩm Smart Watch. |
| **`over_item_contribution`** | Array of Objects | Trả về danh sách chi tiết từng dòng phụ tùng gây Over kèm mã máy, WO, và phân loại nguồn phát sinh. | Minh bạch hóa 100% trách nhiệm chi phí cho Ban Giám Đốc và Quản đốc xưởng. |

