# 03. Công Cụ Gom & Xử Lý Hàng Loạt Của LEC Theo Trạng Thái (Batch Interlock Resolver)
> *Gom Hạng Mục Từ Các Kỹ Sư Ngang Hàng Trong Team, Quét Interlock, Thiết Lập Hạn Deadline, Lọc Mã Đủ Điều Kiện (Bắt Buộc Có QCode) Đưa Vào Thẩm Định Đầu Tháng & LEC Đánh Dấu Target/Over Thủ Công*

---

## 1. Nhu Cầu & Kiến Trúc Gom Nhóm Đồng Loại Của LEC

Mỗi kỳ mua sắm tại phân xưởng Smart Watch (Factory HW), LEC trong Team (Pham Duc Long - 658359) phải tiếp nhận và xử lý hàng trăm yêu cầu từ các kỹ sư hiện trường trong Team (các kỹ sư ngang hàng, không phân chia cấp bậc công đoạn).

Hệ thống cung cấp **Module Gom & Xử Lý Đồng Loạt (Status-based Batch Aggregator & Resolver)** với các nguyên tắc cốt lõi:
1.  **Gom Tất Cả Hạng Mục Đăng Ký Trong Team**: Tập trung toàn bộ danh sách phụ tùng kỹ sư tạo về một hàng đợi duy nhất của Team.
2.  **Tự Động Phân Nhóm Cùng Trạng Thái (Status Grouping)**:
    - *Nhóm 1: Mới đăng ký (Cần quét Interlock 4 bước)*.
    - *Nhóm 2: Cảnh báo tồn kho (`agingInterlockFlag` == 'Y')*: Cảnh báo tồn kho lâu ngày (có thể là tồn kho của Team khác). Kỹ sư phải làm thủ tục mượn/xuất dùng; task duy trì liên tục cho đến khi EMS đồng bộ `'N'`.
    - *Nhóm 3: Kiểm tra cờ giá (`unitPriceFlag`)*: Phân tách rõ mã đã có giá hợp đồng (`Y`) vs mã chưa có giá (`N` - cần Purchase RFQ).
    - *Nhóm 4: Đủ điều kiện thẩm định đầu tháng (Purchasable)* $\rightarrow$ Bắt buộc **phải có Mã QCode chính thức** (mã tạm `TMP-HW-xxxx` bị giữ lại hàng đợi chuẩn bị dữ liệu).
    - *Nhóm 5: Chờ Xác Nhận Liên Pháp Nhân* (Điều chuyển kho hoặc Mua giá thấp nhất tại LGD HQ/Guangzhou).
    - *Nhóm 6: Bất Thường / Ngừng Sản Xuất (EOL)* $\rightarrow$ LEC thẩm tra kỹ thuật và phản hồi kỹ sư.
3.  **Quy Định Thời Hạn (Deadlines Do LEC Cấu Hình)**:
    - Hạn chót kỹ sư nộp giải trình tồn kho đầu tháng.
    - Hạn chót đóng danh sách chốt hồ sơ thẩm định đầu tháng.
4.  **Thẩm Quyền Đánh Dấu Kế Hoạch Của LEC (Không Tự Động)**:
    - LEC trực tiếp rà soát và **thủ công đánh dấu `[TRONG TARGET]` hay `[OVER PHÁT SINH]`**. Hệ thống tuyệt đối không tự động phân loại.

---

## 2. Giao Diện Bàn Làm Việc Gom Nhóm & Xử Lý Hàng Loạt Của LEC

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  BÀN LÀM VIỆC GOM VÀ XỬ LÝ HẠNG MỤC THEO TRẠNG THÁI (MULTI-LEC WORKBENCH)       [Team: HW Smart Watch 1]   [⚡ QUÉT INTERLOCK]   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  CẤU HÌNH THỜI HẠN (DEADLINE DO LEC QUY ĐỊNH):                                                                                  │
│  📅 Hạn Chót Kỹ Sư Giải Trình Tồn Kho: [ 03 hàng tháng - 17:00 ]   📅 Hạn Đóng Hồ Sơ Thẩm Định Đầu Tháng: [ 05 hàng tháng - 12:00 ]│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  TAB PHÂN NHÓM TRẠNG THÁI:                                                                                                       │
│  [🔘 Tất Cả (184)] [⏳ Mới Đăng Ký (42)] [⚠️ Cảnh Báo Tồn Kho (18)] [🟢 Đủ ĐK Thẩm Định (85)] [🌐 Liên Pháp Nhân (23)] [🏷️ EOL (16)]│
├────┬────────────┬─────────────────────────────┬───────────┬──────────────┬─────────────┬──────────────┬─────────────┬──────────────┤
│STT │Mã Hạng Mục │Tên Phụ Tùng & Maker         │Định Vị Máy│Trạng Thái    │Interlock &  │Phân Loại LEC │Lộ Trình Xử  │Hành Động     │
│    │/ QCode     │(Kỹ sư hiện trường tạo)      │Line / VịTrí│Hệ Thống     │Tồn / Giá    │(Thủ Công)    │Lý Tiếp Theo │Của LEC       │
├────┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ 1  │PR-2611-001 │Cảm biến quang vuông         │Line #201  │🟢 ĐỦ ĐK      │agingFlag: N │[🔘 TRONG     │Đưa vào Thẩm │[✅ Gom Vào   │
│    │QDAB03583   │Maker: Panasonic / Model: CN │Die Bonder │   THẨM ĐỊNH  │unitPrice: Y │ TARGET]      │định ĐẦU     │ Thẩm Định]   │
│    │(QCode Chuẩn│Kỹ sư: Nguyễn Văn Thắng      │           │(Có QCode)    │(Đã có giá)  │              │ THÁNG       │              │
├────┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ 2  │PR-2611-002 │Board nguồn CPX V4 Controls  │Line #202  │🟢 ĐỦ ĐK      │agingFlag: N │[🔘 OVER      │Đưa vào Thẩm │[✅ Gom Vào   │
│    │QDAD12236   │Maker: Trumpf / Model: 291214│Laser Cut  │   THẨM ĐỊNH  │unitPrice: Y │ PHÁT SINH]   │định ĐẦU     │ Thẩm Định]   │
│    │(QCode Chuẩn│Kỹ sư: Trần Đức Minh         │           │(Có QCode)    │(Đã có giá)  │Lý do: OVR-01 │ THÁNG       │              │
│    │            │↳ Kỹ sư ghi chú: Cháy nổ do xung điện lưới (WO-248926091)   ➔ LEC gắn cờ OVER vì ngoài định mức hao mòn định kỳ │
├────┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ 3  │PR-2611-003 │Xylanh kẹp SMC khí nén       │Line #201  │⚠️ CẢNH BÁO   │agingFlag: Y │—             │Kỹ sư phải   │[🔔 Nhắc Kỹ Sư│
│    │QCAD38190   │Maker: SMC / Model: MHZ2-16D │Tester     │   TỒN KHO    │(Tồn Team 2) │(Chưa xét     │làm thủ tục  │ Mượn Tồn]    │
│    │(QCode Chuẩn│Kỹ sư: Lê Hoàng Quân         │           │(Team khác)   │unitPrice: Y │ Target/Over) │mượn xuất kho│              │
├────┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ 4  │PR-2611-004 │Bộ điều tốc Driver Motor     │Line #203  │⏳ CHỜ QCODE  │agingFlag: N │—             │LEC nộp dữ   │[📤 Đăng Ký   │
│    │TMP-HW-0105 │Maker: Omron / Model: R88D   │Bonding    │(Mã Tạm)      │unitPrice: N │(Chưa xét     │liệu kỹ thuật│ QCode ERP]   │
│    │(MÃ TẠM)    │Kỹ sư: Vũ Quốc Huy (Nộp CAD) │           │CHƯA THẨM ĐỊNH│(Chờ RFQ)    │ Target/Over) │lên ERP/EMS  │              │
└────┴────────────┴─────────────────────────────┴───────────┴──────────────┴─────────────┴──────────────┴─────────────┴──────────────┘
  ➔ Thao tác hàng loạt theo nhóm đang chọn: 
  [📦 GOM TOÀN BỘ 85 MÃ ĐỦ ĐK CHUYỂN THẨM ĐỊNH ĐẦU THÁNG]   [⚡ ĐÁNH DẤU TRONG TARGET]   [🔔 GỬI CẢNH BÁO TASK TỒN KHO]
```

---

## 3. Quy Trình 3 Bước Xử Lý Đồng Loạt Cho Nhóm "Đủ Điều Kiện Thẩm Định"

1.  **Bước 1: Quét Lọc Trạng Thái & Điều Kiện Tiên Quyết**:
    - LEC bấm chọn tab `[🟢 Đủ ĐK Thẩm Định Đầu Tháng]`.
    - **Điều kiện bất di bất dịch**: Hạng mục **bắt buộc phải có Mã QCode chính thức** trên hệ thống ERP/EMS. Nếu chỉ có mã tạm `TMP-HW-xxxx`, hệ thống lập tức loại khỏi danh sách thẩm định và chuyển vào hàng đợi đăng ký QCode.
    - Mã không bị cờ Interlock chặn (`stopPoFlag == 'N'`).
    - Nếu có cờ tồn kho (`agingInterlockFlag == 'Y'`), kỹ sư phải hoàn thành mượn/xuất kho trước, EMS cập nhật sang `'N'` mới được mua bổ sung.

2.  **Bước 2: Đối Soát Ngân Sách & Đánh Dấu Kế Hoạch Thủ Công (LEC Phân Loại)**:
    - LEC xem xét từng hạng mục:
      * Với phụ tùng tiêu hao định kỳ nằm trong kế hoạch chi phí: LEC đánh dấu `[TRONG TARGET]`.
      * Với phụ tùng hư hỏng đột xuất, sự cố bất thường hoặc vượt hạn mức ngân sách: LEC đánh dấu `[OVER PHÁT SINH]` và chỉ định mã nguyên nhân (`OVR-01` đến `OVR-06`).
    - LEC kiểm tra cờ `unitPriceFlag`: Nếu `'N'` (chưa có giá hợp đồng), LEC ghi chú cần Purchase đàm phán RFQ song song.

3.  **Bước 3: Đóng Gói Hồ Sơ Trình Thẩm Định Đầu Tháng (Cost Management Review)**:
    - Đúng thời hạn Deadline do LEC thiết lập (Đầu tháng), LEC bấm `[📦 GOM TOÀN BỘ VÀO BÁO CÁO THẨM ĐỊNH ĐẦU THÁNG]`.
    - Hệ thống đóng băng dữ liệu của nhóm này, khóa chỉnh sửa tạm thời và tự động kết xuất hồ sơ thẩm định gửi sang **Bàn Thẩm Định Của Bộ Phận Quản Lý Chi Phí (Cost Management Portal - Reviewer & Assistant là 1 người)**.
    - Nếu Reviewer yêu cầu làm rõ, LEC sẽ nhập yêu cầu lên hệ thống gửi cho kỹ sư, nhận phản hồi từ kỹ sư, rồi tổng hợp phản hồi lại cho Reviewer trước khi tiến hành tạo PRV/PO trên EMS.
