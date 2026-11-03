# 02. Sơ Đồ Quy Trình: Giao Dịch Liên Pháp Nhân (Chuyển Giao Tồn Kho & Mua Giá Thấp Nhất)
> *Chuẩn Hóa 2 Nhánh Giao Dịch Liên Pháp Nhân, Cơ Chế Chờ Xác Nhận Y/N, Điều Kiện Bắt Buộc Có QCode & Kích Hoạt Sau Thẩm Định Đầu Tháng*

---

## 1. Lưu Đồ Chi Tiết 2 Nhánh Giao Dịch Liên Pháp Nhân

```mermaid
flowchart TD
    Start["Hạng mục cần xử lý Liên Pháp Nhân\n(Sau khi kiểm tra Interlock stopPoFlag == 'Y')"] --> HasQCode{"Đã Có Mã QCode Chính Thức?"}
    
    HasQCode -->|"Chưa có (Mã tạm TMP)"| HoldData["Chuẩn bị dữ liệu CAD/Doc/ảnh\nLEC đăng ký QCode ERP trước"]
    HoldData --> HasQCode
    
    HasQCode -->|"Đã có QCode chuẩn"| SelectRoute{"Lựa chọn Phương Án Giao Dịch"}
    
    SelectRoute -->|"Phương Án 1: Chuyển Giao Tồn Kho"| TransferRoute["Yêu cầu Transfer Tồn Kho Nhàn Rỗi\n(LGD HQ, Nanjing, Guangzhou...)"]
    SelectRoute -->|"Phương Án 2: Mua Với Giá Thấp Nhất"| BuyCheapRoute["Ủy thác Pháp Nhân Bạn Mua Hộ\n(Hợp đồng khung giá thấp nhất)"]
    
    TransferRoute --> SendReq1["Gửi Request qua API retPartsTransferReqList"]
    BuyCheapRoute --> SendReq2["Gửi Request qua API retOtherSitePoRevReqList\n(Nếu bị khóa: xử lý tương tự Transfer)"]
    
    SendReq1 --> StatusWait["Chuyển trạng thái:\n⏳ PENDING_OTHER_ENTITY_CONFIRMATION\n(Đồng hồ đếm SLA: 48h làm việc)"]
    SendReq2 --> StatusWait
    
    StatusWait --> WaitConfirm{"Pháp nhân bạn phản hồi (Y/N)?"}
    
    WaitConfirm -->|"1. Xác nhận thành công ('Y')"| PassHold["Hạng mục được đưa vào Danh Sách Chờ Thẩm Định\n(Họp Thẩm Định Đầu Tháng với Cost Management)"]
    
    WaitConfirm -->|"2. Không giao được / vướng thủ tục ('N')"| StepNext["CHUYỂN TIẾP SANG BƯỚC INTERLOCK TIẾP THEO\n(Kiểm tra CheckDisuse ➔ Kiểm tra Sửa chữa SPR)"]
    
    WaitConfirm -->|"3. Quá hạn SLA 48h"| Timeout["Cảnh báo quá hạn\nLEC ghi chú lý do và mở khóa chuyển bước"]
    
    PassHold --> AuditEarlyMonth{"Phiên Thẩm Định Đầu Tháng Thông Qua?"}
    
    AuditEarlyMonth -->|"Được Thẩm Định Thông Qua"| ExecAction["LEC TẠO ĐƠN PRV TRÊN EMS ĐỂ KÝ DUYỆT CHÍNH THỨC\n(EMS phê duyệt xong mới phát hành đơn/vận chuyển)"]
    AuditEarlyMonth -->|"Bác Bỏ / Hoãn"| CancelAction["Hủy hoặc điều chỉnh kế hoạch kỳ sau"]
```

---

## 2. Đặc Tả Nghiệp Vụ & Ràng Buộc Tuần Tự

### 2.1. Phân Biệt Rõ Ràng Hai Nhánh
1.  **Chuyển Giao Tồn Kho (Inventory Transfer)**:
    - Áp dụng khi phụ tùng đang nằm sẵn trong kho của pháp nhân bạn dưới dạng tồn kho an toàn vượt mức hoặc phụ tùng nhàn rỗi.
    - Tiết kiệm 100% chi phí mua mới từ nhà cung cấp bên ngoài.
2.  **Mua Với Giá Thấp Nhất Từ Pháp Nhân Khác (Lowest-Cost Proxy Purchase)**:
    - Áp dụng khi nhà cung cấp ngoài bán cùng một linh kiện cho LGD Hàn Quốc hoặc Trung Quốc với đơn giá rẻ hơn so với báo giá cho LGD Việt Nam.
    - Nếu kênh mua qua pháp nhân bạn cũng bị khóa hệ thống: Quy trình xử lý tương tự lệnh Transfer (gửi yêu cầu đối tác xác nhận, chờ phản hồi trong vòng 48h).

### 2.2. Điều Kiện Kích Hoạt Bắt Buộc: Sau Khi Thẩm Định Đầu Tháng
> ⚠️ **RÀNG BUỘC PHÊ DUYỆT & PHÁP LÝ**:  
> Dù pháp nhân bạn đã phản hồi đồng ý chuyển giao hoặc mua hộ (`status == 'CONFIRMED'`), **tuyệt đối không được phát hành lệnh xuất kho hay ký đơn trước phiên Thẩm Định Đầu Tháng với Bộ Phận Quản Lý Chi Phí (Cost Management - Reviewer & Assistant là 1 người)**.  
> Sau khi thẩm định offline thông qua, LEC mới tiến hành tạo PRV trên EMS để các cấp lãnh đạo ký duyệt chính thức. Mọi giao dịch chỉ có hiệu lực khi EMS hoàn tất phê duyệt.
