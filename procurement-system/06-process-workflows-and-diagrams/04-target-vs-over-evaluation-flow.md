# 04. Sơ Đồ Quy Trình: Phân Loại Trong Target vs Over Ngoài Kế Hoạch & Thẩm Quyền Của LEC
> *Kỹ Sư Cung Cấp Lý Do/Hiện Trạng, LEC Chính Thức Đánh Dấu Cờ Phân Loại, Đối Chiếu Hai Trục Chi Phí (Mua Hàng vs Xuất Kho) & Ngân Sách Không Rollover*

---

## 1. Lưu Đồ Quyết Định Phân Loại Của LEC (Decision Flow)

```mermaid
flowchart TD
    Start["Kỹ Sư Process Gửi Nhu Cầu Mua / Xuất"] --> EngineerInput["Kỹ Sư Cung Cấp Dữ Liệu Hiện Trường:\n• Chọn Chế độ: Bù tồn định kỳ HOẶC Sự cố máy\n• Nhập mã Work Order sự cố (nếu có)\n• Đề xuất sơ bộ mã nguyên nhân (OVR-01 đến OVR-06)"]
    
    EngineerInput --> LEC_Review["LEC Mở Bàn Làm Việc Đối Soát Ngân Sách:\n• Kiểm tra Hạn mức Ngân Sách Tháng (Thủ công, No Rollover)\n• Kiểm tra tồn kho khả dụng & tỷ lệ tiêu hao"]
    
    LEC_Review --> EvalCheck{"Nhu cầu có nằm trong kế hoạch định mức ban đầu?"}
    
    EvalCheck -->|"Đúng định mức BOM & Tồn an toàn"| ActionTarget["LEC BẤM ĐÁNH DẤU: 🟢 TRONG TARGET\n(Cấp hạn mức chi tiêu thường xuyên)"]
    
    EvalCheck -->|"Phát sinh ngoài kế hoạch / Vượt hạn mức"| ActionOver["LEC BẤM ĐÁNH DẤU: 🔴 OVER NGOÀI KẾ HOẠCH\n(Xác nhận 1 trong 6 mã nguyên nhân OVR-01..06)"]
    
    ActionOver --> SplitFlow{"Phân loại theo bản chất chi phí"}
    
    SplitFlow -->|"Phát sinh từ Đơn Đặt Hàng Mới"| OverPO["🔴 OVER DO MUA HÀNG (PO COMMIT OVER)\n• Gắn mã PRV/PO, Nhà cung cấp\n• Đưa vào danh sách giải trình Thẩm định ngày 25"]
    
    SplitFlow -->|"Phát sinh từ Xuất Kho Lắp Máy"| OverIssue["🔴 OVER DO XUẤT KHO (ISSUE EXPENSE OVER)\n• Gắn mã Machine Name, Assembly Slot, Work Order\n• Ghi nhận vượt định mức vận hành công đoạn"]
    
    ActionTarget --> AuditQueue["GOM ĐƯA VÀO HỒ SƠ THẨM ĐỊNH NGÀY 25"]
    OverPO --> AuditQueue
    OverIssue --> MonthlyReview["GỬI BÁO CÁO KIỂM THẢO CHI PHÍ VẬN HÀNH"]
```

---

## 2. Bảng Ma Trận Phân Định Trách Nhiệm (RACI Matrix)

| Bước nghiệp vụ | Kỹ sư Quy trình (Requestor) | Kỹ sư Quản trị Thiết bị (LEC) | Leader Công Đoạn | Ban Quản Lý (Management) |
| :--- | :---: | :---: | :---: | :---: |
| Nhập hiện trạng máy & Work Order | **R** (Thực hiện) | I (Nhận tin) | A (Phê duyệt WO) | I |
| Đề xuất mã nguyên nhân Over | **R** (Đề xuất) | C (Tham vấn) | I | I |
| **Đánh dấu chính thức `TARGET` / `OVER`** | I | **R / A (Thẩm quyền duy nhất)** | I | I |
| Đối soát với hạn mức Ngân sách tháng | I | **R (Thực hiện)** | I | C |
| Phê duyệt danh sách Over trong phiên 25 | I | C (Giải trình) | C (Giải trình) | **A (Quyết định tối cao)** |

*(R: Responsible, A: Accountable, C: Consulted, I: Informed)*
