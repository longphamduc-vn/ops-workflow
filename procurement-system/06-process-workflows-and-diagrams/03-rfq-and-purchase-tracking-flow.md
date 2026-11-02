# 03. Sơ Đồ Quy Trình: Khảo Sát Báo Giá & Phối Hợp Thủ Công Với Purchase

## 1. Lưu Đồ Chi Tiết Vòng Đời Báo Giá (RFQ Flow)

Do EMS hoàn toàn không quản lý các bước đàm phán trung gian của Bộ phận Mua Hàng (Purchase), luồng thông tin vận hành như sau:

```mermaid
flowchart TD
    subgraph S1["1. Khởi Tạo Yêu Cầu Báo Giá"]
        Item["Phụ tùng chưa có đơn giá hợp lệ\n(Chưa đăng ký giá trên EMS hoặc dùng mã tạm TMP-HW-xxxx)"]
        Item --> LEC_Send["LEC xuất phiếu Request RFQ\nGửi danh mục sang chuyên viên Purchase"]
        LEC_Send --> SystemLog["LEC nhập ngày gửi RFQ lên hệ thống:\nrequest_rfq_date"]
    end

    subgraph S2["2. Giai Đoạn Đàm Phán Thương Mại (Purchase Phụ Trách)"]
        SystemLog --> PurWork["Purchase gửi bản đặc tả kỹ thuật sang Nhà Cung Cấp\n(ServeOne, SMC, Keyence, Trumpf...)"]
        PurWork --> VenQuote["Nhà Cung Cấp gửi báo giá dự toán"]
        VenQuote --> PurNegotiate["Purchase đàm phán chiết khấu số lượng & điều khoản giao hàng"]
    end

    subgraph S3["3. Đồng Bộ Thủ Công Vào Hệ Thống (LEC Thực Hiện)"]
        PurNegotiate -.->|"Trao đổi định kỳ qua Điện thoại / Email / Họp giao ban"| LEC_Sync["LEC tiếp nhận thông tin từ chuyên viên Purchase"]
        LEC_Sync --> ScreenUpdate["LEC mở màn hình Purchase Tracking nhập thủ công:\n• Trạng thái Purchase (WAITING / NEGOTIATING / DONE)\n• Đơn giá sơ bộ đã chốt\n• Đính kèm tệp PDF Quotation"]
    end

    subgraph S4["4. Đăng Ký Mã Chính Thức & Hoàn Tất Giá"]
        ScreenUpdate --> CheckCode{"Đang dùng mã tạm\nTMP-HW-xxxx?"}
        CheckCode -->|"Có mã tạm"| ReqMaster["LEC gửi hồ sơ Master Data sang EMS\nXin cấp QCode chính thức"]
        ReqMaster --> LinkCode["Nhập QCode mới vào hệ thống\nKế thừa toàn bộ báo giá và cây EBOM"]
        CheckCode -->|"Đã có QCode"| FinalPrice["Cập nhật đơn giá vào phiếu PRV sẵn sàng lên PO"]
        LinkCode --> FinalPrice
    end
```

