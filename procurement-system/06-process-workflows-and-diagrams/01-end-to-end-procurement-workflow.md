# 01. Sơ Đồ Quy Trình Tổng Thể Đầu - Cuối (End-to-End Procurement Progress Workflow)
> *Kiến trúc kiểm soát tiến độ mua sắm phụ tùng Factory HW (Smart Watch)*  
> *Nguyên tắc cốt lõi: Hệ thống mới kiểm soát tiến độ (KHÔNG PHÊ DUYỆT); Mọi phê duyệt ký tá ngân sách diễn ra trên EMS; Bỏ qua Cổng thủ kho (xuất kho lấy từ EMS); Kỹ sư ngang hàng trong Part/Team; Thẩm định ĐẦU THÁNG với Cost Management (1 người); Luồng phản hồi 3 bên; Bắt buộc có QCode để thẩm định; Nhập tiến độ Vendor Confirm / ETA thủ công.*

---

## 1. Sơ Đồ Quy Trình Hoạt Động (Swimlane Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor REQ as 1. Kỹ Sư Hiện Trường (Peers)
    actor LDR as 2. Leader Team / Part
    actor LEC as 3. LEC Quản Lý Phụ Tùng (Pham Duc Long)
    actor PUR as 4. Chuyên Viên Purchase
    actor CST as 5. Cost Management (1 Người)
    participant SYS as Hệ Thống Tiến Độ Mới
    participant EMS as 6. Core LG Display EMS

    %% Giai đoạn 1: Chuẩn bị dữ liệu & Tạo yêu cầu
    opt Đăng ký phụ tùng mới chưa có QCode
        REQ->>SYS: Kéo thả folder CAD/Doc/Ảnh -> Nhập thông số sơ bộ (Mã tạm TMP-HW-xxxx)
        SYS-->>LEC: Chuyển dữ liệu kỹ thuật để LEC đăng ký QCode trên ERP/EMS
        LEC->>EMS: Đăng ký mã QCode chính thức ngoài ERP/EMS
        LEC->>SYS: Cập nhật mã QCode chính thức thay thế mã tạm TMP
    end

    REQ->>SYS: Tạo yêu cầu mua (Tên máy thân thiện, QCode chuẩn, số lượng, Work Order)
    alt Phát hiện tồn kho lâu ngày của Team khác (agingInterlockFlag == 'Y')
        SYS-->>REQ: ⚠️ Bắn Banner CẢNH BÁO TỨC THÌ & Mở Task Bắt Buộc mượn/xuất dùng
        Note over REQ,SYS: Task mượn tồn kho LUÔN LUÔN DUY TRÌ cho đến khi EMS đồng bộ 'N'
    end

    %% Giai đoạn 2: Leader giám sát & LEC gom đơn
    SYS-->>LDR: Hiển thị tiến độ mua sắm nội bộ Part/Team (Giám sát, không có nút duyệt)
    SYS-->>LEC: Hàng đợi gom đơn toàn team & Quét Interlock 4 bước
    LEC->>SYS: Thiết lập hạn Deadline giải trình & Đánh dấu thủ công [TRONG TARGET] hoặc [OVER PHÁT SINH]

    %% Giai đoạn 3: Phối hợp RFQ với Purchase
    alt unitPriceFlag == 'N' (Chưa có giá hợp đồng)
        LEC->>PUR: Gửi thông tin kỹ thuật yêu cầu RFQ
        PUR-->>LEC: Đàm phán nhà cung cấp, phản hồi báo giá
        LEC->>SYS: Cập nhật đơn giá sơ bộ & tiến độ RFQ
    end

    %% Giai đoạn 4: Thẩm định ĐẦU THÁNG & Luồng 3 bên
    Note over LEC,CST: ĐẦU THÁNG (TỪ NGÀY 01 ĐẾN NGÀY 05): THẨM ĐỊNH CHI PHÍ
    LEC->>SYS: Đóng hồ sơ thẩm định đầu tháng (Chỉ gom các mã ĐÃ CÓ QCODE)
    LEC->>CST: Thẩm định chi phí offline (Rà soát ngân sách SG No-Rollover & danh sách Over)
    opt Reviewer Cost Management cần thêm thông tin
        CST->>SYS: Nhập yêu cầu cần làm rõ trên giao diện Thẩm Định
        SYS-->>LEC: Thông báo yêu cầu làm rõ từ Reviewer
        LEC->>SYS: Giao việc & điều phối cho Kỹ sư phụ trách máy
        SYS-->>REQ: Nhận câu hỏi làm rõ trên Tab 4
        REQ->>SYS: Cập nhật bằng chứng kỹ thuật (ảnh, biên bản sự cố)
        SYS-->>LEC: Kỹ sư đã phản hồi
        LEC->>SYS: Tổng hợp tài liệu & Gửi lại cho Reviewer Cost Management
        CST->>SYS: Reviewer xác nhận hoàn tất thẩm định offline
    end

    %% Giai đoạn 5: Phê duyệt chính thức & Phát hành PO trên EMS
    LEC->>EMS: Tạo PRV No trên hệ thống EMS (Kèm biên bản thẩm định)
    Note over EMS: Cost Management (Reviewer - 1 người) phê duyệt ký tắt chính thức TRÊN EMS
    LEC->>SYS: Nhập mã PRV No vào hệ thống để bắt đầu đồng bộ tiến độ
    EMS-->>SYS: Đồng bộ trạng thái PO No đã phát hành

    %% Giai đoạn 6: Theo dõi tiến độ nhập hàng & Xuất kho
    LEC->>SYS: Nhập thủ công tiến độ: Vendor Confirm ngày giao, ETA về xưởng, Phân bổ chi phí
    EMS-->>SYS: Đọc dữ liệu nhập kho thực tế (Goods Receipt hoàn tất trên EMS)
    REQ->>EMS: Kỹ sư làm thủ tục xuất kho trên EMS để lấy phụ tùng lắp máy
    EMS-->>SYS: Tự động đồng bộ số liệu xuất kho (Issue Expense) & Ghi nhận chi phí thực tế
```

---

## 2. Các Mốc Trạng Thái Vòng Đời Của Yêu Cầu (Requisition State Machine)

Hệ thống quản lý tiến độ qua 8 trạng thái minh bạch:

```mermaid
stateDiagram-v2
    [*] --> DRAFT_DATA_PREPARATION: Kỹ sư nộp folder CAD/Doc/ảnh (Mã tạm TMP-HW-xxxx)
    DRAFT_DATA_PREPARATION --> QCODE_REGISTERED: LEC đã đăng ký QCode chính thức trên ERP/EMS
    
    QCODE_REGISTERED --> INTERLOCK_SCANNING: Quét Interlock, kiểm tra cờ agingInterlock & unitPrice
    
    state INTERLOCK_SCANNING {
        [*] --> HAS_OTHER_TEAM_STOCK: agingInterlockFlag = Y
        HAS_OTHER_TEAM_STOCK --> PERSISTENT_TASK_BORROW: Mở Task bắt buộc mượn tồn kho (Treo đến khi EMS='N')
        PERSISTENT_TASK_BORROW --> READY_FOR_AUDIT: EMS cập nhật 'N'
        [*] --> READY_FOR_AUDIT: agingInterlockFlag = N
    }
    
    READY_FOR_AUDIT --> MONTHLY_AUDIT_PENDING: LEC gom danh sách & tự phân loại Target/Over
    MONTHLY_AUDIT_PENDING --> THREE_WAY_CLARIFICATION: Reviewer Cost Management yêu cầu làm rõ
    THREE_WAY_CLARIFICATION --> MONTHLY_AUDIT_PENDING: Kỹ sư phản hồi qua LEC
    
    MONTHLY_AUDIT_PENDING --> EMS_PRV_PROCESSING: Thẩm định đầu tháng hoàn tất -> LEC tạo PRV trên EMS
    EMS_PRV_PROCESSING --> PO_TRACKING_PROGRESS: PRV/PO duyệt trên EMS -> LEC nhập Vendor Confirm & ETA
    PO_TRACKING_PROGRESS --> RECEIVED_IN_EMS: Hàng về (Đồng bộ từ EMS)
    RECEIVED_IN_EMS --> ISSUED_FROM_EMS: Kỹ sư xuất kho lắp máy (Đồng bộ Issue từ EMS)
    ISSUED_FROM_EMS --> [*]
```

---

## 3. Các Nguyên Tắc Vận Hành Bất Biến

1. **Tuyệt Đối Không Phê Duyệt Trên Hệ Thống Mới**:
   - Hệ thống mới đóng vai trò là "Bảng điều khiển kiểm soát tiến độ & dữ liệu kỹ thuật". Mọi phê duyệt có giá trị pháp lý và tài chính bắt buộc phải thực hiện trên **LG Display Nexacro EMS**.
2. **Loại Bỏ Hoàn Toàn Cổng Thủ Kho**:
   - Nhân viên kho không sử dụng ứng dụng này. Số liệu xuất kho, nhập kho và tồn kho vật lý được đọc tự động qua các API tích hợp của EMS.
3. **Điều Kiện Đủ Để Thẩm Định Chi Phí**:
   - Bắt buộc phải có **Mã QCode chính thức**. Mọi phụ tùng mới còn mang mã tạm `TMP-HW-xxxx` chỉ dừng ở giai đoạn chuẩn bị dữ liệu, không được đưa vào đợt thẩm định đầu tháng.
4. **Cảnh Báo Tồn Kho Khác Team Là Task Bắt Buộc**:
   - Kỹ sư không phải giải trình lý do chưa xuất, nhưng bắt buộc phải ưu tiên liên hệ mượn/xuất kho của Team bạn. Task này không thể bấm đóng thủ công; chỉ khi hệ thống đọc lại EMS thấy cờ chuyển `'N'`, Task mới tự động hoàn tất.
