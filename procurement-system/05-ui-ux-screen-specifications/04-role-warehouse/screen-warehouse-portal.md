# Giao Diện Dành Riêng Cho Vai Trò: Warehouse (Thủ Kho Nhà Máy HW)
> **Mã Giao Diện: UI-ROLE-04 — Warehouse Issuance & Physical Inventory Portal**  
> *Dành riêng cho: Nhân sự quản lý kho phụ tùng tại Factory HW (Display Module Plant 1 - Kho H1, H2, H3)*

---

## 1. Tổng Quan Không Gian Làm Việc Của Thủ Kho (Workspace Anatomy)

Giao diện Warehouse Portal được thiết kế tối ưu cho các thiết bị công nghiệp: màn hình cảm ứng tại bàn thủ kho, máy tính bảng công nghiệp (Tablet) và máy quét mã vạch không dây (Handheld Barcode Scanner). 

Mục tiêu cốt lõi: **Ghi nhận chính xác chi phí sử dụng phụ tùng vào máy khi xuất kho**:
> *"Tiền sẽ được tính theo khi xuất kho sử dụng."*

Cấu trúc giao diện gồm **3 Tab chức năng vận hành kho**:
1.  **Tab 1: 📤 Quét Mã Xuất Kho Lắp Máy (Barcode Issuance Workbench)**: Thực hiện quy trình xuất kho 3 bước bằng máy quét barcode: Quét mã máy 14 ký tự EM No (`HWBMTL21EC0101`) $\rightarrow$ Quét mã phụ tùng / Serial (`QDAD12236`) $\rightarrow$ Quét mã thẻ nhân viên kỹ sư nhận hàng và kiểm tra mã lệnh sửa chữa `Work Order`.
2.  **Tab 2: 💰 Hạch Toán Ghi Nhận Chi Phí Thực Tế (Issue Expense Journal)**: Tự động ghi nhận số tiền phụ tùng xuất kho vào đúng tài khoản chi phí SG của phòng ban (`NY PO M Technology CP/SG Part 1 - Mã BP: 87321`), đúng công đoạn (`DB`) và đúng mã máy. Tách bạch hoàn toàn với chi phí cam kết mua hàng (PO Spend).
3.  **Tab 3: 📊 Đối Soát Tồn Kho Vật Lý On-hand (Physical Bin Audit)**: Hiển thị sơ đồ vị trí kệ kho (Kệ A, Kệ B, Ô lưu trữ), đối chiếu số lượng thực tế kiểm đếm với dữ liệu tồn kho tức thời trên hệ thống EMS Read-Model.

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  CỔNG QUẢN LÝ KHO PHỤ TÙNG HW — SMART WATCH PLANT                 [🔔 Sẵn sàng quét] [👤 Le Thi Thu Kho (Lead)]       │
│ Ngữ cảnh: Kho HW (Display Module Plant 1 - Org ID: 28753) > Tòa Nhà H1 (Tầng 2F)                     Thiết bị quét: Không dây (2.4G)│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CÁC TAB CHỨC NĂNG CỦA THỦ KHO:                                                                                                   │
│ [📤 TAB 1: XUẤT KHO LẮP MÁY (F3)]    [💰 TAB 2: HẠCH TOÁN CHI PHÍ THỰC TẾ]    [📊 TAB 3: ĐỐI SOÁT TỒN KHO & VỊ TRÍ KỆ]             │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📌 ĐANG HIỂN THỊ: TAB 1 — PHIẾU XUẤT KHO PHỤ TÙNG LẮP ĐẶT MÁY (ISSUE TO MACHINE)                                                 │
│                                                                                                                                  │
│ 1. QUÉT THÔNG TIN THIẾT BỊ ĐÍCH (SCAN DESTINATION MACHINE EM NO):                                                                │
│  Quét Mã EM No Thiết Bị Lắp Đặt: [ HWBMTL21EC0101             ] [📷 Quét Barcode Khung Máy]                                      │
│  ↳ GIẢI MÃ TỰ ĐỘNG: Factory HW (Smart Watch) > Tầng 2F > Line #201 > Machine EC > Unit 01 (Head) > Assembly 01                    │
│                                                                                                                                  │
│  Mã Lệnh Sửa Máy (Work Order):   [ WO-248926091                ]  Kỹ sư nhận phụ tùng: [ Nguyen Van A (DB Process - ID: 87021) ] │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. QUÉT MÃ VẬT TƯ THAY THẾ (SCAN ITEM SERIAL / QCODE):                                                                           │
│  Mã Phụ Tùng Xuất Kho:           [ QDAD12236                  ]  [📷 Quét Mã Phụ Tùng]                                           │
│  Tên Chi Tiết: Board Nguồn Điều Khiển CPX V4 Trumpf         Maker: TRUMPF             Vị Trí Kệ Kho: [ Kệ A-12, Ô số 04 ]        │
│  Số Lượng Xuất: [ 1 ] EA               Đơn Giá Xuất Kho: $3,150.00 USD                Thành Tiền Chi Phí: $3,150.00 USD          │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. ĐỊNH TUYẾN TÀI KHOẢN KẾ TOÁN & CHI PHÍ THỰC TẾ:                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 📌 HỆ THỐNG HẠCH TOÁN CHI PHÍ THỰC TẾ:                                                                                     │  │
│  │ • Phòng Ban Chịu Chi Phí (Budget Dept):    PO Module Technology Team 2 (Mã BP: 87321)                                      │  │
│  │ • Tài Khoản Ngân Sách SG (Budget Account): NY PO M Technology CP/SG Part 1                                                 │  │
│  │ • Công Đoạn & Dây Chuyền Sử Dụng:          Process DB (Die Bonding) — Dây chuyền Line #201 (Model Smart Watch D111)        │  │
│  │ • Tình Trạng Ngân Sách:                    🔴 Ghi nhận vào danh mục Over Ngoài Kế Hoạch (Mã OVR-01: Sự cố cháy board nguồn)│  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                                  │
│  [🔄 Quét Hạng Mục Khác]                  [🖨️ In Phiếu Xuất Kho 2 Liên (P)]                  [✅ HOÀN TẤT XUẤT KHO (Enter)]   │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tab 3 Chi Tiết: Đối Soát Tồn Kho Vật Lý On-hand (Bin Inventory Audit)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📊 ĐỐI SOÁT TỒN KHO VẬT LÝ HW VS READ-MODEL EMS (TÒA NHÀ H1 - TẦNG 2F)                                                           │
├────┬──────────┬──────────────┬─────────────┬──────────┬──────────────┬─────────────┬──────────────┬────────────────────────────┤
│STT │Vị Trí Kệ │ Mã QCode     │ Tên Chi Tiết│ Maker &  │ Tồn Kho Thực │ Tồn Trên EMS│ Chênh Lệch   │ Trạng Thái Đối Soát        │
│    │Kho HW    │ / Mã Tạm     │ Phụ Tùng    │ Quy Cách │ Kiểm Đếm     │ (Read-Model)│ (Variance)   │                            │
├────┼──────────┼──────────────┼─────────────┼──────────┼──────────────┼─────────────┼──────────────┼────────────────────────────┤
│ 1  │Kệ A12-04 │ QDAD12236    │ Board nguồn │ TRUMPF   │ 0 EA         │ 0 EA        │ 0 EA         │ 🟢 Khớp Tuyệt Đối          │
│ 2  │Kệ B03-01 │ QDAB03583    │ Sensor quang│ PANASONIC│ 15 EA        │ 15 EA       │ 0 EA         │ 🟢 Khớp Tuyệt Đối          │
│ 3  │Kệ B05-02 │ QCAD38190    │ Xylanh đôi  │ SMC      │ 2 EA         │ 2 EA        │ 0 EA         │ 🟡 Khóa Kỹ Thuật (Disuse)  │
│ 4  │Kệ C01-08 │ TMP-HW-0104  │ Xylanh trượt│ SMC      │ 0 EA         │ 0 EA        │ 0 EA         │ ⚪ Chờ Giao Từ ServeOne    │
└────┴──────────┴──────────────┴─────────────┴──────────┴──────────────┴─────────────┴──────────────┴────────────────────────────┘
```

---

## 4. Quyền Hạn Nghiệp Vụ Của Thủ Kho

| Chức Năng | Quyền Hạn | Ràng Buộc Kiểm Soát |
| :--- | :--- | :--- |
| **Xuất kho linh kiện** | Được phép xuất mọi linh kiện có sẵn trong kho HW. | **Bắt buộc phải có mã máy EM No 14 ký tự** và mã Work Order hợp lệ. Không xuất linh kiện nếu thiếu thông tin lắp đặt. |
| **Khấu trừ tồn kho** | Số lượng tồn kho on-hand tự động giảm ngay lập tức khi bấm Hoàn tất. | Dữ liệu đồng bộ tức thời sang Read-Model để Kỹ sư nhìn thấy số tồn thực. |
| **Ghi nhận chi phí** | Phiếu xuất tự động ghi nợ vào tài khoản chi phí SG của phòng ban thụ hưởng. | Thủ kho không có quyền thay đổi mã phòng ban hay tài khoản kế toán. |

