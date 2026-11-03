# 05. Sơ Đồ Quy Trình: Kiểm Thảo Tồn Kho, Chốt Kỳ Tháng & Thẩm Định Offline Ban Quản Lý
> *Quy Trình Kiểm Thảo Hàng Tháng: Kỹ Sư Giải Trình Tồn Kho Chưa Dùng Qua Task, Thẩm Định Offline Ngày 25 & Kích Hoạt Mua Bán / Chuyển Giao SAU Khi Phê Duyệt*

---

## 1. Dòng Thời Gian Vận Hành Toàn Diện Kỳ Mua Sắm & Kiểm Thảo Tháng

```mermaid
flowchart TD
    subgraph Phase1["Giai Đoạn 1: Từ ngày 01 đến 24 hàng tháng (Thu Thập & Kiểm Thảo)"]
        P1["Kỹ sư Process đăng ký nhu cầu mua theo tên máy thân thiện"]
        P1_Stock["Hệ thống quét tồn kho >30 ngày chưa xuất\n➔ Tự động phát sinh TASK GIẢI TRÌNH TỒN KHO cho Kỹ sư"]
        P1_Task["Kỹ sư hoàn thành nộp Task giải trình tồn kho trước ngày 24"]
        P1_LEC["LEC gom hạng mục, lọc nhóm CÓ THỂ MUA (Purchasable)\nĐánh dấu chính thức TRONG TARGET vs OVER NGOÀI KH"]
    end

    subgraph Phase2["Giai Đoạn 2: 17:00 Ngày 25 Hàng Tháng (Khóa Số Liệu & Xuất Báo Cáo)"]
        P2["LEC bấm 'Khóa Sổ Kỳ Tháng'\nĐóng băng 100% dữ liệu của nhóm Có Thể Mua"]
        P3["Hệ thống tự động tổng hợp Dashboard Báo Cáo & Xuất File Thẩm Định:\n• Bảng tổng hợp tiến độ mua hàng & các chỉ số KPIs\n• Đối chiếu Budget SG tháng (Thủ công, No Rollover)\n• Danh sách gây Over (Chi tiết theo Mua Hàng & Xuất Kho)\n• Danh sách kiểm thảo giải trình tồn kho chưa dùng của kỹ sư"]
    end

    subgraph Phase3["Giai Đoạn 3: Ngày 26 Hàng Tháng (Họp Thẩm Định Offline Ban Quản Lý)"]
        P4["Họp Thẩm Định Trực Tiếp giữa LEC, Leader & Ban Quản Lý (Management)\n• Thẩm tra các hạng mục Over ngoài kế hoạch (OVR-01..06)\n• Thẩm thảo lý do tồn kho chưa xuất của kỹ sư"]
        P5["Ban Quản Lý ký duyệt phê duyệt chính thức trên Biên bản giấy"]
    end

    subgraph Phase4["Giai Đoạn 4: Ngày 27 Trở Đi (KÍCH HOẠT MUA BÁN & CHUYỂN GIAO)"]
        P6["Tải file scan biên bản có chữ ký lãnh đạo lên Executive Portal\nKích hoạt mở khóa toàn hệ thống"]
        
        P7{"Lộ trình cập nhật EMS"}
        P7 -->|"Phase 1 (Hiện tại)"| P7_Phase1["1. LEC tạo PRV trên EMS ngoài\n2. LEC nhập mã PRV No đối soát vào hệ thống\n3. Hệ thống tự động fetch data & cập nhật PO_SYNCED"]
        P7 -->|"Phase 2 (Tương lai)"| P7_Phase2["Hệ thống tự động gọi API save130PrvData.lgdn sinh đơn"]
        
        P7_Phase1 --> DoneAction["CHÍNH THỨC PHÁT HÀNH PO MUA & XUẤT KHO CHUYỂN GIAO"]
        P7_Phase2 --> DoneAction
    end

    Phase1 --> Phase2
    P2 --> P3 --> Phase3
    P4 --> P5 --> Phase4
    P6 --> P7
```

---

## 2. Các Nguyên Tắc Bắt Buộc Trong Kiểm Thảo & Thẩm Định

1.  **Mua Bán & Chuyển Giao Tuyệt Đối Diễn Ra Sau Thẩm Định**:
    - Ngăn chặn triệt để tình trạng "tiền trảm hậu tấu" (tự ý mua ngoài hoặc tự ý nhận chuyển giao kho từ pháp nhân bạn khi lãnh đạo chưa phê chuẩn).
    - Mọi mã hàng chỉ được cấp ngân sách và mở cổng phát hành PO sau khi Biên bản thẩm định ngày 25 có chữ ký của Quản Lý.
2.  **Trách Nhiệm Giải Trình Tồn Kho Của Kỹ Sư**:
    - Phụ tùng mua về phải được lắp máy tạo ra sản phẩm. Nếu phụ tùng nằm kho quá 30 ngày, Kỹ sư yêu cầu ban đầu bắt buộc phải làm việc qua Task giải trình.
    - Ban Quản Lý sử dụng danh sách giải trình này để quyết định có tiếp tục phê duyệt các đơn mua mới của kỹ sư đó hay không.
