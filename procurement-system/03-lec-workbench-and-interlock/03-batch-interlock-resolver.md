# 03. Công Cụ Gom & Xử Lý Interlock Hàng Loạt Theo Trạng Thái (Batch Interlock Resolver)
> *Gom Hạng Mục Từ Các Kỹ Sư Process, Phân Nhóm Cùng Trạng Thái Xử Lý Đồng Loạt, Lọc Mã "Có Thể Mua" Đưa Vào Thẩm Định & Đánh Dấu Target/Over*

---

## 1. Nhu Cầu & Kiến Trúc Gom Nhóm Đồng Loại Của LEC

Mỗi kỳ mua sắm định kỳ tại phân xưởng, LEC trong Team phải quản lý hàng trăm yêu cầu đăng ký từ nhiều Kỹ sư Quy trình (`Engineer Process`) thuộc các công đoạn khác nhau (POL, TAB, DIP, LT, DB, BD...). Nếu xử lý rải rác từng yêu cầu đơn lẻ sẽ gây chậm trễ nghiêm trọng và đứt gãy tiến độ.

Hệ thống cung cấp **Module Gom & Xử Lý Đồng Loạt (Status-based Batch Aggregator & Resolver)**:
1.  **Gom Tất Cả Hạng Mục Đăng Ký Trong Team**: Tập trung toàn bộ phiếu yêu cầu từ các kỹ sư về một hàng đợi duy nhất của Team.
2.  **Tự Động Phân Nhóm Cùng Trạng Thái (Status Grouping)**:
    - *Nhóm 1: Mới đăng ký (Cần chạy quét Interlock)*.
    - *Nhóm 2: Trạng thái Có Thể Mua (Purchasable)* $\rightarrow$ Gom lại toàn bộ để trình Thẩm định ngày 25.
    - *Nhóm 3: Chờ Xác Nhận Liên Pháp Nhân* (Tách rõ 2 nhánh: Điều chuyển kho hoặc Mua giá thấp nhất).
    - *Nhóm 4: Bất Thường / Ngừng Sản Xuất (EOL)* $\rightarrow$ LEC thẩm tra và phản hồi lại Requestor.
    - *Nhóm 5: Khóa Interlock / Disuse (Khai tử)* $\rightarrow$ Bác bỏ và thông báo lý do chính thức.
3.  **Thẩm Quyền Đánh Dấu Kế Hoạch Của LEC**:
    - Dựa trên lý do và hiện trạng kỹ sư đã cung cấp, LEC là người **chính thức bấm chọn `TRONG TARGET` hay `OVER NGOÀI KẾ HOẠCH`** trước khi gom danh sách đưa vào Thẩm định.

---

## 2. Giao Diện Bàn Làm Việc Gom Nhóm & Xử Lý Hàng Loạt Của LEC

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  BÀN LÀM VIỆC GOM VÀ XỬ LÝ HẠNG MỤC THEO TRẠNG THÁI (MULTI-LEC WORKBENCH)       [Team: HW Smart Watch 1]   [⚡ QUÉT INTERLOCK]   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  TAB PHÂN NHÓM TRẠNG THÁI:                                                                                                       │
│  [🔘 Tất Cả (184)]  [⏳ Mới Đăng Ký (42)]  [🟢 Có Thể Mua (95)]  [🌐 Liên Pháp Nhân (31)]  [⚠️ EOL / Disuse (16)]                │
├────┬────────────┬─────────────────────────────┬───────────┬──────────────┬─────────────┬──────────────┬─────────────┬──────────────┤
│STT │Mã Hạng Mục │Tên Phụ Tùng & Maker         │Công Đoạn  │Trạng Thái    │Interlock    │Đánh Dấu Phân │Lộ Trình Xử  │Hành Động     │
│    │/ QCode     │(Engineer Process đăng ký)   │& Tên Máy  │Hệ Thống      │(stopPoFlag) │Loại Kế Hoạch │Lý Tiếp Theo │Của LEC       │
├────┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ 1  │PR-2611-001 │Cảm biến quang vuông         │DB         │🟢 CÓ THỂ MUA │🟢 N         │[🔘 TRONG     │Đưa vào Thẩm │[✅ Gom Vào   │
│    │QDAB03583   │Maker: Panasonic / Model: CN │Máy: DB-01 │(Purchasable) │             │ TARGET]      │định ngày 25 │ Thẩm Định]   │
│    │            │Kỹ sư: Nguyễn Văn Thắng (DB) │           │              │             │              │             │              │
├────┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ 2  │PR-2611-002 │Board nguồn CPX V4 Controls  │DB         │🟢 CÓ THỂ MUA │🟢 Đã mở khóa│[🔘 OVER      │Đưa vào Thẩm │[✅ Gom Vào   │
│    │QDAD12236   │Maker: Trumpf / Model: 291214│Máy: DB-01 │(Purchasable) │(stopPo = N) │ NGOÀI KH]    │định ngày 25 │ Thẩm Định]   │
│    │            │↳ Kỹ sư: Hỏng sét đánh (WO-248926091) ➔ LEC đánh dấu OVER do ngoài định mức │Lý do: OVR-01 │ kèm giải trình│
├────┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ 3  │PR-2611-003 │Xylanh trượt dẫn hướng SMC   │TAB        │🌐 LIÊN PHÁP  │🔴 Y (Bị khóa│[🔘 TRONG     │Nhánh: Mua   │[📤 Gửi Yêu   │
│    │QCAD38190   │Maker: SMC / Model: MXQ16-100│Máy: TAB-02│   NHÂN       │ kênh mua VN)│ TARGET]      │giá rẻ nhất  │ Cầu Mua Hộ]  │
│    │            │Kỹ sư: Lê Hoàng Quân (TAB)   │           │(Chờ LGD xác) │             │              │tại LGD HQ   │              │
├────┼────────────┼─────────────────────────────┼───────────┼──────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ 4  │PR-2611-004 │Bộ điều khiển servo Driver   │POL        │⚠️ NGỪNG SẢN  │⚪ N         │—             │EMS báo ACTIVE│[🏷️ Gắn EOL & │
│    │QCAB99120   │Maker: Omron / Model: R88D   │Máy: POL-01│   XUẤT (EOL) │(EMS Active) │              │nhưng hãng đã │ Phản Hồi REQ]│
│    │            │Kỹ sư: Trần Đức Minh (POL)   │           │              │             │              │ngừng bán    │              │
└────┴────────────┴─────────────────────────────┴───────────┴──────────────┴─────────────┴──────────────┴─────────────┴──────────────┘
  ➔ Thao tác hàng loạt theo nhóm đang chọn: 
  [📦 GOM TOÀN BỘ 95 MÃ 'CÓ THỂ MUA' CHUYỂN THẨM ĐỊNH NGÀY 25]   [⚡ ĐÁNH DẤU TRONG TARGET ĐỒNG LOẠT]   [📤 GỬI TRANSFER ĐỒNG LOẠT]
```

---

## 3. Quy Trình 3 Bước Xử Lý Đồng Loạt Cho Nhóm "Có Thể Mua" (Purchasable)

1.  **Bước 1: Quét Lọc Trạng Thái**:
    - LEC bấm chọn tab `[🟢 Có Thể Mua (Purchasable)]`.
    - Danh sách này chỉ chứa các mã:
      - Mã không bị cờ Interlock chặn (`stopPoFlag == 'N'`).
      - Hoặc các mã đã được LEC xử lý mở khóa Interlock hợp lệ (sau khi kiểm tra SPR / điều chuyển).
2.  **Bước 2: Đối Soát Ngân Sách & Đánh Dấu Kế Hoạch (Target / Over)**:
    - LEC duyệt lướt các dòng, kiểm tra lý do và hiện trạng kỹ sư quy trình đã nhập.
    - Với các mã thay thế định kỳ nằm trong hạn mức: LEC giữ nguyên `TRONG TARGET`.
    - Với các mã sự cố đột xuất hoặc vượt hạn mức: LEC bấm chọn `OVER NGOÀI KẾ HOẠCH` và xác nhận mã nguyên nhân (`OVR-01` đến `OVR-06`).
3.  **Bước 3: Gom Gói Hồ Sơ Trình Thẩm Định Ngày 25**:
    - Bấm nút `[📦 GOM TOÀN BỘ VÀO BÁO CÁO THẨM ĐỊNH NGÀY 25]`.
    - Hệ thống đóng băng dữ liệu của nhóm này, khóa chỉnh sửa tạm thời và tự động đẩy dữ liệu sang **Bàn Thẩm Định Offline Của Ban Quản Lý (Executive Management Audit Portal)**.
    - Mọi lệnh phát hành PO hoặc xuất kho chuyển giao đều bị khóa cho đến khi Thẩm định hoàn tất đóng mộc phê duyệt.


