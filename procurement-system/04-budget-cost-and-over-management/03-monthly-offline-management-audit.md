# 03. Quy Trình Chốt Kỳ Tháng, Giải Trình Tồn Kho & Kiểm Thảo Định Kỳ (Xuất Excel Form Cố Định)

## 1. Cơ Chế Thẩm Định & Kiểm Thảo Hàng Tháng (Monthly Inventory Audit & Governance)

Hệ thống phục vụ công tác **Giải trình tồn kho và kiểm thảo định kỳ hàng tháng** với Ban Quản Lý (Team Management). Do Team Management tạm thời chưa đưa vào phần mềm, quy trình được vận hành thực tế và tinh gọn như sau:

```mermaid
sequenceDiagram
    autonumber
    actor LEC as Nhóm LEC Trong Team
    participant SYS as Hệ Thống Mua Bán Mới
    actor MNG as Team Management (Reviewer)
    participant EMS as Hệ Thống EMS Nexacro

    Note over LEC,SYS: Ngày 25 hàng tháng: Khóa kỳ kiểm thảo nội bộ
    LEC->>SYS: Bấm "Chốt kỳ & Xuất Báo Cáo Kiểm Thảo Tháng [YYYY-MM]"
    SYS-->>LEC: Xuất file Excel theo Form Cố Định Chuẩn Hóa (Giải trình tồn kho, Trong Target vs Over)
    
    Note over LEC,MNG: Họp Thẩm định & Kiểm thảo Trực tiếp Offline
    LEC->>MNG: Trình file Excel in/chiếu, giải trình tồn kho và các khoản chi Over
    MNG->>MNG: Rà soát tính cấp thiết, ký duyệt trên biên bản họp
    MNG-->>LEC: Thống nhất danh mục được phép phát hành PO
    
    Note over LEC,EMS: Giai Đoạn 1: LEC tạo trên EMS & Cập nhật mã đối soát
    LEC->>EMS: Thao tác tạo PRV / PO trên giao diện EMS Nexacro
    LEC->>SYS: Nhập thông tin PRV No / PO No vào hệ thống mới
    SYS->>EMS: Gọi API tra cứu tự động lấy dữ liệu chi tiết
    SYS-->>SYS: Cập nhật trạng thái "EMS_PO_SYNCED" và hoàn tất chu kỳ tháng

    Note over SYS,EMS: Giai Đoạn 2 (Sau này mở rộng): Gọi API tự động sinh PRV
```

---

## 2. Cấu Trúc Báo Cáo Excel Form Cố Định (Fixed Standard Excel Template)

Báo cáo xuất ra từ hệ thống sử dụng duy nhất một **Mẫu Excel Cố Định (Standard Fixed Template)** gồm 4 Sheet tiêu chuẩn:
1.  **Sheet 1: Giải Trình Biến Động Tồn Kho & Chi Phí (Inventory & Cost Variance)**:
    *   Tồn kho đầu kỳ, lượng nhập kho, lượng xuất kho lắp máy trong tháng, tồn kho cuối kỳ.
    *   Đối soát tồn kho an toàn (Target Stock) vs Tồn kho thực tế On-hand tại kho HW.
2.  **Sheet 2: Bảng Cân Đối Ngân Sách SG Tháng ($33\% - 33\% - 34\%$)**:
    *   Hạn mức phân bổ tháng: \$150,000 USD (kèm số dư dồn từ tháng trước nếu có).
    *   Tổng cam kết mua Trong Target: \$125,000 USD.
    *   Tổng phát sinh Mua Ngoài Kế Hoạch (Over): \$28,000 USD.
    *   Tổng đề xuất duyệt: \$153,000 USD.
3.  **Sheet 3: Danh Mục Chi Tiết Các Hạng Mục Over Ngoài Kế Hoạch**:
    *   Bảng kê từng chi tiết Over kèm mã nguyên nhân (**OVR-01 đến OVR-06**), mã lệnh máy `Work Order`, đơn giá và người đề xuất.
4.  **Sheet 4: Báo Cáo Hiệu Quả Xử Lý Interlock (Transfer / Pháp nhân khác)**:
    *   Tổng hợp các hạng mục đã xử lý điều chuyển liên pháp nhân hoặc mua qua pháp nhân khác thành công, giúp tiết kiệm chi phí mua mới.

