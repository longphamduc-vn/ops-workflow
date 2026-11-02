# 07. Đặc Tả Giao Diện Chi Tiết: Trình Duyệt Trực Quan Cây Thiết Bị EBOM
> *Khám phá cấu trúc phả hệ thiết bị 6 cấp tích hợp bộ giải mã EM No 14 ký tự (HWBMTL21EC0101)*

---

## 1. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  TRÌNH DUYỆT CÂY THIẾT BỊ EBOM — FACTORY HW (SMART WATCH)                            [🔍 Tìm nhanh theo EM No/QCode] │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ KHUNG TÌM KIẾM & BỘ GIẢI MÃ EM NO:                                                                                              │
│ [ HWBMTL21EC0101                    ] [⚡ GIẢI MÃ & BUNG CÂY] ➔ 🟢 ĐÃ KHỚP: Line #201 > Machine EC > Unit 01 > Assembly 01       │
├──────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────┤
│ KHUNG TRÁI: CÂY PHÂN CẤP THIẾT BỊ    │ KHUNG PHẢI: CHI TIẾT CỤM LẮP RÁP & DANH MỤC PHỤ TÙNG (ASSEMBLY 01)                       │
│ (COLLAPSIBLE TREE VIEW)              │                                                                                           │
│ 📁 Factory HW (Smart Watch)          │ Tên Cụm Lắp Ráp: Cụm Xylanh Trượt Đầu Gắp (Bonding Head Slide Assembly)                   │
│   ├── 📁 Floor 2F (Tầng 2)           │ Mã Số Quản Lý EM: [ HWBMTL21EC0101 ]       Công Đoạn: DB (Die Bonding)                    │
│   │   ├── 📁 Line #201 (Hex: 1)      │ Vị Trí Lắp Đặt:   Line #201, Máy EC, Cụm 01 (Bonding Head), Cụm Lắp Ráp 01                 │
│   │   │   └── 📁 Process: DB         │ ───────────────────────────────────────────────────────────────────────────────────────── │
│   │   │       ├── 📁 Machine: EC     │ DANH MỤC PHỤ TÙNG LẮP ĐẶT TRONG CỤM NÀY (BOM PARTS LIST):                                 │
│   │   │       │   ├── 📂 Unit: 01    │ ┌──┬────────────┬─────────────────────────────┬──────┬─────┬───────────┬────────┬──────────┐ │
│   │   │       │   │   ├── 📌 Assy: 01│ │ST│ Mã QCode   │ Tên Phụ Tùng & Maker        │ Loại │ ĐVT │ SL Lắp/Máy│ Tuổi   │ Hành Động│ │
│   │   │       │   │   │   (Đang chọn)│ │  │ / Mã Tạm   │                             │ Hàng │     │ (Qty/Mach)│ Thọ ĐM │          │ │
│   │   │       │   │   └── 📌 Assy: 02│ ├──┼────────────┼─────────────────────────────┼──────┼─────┼───────────┼────────┼──────────┤ │
│   │   │       │   └── 📂 Unit: 02    │ │1 │ QDAD12236  │ Board nguồn CPX V4 Trumpf   │ SPR  │ EA  │ 1 EA      │15,000h │ [🛒 Mua] │ │
│   │   │       │       └── 📌 Assy: 01│ │  │ (Mã EMS cũ)│ TRUMPF (Đức)                │      │     │           │        │ [📐 CAD] │ │
│   │   │       └── 📁 Machine: DB-02  │ ├──┼────────────┼─────────────────────────────┼──────┼─────┼───────────┼────────┼──────────┤ │
│   │   ├── 📁 Line #202 (Hex: 2)      │ │2 │ QCAD38190  │ Xylanh dẫn hướng đôi 16-100 │ SP   │ EA  │ 2 EA      │1,000,00│ [🛒 Mua] │ │
│   │   └── 📁 Line #210 (Hex: A)      │ │  │ (Mã EMS cũ)│ SMC CORPORATION             │      │     │           │chu kỳ  │ [📐 CAD] │ │
│   └── 📁 Floor 6F (Tầng 6)           │ └──┴────────────┴─────────────────────────────┴──────┴─────┴───────────┴────────┴──────────┘ │
│       ├── 📁 Line #601 (Hex: 1)      │ ───────────────────────────────────────────────────────────────────────────────────────── │
│       └── 📁 Line #604 (Hex: 4)      │ XEM TRƯỚC BẢN VẼ FDM CAD 3D TRỰC TUYẾN:                                                   │
│                                      │ [ 📐 Khung hiển thị mô hình 3D xoay lật linh kiện: FDM_QDAD12236_3D_Model.dwg ]           │
└──────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────┘
```

