# 03. Sơ Đồ Quy Trình: Theo Dõi Báo Giá (RFQ), Xử Lý Bất Thường & Kiểm Soát Tiến Độ Nhập Hàng
> *Ranh Giới Nghiệp Vụ Chuẩn Hóa: Purchase Làm Giá Với Nhà Cung Cấp, LEC Theo Dõi Tiến Độ RFQ, Xử Lý Bất Thường Từ Email, và Nhập Thủ Công Các Mốc Tiến Độ Nhập Hàng (Vendor Confirm, ETA, Phân Bổ Chi Phí Hàng Tháng; Hàng Về Kiểm Tra Trên EMS)*

---

## 1. Lưu Đồ Chi Tiết Vòng Đời Báo Giá & Kiểm Soát Tiến Độ Nhập Hàng

```mermaid
flowchart TD
    subgraph S1["1. Khởi Tạo Yêu Cầu & Kiểm Tra Cờ Giá (unitPriceFlag)"]
        Req["Kỹ sư hiện trường tạo yêu cầu mua (Bắt buộc có QCode)"] --> PriceCheck{"Cờ Giá unitPriceFlag (Y/N)?"}
        PriceCheck -->|"Y (Đã có đơn giá hợp đồng)"| DonePrice["Đã có giá ServeOne / Hợp đồng\n➔ Sẵn sàng cho LEC phân loại Target/Over"]
        PriceCheck -->|"N (Chưa có giá hợp đồng)"| RFQ_Init["Hệ thống chuyển trạng thái: ⏳ CHỜ BÁO GIÁ RFQ"]
    end

    subgraph S2["2. Giai Đoạn Đàm Phán Thương Mại (Purchase Phụ Trách)"]
        RFQ_Init --> PurAction["Chuyên viên Purchase gửi RFQ sang Nhà Cung Cấp ngoài\n(ServeOne, SMC, Keyence, Trumpf...)"]
        PurAction --> VenResponse{"Nhà Cung Cấp Phản Hồi"}
    end

    subgraph S3["3. Phân Nhánh: Báo Giá Chuẩn vs Bất Thường Nhận Qua Email"]
        VenResponse -->|"Báo giá bình thường"| NormalFlow["Purchase cập nhật đơn giá thỏa thuận vào EMS"]
        NormalFlow --> DonePrice
        
        VenResponse -->|"Có BẤT THƯỜNG\n(EOL / Tăng giá đột biến / Leadtime >120 ngày)"| ExMail["Purchase gửi Email cảnh báo bất thường cho LEC"]
    end

    subgraph S4["4. Xử Lý Bất Thường Kỹ Thuật (LEC Thực Hiện)"]
        ExMail --> LEC_Input["LEC mở Form 'Xử Lý Bất Thường RFQ' trên hệ thống:\n• Trích dẫn nội dung Email từ Purchase\n• Đính kèm tệp email / báo giá\n• Chọn hướng xử lý: Đổi mã thay thế / Sửa chữa SPR"]
        LEC_Input --> SysAlert["Hệ thống chuyển trạng thái: ⚠️ RFQ_EXCEPTION\nBắn thông báo làm rõ cho Kỹ sư"]
        SysAlert --> ReqAction{"Kỹ sư phản hồi"}
        ReqAction -->|"Đồng ý mã thay thế"| UpdateOrder["Cập nhật mã linh kiện mới"]
        ReqAction -->|"Giữ nguyên & Giải trình kỹ thuật"| ReExplain["Gửi lại ý kiến kỹ thuật cho LEC & Purchase"]
        UpdateOrder --> DonePrice
    end

    subgraph S5["5. Thẩm Định Đầu Tháng & Theo Dõi Tiến Độ Nhập Hàng Thủ Công"]
        DonePrice --> AuditMonth["Họp Thẩm Định Chi Phí ĐẦU THÁNG với Cost Management (1 người)\n(LEC tự tay phân loại [TARGET] hoặc [OVER PHÁT SINH])"]
        AuditMonth --> EMS_PO["LEC tạo PRV trên EMS ➔ Lãnh đạo ký duyệt ➔ EMS phát hành PO"]
        
        EMS_PO --> ManualTracking["LEC NHẬP TIẾN ĐỘ THỦ CÔNG TRÊN HỆ THỐNG:\n1. 📅 Vendor Confirm Ngày Giao Hàng Dự Kiến\n2. 🚚 Ngày Hàng Về Cảng / Xưởng (ETA)\n3. 📊 Sắp Xếp Phân Bổ Sử Dụng Hàng Tháng (Phân bổ chi phí)"]
        
        ManualTracking --> EMS_Receipt["KIỂM TRA THÔNG TIN HÀNG VỀ TRÊN EMS:\n(Goods Receipt hoàn tất trên EMS ➔ Đọc tự động vào hệ thống)"]
    end
```

---

## 2. Đặc Tả Nghiệp Vụ Xử Lý & Kiểm Soát Tiến Độ

1.  **Ranh Giới Rõ Ràng Về Báo Giá**:
    - LEC không làm thay công việc thương mại của Purchase. Mọi thủ tục đàm phán, chiết khấu thuộc trách nhiệm của bộ phận Mua hàng. LEC chỉ theo dõi trạng thái cờ `unitPriceFlag` trên hệ thống.
2.  **Minh Bạch Sự Cố Qua Email**:
    - Khi có chậm trễ ngoài mong muốn (hãng ngừng sản xuất EOL, thời gian giao hàng kéo dài), LEC đưa nguyên văn email từ Purchase lên hệ thống để kỹ sư nắm rõ, loại bỏ hoàn toàn việc nghi ngờ chậm trễ thủ tục.
3.  **Kiểm Soát Tiến Độ Nhập Hàng Thủ Công**:
    - **Thông tin hàng về cuối cùng**: Chỉ cần kiểm tra và đọc tự động từ hệ thống Core EMS khi kho hoàn tất thủ tục nhập kho.
    - **Các mốc trước khi hàng về**: Do EMS không quản lý chi tiết các mốc trung gian của nhà sản xuất, LEC sẽ **nhập thủ công trên hệ thống này**:
      * **Vendor Confirm Ngày Nhận**: Ngày nhà cung cấp chính thức xác nhận xuất xưởng.
      * **ETA (Estimated Time of Arrival)**: Ngày dự kiến hàng cập cảng hoặc về đến nhà máy HW.
      * **Sắp Xếp Phân Bổ Sử Dụng Hàng Tháng**: Kế hoạch chia nhỏ số lượng sử dụng theo từng tháng để cân đối phân bổ chi phí ngân sách SG, tránh dồn cục chi phí làm vượt trần ngân sách tháng.
