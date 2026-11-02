# 01. Sơ Đồ Quy Trình Tổng Thể Đầu - Cuối (End-to-End Procurement Workflow)

## 1. Sơ Đồ Quy Trình Hoạt Động (Swimlane Process Diagram)

Quy trình chuẩn hóa sự tham gia của 6 tác nhân chính:

```mermaid
sequenceDiagram
    autonumber
    actor REQ as 1. Engineer Process (Kỹ Sư Công Đoạn)
    actor LDR as 2. Leader (Process / Part / Team)
    actor LEC as 3. LEC Trong Team (Pham Duc Long - 658359)
    actor PUR as 4. Bộ Phận Purchase Ngoài
    actor MNG as 5. Team Management (Duyệt Offline)
    participant SYS as Hệ Thống Mua Bán Mới
    participant EMS as 6. Hệ Thống EMS

    %% Giai đoạn 1: Khởi tạo
    REQ->>SYS: Chọn phụ tùng từ EBOM (Process > Machine > Unit > Line)
    Note over REQ,SYS: Phân loại: 🟢 Trong Target hoặc 🔴 Over ngoài kế hoạch (OVR-01..06)
    REQ->>SYS: Gửi phiếu yêu cầu (Cấp mã tạm TMP-HW-xxxx nếu chưa có QCode)
    
    %% Giai đoạn 2: Leader xác nhận nội bộ
    SYS-->>LDR: Thông báo yêu cầu mới trong phạm vi Team
    LDR->>SYS: Kiểm tra tính xác thực mã máy & Work Order -> Bấm "Xác Nhận Team"
    
    %% Giai đoạn 3: LEC thẩm tra & Báo giá với Purchase
    SYS-->>LEC: Phiếu chuyển đến Bàn làm việc LEC
    LEC->>PUR: Gửi Request Báo Giá (RFQ)
    LEC->>SYS: Cập nhật ngày gửi RFQ lên hệ thống
    PUR-->>LEC: Đàm phán với NCC ngoài, phản hồi tiến độ & giá qua Email/Phone
    LEC->>SYS: Cập nhật thủ công đơn giá sơ bộ & tiến độ Purchase
    
    %% Giai đoạn 4: Xử lý Interlock Y/N liên pháp nhân
    Note over LEC,SYS: Kiểm tra Interlock tuần tự theo cờ Y/N
    alt Có cờ Transfer (transferFlag == Y)
        SYS->>EMS: Đẩy yêu cầu transfer sang pháp nhân khác (retPartsTransferReqList)
        SYS-->>SYS: Trạng thái: CHỜ PHÁP NHÂN KHÁC XÁC NHẬN
        Note over SYS,EMS: Pháp nhân không có quyền từ chối, chỉ chờ xác nhận thực xuất
    end
    alt Có cờ Disuse (disuseFlag == Y)
        SYS->>EMS: Gọi TargetStockSearchList trích xuất holdReasonContent
        SYS-->>LEC: Hiển thị nguyên văn lý do cấm sử dụng -> LEC bấm Reject
    end
    LEC->>SYS: Mở chặn Mua Thường (stopPoFlag = 'N') khi đủ điều kiện
    
    %% Giai đoạn 5: Chốt tháng & Thẩm định Offline
    Note over LEC,MNG: NGÀY 25 HÀNG THÁNG: CHỐT SỐ LIỆU THÁNG
    LEC->>SYS: Bấm "Chốt kỳ mua sắm tháng" -> Xuất Hồ sơ Thẩm định Offline
    LEC->>MNG: Tổ chức họp thẩm định trực tiếp Offline (Giải trình các dòng Over)
    MNG-->>LEC: Ký duyệt văn bản giấy
    LEC->>SYS: Cập nhật trạng thái "Đã Duyệt Offline" & Tải file scan biên bản
    
    %% Giai đoạn 6: Xuất PO sang EMS & Hạch toán chi phí
    SYS->>EMS: Gọi API save130PrvData.lgdn để chính thức tạo đơn PRV
    EMS-->>EMS: Phát hành PO cho nhà cung cấp giao hàng về kho HW
    Note over EMS,SYS: Hàng về kho HW -> Ghi nhận TÀI SẢN TỒN KHO
    REQ->>SYS: Kỹ sư xuất kho lắp vào Line/Máy thực tế
    SYS-->>SYS: CHÍNH THỨC GHI NHẬN CHI PHÍ SẢN XUẤT (Issue Expense)
```

---

## 2. Các Mốc Trạng Thái Vòng Đời Của Yêu Cầu (Requisition State Machine)

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Kỹ sư tạo phiếu (Gắn mã tạm TMP-HW-xxxx)
    DRAFT --> PENDING_LEADER_ENDORSE: Gửi duyệt nội bộ
    PENDING_LEADER_ENDORSE --> PENDING_LEC_REVIEW: Leader xác nhận team
    PENDING_LEADER_ENDORSE --> DRAFT: Leader trả lại chỉnh sửa
    
    PENDING_LEC_REVIEW --> WAITING_PURCHASE_QUOTE: LEC gửi RFQ sang Purchase
    WAITING_PURCHASE_QUOTE --> PENDING_ENTITY_TRANSFER: Có cờ transfer liên pháp nhân
    PENDING_ENTITY_TRANSFER --> INTERLOCK_CLEARED: Pháp nhân xác nhận xong / Đủ điều kiện mua
    WAITING_PURCHASE_QUOTE --> INTERLOCK_CLEARED: Không bị Interlock
    
    INTERLOCK_CLEARED --> MONTHLY_CUTOFF_LOCKED: LEC khóa kỳ ngày 25
    MONTHLY_CUTOFF_LOCKED --> OFFLINE_MANAGEMENT_APPROVED: Team Management ký duyệt giấy
    OFFLINE_MANAGEMENT_APPROVED --> PO_ISSUED_IN_EMS: Gọi API save130PrvData
    PO_ISSUED_IN_EMS --> RECEIVED_IN_WAREHOUSE: Hàng về kho HW (Tài sản)
    RECEIVED_IN_WAREHOUSE --> ISSUED_TO_MACHINE: Xuất kho lắp máy (Chi phí thực)
    ISSUED_TO_MACHINE --> [*]
```

