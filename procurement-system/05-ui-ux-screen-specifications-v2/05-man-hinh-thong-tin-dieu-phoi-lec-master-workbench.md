# 05. MÀN HÌNH THÔNG TIN ĐIỀU PHỐI LEC MASTER WORKBENCH

> **Mã màn hình**: `UI-INFO-04`  
> **Tên màn hình**: LEC Master Workbench, Batch Grouping, Interlocks & 3-Party Bridge Information Screen  
> **Vai trò người dùng**: Chuyên viên Điều phối Thiết bị Team (LEC - Spare Part Coordinator) — **Phạm Đức Long (MSNV: 658359) và các đồng nghiệp LEC (Hỗ trợ Đa LEC)**.  
> **Mục tiêu**: Điều phối toàn bộ hoạt động mua sắm trong Team; gom mẻ theo trạng thái để xử lý hàng loạt; giải tỏa Interlock 4 bước; đánh dấu thủ công Target/Over; cấp mã QCode từ folder kỹ sư; quản lý mốc giao hàng Inbound và đóng vai trò cầu nối giải trình 3 bên.

---

## 1. CẤU TRÚC BỐ CỤC KHÔNG GIAN THÔNG TIN (LAYOUT ANATOMY)

Màn hình được thiết kế theo cấu trúc Tab 6 phân hệ nghiệp vụ chuyên sâu:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Bàn Điều Phối LEC Master | LEC Trực Ban: Phạm Đức Long (658359) [Đổi LEC ▼] | Team: PO Module 2│
│ Trạng Thái Tác Nghiệp: ⚡ 2 Mã Chờ Quét Interlock | 📁 1 Folder Chờ Cấp QCode | 💬 1 Thắc Mắc Chờ Xử Lý │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ĐIỀU HƯỚNG 6 PHÂN HỆ TÁC NGHIỆP LEC (6 WORKBENCH TABS):                                                │
│ [ 1.Gom Mẻ Đồng Loạt ] [ 2.Đánh Dấu Target/Over ] [ 3.Hồ Sơ Cấp QCode ]                                │
│ [ 4.Mốc Inbound & 3 Tháng ] [ 5.Cầu Nối 3 Bên ] [ 6.Deadline & Ngân Sách ]                             │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 1: GOM MẺ THEO TRẠNG THÁI & XỬ LÝ ĐỒNG LOẠT (BATCH GROUPING ENGINE)]                    │
│ Thanh Lọc Trạng Thái: [Tất Cả] [Có Thể Mua] [Quét Interlock] [Tồn Kho Liên Team] [Chờ RFQ] [EOL]        │
│ Thanh Tác Vụ Đồng Loạt (Đã chọn: 3 mục):                                                               │
│ [🔓 Mở Khóa Interlock Mua Cục Bộ] [📤 Chuyển Sang Ký Duyệt EMS] [🚫 Đánh Dấu Ngừng Sản Xuất EOL]       │
│ ┌───┬───┬─────────────┬─────────────┬──────────────────────────┬──────────┬──────────┬───────────────┐ │
│ │[X]│STT│Mã PR / QCode│Tên Phụ Tùng │Thiết Bị & Chuyền         │Kỹ Sư     │Thành Tiền│Trạng Thái     │ │
│ ├───┼───┼─────────────┼─────────────┼──────────────────────────┼──────────┼──────────┼───────────────┤ │
│ │[X]│ 1 │PR-2611-0081 │Cảm biến quangDie Bonder 01 (Line 201)  │Thắng (P1)│$450 USD  │PURCHASABLE    │ │
│ │[X]│ 2 │PR-2611-0083 │Xylanh 2 ty  │Tape Bonder 02 (Line 202) │Quân (P1) │$880 USD  │CROSS_TEAM_STK │ │
│ └───┴───┴─────────────┴─────────────┴──────────────────────────┴──────────┴──────────┴───────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 2: ĐÁNH DẤU THỦ CÔNG TARGET VS. OVER (NGUYÊN TẮC VÀNG #6 - KHÔNG TỰ ĐỘNG)]              │
│ LEC trực tiếp xem xét mã Work Order và lý do sự cố để đánh dấu phân loại:                              │
│ • Chọn hạng mục ➔ Bật Hộp thoại: [TRONG KẾ HOẠCH (TARGET)] hoặc [NGOÀI KẾ HOẠCH (OVER)].              │
│ • Nếu chọn OVER ➔ Bắt buộc gán 1 trong 6 mã nguyên nhân OVR-01..06 và nhập/đối soát mã Work Order.     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 3: TIẾP NHẬN FOLDER KỸ THUẬT & CẤP MÃ QCODE CHÍNH THỨC]                                  │
│ • Tiếp nhận các folder kỹ sư nộp mang mã tạm TMP-HW-xxxx.                                              │
│ • LEC tải bản vẽ CAD/Catalog về ➔ Đăng ký mã trên ERP/EMS ngoài ➔ Quay lại bấm [Nhập QCode Chính Thức] │
│ • Sau khi cấp mã (e.g. QDAC77219), hệ thống tự động mở khóa cho hạng mục tham gia Thẩm định đầu tháng. │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 4: MỐC INBOUND GIAO HÀNG & PHÂN BỔ GHI NHẬN CHI PHÍ 3 THÁNG]                             │
│ Bảng theo dõi mốc tiến độ giao hàng và ma trận phân bổ ngân sách 3 tháng:                               │
│ • Ngày NCC Xác Nhận (Vendor Confirm Date) • Ngày Hàng Về Cảng/Kho HW (ETA Date).                       │
│ • Phân bổ chi phí: Tháng 11/2026 (50%) | Tháng 12/2026 (25%) | Tháng 01/2027 (25%).                    │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 5: CẦU NỐI THẨM ĐỊNH 3 BÊN (REVIEWER <-> LEC <-> KỸ SƯ)]                                 │
│ 1. Tiếp nhận câu hỏi thẩm tra từ Cost Management (Reviewer) ➔ Thêm ghi chú kỹ thuật của LEC.           │
│ 2. Chuyển tiếp cho Kỹ sư hiện trường ➔ Kỹ sư phản hồi kèm bằng chứng ảnh chụp.                         │
│ 3. LEC rà soát nội dung giải trình ➔ Bấm [Xác Nhận Giải Trình & Hoàn Tất Với Reviewer].                │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 6: THIẾT LẬP DEADLINE KIỂM THẢO & NGÂN SÁCH SG (STRICT NO-ROLLOVER)]                     │
│ • Cấu hình Trần Ngân Sách SG Tháng (USD): LEC nhập tay (Số dư chuyển sang tháng sau = $0).             │
│ • Hạn chót kỹ sư nộp giải trình tồn kho: Ngày 05 hàng tháng.                                           │
│ • Hạn chót khóa sổ kiểm thảo chi phí đầu tháng: Ngày 07 hàng tháng.                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ĐẶC TẢ CHI TIẾT 6 PHÂN HỆ TÁC NGHIỆP LEC

### 2.1. Tab 1: Gom Mẻ Theo Trạng Thái & Xử Lý Đồng Loạt (Batch Grouping Engine)
* **Khắc phục tình trạng xử lý đơn lẻ, phân tán**:
  * Thay vì xử lý từng mã mua sắm rời rạc gây mất thời gian, hệ thống cho phép LEC gom nhóm các đơn mua có cùng trạng thái trên toàn bộ Team để xử lý đồng loạt.
* **Bộ lọc gom mẻ chuyên dụng**:
  * `PURCHASABLE`: Toàn bộ các mã đã vượt qua quét Interlock và có giá hợp đồng UP001, sẵn sàng để gom lại ký PRV trên EMS.
  * `INTERLOCK_CHECK`: Các mã đang chờ đối soát trùng lặp hoặc chờ giải tỏa cờ tồn kho.
  * `CROSS_TEAM_STOCK`: Các mã đang bị khóa do Team khác trong Factory HW có sẵn tồn kho.
  * `RFQ_WAITING`: Các mã chưa có đơn giá hợp đồng (UP004), đang chờ email báo giá từ bộ phận Mua hàng.
  * `EOL`: Các mã linh kiện đã ngừng sản xuất.
* **Các hành động đồng loạt 1-Click (Batch Actions)**:
  * **Mở khóa Interlock mua cục bộ**: Mở khóa đồng loạt cho các mã mà LEC đã xác minh không thể mượn hàng từ team khác (do team bạn cần giữ dự phòng).
  * **Chuyển sang ký duyệt EMS**: Đồng loạt tạo số PRV/PO mô phỏng và chuyển hồ sơ sang trạng thái sẵn sàng ký duyệt trên phần mềm Nexacro EMS.
  * **Gán EOL**: Đồng loạt đánh dấu linh kiện ngừng sản xuất và gửi thông báo cho các kỹ sư liên quan tìm mã thay thế.

### 2.2. Tab 2: Đánh Dấu Thủ Công Target vs. Over (Strict Non-Automated)
* **Hiện thực hóa Nguyên tắc vàng #6**:
  * Hệ thống tuyệt đối không áp dụng thuật toán tự động phân loại Target/Over nhằm tránh sai sót trong hạch toán chi phí dự án.
* **Quy trình đánh dấu của LEC**:
  1. LEC mở danh sách các hạng mục chưa phân loại (`UNCLASSIFIED`).
  2. Xem xét kỹ thuật: Nếu là linh kiện bảo dưỡng định kỳ trong danh mục kế hoạch đã duyệt $\rightarrow$ Đánh dấu `TARGET`.
  3. Nếu phát sinh ngoài định mức do sự cố hoặc đổi model $\rightarrow$ Đánh dấu `OVER`.
  4. Khi đánh dấu `OVER`, giao diện bắt buộc LEC phải chọn 1 trong 6 mã nguyên nhân chuẩn:
     * `OVR-01`: Đột xuất hỏng hóc dừng chuyền (Line Stop).
     * `OVR-02`: Tăng sản lượng đột biến (Production Surge).
     * `OVR-03`: Chậm trễ chuyển giao liên pháp nhân (Transfer Delay).
     * `OVR-04`: Setup model mới (e.g. D111 $\rightarrow$ D222).
     * `OVR-05`: Biến động giá / Tỷ giá ngoại tệ NCC.
     * `OVR-06`: Hư hỏng trong căn chỉnh/lắp đặt.
  5. Đối soát và điền mã phiếu sự cố: `workOrderNo` (e.g. `WO-248926091`).

### 2.3. Tab 3: Tiếp Nhận Folder & Cấp Mã QCode Chính Thức
* **Bảo vệ tính toàn vẹn của kỳ thẩm định chi phí đầu tháng**:
  * Theo **Nguyên tắc vàng #5**: Mã tạm `TMP-HW-xxxx` sinh ra từ việc kỹ sư tải folder bản vẽ/catalog chỉ là bước chuẩn bị kỹ thuật và **bị chặn hoàn toàn khỏi kỳ thẩm định đầu tháng**.
* **Trách nhiệm của LEC**:
  1. Mở danh sách hồ sơ folder kỹ sư nộp trong Tab 3.
  2. Tải các tệp bản vẽ CAD (`.dwg`), catalog (`.pdf`) và ảnh phóng đại mẫu về máy tính.
  3. Đăng ký thông số kỹ thuật trên phần mềm ERP / EMS Core của tập đoàn.
  4. Sau khi ERP sinh ra mã QCode chính thức (ví dụ: `QDAC77219`), LEC quay lại giao diện nhấn nút **[Nhập QCode Chính Thức]**.
  5. Hệ thống tự động chuyển toàn bộ các đơn mua mang mã tạm `TMP-HW-xxxx` sang mã chính thức `QDAC77219`, gỡ bỏ cờ `isTempCode` và đưa các đơn mua này vào diện đủ điều kiện tham gia thẩm định chi phí đầu tháng.

### 2.4. Tab 4: Mốc Inbound Giao Hàng & Phân Bổ Chi Phí 3 Tháng
* **Quản trị tiến độ logistics trước khi nhận hàng**:
  * Việc xác nhận nhận hàng vật lý thực tế được kiểm tra đồng bộ từ EMS. Tuy nhiên, các mốc trước đó do LEC trực tiếp quản trị trên giao diện này:
    * **Vendor Confirm Date**: Ngày nhà cung cấp chính thức xác nhận đơn hàng và cam kết giao.
    * **ETA Date**: Ngày dự kiến hàng cập cảng Hải Phòng hoặc nhập kho ngoại quan HW.
* **Ma trận phân bổ ghi nhận chi phí theo tháng (Monthly Expense Allocation Matrix)**:
  * Cho phép chia nhỏ số lượng linh kiện của đơn hàng lớn để ghi nhận chi phí rải đều trong 3 tháng liên tiếp (Tháng hiện tại $T$, Tháng $T+1$, Tháng $T+2$).
  * Tránh tình trạng dồn toàn bộ chi phí lớn vào một tháng làm vượt trần ngân sách SG (Over budget).

### 2.5. Tab 5: Cầu Nối Thẩm Định 3 Bên (Reviewer $\leftrightarrow$ LEC $\leftrightarrow$ Kỹ Sư)
* **Hiện thực hóa Nguyên tắc vàng #8**:
  * Chuyên viên Quản lý Chi phí (Reviewer) làm việc offline hoặc qua hệ thống, khi phát hiện hạng mục giá cao hoặc lý do Over chưa rõ ràng sẽ phát hành thắc mắc.
  * Câu hỏi chuyển đến Bàn làm việc LEC ở trạng thái `PENDING_LEC`.
  * LEC bổ sung chỉ dẫn chuyên môn: *"Thắng chụp thêm ảnh phóng đại vi mạch tụ C14 và trích lục nhật ký ca đêm nhé"*, rồi bấm **[Chuyển Cho Kỹ Sư]** (`PENDING_ENGINEER`).
  * Kỹ sư phản hồi văn bản và đính kèm bằng chứng (`ENGINEER_REPLIED`).
  * LEC kiểm tra tính hợp lý của phản hồi, bấm **[Xác Nhận Giải Trình & Hoàn Tất Với Reviewer]** để chuyển trạng thái sang `RESOLVED`.

### 2.6. Tab 6: Cấu Hình Deadline & Ngân Sách SG (Strict No-Rollover)
* **Hiện thực hóa Nguyên tắc vàng #7 & #10**:
  * **Hạn mức Ngân sách SG Tháng**: LEC nhập thủ công hạn mức được duyệt (e.g. `$150,000 USD`). Khóa cứng nguyên tắc số dư không dùng hết bị hủy vào cuối tháng (**Carryover Surplus = $0**).
  * **Hạn chót kỹ sư nộp giải trình tồn kho chậm luân chuyển**: Mặc định ngày 05 hàng tháng. Toàn bộ các tác vụ giải trình chưa nộp sau thời điểm này sẽ bị cảnh báo đỏ.
  * **Hạn chót khóa sổ kiểm thảo chi phí đầu tháng**: Mặc định ngày 07 hàng tháng, cố định dữ liệu để phục vụ báo cáo Ban Giám Đốc.

---

## 3. TỪ ĐIỂN TRƯỜNG THÔNG TIN MÀN HÌNH LEC

| Tên Trường Hiển Thị | Mã Trường | Kiểu | Ý Nghĩa Điều Phối |
| :--- | :--- | :---: | :--- |
| **LEC Trực Ban** | `activeLec` | Object | Hồ sơ LEC phụ trách: Tên, MSNV, ĐT (Phạm Đức Long - 658359) |
| **Trạng Thái Gom Mẻ** | `statusFilter` | Enum | Lọc theo trạng thái để gom mẻ xử lý đồng loạt |
| **Danh Sách Chọn Đồng Loạt**| `selectedIds` | Array[String]| Mảng các mã PR được tích chọn checkbox |
| **Phân Loại Kế Hoạch** | `selectedPlan` | Enum | `TARGET` (Trong kế hoạch) hoặc `OVER` (Ngoài kế hoạch) |
| **Mã Nguyên Nhân Over** | `selectedOverReason` | Enum | 1 trong 6 mã chuẩn: `OVR-01` đến `OVR-06` |
| **Mã QCode Chính Thức** | `officialQCodeInput` | String | Mã QCode chuẩn cấp từ ERP/EMS (e.g. `QDAC77219`) |
| **Ngày NCC Xác Nhận** | `vendorConfirmDate` | Date | Mốc thời gian NCC cam kết giao hàng |
| **Ngày Hàng Về Dự Kiến (ETA)**| `etaDate` | Date | Mốc dự kiến hàng đến kho Factory HW |
| **Phân Bổ Chi Phí 3 Tháng**| `monthlyAllocations` | Array[Object]| Phân bổ số lượng và số tiền cho 3 tháng: Tháng $T$, $T+1$, $T+2$ |
| **Ghi Chú Hướng Dẫn LEC** | `lecNote` | Textarea | Hướng dẫn của LEC gửi kỹ sư để hoàn thiện hồ sơ giải trình |
| **Trần Ngân Sách SG Tháng**| `monthlyAllocationBudget`| Currency | Ngân sách tháng do LEC nhập tay (Không cộng dồn số dư) |
| **Hạn Chót Kỹ Sư Nộp Giải Trình**| `justificationDeadline` | Date | Hạn chót nộp giải trình tồn kho (Mặc định ngày 05) |
| **Hạn Chót Khóa Sổ Thẩm Định**| `auditLockDeadline` | Date | Hạn chót chốt hồ sơ kiểm thảo đầu tháng (Mặc định ngày 07) |
