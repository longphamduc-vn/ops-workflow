# 03. Quy Trình Thẩm Định Đầu Tháng & Kiểm Thảo Giải Trình Tồn Kho (Cost Management Audit)
> *Thẩm Định Chi Phí & Kiểm Thảo Tồn Kho Chưa Dùng Vào ĐẦU THÁNG, Cơ Chế Làm Rõ Thông Tin 3 Bên (Reviewer <-> LEC <-> Kỹ Sư), Ngân Sách Không Rollover & Phê Duyệt Trên EMS*

---

## 1. Cơ Chế Thẩm Định & Kiểm Thảo Đầu Mỗi Tháng (Beginning-of-Month Cost Governance)

Quy trình thẩm định được vận hành thực tế và tinh gọn vào **đầu mỗi tháng** giữa **Nhóm LEC trong Team** và **Reviewer (Bộ phận Cost Management - Reviewer & Assistant là 1 người)**:

```mermaid
sequenceDiagram
    autonumber
    actor LEC as Nhóm LEC Trong Team
    participant SYS as Hệ Thống Mua Bán Mới
    actor REV as Reviewer (Cost Management)
    actor ENG as Kỹ Sư Hiện Trường
    participant EMS as Hệ Thống EMS Nexacro

    Note over LEC,SYS: ĐẦU MỖI THÁNG: Chốt kỳ & Xuất Hồ sơ Kiểm thảo
    LEC->>SYS: Bấm "Chốt kỳ & Xuất Báo Cáo Kiểm Thảo Tháng [YYYY-MM]"
    SYS-->>LEC: Xuất file Excel Form Cố Định (Giải trình tồn kho, Trong Target vs Over)
    
    Note over LEC,REV: Họp Thẩm Định Offline Đầu Tháng (Reviewer & LEC)
    LEC->>REV: Trình giải trình chi phí Over (OVR-01..06) và tồn kho chưa xuất dùng
    
    alt Reviewer CẦN THÊM THÔNG TIN / GIẢI TRÌNH BỔ SUNG
        REV->>LEC: Nêu yêu cầu làm rõ các dòng nghi vấn
        LEC->>SYS: Nhập yêu cầu làm rõ vào đơn trên hệ thống
        SYS->>ENG: Bắn thông báo & Task phản hồi cho Kỹ Sư
        ENG->>SYS: Kỹ sư nhập giải trình, đính kèm tài liệu/ảnh
        SYS->>LEC: Thông báo Kỹ sư đã phản hồi
        LEC->>SYS: LEC kiểm tra và bấm [Gửi Lại Cho Reviewer]
        SYS-->>REV: Reviewer xem phản hồi hoàn thiện
    end

    REV-->>LEC: Thống nhất xác nhận chi phí (Cost Clearance)
    
    Note over REV,EMS: PHÊ DUYỆT CHÍNH THỨC TRÊN EMS
    REV->>EMS: Thao tác duyệt chính thức trên hệ thống EMS
    LEC->>EMS: Lên PRV / PO trên EMS theo quy trình tập đoàn
    LEC->>SYS: Nhập mã PRV No / PO No đối soát vào hệ thống để theo dõi tiến độ
```

---

## 2. Cấu Trúc Báo Cáo Excel Form Cố Định (Standard Fixed Template)

Báo cáo xuất ra phục vụ phiên thẩm định đầu tháng gồm 4 Sheet tiêu chuẩn:
1. **Sheet 1: Giải Trình Biến Động Tồn Kho & Tuổi Thọ Tồn (Inventory Aging & Variance)**:
   - Tồn kho đầu kỳ, lượng nhập kho, lượng xuất kho lắp máy trong tháng (từ EMS), tồn kho cuối kỳ.
   - Đối soát tồn an toàn (Target Stock) vs Tồn thực tế On-hand tại kho HW.
   - Danh sách tồn kho >30 ngày kèm nội dung Task giải trình của Kỹ sư.
2. **Sheet 2: Bảng Cân Đối Ngân Sách SG Tháng (TUYỆT ĐỐI KHÔNG ROLLOVER)**:
   - Hạn mức ngân sách SG tháng mới do LEC nhập thủ công (độc lập từng Team).
   - **Tuyệt đối KHÔNG cộng dồn số dư từ tháng trước sang tháng sau**.
   - Tổng cam kết mua Trong Target vs Tổng phát sinh Mua Ngoài Kế Hoạch (Over).
3. **Sheet 3: Danh Mục Chi Tiết Các Hạng Mục Over Ngoài Kế Hoạch**:
   - Bảng kê từng chi tiết Over kèm 6 mã nguyên nhân (**OVR-01 đến OVR-06**), mã lệnh máy `Work Order`, đơn giá và kỹ sư yêu cầu.
4. **Sheet 4: Báo Cáo Hiệu Quả Xử Lý Interlock & Tồn Kho Team Bạn**:
   - Tổng hợp các hạng mục đã xuất sử dụng từ tồn kho nhàn rỗi của Team bạn trong nhà máy HW (theo cảnh báo `agingInterlockFlag`), giúp tiết kiệm chi phí mua mới.
   - Danh sách các mã điều chuyển liên pháp nhân thành công.
