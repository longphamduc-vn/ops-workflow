# 03. Quy Trình Chốt Kỳ Tháng & Thẩm Định Offline Với Team Management

## 1. Cơ Chế Thẩm Định Offline (Offline Management Governance)

Do **Team Management tạm thời chưa đưa vào hệ thống**, mọi quyết định phê duyệt cấp cao (đặc biệt là duyệt các khoản Over ngoài kế hoạch và duyệt phát hành PO tháng) được vận hành theo cơ chế hồ sơ giấy kết hợp xác thực số:

```mermaid
sequenceDiagram
    autonumber
    actor LEC as LEC (Pham Duc Long - 658359)
    participant SYS as Hệ Thống Mua Bán Mới
    actor MNG as Team Management (Reviewer)
    participant EMS as Hệ Thống EMS

    Note over LEC,SYS: Ngày 25 hàng tháng: Khóa kỳ thẩm định nội bộ
    LEC->>SYS: Bấm "Chốt kỳ mua sắm tháng [YYYY-MM]"
    SYS-->>SYS: Tự động gom nhóm: Tách riêng danh sách Trong Target vs Over (OVR-01..06)
    SYS-->>LEC: Xuất "Hồ Sơ Báo Cáo Thẩm Định Offline" (File Excel + PDF chuẩn hóa)
    
    Note over LEC,MNG: Họp Thẩm định Trực tiếp Offline
    LEC->>MNG: Trình hồ sơ giấy, giải trình các khoản chi ngoài kế hoạch (Over)
    MNG->>MNG: Rà soát tính cấp thiết, ký phê duyệt trực tiếp trên văn bản
    MNG-->>LEC: Trao biên bản phê duyệt có đầy đủ chữ ký
    
    Note over LEC,SYS: Cập nhật kết quả vào phần mềm
    LEC->>SYS: Bấm "Xác Nhận Đã Phê Duyệt Offline" & Tải bản scan biên bản có chữ ký
    SYS-->>SYS: Khóa toàn bộ dữ liệu kỳ tháng, kích hoạt trạng thái "READY_FOR_EMS_PO"
    SYS->>EMS: Đóng gói và gọi API save130PrvData.lgdn để phát hành PO chính thức
```

---

## 2. Cấu Trúc Hồ Sơ Thẩm Định Offline (Offline Audit Package)

File hồ sơ xuất ra từ hệ thống bao gồm 4 phần tiêu chuẩn:
1.  **Phần 1: Bảng tổng hợp cân đối ngân sách SG tháng ($33\% - 33\% - 34\%$)**:
    *   Hạn mức phân bổ tháng: \$150,000 USD.
    *   Tổng cam kết mua Trong Target: \$125,000 USD.
    *   Tổng phát sinh Mua Ngoài Kế Hoạch (Over): \$28,000 USD.
    *   Tổng đề xuất duyệt: \$153,000 USD (Vượt trần \$3,000 USD).
2.  **Phần 2: Bảng giải trình chi tiết các dòng Over ngoài kế hoạch**:
    *   Bảng kê chi tiết từng phụ tùng Over kèm mã nguyên nhân (**OVR-01 đến OVR-06**), số tiền chênh lệch, mã máy hỏng và số Work Order.
3.  **Phần 3: Báo cáo hiệu quả xử lý Interlock**:
    *   Số tiền đã tiết kiệm được nhờ điều chuyển từ pháp nhân khác hoặc sửa chữa phục hồi linh kiện SPR nội bộ thay vì mua mới 100%.
4.  **Phần 4: Trang ký duyệt pháp lý**:
    *   Khu vực chữ ký của **Đại diện LEC (Pham Duc Long)** và **Đại diện Ban Quản Lý (Team Management Reviewer)**.

