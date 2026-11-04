# 01. MÀN HÌNH THÔNG TIN TỔNG QUAN VẬN HÀNH & PHÂN TÍCH TOÀN XƯỞNG

> **Mã màn hình**: `UI-INFO-00`  
> **Tên màn hình**: Universal Operations & Procurement Analytics Information Dashboard  
> **Phạm vi hiển thị (Visibility Scope)**: Toàn xưởng (Factory HW - Smart Watch 1), tự động điều chỉnh ngữ cảnh theo vai trò đăng nhập.  
> **Mục tiêu**: Cung cấp bức tranh toàn cảnh thời gian thực về tiến độ mua sắm, đối soát 3 trục ngân sách SG (không lũy kế), phân tích 6 mã Over, và kết xuất file Excel 4 sheet tiêu chuẩn.

---

## 1. CẤU TRÚC BỐ CỤC KHÔNG GIAN THÔNG TIN (LAYOUT ANATOMY)

Màn hình được phân bổ theo lưới thông tin 5 khối liên hoàn:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER THÔNG TIN: Factory HW (Smart Watch) | Kỳ: 2026-11 | Cổng EMS Gateway: Online (5 req/s)          │
│ Thanh Công Cụ Lọc Đa Chiều (Omni-Filter): [Kỳ Tháng ▼] [Team ▼] [Chuyền ▼] [Phân Loại Target/Over ▼]   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ KHỐI 1: ĐỐI SOÁT NGÂN SÁCH SG 3 TRỤC (STRICT NO-ROLLOVER POLICY)                                       │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬───────────────────────────────┐ │
│ │ 1. Trần Ngân Sách SG │ 2. Thực Chi Cam Kết  │ 3. Chi Phí Xuất Kho  │ 4. Chi Phí Vượt Mức (Over)    │ │
│ │    $150,000 USD      │    $148,200 USD      │    $118,450 USD      │    $26,200 USD (17.7%)        │ │
│ │ • LEC nhập đầu tháng │ • 98.8% trần ngân    │ • Đồng bộ từ ds_Inv  │ • 6 mã OVR-01..06             │ │
│ │ • Carryover = $0     │   sách cam kết       │   (Xuất vào máy)     │ • Cần giải trình mã WO        │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴───────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ KHỐI 2: PHỄU TIẾN ĐỘ MUA SẮM 7 GIAI ĐOẠN TƯƠNG TÁC (CLICKABLE PIPELINE)                                │
│ [ 1.Chuẩn bị QCode ] ➔ [ 2.Quét Interlock ] ➔ [ 3.Chờ Báo Giá ] ➔ [ 4.Ký Duyệt EMS ]                   │
│   (Folder CAD/Catalog)   (Tồn kho & Đơn giá)     (UP004 RFQ)          (PRV & PO EMS)                   │
│ ➔ [ 5.NCC Xác Nhận ] ➔ [ 6.Hàng Về Kho HW ] ➔ [ 7.Xuất Lắp Máy ]                                       │
│   (Vendor Confirm)       (Mốc ETA đến cảng)      (Ghi nhận chi phí)                                    │
│ • Bình quân chu kỳ: 9.4 Ngày • Tỷ lệ giao hàng đúng hạn (OTD): 92.8% • Nhấn vào từng bước để lọc bảng │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ KHỐI 3: PHÂN TÍCH 6 MÃ NGUYÊN NHÂN OVER (LEADER & LEC ĐỐI CHIẾU WORK ORDER)                           │
│ ┌────────────────────────────────────────────────────────────┬───────────────────────────────────────┐ │
│ │ Phân Bổ 6 Mã Over (Nhấn mã để lọc bảng chi tiết):          │ Phân Tách Nguồn Chi Phí Over:         │ │
│ │ • OVR-01: Đột xuất hỏng hóc dừng chuyền (Line Stop) $13,500│ • Over Mua Sắm Mới (PO Commit Over):  │ │
│ │ • OVR-02: Tăng sản lượng đột biến (Surge)           $5,800 │   $17,400 USD (66.4%)                 │ │
│ │ • OVR-03: Chậm chuyển giao liên pháp nhân           $3,900 │ • Over Xuất Kho Dây Chuyền (EMS):     │ │
│ │ • OVR-04: Setup model mới (D111 -> D222)            $1,800 │   $8,800 USD (33.6%)                  │ │
│ │ • OVR-05: Biến động giá / Tỷ giá ngoại tệ NCC         $750 │                                       │ │
│ │ • OVR-06: Hư hỏng trong căn chỉnh/lắp đặt             $450 │                                       │ │
│ └────────────────────────────────────────────────────────────┴───────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ KHỐI 4: BẢNG THÔNG TIN CHI TIẾT DANH MỤC MUA SẮM & TRẠNG THÁI                                          │
│ Bộ lọc nhanh: [ Tất Cả (64) ] [ Trong Kế Hoạch - TARGET (52) ] [ Ngoài Kế Hoạch - OVER (12) ]          │
│ ┌───┬─────────────┬─────────────┬──────────────────┬──────────┬───────────┬──────────┬───────────────┐ │
│ │STT│Mã PR / QCode│Tên Phụ Tùng │Thiết Bị & Chuyền │Phân Loại │Mã WO Sự Cố│Thành Tiền│Trạng Thái     │ │
│ ├───┼─────────────┼─────────────┼──────────────────┼──────────┼───────────┼──────────┼───────────────┤ │
│ │ 1 │PR-2611-0081 │Cảm biến quangDie Bonder 01 (201)│TARGET    │-          │$450 USD  │PURCHASABLE    │ │
│ │ 2 │PR-2611-0082 │Board nguồn  │Die Bonder 01 (201)│OVER(OVR01│WO-24892601│$3,150 USD│EMS_APPROVED   │ │
│ │ 3 │PR-2611-0083 │Xylanh 2 ty  │Tape Bonder 02    │OVER(OVR03│WO-24892605│$880 USD  │CROSS_TEAM_STK │ │
│ └───┴─────────────┴─────────────┴──────────────────┴──────────┴───────────┴──────────┴───────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ KHỐI 5: HỘP THOẠI XUẤT BÁO CÁO TỔNG HỢP EXCEL 4 SHEET TIÊU CHUẨN                                       │
│ [Sheet 1: KPI Dashboard] [Sheet 2: Target Requisitions] [Sheet 3: Over Items] [Sheet 4: Aging Stock]   │
│ Nút Hành Động: [Tải File Excel UTF-8 CSV] (Khớp 100% mẫu quy định phục vụ họp Ban Giám Đốc)            │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ĐẶC TẢ CHI TIẾT TỪNG KHỐI THÔNG TIN

### 2.1. Khối 1: Bảng Đối Soát Ngân Sách SG 3 Trục (Three-Axis Budget Panel)
Khối này đóng vai trò chốt chặn tài chính, hiện thực hóa **Nguyên tắc vàng #10**:
* **Hạn mức Ngân sách SG Tháng ($B_{\text{alloc}}$)**:
  * Nguồn dữ liệu: LEC nhập thủ công đầu tháng sau khi nhận hạn mức từ Cost Management.
  * Trạng thái kiểm soát: Cố định cho chu kỳ tháng; số dư không dùng hết bị hủy vào cuối tháng (**Carryover Surplus = $0**).
* **Thực chi PO Cam kết ($S_{\text{PO}}$)**:
  * Nguồn dữ liệu: Tổng giá trị các PRV/PO đã phát hành trên hệ thống (tổng hợp từ trạng thái `PURCHASABLE`, `EMS_APPROVED`, `INBOUND_TRACKING`, `ISSUED`).
  * Thanh tiến độ (Progress bar): Màu xanh dương nếu $\le 100\%$, đổi sang màu đỏ nếu $> 100\%$.
* **Chi phí Xuất kho Thực tế ($E_{\text{EMS}}$)**:
  * Nguồn dữ liệu: Tự động đồng bộ từ bảng kê xuất kho `ds_Inv` của hệ thống EMS Nexacro khi thủ kho phát vật tư lên chuyền sản xuất.
  * Ý nghĩa: Chi phí thực tế được tính vào giá thành sản phẩm của xưởng Smart Watch trong tháng.
* **Chi phí Ngoài Kế Hoạch ($O_{\text{unplanned}}$)**:
  * Nguồn dữ liệu: Tổng giá trị các hạng mục được LEC đánh dấu thủ công là `OVER`.
  * Chỉ số cảnh báo: Tỷ lệ % Over trên tổng chi phí cam kết. Bắt buộc có mã nguyên nhân `OVR-01..06` và mã Work Order đối chiếu.

### 2.2. Khối 2: Phễu Tiến Độ Mua Sắm 7 Giai Đoạn Tương Tác
Phễu trực quan hóa toàn bộ vòng đời của linh kiện:
1. **Giai đoạn 1: Chuẩn bị QCode & Folder CAD**: Đang ở dạng mã tạm `TMP-HW-xxxx` hoặc bản nháp, chờ LEC đăng ký ERP ngoài.
2. **Giai đoạn 2: Quét & Phân tích Interlock**: Kiểm tra trùng lặp PRV, rà quét cờ tồn kho liên team (`agingInterlockFlag`), và kiểm tra đơn giá hợp đồng (`unitPriceFlag`).
3. **Giai đoạn 3: Chờ Báo Giá RFQ**: Các linh kiện chưa có đơn giá hợp đồng (`unitPriceFlag = 'N'`), theo dõi tiến độ báo giá thương mại từ bộ phận Mua hàng.
4. **Giai đoạn 4: Ký Duyệt Trên EMS**: Hồ sơ đã sẵn sàng, mã PRV/PO được tạo và ký duyệt trên hệ thống Nexacro EMS.
5. **Giai đoạn 5: NCC Xác Nhận Giao Hàng**: Theo dõi mốc cam kết của nhà cung cấp (`vendorConfirmDate`).
6. **Giai đoạn 6: Hàng Về Cảng / Kho HW**: Theo dõi mốc dự kiến hàng đến (`etaDate`).
7. **Giai đoạn 7: Xuất Lắp Đặt Vào Máy**: Linh kiện được thủ kho phát lên chuyền, gắn với mã WO bảo dưỡng hoặc khắc phục sự cố, ghi nhận chi phí vào `ds_Inv`.

> [!TIP]
> **Tính năng Tương Tác Lọc Dữ Liệu**: Khi người dùng nhấn vào bất kỳ giai đoạn nào trên phễu, Bảng Danh mục Mua sắm ở Khối 4 sẽ tự động kích hoạt bộ lọc tương ứng để hiển thị đúng các mã đang ở giai đoạn đó.

### 2.3. Khối 3: Phân Tích 6 Mã Nguyên Nhân Over & Nguồn Chi Phí
Trình bày chi tiết lý do phát sinh chi phí ngoài kế hoạch:
* **Bảng 6 Mã Over Chuẩn**:
  * `OVR-01`: Đột xuất hỏng hóc dừng chuyền (Line Stop) — Bắt buộc mã WO sự cố.
  * `OVR-02`: Tăng sản lượng đột biến (Production Surge) — Kế hoạch mở rộng công suất.
  * `OVR-03`: Chậm trễ chuyển giao liên pháp nhân — Trễ hạn hàng transfer.
  * `OVR-04`: Setup model mới (e.g. D111 $\rightarrow$ D222) — Cải tạo đồ gá NPI.
  * `OVR-05`: Biến động giá / Tỷ giá ngoại tệ NCC — Đàm phán thương mại tăng giá.
  * `OVR-06`: Hư hỏng trong căn chỉnh/lắp đặt — Biên bản bất thường kỹ thuật.
* **Tách Bạch Nguồn Over**:
  * **Over do Mua sắm (PO Commit Over)**: Tiền mua linh kiện mới chưa có trong kế hoạch đầu tháng.
  * **Over do Xuất kho (EMS Issue Over)**: Tiền linh kiện đã có sẵn trong kho nhưng bị xuất vượt định mức định kỳ do sự cố máy phát sinh nhiều.

### 2.4. Khối 4: Bảng Thông Tin Chi Tiết Danh Mục Mua Sắm
Bảng dữ liệu trung tâm hiển thị toàn bộ hồ sơ với đầy đủ các trường:
* **Mã PR & Mã QCode**: Hiển thị rõ mã PR hệ thống, mã QCode (nếu là mã tạm thì gắn nhãn màu vàng `MÃ TẠM`).
* **Tên Phụ Tùng & Hãng SX**: Tên tiếng Việt và tiếng Anh, Maker, Model/Part Number.
* **Tên Máy Thân Thiện & Mã EM 14 Ký Tự**: Tên máy dễ nhớ (e.g. `Die Bonder 01 - DB-01`) kèm mã EM đầy đủ (`HWBMTL21EC0101`).
* **Phân Loại Kế Hoạch**: Nhãn `TARGET` (màu xanh lá) hoặc `OVER` (màu đỏ kèm mã OVR).
* **Mã Work Order**: Mã phiếu sự cố liên kết từ hệ thống bảo trì (e.g. `WO-248926091`).
* **Số Lượng, Đơn Giá & Thành Tiền**: Tính toán tự động theo thời gian thực.
* **Trạng Thái Vận Hành**: Badge trạng thái chuẩn (`DRAFT`, `INTERLOCK_CHECK`, `CROSS_TEAM_STOCK`, `PURCHASABLE`, `EMS_APPROVED`, `INBOUND_TRACKING`, `ISSUED`, `EOL`).

### 2.5. Khối 5: Hộp Thoại Báo Cáo Tổng Hợp Excel 4 Sheet Chuẩn
Hỗ trợ xem trước và tải xuống đúng 4 sheet cố định:
* **Sheet 1: `KPI_Summary`**: Bảng cân đối ngân sách SG, tỷ lệ chi tiêu, tỷ lệ hoàn thành giải trình tồn kho.
* **Sheet 2: `Target_Requisitions`**: Toàn bộ các mã trong định mức đã duyệt.
* **Sheet 3: `Over_Requisitions`**: Toàn bộ các mã Over kèm mã Work Order và mã nguyên nhân `OVR-01..06`.
* **Sheet 4: `Aging_Stock_Justifications`**: Danh sách linh kiện tồn kho lâu ngày kèm lý do giải trình và cam kết ngày sử dụng hết của kỹ sư hiện trường.

---

## 3. TỪ ĐIỂN TRƯỜNG DỮ LIỆU HIỂN THỊ (DATA FIELD DICTIONARY)

| Tên Trường Hiển Thị | Mã Trường Dữ Liệu | Kiểu Dữ Liệu | Nguồn Cung Cấp | Định Dạng Hiển Thị & Quy Tắc Giao Diện |
| :--- | :--- | :---: | :---: | :--- |
| **Mã Đơn Yêu Cầu** | `id` | String | Ops-Workflow sinh | Chữ in hoa font Mono: `PR-2611-xxxx` |
| **Mã Linh Kiện** | `qCode` | String | ERP / Folder Kỹ sư | Font Mono. Nếu `isTempCode = true` $\rightarrow$ Thêm badge màu vàng `MÃ TẠM` |
| **Tên Linh Kiện** | `partName` | String | Danh mục kỹ thuật | Text đậm, cắt ngắn có tooltip nếu dài quá 40 ký tự |
| **Tên Máy Thân Thiện**| `machineFriendlyName`| String | Kỹ sư chọn | Text thường: e.g. `Die Bonder 01 (DB-01)` |
| **Mã EM 14 Ký Tự** | `emNo` | String (14) | Công thức hệ thống | Font Mono: `[Plant][Prod][Proc][Line][Cat][Seq][Sub]` |
| **Dây Chuyền** | `lineName` | String | Kỹ sư chọn | Text: `Line #201` (Tự động suy ra Tầng 2F) |
| **Phân Loại Kế Hoạch** | `planClassification` | Enum | LEC đánh dấu thủ công | `TARGET` (Xanh lá) \| `OVER` (Đỏ) \| `UNCLASSIFIED` (Xám) |
| **Mã Nguyên Nhân Over**| `overReasonCode` | Enum | LEC gán thủ công | `OVR-01` đến `OVR-06` |
| **Mã Work Order** | `workOrderNo` | String | Kỹ sư nhập / EMS | Font Mono xanh dương: `WO-248926xxx` |
| **Số Lượng & Đơn Vị** | `quantity`, `unit` | Number, String | Kỹ sư nhập | Số nguyên + Đơn vị: `10 EA`, `2 SET` |
| **Đơn Giá Ước Tính** | `estimatedUnitPrice` | Currency | Hợp đồng / Báo giá | Ký hiệu tiền tệ: `$45 USD` |
| **Tổng Giá Trị** | `totalCost` | Currency | Hệ thống tự tính | In đậm font Mono: `$450 USD` |
| **Trạng Thái Vận Hành** | `status` | Enum | Máy trạng thái | Badge màu tương ứng từng trạng thái quy định |
| **Ngày Dự Kiến Hàng Về**| `etaDate` | Date | LEC cập nhật | Font Mono: `YYYY-MM-DD` |
