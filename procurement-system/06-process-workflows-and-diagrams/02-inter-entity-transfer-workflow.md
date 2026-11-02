# 02. Sơ Đồ Quy Trình: Điều Chuyển Liên Pháp Nhân & Chờ Xác Nhận

## 1. Lưu Đồ Chi Tiết Quy Trình Bước 1 Interlock (Transfer)

```mermaid
flowchart TD
    Start["Hạng mục có cờ transferFlag == 'Y'"] --> CheckEntity{"Kho đối ứng thuộc\npháp nhân nào?"}
    
    CheckEntity -->|"Cùng pháp nhân tại VN\n(Kho H1, H2, H3)"| IntraTransfer["Tạo phiếu điều chuyển nội bộ\nThực hiện xuất - nhập kho trong ngày"]
    
    CheckEntity -->|"Khác pháp nhân\n(LGD Hàn Quốc, LGD Trung Quốc...)"| InterEntity["Khởi tạo yêu cầu chuyển giao liên pháp nhân\n(retPartsTransferReqList.lgdn)"]
    
    InterEntity --> StatusWait["Chuyển trạng thái hạng mục:\n⏳ PENDING_OTHER_ENTITY_CONFIRMATION\n(Bật đồng hồ đếm SLA: 48h làm việc)"]
    
    StatusWait --> WaitConfirm{"Pháp nhân khác xử lý thế nào?"}
    
    WaitConfirm -->|"1. Xác nhận chuyển giao thành công ('Y')"| Success["Pháp nhân bạn làm thủ tục xuất khẩu\nCập nhật mã vận đơn / ETA ngày về kho HW\n➔ ĐÓNG NHU CẦU MUA NGOÀI"]
    
    WaitConfirm -->|"2. Thông báo hoãn / vướng hải quan liên quốc gia"| Delayed["Hệ thống lưu biên bản giải trình vướng mắc hải quan\n➔ CHUYỂN TIẾP SANG BƯỚC 2: REJECT & DISUSE"]
    
    WaitConfirm -->|"3. Quá thời hạn SLA 48h chưa phản hồi"| Timeout["Cảnh báo quá hạn\nLEC liên hệ trực tiếp đầu mối pháp nhân\nNếu ảnh hưởng dừng máy Smart Watch ➔ CHUYỂN BƯỚC 2"]
```

### Điểm nhấn pháp lý quan trọng:
- Pháp nhân sở hữu kho **không có quyền từ chối lệnh chuyển giao của tập đoàn**.
- Phiếu điều chuyển chỉ chuyển trạng thái hoặc chuyển sang mua mới khi có xác nhận chính thức về rào cản logistics xuất nhập khẩu hoặc kiểm kê thực tế thiếu hụt từ pháp nhân đó.

