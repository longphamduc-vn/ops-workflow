# 03. Công Cụ Giải Tỏa Interlock Hàng Loạt (Batch Interlock Resolver)

## 1. Nhu Cầu & Kiến Trúc Tự Động Hóa

Mỗi kỳ mua sắm định kỳ tại Factory HW, LEC phải đối mặt với danh sách từ 200 đến 500 phụ tùng cần kiểm tra Interlock. Việc click từng dòng thủ công trên giao diện EMS cũ là bất khả thi.

Hệ thống xây dựng **Batch Interlock Resolver Workbench**:
- Tích hợp trực tiếp với pipeline ngầm [`procurement-rfq-stock-optimization.yml`](file://wsl.localhost/Ubuntu/home/longp/projects/ops-workflow/services/ops-workflow/workflows/procurement-rfq-stock-optimization.yml) của `ops-workflow`.
- Chạy song song 11 bước truy vấn và logic đánh giá cờ Y/N cho hàng trăm mã cùng lúc.

---

## 2. Giao Diện Bàn Làm Việc Hàng Loạt Của LEC

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  BÀN LÀM VIỆC GIẢI TỎA INTERLOCK HÀNG LOẠT (LEC WORKBENCH)                        [🔘 Chọn tất cả (124 dòng)]   [⚡ CHẠY QUÉT NHANH]│
├────┬────────────┬─────────────────────────────┬───────────┬──────────────┬─────────────┬──────────────┬─────────────┬──────────────┤
│ STT│ Mã QCode   │ Tên Phụ Tùng                │ Công Đoạn │ Cờ Chặn Mua  │ Cờ Transfer │ Cờ Disuse    │ Cờ Repair   │ Khuyến Nghị  │
│    │ / Mã Tạm   │                             │ & Máy     │ (stopPoFlag) │ (Pháp nhân) │ (holdReason) │ (SPR)       │ Hành Động    │
├────┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ 1  │ QDAB03583  │ Cảm biến quang vuông        │ DB / DB-01│ 🟢 N         │ ⚪ N        │ ⚪ N         │ ⚪ N        │ ✅ Mua Thường│
│ 2  │ QDAD12236  │ Board nguồn CPX V4 Trumpf   │ DB / DB-01│ 🔴 Y         │ 🟡 Y (Chờ PN│ ⚪ N         │ 🟡 Y (SPR)  │ ⏳ Chờ PN x/n│
│ 3  │ QCAD38190  │ Xylanh dẫn hướng đôi SMC    │ TAB/TAB-02│ 🔴 Y         │ ⚪ N        │ 🔴 Y (Khai tử│ ⚪ N        │ ❌ Bấm Reject│
│    │            │ ↳ Lý do trích xuất: "Ngừng sử dụng theo chỉ thị HQ-601 từ 01/09/2026"                                          │
│ 4  │ QCAB10960  │ Thanh trượt LM Guide THK    │ POL/POL-01│ 🔴 Y         │ ⚪ N        │ ⚪ N         │ 🟡 Y (SPR)  │ 🔧 Tạo Lệnh S│
└────┴────────────┴─────────────────────────────┴───────────┴──────────────┴─────────────┴──────────────┴─────────────┴──────────────┘
  ➔ Thao tác hàng loạt: [⚡ Ký Duyệt Mở Chặn Hàng Loạt (85 dòng sạch)]  [📤 Gửi Lệnh Điều Chuyển (25 dòng)]  [🗑️ Hủy Hàng Loạt Disuse (5 dòng)]
```

### Lợi ích thực tế:
- Tự động tách nhóm các dòng sạch (không bị cờ nào chặn) để LEC ký duyệt mở mua thường hàng loạt chỉ bằng 1 cú click.
- Tự động hiển thị nổi bật các dòng bị `CheckDisuse` kèm nguyên văn lý do từ `holdReasonContent` để không bao giờ duyệt nhầm hàng phế.

