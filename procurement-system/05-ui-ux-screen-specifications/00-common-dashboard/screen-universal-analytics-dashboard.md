# Màn Hình Chung: Dashboard Kiểm Soát Tiến Độ Tổng Hợp (Universal Progress & Analytics Dashboard)
> **Mã Giao Diện: UI-COMMON-00 — Universal Progress & Operations Analytics Dashboard**  
> *Màn hình điều hành dùng chung cho toàn bộ nhà máy Factory HW (Smart Watch): Team Leader, Part Leader, LEC, Cost Management và Kỹ Sư (với góc nhìn phân quyền dữ liệu tương ứng)*

---

## 1. Mục Đích & Kiến Trúc Phân Vùng Tổng Thể (Dashboard Anatomy)

Dashboard Tiến Độ Tổng Hợp là **bộ chỉ huy dữ liệu thời gian thực (Real-time Operations Intelligence)**, hợp nhất toàn bộ thông tin từ các khâu: Đăng ký nhu cầu, Thẩm định chi phí đầu tháng, Điều phối chuyển giao, Báo giá Purchase, Nhập hàng thủ công, Xuất kho từ EMS và Kế toán ngân sách SG.

Giao diện được cấu trúc thành **5 Khối Phân Tích Trọng Yếu**:
1.  **Khối 1: Tổng Hợp Tiến Độ Mua Hàng & Phễu Chu Kỳ (Procurement Pipeline & Progress Funnel)**:
    *   Theo dõi toàn bộ vòng đời tiến độ: `Đăng ký nhu cầu` $\rightarrow$ `LEC gom & xử lý Interlock` $\rightarrow$ `THẨM ĐỊNH CHI PHÍ ĐẦU THÁNG` $\rightarrow$ `Phê duyệt trên EMS` $\rightarrow$ `Ký PO / Báo giá Purchase` $\rightarrow$ `Nhập hàng về kho HW (Cập nhật thủ công)` $\rightarrow$ `Xuất kho lắp máy (Đồng bộ từ EMS)`.
    *   Các chỉ số đo lường: Thời gian chu kỳ trung bình (Cycle Time: ngày), Tỷ lệ giao hàng đúng hạn (OTD %), và cảnh báo tắc nghẽn.
2.  **Khối 2: Bộ Chỉ Số Tồn Kho & Kiểm Thảo Giải Trình (Inventory KPIs & Aging Audit)**:
    *   Tổng giá trị tồn kho khả dụng tại kho HW.
    *   Cơ cấu tuổi thọ tồn kho (Inventory Aging): `< 30 ngày`, `30 - 60 ngày`, `> 60 ngày (Cảnh báo tồn kho chết)`.
    *   Tỷ lệ hoàn thành **Task Giải Trình Tồn Kho Đầu Tháng** của các Kỹ sư hiện trường.
3.  **Khối 3: Cân Đối Ngân Sách SG 3 Chiều (Budget vs Actual Spend - TUYỆT ĐỐI NO ROLLOVER)**:
    *   So sánh trực quan giữa 3 trục: **Ngân Sách Phân Bổ Tháng (LEC Nhập Thủ Công)** vs **Chi Phí Cam Kết Mua (PO Commit Spend)** vs **Chi Phí Xuất Kho Thực Tế (Issue Expense từ EMS)**.
    *   Khẳng định nguyên tắc: Hạn mức tháng nào khóa sổ tháng đó, không cộng dồn số dư.
4.  **Khối 4: Phân Tích Sâu Nguyên Nhân Over (Over Root Cause Breakdown)**:
    *   Tỷ lệ Trong Target vs Over Ngoài Kế Hoạch (Biểu đồ Doughnut).
    *   Cơ cấu 6 mã lý do Over (`OVR-01: Sự cố`, `OVR-02: Tăng sản lượng`, `OVR-03: Vướng chuyển giao`, `OVR-04: Setup model`, `OVR-05: Biến động giá`, `OVR-06: Thao tác`).
5.  **Khối 5: Danh Sách Chi Tiết Các Hạng Mục Gây Over (Detailed Over Contribution Matrix)**:
    *   **Over do Mua Hàng (PO Spend Over)**: Danh sách cụ thể các mã linh kiện mua mới làm vượt ngân sách cam kết tháng.
    *   **Over do Xuất Kho (Issue Expense Over)**: Danh sách cụ thể các mã linh kiện xuất kho lắp máy vượt định mức tiêu hao (dữ liệu đọc từ EMS).

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  DASHBOARD KIỂM SOÁT TIẾN ĐỘ & PHÂN TÍCH — FACTORY HW (SMART WATCH)    [📅 Tháng 11/2026] [👤 Pham Duc Long (LEC)]      │
│ Ngữ cảnh: Factory HW (Smart Watch) > PO Module Tech Team 2 | Tòa Nhà: H1, H2, H3 | Dây chuyền: Line #201..#210, #601, #604      │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ THANH CÔNG CỤ LỌC ĐA CHIỀU (OMNI-FILTERS):                                                                                       │
│ Kỳ Tháng: [ Tháng 11/2026 ▼ ]  Team: [ PO Module Tech Team 2 ▼ ]  Line: [ Tất Cả (#201..#604) ▼ ]  Phân Loại: [ Tất Cả ▼ ]       │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. TIẾN ĐỘ MUA HÀNG & PHỄU CHU KỲ (PROCUREMENT FUNNEL & PROGRESS PIPELINE):                                                      │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 📥 Đăng Ký (64) ➔ ⚡ Interlock (58) ➔ ⚖️ THẨM ĐỊNH ĐẦU THÁNG (52) ➔ 🛒 Duyệt EMS (48) ➔ 📦 Nhập Hàng (36) ➔ ⚙️ Xuất Lắp (28) │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ • Thời gian chu kỳ trung bình (Avg Cycle Time): 9.4 ngày (Target: <= 12 ngày)   • Tỷ lệ giao hàng đúng hạn (OTD): 92.8%          │
│ • Cảnh báo tắc nghẽn: 🟡 4 đơn chờ Purchase chốt giá (unitPriceFlag = N) | 🔴 2 đơn chuyển giao liên pháp nhân quá hạn 48h      │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. CHỈ SỐ TỒN KHO & GIẢI TRÌNH ĐẦU THÁNG:                        │ 3. CÂN ĐỐI NGÂN SÁCH SG (TUYỆT ĐỐI KHÔNG ROLLOVER):           │
│ • Tổng Giá Trị Tồn Kho Khả Dụng HW: $286,400 USD (Kho H1, H2, H3)│ • Hạn Mức Mua Tháng 11 (LEC Nhập Mới):     $150,000 USD       │
│ • Cơ Cấu Tuổi Thọ Tồn Kho (Aging Distribution):                  │ • Chi Phí Cam Kết Mua (PO Commit):        $148,200 USD (98.8%)│
│   ┌────────────────────────┬──────────────────────┬────────────┐ │   [██████████████████████████████████████░] Trong trần tháng  │
│   │ < 30 Ngày (Lưu động tốt│ 30 - 60 Ngày (Cần theo│ > 60 Ngày  │ │ • Chi Phí Xuất Kho Thực Tế (Từ EMS):      $118,450 USD         │
│   │ $214,000 USD (74.7%)   │ $54,200 USD (18.9%)  │ $18,200 USD│ │   (Đọc tự động từ dữ liệu xuất kho EMS, tính vào chi phí máy) │
│   └────────────────────────┴──────────────────────┴────────────┘ │ • Tình Trạng Ngân Sách:                                        │
│ • Tiến Độ Kỹ Sư Giải Trình Tồn Kho Đầu Tháng: 14/16 Task (87.5%) │   🟢 Trong Target: $122,000 USD | 🔴 Phát Sinh Over: $26,200 USD│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. PHÂN TÍCH SÂU NGUYÊN NHÂN OVER (TỔNG TIỀN OVER: $26,200 USD):                                                                 │
│ ┌────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────┐ │
│ │ CƠ CẤU 6 MÃ NGUYÊN NHÂN OVER (PIE / BAR BREAKDOWN):        │ PHÂN TÁCH NGUỒN PHÁT SINH OVER (MUA HÀNG VS XUẤT KHO):          │ │
│ │ • OVR-01 (Sự cố máy hỏng đột xuất / Breakdown):  $13,500   │ • Over do MUA HÀNG (PO Commit Over):  $17,400 USD (66.4%)       │ │
│ │ • OVR-02 (Tăng sản lượng Smart Watch đột biến):   $5,800   │   ↳ Linh kiện mua mới ngoài kế hoạch do sự cố máy trên line     │ │
│ │ • OVR-03 (Pháp nhân khác chậm/vướng chuyển giao): $3,900   │ • Over do XUẤT KHO (Issue Exp Over):   $8,800 USD (33.6%)       │ │
│ │ • OVR-04 (Setup Model mới D111 -> D222):          $1,800   │   ↳ Xuất thay thế vượt định mức tiêu hao của máy (từ EMS)        │ │
│ │ • OVR-05 (Biến động đơn giá nhà cung cấp):          $750   │                                                                 │ │
│ │ • OVR-06 (Hư hại trong thao tác lắp đặt):           $450   │                                                                 │ │
│ └────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. MA TRẬN CHI TIẾT CÁC HẠNG MỤC GÂY OVER (DETAILED OVER CONTRIBUTION LIST):                                                     │
│ [🔘 Tất Cả Hạng Mục Over (11)]  [🛒 Chỉ Hiện Over Do Mua Hàng (7)]  [⚙️ Chỉ Hiện Over Do Xuất Kho (4)]  [📥 Xuất Báo Cáo Excel]     │
│ ┌──┬────────────┬─────────────────────────────┬───────────┬──────────────┬─────────────┬──────────┬──────────┬────────┬────────────┐ │
│ │ST│ Mã QCode   │ Tên Phụ Tùng Chi Tiết       │ Vị Trí    │ Vị Trí Máy   │ Số Lượng &  │ Thành    │ Nguồn    │ Mã Lý  │ Mã Lệnh    │ │
│ │T │ / Mã Tạm   │                             │ & Line    │ (EM No 14 Ký)│ Đơn Giá Dự K│ Tiền Over│ Phát Sinh│ Do Over│ Work Order │ │
│ ├──┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────┼──────────┼────────┼────────────┤ │
│ │1 │ QDAD12236  │ Board Nguồn CPX V4 Trumpf   │ Line #201 │ HWBMTL21EC010│ 1 EA @$3,150│ $3,150.00│ 🛒 Mua H │ OVR-01 │WO-248926091│ │
│ │  │            │ ↳ Chi tiết: Cháy tụ C14 do xung sét ca đêm máy DB-01, bắt buộc mua khẩn cấp thay thế                    [👁️ Xem WO] │ │
│ ├──┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────┼──────────┼────────┼────────────┤ │
│ │2 │ QCAD38190  │ Xylanh trượt kép MXQ16 SMC  │ Line #202 │ HWBMTL22EC010│ 4 EA @$220  │   $880.00│ ⚙️ Xuất K│ OVR-01 │WO-248926094│ │
│ │  │            │ ↳ Chi tiết: Đầu gắp TAB-02 kẹt hành trình gãy pít-tông, xuất kho vượt định mức tháng 2 chiếc           [👁️ Xem WO] │ │
│ └──┴────────────┴─────────────────────────────┴───────────┴──────────────┴─────────────┴──────────┴──────────────┴──────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
