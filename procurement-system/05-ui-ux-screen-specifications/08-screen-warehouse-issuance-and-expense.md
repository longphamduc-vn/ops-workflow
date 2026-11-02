# 08. Đặc Tả Giao Diện Chi Tiết: Màn Hình Xuất Kho Lắp Máy & Ghi Nhận Chi Phí Thực Tế
> *Thời điểm cốt lõi: Hạch toán chi phí sản xuất khi linh kiện được quét xuất kho lắp vào mã EM No: HWBMTL21EC0101*

---

## 1. Nguyên Tắc Kế Toán & Bản Vẽ Giao Diện Chi Tiết

Màn hình dành cho Thủ kho và Kỹ thuật viên bảo trì tại Kho HW:
*   Khi quét mã phụ tùng xuất kho gắn liền với **Số Quản Lý EM No (14 ký tự)** và **Mã Lệnh Máy (Work Order)**:
*   **HỆ THỐNG CHÍNH THỨC GHI NHẬN CHI PHÍ SẢN XUẤT THỰC TẾ (Actual Expense Recognition)**.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  PHIẾU XUẤT KHO PHỤ TÙNG LẮP ĐẶT MÁY — KHO HW (DISPLAY MODULE PLANT 1)          [👤 Le Thi Thu Kho (Warehouse Lead)]  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. QUÉT THÔNG TIN THIẾT BỊ ĐÍCH (SCAN DESTINATION MACHINE EM NO):                                                                │
│  Quét Mã EM No Thiết Bị Lắp Đặt: [ HWBMTL21EC0101             ] [📷 Quét Barcode Trên Khung Máy]                                 │
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
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ HÀNH ĐỘNG:                 [❌ Hủy Thao Tác]         [🖨️ In Phiếu Xuất Kho]         [✅ XÁC NHẬN XUẤT KHO & GHI NHẬN CHI PHÍ (F12)]│
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

