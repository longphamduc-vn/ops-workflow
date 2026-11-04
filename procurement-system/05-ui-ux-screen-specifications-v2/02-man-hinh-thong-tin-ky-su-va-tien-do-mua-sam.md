# 02. MÀN HÌNH THÔNG TIN YÊU CẦU MUA SẮM & TÁC VỤ KỸ SƯ HIỆN TRƯỜNG

> **Mã màn hình**: `UI-INFO-01`  
> **Tên màn hình**: Field Engineer Requisition, Task Box & Friendly Equipment Information Portal  
> **Vai trò người dùng**: Kỹ sư hiện trường (Field Engineer) — **Quan hệ đồng nghiệp ngang hàng (Không phân cấp công đoạn POL, TAB, DIP)**.  
> **Mục tiêu**: Đăng ký nhu cầu mua sắm bằng tên máy thân thiện, tự động sinh mã EM 14 ký tự, cảnh báo tồn kho liên team, nộp folder CAD chuẩn bị QCode, hoàn thành tác vụ giải trình tồn kho đầu tháng và trả lời thẩm tra chi phí.

---

## 1. CẤU TRÚC BỐ CỤC KHÔNG GIAN THÔNG TIN (LAYOUT ANATOMY)

Màn hình được thiết kế theo cấu trúc Tab 4 phân hệ thông tin liên hoàn:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Cổng Kỹ Sư Hiện Trường | Kỹ sư: Nguyễn Văn Thắng (CP/SG Part 1) | Chuyền Phụ Trách: Line #201  │
│ Huy Hiệu Cảnh Báo: ⚠️ 1 Mượn Hàng Liên Team Bắt Buộc | ⏳ 1 Giải Trình Tồn Kho Đầu Tháng Cần Nộp         │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ĐIỀU HƯỚNG 4 PHÂN HỆ THÔNG TIN (4 INTERACTIVE TABS):                                                   │
│ [ TAB 1: Đăng Ký Mua Theo Tên Máy ] [ TAB 2: Tải Folder QCode ] [ TAB 3: Tác Vụ Bắt Buộc ] [ TAB 4: Trao Đổi LEC ] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 1: FORM THÔNG TIN ĐĂNG KÝ THEO TÊN THÂN THIỆN]                                           │
│ ┌────────────────────────────────────────────────────────────┬───────────────────────────────────────┐ │
│ │ 1. KHUNG CHỌN THIẾT BỊ BẰNG TÊN THÂN THIỆN:                │ GIẢI MÃ MÃ EM THIẾT BỊ (14 KÝ TỰ):    │ │
│ │ • Dây Chuyền: [ Line #201 (Tầng 2F) ▼ ]                    │ ┌───────────────────────────────────┐ │ │
│ │   ↳ Quy tắc: Left(Line, 1) = Tầng (2F)                     │ │          HWBMTL21EC0101           │ │ │
│ │ • Tên Máy Thân Thiện: [ Die Bonder 01 (DB-01) ▼ ]          │ └───────────────────────────────────┘ │ │
│ │ • Cụm Cơ Cấu Lắp Đặt: [ Cụm Đầu Gắp Chip (SubUnit 01) ▼ ]  │ • HW (Nhà máy HW) • BM (Smart Watch)  │ │
│ │ ────────────────────────────────────────────────────────── │ • TL (Total Line) • 21 (Line #201)    │ │
│ │ 2. CHỌN LINH KIỆN & KIỂM TRA TỨC THỜI (50ms):              │ • EC (Core Bonder)• 01 (Máy DB-01)    │ │
│ │ • Linh kiện: [ QCAD38190 - Xylanh 2 ty SMC MXQ16 ($220) ▼ ]│ • 01 (Cụm gắp Bonding Head 01)        │ │
│ │ ┌────────────────────────────────────────────────────────┐ │ ─────────────────────────────────────  │ │
│ │ │ ⚠️ CẢNH BÁO TỒN KHO LIÊN TEAM (AGING INTERLOCK = 'Y'): │ │ TỔNG GIÁ TRỊ DỰ KIẾN:                 │ │
│ │ │ Kho H1-2F của PO Module Tech Team 1 đang CÓ SẴN 6 EA.  │ │ $440 USD                              │ │
│ │ │ Bạn BẮT BUỘC phải làm thủ tục mượn trước khi mua mới!  │ │ (2 EA x $220/EA)                      │ │
│ │ └────────────────────────────────────────────────────────┘ │ ─────────────────────────────────────  │ │
│ │ • Số Lượng: [ 2 ] EA   • Nhu Cầu: [ BREAKDOWN (Sự Cố) ▼ ]  │ [🔘 Xác Nhận Đăng Ký Yêu Cầu]          │ │
│ │ • Mã Work Order: [ WO-248926095 ]                          │                                       │ │
│ │ • [X] Tích chọn: Khai Báo Muộn EBOM (Chưa có slot cơ cấu)  │                                       │ │
│ └────────────────────────────────────────────────────────────┴───────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 2: TẢI FOLDER CHUẨN BỊ DỮ LIỆU ĐĂNG KÝ QCODE MỚI]                                        │
│ • Vùng kéo thả thư mục (CAD .dwg, Catalog .pdf, Spec ảnh .png).                                        │
│ • Bảng trích xuất cấu trúc tệp đính kèm và form điền thông số kỹ thuật (Maker, Model, Kích thước).     │
│ • Cảnh báo: Mã sinh ra là mã tạm TMP-HW-xxxx; KHÔNG ĐƯỢC THẨM ĐỊNH ĐẦU THÁNG cho đến khi LEC cấp QCode! │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 3: HỘP THƯ TÁC VỤ BẮT BUỘC (MANDATORY PERSISTENT TASKS)]                                 │
│ 1. Tác vụ Mượn Kho Liên Team: Mượn 6 EA QCAD38190 từ Team 1 (Chỉ tự đóng khi EMS đồng bộ cờ = 'N').    │
│ 2. Tác vụ Giải Trình Tồn Kho Đầu Tháng: Linh kiện QDAB03583 tồn kho 48 ngày (Hạn chót: 2026-11-05).   │
│    ↳ Nút [Nhập Giải Trình]: Điền lý do chưa dùng + Kế hoạch sử dụng + Ngày cam kết thay thế.          │
│ 3. Tác vụ Khai Báo Muộn EBOM: Gán đồ gá TMP-HW-0105 vào cây máy DB-01 trong 7 ngày.                   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 4: CẦU NỐI TRAO ĐỔI VỚI LEC (3-PARTY CLARIFICATION BRIDGE)]                              │
│ • Nhận thắc mắc từ Người thẩm định thông qua hướng dẫn của LEC Phạm Đức Long.                          │
│ • Khung soạn thảo phản hồi kỹ thuật + Nút đính kèm ảnh chụp hiện trường vi mạch sự cố ca đêm.          │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ĐẶC TẢ CHI TIẾT 4 PHÂN HỆ THÔNG TIN

### 2.1. Tab 1: Đăng Ký Theo Tên Thân Thiện & Giải Mã Mã EM 14 Ký Tự
* **Mục tiêu**: Giảm tải áp lực ghi nhớ mã số kỹ thuật phức tạp cho kỹ sư hiện trường; thay vào đó, kỹ sư làm việc hoàn toàn với tên thông dụng của máy, dây chuyền và cụm cơ cấu.
* **Bộ chọn phân cấp thân thiện**:
  1. **Dây chuyền (Line)**: `Line #201`, `Line #202`, `Line #301`.
     * *Quy tắc hệ thống*: Tự động áp dụng `Left(Line, 1) = Floor` $\rightarrow$ Line 201 thuộc Tầng 2F, Line 301 thuộc Tầng 3F.
  2. **Tên máy (Machine)**: `Die Bonder 01 (DB-01)`, `Tape Automated Bonder (TAB-02)`, `Polarizer Attach (POL-01)`.
  3. **Cụm cơ cấu (Mechanism)**: `Cụm Đầu Gắp (Bonding Head)`, `Bàn Nhiệt (Heating Stage)`, `Cụm Cấp Phôi (Feeder Unit)`.
* **Công thức tự động sinh mã EM 14 ký tự**:
  $$\text{EM\_No} = \text{HW} + \text{BM} + \text{TL} + \text{LineCode} + \text{EqCode} + \text{Seq} + \text{SubUnit}$$
  * Ví dụ: Kỹ sư chọn `Line 201` + `Die Bonder 01` + `Cụm Đầu Gắp 01` $\rightarrow$ Hệ thống lập tức hiển thị mã thẻ: `HWBMTL21EC0101`.
* **Cơ chế quét tức thời 50ms & Cảnh báo tồn kho liên team (`agingInterlockFlag = 'Y'`)**:
  * Khi kỹ sư chọn mã linh kiện (ví dụ `QCAD38190`), hệ thống truy vấn ngay lập tức bảng tồn kho của nhà máy Factory HW.
  * Nếu phát hiện tồn kho tại Team khác (ví dụ PO Module Tech Team 1 đang tồn 6 EA):
    * Ngay lập tức bật **Banner cảnh báo màu hổ phách**.
    * Khóa không cho mua mới cục bộ trừ khi mượn hoặc được LEC mở khóa.
    * Tự động sinh ra một **Tác vụ bắt buộc mượn hàng liên team** trong Tab 3.

### 2.2. Tab 2: Tải Folder Chuẩn Bị Dữ Liệu Đăng Ký Mã QCode
* **Bản chất nghiệp vụ**: Kỹ sư hiện trường không có quyền truy cập trực tiếp để tạo QCode trên phần mềm ERP tập đoàn. Do đó, hệ thống cung cấp giao diện chuẩn bị hồ sơ kỹ thuật trọn gói.
* **Các thành phần hồ sơ folder bắt buộc**:
  * Bản vẽ gia công kỹ thuật 2D/3D: định dạng `.dwg`, `.dxf`, `.step`.
  * Catalog sản phẩm từ nhà chế tạo: định dạng `.pdf`.
  * Ảnh chụp mẫu thực tế hoặc vi sai dung sai: `.png`, `.jpg`.
* **Mã tạm `TMP-HW-xxxx`**:
  * Sau khi nộp folder, hệ thống tự động sinh một mã tạm mang định dạng `TMP-HW-xxxx` (cờ `isTempCode = true`).
  * **Thông báo giới hạn nghiêm ngặt**: Giao diện hiển thị rõ dòng chữ đỏ:  
    `"Mã tạm TMP-HW-xxxx CHỈ DÙNG ĐỂ CHUẨN BỊ DỮ LIỆU. Hạng mục này BỊ KHÓA KHỎI PHIÊN THẨM ĐỊNH CHI PHÍ ĐẦU THÁNG cho đến khi LEC đăng ký thành công mã QCode chính thức trên ERP!"`

### 2.3. Tab 3: Hộp Thư Tác Vụ Bắt Buộc (Mandatory Persistent Tasks)
Hộp thư quản lý 3 nhóm nhiệm vụ mà kỹ sư bắt buộc phải hoàn thành:
1. **Tác vụ Mượn Tồn Kho Liên Team (`INTER_TEAM_BORROW`)**:
   * *Đặc tính*: **Không thể tự ý đóng thủ công**.
   * *Cơ chế giải phóng*: Kỹ sư làm thủ tục mượn trên EMS $\rightarrow$ EMS xuất kho chuyển giao $\rightarrow$ Gateway EMS đồng bộ lại thấy cờ tồn kho = `'N'` $\rightarrow$ Hệ thống tự động chuyển tác vụ sang `RESOLVED`.
2. **Tác vụ Giải Trình Tồn Kho Chậm Luân Chuyển Đầu Tháng (`AGING_JUSTIFICATION`)**:
   * Áp dụng cho các linh kiện trong tủ phụ tùng của team đã tồn trữ $> 30$ ngày mà chưa xuất thay thế.
   * Kỹ sư phải bấm nút **[Nhập Bản Giải Trình]** trước hạn chót của LEC (ngày 05) gồm 3 thông tin:
     1. Lý do kỹ thuật tại sao chưa thay thế (ví dụ: máy chạy tăng sản lượng đơn hàng nên hoãn PM).
     2. Kế hoạch hành động cụ thể (Action Plan).
     3. Ngày cam kết xuất dùng hết hàng tồn (Target Usage Date).
   * Dữ liệu này tự động kết xuất vào **Sheet 4 của Báo cáo Excel Thẩm định**.
3. **Tác vụ Khai Báo Muộn EBOM (`EBOM_LATE_DECLARATION`)**:
   * Xuất hiện khi kỹ sư tạo đơn khẩn cấp và tích chọn *"Khai báo muộn cơ cấu EBOM"*.
   * Đếm ngược thời hạn 7 ngày để kỹ sư vào giao diện `UI-INFO-02` kéo thả gán Slot cho máy.

### 2.4. Tab 4: Cầu Nối Trao Đổi 2 Chiều Với LEC (3-Party Clarification Bridge)
* Khung hội thoại giải trình kỹ thuật theo từng mã yêu cầu:
  1. Hiển thị nội dung chất vấn của Chuyên viên Quản lý Chi phí (Reviewer).
  2. Hiển thị ghi chú hướng dẫn của LEC (Phạm Đức Long).
  3. Khung nhập văn bản giải trình của Kỹ sư hiện trường và nút đính kèm tài liệu chứng minh (ảnh vi mạch cháy, trích lục ca sự cố dừng chuyền).

---

## 3. TỪ ĐIỂN TRƯỜNG THÔNG TIN GIAO DIỆN KỸ SƯ

| Tên Trường Hiển Thị | Mã Trường | Kiểu | Ràng Buộc & Quy Tắc Giao Diện |
| :--- | :--- | :---: | :--- |
| **Dây Chuyền** | `line` | Select | Bắt buộc chọn (`Line #201`, `#202`, `#301`). Tự động tính tầng |
| **Tên Máy Thân Thiện** | `machineType` | Select | Bắt buộc chọn (`DB-01`, `TAB-02`, `POL-01`) |
| **Cụm Cơ Cấu** | `mechanism` | Select | Bắt buộc chọn cụm cơ cấu phụ trách |
| **Mã EM 14 Ký Tự** | `generatedEmNo` | Read-only | Hệ thống tự động tính toán và giải mã tức thời |
| **Mã QCode Linh Kiện** | `selectedPart` | Select/Search | Tra cứu nhanh 50ms, hiển thị đơn giá và cờ cảnh báo tồn kho |
| **Cờ Tồn Kho Liên Team**| `agingInterlock`| Enum ('Y'/'N')| Nếu 'Y' $\rightarrow$ Hiện Banner màu hổ phách cảnh báo tồn kho |
| **Đơn Giá Hợp Đồng** | `unitPriceFlag` | Enum ('Y'/'N')| Nếu 'N' $\rightarrow$ Cảnh báo linh kiện cần lấy báo giá UP004 RFQ |
| **Số Lượng Đăng Ký** | `quantity` | Number | Nguyên dương, tối thiểu là 1 EA |
| **Loại Nhu Cầu** | `demandType` | Enum | `BREAKDOWN`, `PM`, `IMPROVE`, `SETUP`, `SAFETY_STOCK` |
| **Mã Work Order** | `workOrderNo` | String | Bắt buộc khi nhu cầu là BREAKDOWN hoặc có nguy cơ Over |
| **Cờ Khai Báo Muộn** | `isLateDeclaration` | Boolean | Tích chọn nếu linh kiện mua gấp chưa có trong cây EBOM |
| **Tệp Folder Bản Vẽ** | `uploadedFiles` | File Array | Danh sách tệp đính kèm gồm tên, dung lượng, định dạng CAD/PDF |
| **Lý Do Giải Trình Tồn** | `justificationReason`| Textarea | Nội dung giải trình lý do chưa xuất dùng linh kiện >30 ngày |
| **Ngày Cam Kết Dùng Hết**| `targetUsageDate` | Date | Hạn chót cam kết thay thế linh kiện vào máy |
