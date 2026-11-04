# 04. MÀN HÌNH THÔNG TIN GIÁM SÁT TRƯỞNG NHÓM / PART & ĐỐI SOÁT WORK ORDER

> **Mã màn hình**: `UI-INFO-03`  
> **Tên màn hình**: Leader Team Oversight, Aging Compliance & Work Order Verification Information Screen  
> **Vai trò người dùng**: Trưởng nhóm / Trưởng Part (Team Leader & Part Leader) — Quản lý kỹ thuật và giám sát phân xưởng.  
> **Nguyên tắc cốt lõi (Nguyên tắc vàng #1)**: **TUYỆT ĐỐI KHÔNG CÓ NÚT PHÊ DUYỆT TRÊN HỆ THỐNG NÀY**. Toàn bộ phê duyệt PRV và ký duyệt ngân sách thực hiện 100% trên Nexacro EMS. Màn hình này phục vụ giám sát tiến độ, đôn đốc kỹ sư giải trình tồn kho và đối soát kỹ thuật Work Order.

---

## 1. CẤU TRÚC BỐ CỤC KHÔNG GIAN THÔNG TIN (LAYOUT ANATOMY)

Màn hình được thiết kế theo cấu trúc Tab 3 phân hệ giám sát và đối soát:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Dashboard Giám Sát Trưởng Part/Team | Leader: Trần Văn Hùng | Team: PO Module Technology Team 2│
│ ⚠️ NHẮC NHỞ QUY TẮC: Phê duyệt PRV chính thức trên EMS • Giao diện này phục vụ theo dõi & đối soát WO  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4 THẺ CHỈ SỐ GIÁM SÁT NHANH (TEAM KPI SUMMARY CARDS):                                                 │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬───────────────────────────────┐ │
│ │ Tổng Đơn Hàng Của Team│ Chi Phí Trong Target │ Chi Phí Over Cần Soát│ Tác Vụ Kỹ Sư Tồn Đọng         │ │
│ │ 64 Hạng Mục          │ $122,000 USD (82.3%) │ $26,200 USD (17.7%)  │ 3 Tác Vụ Cần Giải Trình       │ │
│ │ • Part 1: 38 • Part 2: 26│ • Nằm trong định mức │ • Cần đối chiếu WO   │ • Hạn chót: 2026-11-05 (LEC)  │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴───────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ĐIỀU HƯỚNG 3 PHÂN HỆ GIÁM SÁT (3 MONITORING TABS):                                                     │
│ [ TAB 1: Giám Sát Tiến Độ Team => Part ] [ TAB 2: Tiến Độ Giải Trình Tồn Kho ] [ TAB 3: Đối Soát Mã WO ] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 1: TIẾN ĐỘ THEO PHÂN CẤP TEAM => PART => PEER ENGINEERS]                                │
│ Ma Trận Tình Trạng Kỹ Sư Đồng Nghiệp (Peer Engineers Matrix):                                         │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬───────────────────────────────┐ │
│ │ Nguyễn Văn Thắng     │ Lê Hoàng Quân        │ Trần Đức Minh        │ Phạm Văn Kiên                 │ │
│ │ • CP/SG Part 1 (2F)  │ • CP/SG Part 1 (2F)  │ • CP/SG Part 2 (3F)  │ • CP/SG Part 2 (3F)           │ │
│ │ • Đơn mua: 18 mục    │ • Đơn mua: 12 mục    │ • Đơn mua: 15 mục    │ • Đơn mua: 19 mục             │ │
│ │ • Tồn đọng: 2 task ⚠️│ • Tồn đọng: 1 task ⚠️│ • Tồn đọng: 0 task 🟢│ • Tồn đọng: 0 task 🟢         │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴───────────────────────────────┘ │
│ Bảng Chi Tiết Yêu Cầu Mua Của Team (Lọc theo Part 1 / Part 2 / Toàn Team):                             │
│ • Mã PR • Mã QCode • Tên Linh Kiện • Máy • Kỹ Sư • Thành Tiền • Trạng Thái • Nút [Kiểm Tra WO]        │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 2: THEO DÕI TỶ LỆ HOÀN THÀNH GIẢI TRÌNH TỒN KHO ĐẦU THÁNG (AGING COMPLIANCE TRACKER)]   │
│ Bảng đôn đốc kỹ sư nộp văn bản giải trình trước hạn chót của LEC (Ngày 05 hàng tháng):                 │
│ ┌──────────────┬────────────┬──────────────────┬──────────┬──────────────────┬───────────────────────┐ │
│ │Mã Tác Vụ     │Linh Kiện   │Kỹ Sư Phụ Trách   │Hạn Chót  │Tình Trạng Nộp    │Nội Dung Giải Trình    │ │
│ ├──────────────┼────────────┼──────────────────┼──────────┼──────────────────┼───────────────────────┤ │
│ │TASK-AGING-01 │QDAB03583   │Nguyễn Văn Thắng  │2026-11-05│🟢 Đã Nộp         │Do xưởng chạy tăng sản │ │
│ │              │(Tồn 48 ngày│(Part 1)          │          │                  │lượng Model D111 gấp...│ │
│ └──────────────┴────────────┴──────────────────┴──────────┴──────────────────┴───────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NỘI DUNG TAB 3: ĐỐI SOÁT MÃ WORK ORDER (WO) & NGUYÊN NHÂN OVER PHỤC VỤ KIỂM THẢO]                    │
│ Danh sách các hạng mục Over gắn liền với mã Work Order sự cố:                                          │
│ • PR-2611-0082 | Bo mạch nguồn Trumpf ($3,150) | Mã WO-248926091 | Nguyên nhân: OVR-01 (Line Stop)    │
│   ↳ Nút [Kiểm Tra Hồ Sơ]: Xem ảnh tụ vi mạch bị đánh thủng và trích lục nhật ký dừng chuyền ca đêm.   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ĐẶC TẢ CHI TIẾT 3 PHÂN HỆ GIÁM SÁT

### 2.1. Tab 1: Giám Sát Phân Cấp Team $\rightarrow$ Part $\rightarrow$ Kỹ Sư Đồng Nghiệp
* **Xóa bỏ hoàn toàn rào cản phân cấp công đoạn**:
  * Các chức danh Trưởng công đoạn (Process Leader) như Trưởng POL, Trưởng TAB, Trưởng DIP đã bị bãi bỏ.
  * Toàn bộ kỹ sư trong Part là **đồng nghiệp ngang hàng** chịu trách nhiệm trực tiếp đối với cụm máy mình vận hành.
* **Ma trận giám sát kỹ sư (Peer Engineers Matrix)**:
  * Trưởng nhóm / Part theo dõi nhanh khối lượng công việc của từng kỹ sư:
    * Số lượng đơn mua đang tạo trong tháng.
    * Số lượng tác vụ tồn đọng (mượn hàng liên team chưa giải quyết, giải trình tồn kho chưa nộp).
* **Bảng chi tiết yêu cầu mua sắm toàn team**:
  * Bộ lọc phân ban: Lọc xem riêng `CP/SG Part 1 (Tầng 2F)`, `CP/SG Part 2 (Tầng 3F)` hoặc `Toàn bộ Team 2`.
  * Cung cấp nút **[Kiểm Tra WO]** trên từng dòng để mở hộp thoại kiểm tra kỹ thuật.

### 2.2. Tab 2: Theo Dõi Tỷ Lệ Hoàn Thành Giải Trình Tồn Kho (Aging Compliance Tracker)
* **Ý nghĩa vận hành**:
  * Linh kiện nằm trong tủ phụ tùng của team $> 30$ ngày chưa sử dụng sẽ bị hệ thống đưa vào diện chậm luân chuyển.
  * Để phục vụ phiên thẩm định đầu tháng với Bộ phận Quản lý Chi phí, kỹ sư phụ trách máy bắt buộc phải nộp văn bản giải trình trước hạn chót do LEC thiết lập (mặc định ngày 05 hàng tháng).
* **Bảng theo dõi tuân thủ**:
  * Hiển thị danh sách tác vụ giải trình của toàn bộ kỹ sư trong team.
  * Trạng thái trực quan:
    * 🟢 **Đã Nộp**: Kỹ sư đã điền lý do kỹ thuật, kế hoạch thay thế và ngày cam kết dùng hết hàng tồn.
    * 🟡 **Chưa Hoàn Thành**: Cảnh báo để Leader trực tiếp đôn đốc kỹ sư nộp trước thời hạn.

### 2.3. Tab 3: Đối Soát Mã Work Order & Hồ Sơ Kiểm Tra Kỹ Thuật
* **Chuẩn bị hồ sơ cho phiên kiểm thảo đầu tháng**:
  * Các hạng mục phát sinh ngoài kế hoạch (`OVER`) chỉ được Cost Management thông qua nếu có căn cứ kỹ thuật xác đáng.
  * Leader rà soát đối chiếu:
    * Mã số phiếu sự cố bảo trì: `workOrderNo` (e.g. `WO-248926091`).
    * Mã nguyên nhân Over do LEC gán (`OVR-01` đến `OVR-06`).
* **Hộp thoại Kiểm Tra Kỹ Thuật Work Order (WO Inspector Modal)**:
  * Hiển thị tóm tắt sự cố: Thời điểm xảy ra sự cố (ví dụ: ca đêm ngoài giờ hành chính), thời gian dừng chuyền sản xuất (Line stop: 45 phút).
  * Hình ảnh bằng chứng kỹ thuật đính kèm (ảnh chụp phóng đại linh kiện bị chập cháy, nứt gãy).
  * Ghi chú kỹ thuật của Leader xác nhận tính cấp thiết trước khi gửi sang phiên thẩm định chi phí.

---

## 3. TỪ ĐIỂN TRƯỜNG THÔNG TIN MÀN HÌNH LEADER

| Tên Trường Hiển Thị | Mã Trường | Kiểu | Ý Nghĩa Kiểm Soát |
| :--- | :--- | :---: | :--- |
| **Phân Ban Phụ Trách** | `partGroup` | String | `CP/SG Part 1` (Tầng 2F) hoặc `CP/SG Part 2` (Tầng 3F) |
| **Kỹ Sư Phụ Trách** | `requestorName` | String | Tên kỹ sư hiện trường tạo yêu cầu mua |
| **Số Đơn Mua Trong Kỳ** | `orderCount` | Number | Tổng số hạng mục mua sắm kỹ sư đăng ký trong tháng |
| **Số Tác Vụ Tồn Đọng** | `pendingTaskCount` | Number | Số tác vụ mượn hàng và giải trình tồn chưa hoàn tất |
| **Mã Work Order Sự Cố** | `workOrderNo` | String | Khóa liên kết phiếu bảo trì máy (e.g. `WO-248926091`) |
| **Lý Do Kỹ Sư Giải Trình**| `justificationText` | Textarea | Nội dung kỹ sư giải trình lý do chưa xuất dùng phụ tùng |
| **Kế Hoạch Thay Thế** | `actionPlan` | String | Phương án đưa linh kiện vào sử dụng trong các đợt PM tới |
| **Ngày Cam Kết Dùng Hết**| `targetUsageDate` | Date | Hạn chót kỹ sư cam kết lắp đặt linh kiện vào máy |
| **Ghi Chú Đánh Giá Của Leader**| `leaderNote` | Textarea | Nhận xét của Leader về tính hợp lý của sự cố |
