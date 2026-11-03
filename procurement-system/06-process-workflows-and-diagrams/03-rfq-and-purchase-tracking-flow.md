# 03. Sơ Đồ Quy Trình: Theo Dõi Trạng Thái Báo Giá (RFQ) & Xử Lý Bất Thường Từ Email
> *Ranh Giới Nghiệp Vụ Chuẩn Hóa: Purchase Làm Giá Với Nhà Cung Cấp, LEC Chỉ Theo Dõi Trạng Thái & Xử Lý Bất Thường Nhận Qua Mail*

---

## 1. Lưu Đồ Chi Tiết Vòng Đời Báo Giá & Luồng Xử Lý Bất Thường

```mermaid
flowchart TD
    subgraph S1["1. Khởi Tạo & Theo Dõi Trạng Thái RFQ"]
        Req["Engineer Process tạo nhu cầu mua (kèm mã QCode hoặc TMP-xxxx)"]
        Req --> RFQ_Init["Hệ Thống Tự Động Sinh Request Báo Giá (RFQ)"]
        RFQ_Init --> StatusTrack["Trạng thái hệ thống: ⏳ CHỜ BÁO GIÁ TỪ PURCHASE\n(LEC chỉ cần theo dõi trạng thái này trên Workbench)"]
    end

    subgraph S2["2. Giai Đoạn Đàm Phán Thương Mại (Purchase Phụ Trách Độc Lập)"]
        StatusTrack --> PurAction["Purchase Dept gửi yêu cầu sang Nhà Cung Cấp ngoài\n(ServeOne, SMC, Keyence, Trumpf...)"]
        PurAction --> VenResponse{"Nhà Cung Cấp Phản Hồi"}
    end

    subgraph S3["3. Phân Nhánh: Tiến Độ Chuẩn vs Bất Thường Nhận Qua Email"]
        VenResponse -->|"Báo giá bình thường"| NormalFlow["Purchase chốt đơn giá chuẩn & cập nhật hệ thống"]
        NormalFlow --> DonePrice["Hoàn tất giá ➔ Gom đưa vào Thẩm định ngày 25"]
        
        VenResponse -->|"Có BẤT THƯỜNG\n(Hết hàng / EOL / Tăng giá 300% / Leadtime >120d)"| ExMail["Purchase gửi Email cảnh báo bất thường cho LEC"]
    end

    subgraph S4["4. Xử Lý Bất Thường & Phản Hồi Kỹ Sư (LEC Thực Hiện)"]
        ExMail --> LEC_Receive["LEC tiếp nhận Email từ Purchase"]
        LEC_Receive --> LEC_Input["LEC mở Form 'Xử Lý Bất Thường RFQ' trên hệ thống:\n• Trích dẫn nội dung Email từ Purchase\n• Đính kèm tệp .msg / .eml / .pdf\n• Chọn hướng xử lý: Đổi mã / Cải tiến gá / Tìm sửa SPR"]
        
        LEC_Input --> SysAlert["Hệ thống đổi trạng thái: ⚠️ RFQ_EXCEPTION\nTự động bắn cảnh báo & Task phản hồi cho Requestor"]
        
        SysAlert --> ReqAction{"Requestor Phản Hồi"}
        ReqAction -->|"Đồng ý phương án mới"| UpdateOrder["Cập nhật mã linh kiện / thông số kỹ thuật mới"]
        ReqAction -->|"Giữ nguyên & Giải trình lại"| ReExplain["Gửi lại ý kiến kỹ thuật cho LEC & Purchase"]
        
        UpdateOrder --> DonePrice
    end
```

---

## 2. Đặc Tả Nghiệp Vụ Xử Lý Bất Thường Của LEC

1.  **Không gây quá tải cho LEC**: LEC không phải chuyên viên đàm phán thương mại. Mọi công việc liên hệ hãng, xin chiết khấu do Purchase đảm nhận 100%. LEC chỉ cần mở hệ thống giám sát tiến độ (đang chờ, đã có giá sơ bộ, hay có vướng mắc).
2.  **Minh bạch nguyên nhân chậm trễ**: Khi có sự cố (ví dụ NCC báo thời gian giao hàng mất 6 tháng do khủng hoảng chip toàn cầu), email gốc từ Purchase được LEC đưa lên hệ thống làm bằng chứng minh bạch, triệt tiêu việc nghi ngờ lẫn nhau giữa Kỹ sư hiện trường và bộ phận văn phòng.
3.  **Tự động liên thông với CSDL Master Data**: Nếu email bất thường xác nhận mã phụ tùng đã bị nhà máy ngừng sản xuất, LEC bấm xác nhận phân loại lại thành `Ngừng sản xuất (EOL)` $\rightarrow$ toàn bộ hệ thống EBOM được cập nhật tức thì.
