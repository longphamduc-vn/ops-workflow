# 03. Đặc Tả Giao Diện Chi Tiết: Bàn Làm Việc LEC & Giải Tỏa Interlock Y/N
> *Trung tâm điều hành của LEC trong Team (Pham Duc Long - 658359): Xử lý Interlock Y/N, Chờ pháp nhân xác nhận, và CheckDisuse*

---

## 1. Vai Trò Nghiệp Vụ Của Màn Hình LEC Workbench

Màn hình là công cụ làm việc chính của nhân sự **LEC trong Team (Pham Duc Long - 658359)**:
1.  **Tiếp nhận yêu cầu**: Gom toàn bộ yêu cầu từ các `Engineer Process` thuộc các `Part` và `Process` trong Team sau khi đã được Leader xác nhận nội bộ.
2.  **Định tuyến Interlock 4 bước tuần tự theo cờ Y/N**:
    *   *Bước 1 (Transfer)*: Gửi lệnh điều chuyển sang pháp nhân khác, hiển thị trạng thái `Chờ pháp nhân xác nhận`.
    *   *Bước 2 (Reject & CheckDisuse)*: Đọc tự động `holdReasonContent` từ `TargetStockSearchList` để hủy các mã khai tử.
    *   *Bước 3 (Internal Repair)*: Đánh giá khả năng sửa chữa phụ tùng `SPR`.
    *   *Bước 4 (Mua thường)*: Mở cờ `stopPoFlag = 'N'` khi đã thỏa mãn điều kiện.
3.  **Chốt kỳ mua sắm tháng**: Phân tách danh sách Trong Target vs Over ngoài kế hoạch để chuẩn bị hồ sơ thẩm định offline với Team Management.

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  BÀN LÀM VIỆC LEC TRONG TEAM — FACTORY HW (SMART WATCH)           [🔔 12 Cần Xử Lý] [👤 Pham Duc Long (LEC - 658359)] │
│ Đơn vị: PO Module Technology Team 2 | Phạm vi: Toàn bộ Part & Process trong Team                   Hệ thống kết nối: EMS Nexacro │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB NGHIỆP VỤ: [📋 HẠNG MỤC CHỜ XỬ LÝ (64)] [⚡ GIẢI TỎA INTERLOCK (28)] [📞 TIẾN ĐỘ PURCHASE (15)] [📅 CHỐT KỲ THÁNG (NGÀY 25)]│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. THANH BỘ LỌC ĐA NĂNG & ĐIỀU PHỐI INTERLOCK:                                                                                   │
│  Lọc Công Đoạn: [ Tất Cả Process (POL..BD) ▼ ]  Phân Loại KH: [ 🔴 Over Ngoài KH (12) ▼ ]  Loại Hàng: [ SPR (Phục hồi) ▼ ]       │
│  Lọc Cờ Interlock: [ 🔴 stopPoFlag == 'Y' (Chặn mua) ▼ ]  Trạng Thái: [ ⏳ Chờ Pháp Nhân Xác Nhận (8) ▼ ]  [🔍 Tìm theo QCode/EM No]│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. BẢNG XỬ LÝ INTERLOCK CHI TIẾT THEO CỜ Y/N (LEC INTERLOCK MATRIX):                                                             │
│ ┌──┬───┬──────────────┬──────────────┬─────────────┬──────────┬──────────┬──────────┬──────────┬─────────────────────────────┐ │
│ │☑ │STT│ Số Quản Lý EM│ Mã QCode     │ Phụ Tùng &  │ Cờ Chặn  │ Transfer │ Disuse   │ Repair   │ Trạng Thái Quy Trình &      │ │
│ │  │   │ (14 Ký Tự)   │ / Mã Tạm     │ Loại Hàng   │ (stopPo) │ (PN Khác)│ (holdRea)│ (SPR)    │ Khuyến Nghị Hành Động       │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 1 │ HWBMTL21EC010│ QDAD12236    │ Board nguồn │ 🔴 Y     │ 🟡 Y (Chờ│ ⚪ N     │ 🟡 Y     │ ⏳ CHỜ PHÁP NHÂN XÁC NHẬN   │ │
│ │  │   │ (Line#201/EC)│ (Mã EMS cũ)  │ TRUMPF (SPR)│          │  PN x/n) │          │ (SPR)    │ SLA: 26h còn lại [Đốc thúc] │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 2 │ HWBMTL22EC010│ QCAD38190    │ Xylanh đôi  │ 🔴 Y     │ ⚪ N     │ 🔴 Y     │ ⚪ N     │ ❌ CHECKDISUSE ĐẶC BIỆT:    │ │
│ │  │   │ (Line#202/EC)│ (Mã EMS cũ)  │ SMC (SP)    │          │          │ (Khai tử)│          │ Có lý do từ TargetStockSearch│ │
│ │  │   │              │              │             │          │          │          │          │ [👁️ Xem Lý Do] [🗑️ HỦY MÃ] │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 3 │ HWBMTL21EC020│ TMP-HW-0104  │ Xylanh trượt│ ⚪ N     │ ⚪ N     │ ⚪ N     │ ⚪ N     │ 🟢 MÃ TẠM ĐỦ ĐIỀU KIỆN      │ │
│ │  │   │ (Line#201/EC)│ (Mã tạm mới) │ SMC (SP)    │          │          │          │          │ Đã có giá Purchase: $220.00 │ │
│ │  │   │              │              │             │          │          │          │          │ [📝 Gửi Tạo QCode EMS]      │ │
│ ├──┼───┼──────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────────────┤ │
│ │☑ │ 4 │ HWBMTL26EC010│ QCAB10960    │ Thanh trượt │ 🔴 Y     │ ⚪ N     │ ⚪ N     │ ⚪ N     │ ✅ ĐỦ ĐIỀU KIỆN MỞ CHẶN     │ │
│ │  │   │ (Line#601/EC)│ (Mã EMS cũ)  │ THK (SP)    │          │          │          │          │ Không vướng điều kiện nào   │ │
│ │  │   │              │              │             │          │          │          │          │ [🔓 MỞ CHẶN MUA THƯỜNG]     │ │
│ └──┴───┴──────────────┴──────────────┴─────────────┴──────────┴──────────┴──────────┴──────────┴─────────────────────────────┘ │
│  Thao tác hàng loạt (4 dòng đã chọn):                                                                                            │
│  [⚡ CHẠY QUÉT TỰ ĐỘNG INTERLOCK TOÀN BỘ]  [🔓 MỞ CHẶN HÀNG LOẠT (DÒNG SẠCH: 18)]  [🗑️ HỦY HÀNG LOẠT CÁC MÃ DISUSE (3 DÒNG)]    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Popup Chi Tiết Lý Do `CheckDisuse` (Trích Xuất `holdReasonContent`)

Khi LEC bấm nút **`[👁️ Xem Lý Do]`** tại dòng số 2 (Mã `QCAD38190`):

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ THẨM TRA ĐẶC BIỆT: PHỤ TÙNG BỊ KHÓA DISUSE TRÊN EMS (QCAD38190)                                          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ THÔNG TIN PHỤ TÙNG & VỊ TRÍ:                                                                              │
│ • Mã Phụ Tùng:    QCAD38190 (Xylanh dẫn hướng đôi khí nén MXQ16-100B, Hãng SMC)                            │
│ • Vị Trí Máy:     HWBMTL22EC0101 (Factory HW > Tầng 2F > Line #202 > Machine EC > Unit 01 > Assy 01)       │
│ • Nguồn Dữ Liệu:  API /emsspareparts/sp302/sp330Nav/TargetStockSearchList.lgdn                             │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ NGUYÊN VĂN NỘI DUNG LÝ DO TỪ HỆ THỐNG EMS (TRƯỜNG holdReasonContent):                                      │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ "Linh kiện MXQ16-100B bị cấm thay thế theo Chỉ thị Chất lượng HQ số 601 ban hành ngày 01/09/2026 do     │ │
│ │ phát hiện lỗi rò khí ở áp suất 0.6MPa làm lệch đầu gắp bonding. Yêu cầu chuyển đổi sang model thay thế   │ │
│ │ MXQ16-100B-X11 hoặc tạo mã tạm TMP-HW-xxxx để khảo sát giải pháp mới."                                │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ HÀNH ĐỘNG CỦA LEC:                                                                                        │
│ [ Lập tức từ chối yêu cầu mua mã cũ này. Đã thông báo cho Kỹ sư chuyển sang mã cải tiến MXQ16-100B-X11.  ] │
│                                                                                                            │
│ [↩️ Đóng Cửa Sổ]                 [📝 Tạo Mã Tạm Thay Thế TMP-HW-xxxx]                 [❌ HỦY HẠNG MỤC NÀY] │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
