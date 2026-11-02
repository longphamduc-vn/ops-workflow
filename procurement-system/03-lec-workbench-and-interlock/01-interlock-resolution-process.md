# 01. Quy Trình Xử Lý Interlock Tuần Tự: Cơ Chế Y/N & Chờ Pháp Nhân Xác Nhận

## 1. Nguyên Tắc Cốt Lõi Về Đánh Giá Interlock

Quy trình Interlock được thiết lập lại dựa trên hai nguyên tắc nghiệp vụ mới:
1.  **Đánh giá thuần túy theo cờ Y/N**:
    *   Hệ thống chỉ kiểm tra cờ chặn là có hay không (`Y` hoặc `N`).
    *   Tuyệt đối **không đánh giá dựa trên số lượng tồn kho** (`transferQty`), vì số lượng tồn kho trên hệ thống chỉ mang tính chất tham khảo, không đảm bảo việc xuất hàng thực tế giữa các pháp nhân.
2.  **Pháp nhân không có quyền từ chối chuyển giao**:
    *   Trong cấu trúc tập đoàn, một pháp nhân thành viên không có quyền đơn phương hủy hay từ chối lệnh điều chuyển của hệ sinh thái.
    *   Trạng thái chính thức là: **Chờ Pháp Nhân Khác Xác Nhận Chuyển Giao (Pending External Entity Confirmation)**.

---

## 2. Chi Tiết 4 Bước Interlock Tuần Tự

```mermaid
flowchart TD
    Start["Hạng mục chuyển sang Thẩm Định Interlock"] --> CheckStop{"stopPoFlag == 'Y' ?\n(Có cờ chặn mua?)"}
    CheckStop -->|Không ('N')| Step4_Pass["Chuyển thẳng Mua Thường (Standard PO)"]
    
    CheckStop -->|Có ('Y')| Step1["BƯỚC 1: TRANSFER (Điều chuyển liên pháp nhân)"]
    Step1 --> CheckTransFlag{"transferFlag == 'Y' ?"}
    CheckTransFlag -->|Có ('Y')| SendReq["Gửi lệnh điều chuyển sang hệ thống pháp nhân bạn\nTrạng thái: CHỜ PHÁP NHÂN KHÁC XÁC NHẬN"]
    SendReq --> EntityConfirm{"Pháp nhân bạn xác nhận\nchuyển giao thành công?"}
    EntityConfirm -->|Xác nhận ('Y')| DoneTransfer["Hoàn tất điều chuyển nội bộ\n(Đóng / Khấu trừ nhu cầu mua ngoài)"]
    EntityConfirm -->|Chưa thể giao ngay ('N')\n(Vướng kiểm kê / Giấy tờ hải quan)| Step2

    CheckTransFlag -->|Không ('N')| Step2["BƯỚC 2: REJECT & TRƯỜNG HỢP ĐẶC BIỆT CHECKDISUSE"]
    Step2 --> CheckDisuse{"disuseFlag == 'Y' ?\n(Cờ cảnh báo phế thải / khóa kỹ thuật)"}
    CheckDisuse -->|Có ('Y')| ExtractReason["Tự động trích xuất nguyên văn lý do từ TargetStockSearchList\nTrường: holdReasonContent"]
    ExtractReason --> RejectAction["LEC thông báo lý do chính thức cho Requestor & Hủy hạng mục"]
    
    CheckDisuse -->|Không ('N')| Step3["BƯỚC 3: INTERNAL (Tái sinh / Sửa chữa phụ tùng SPR)"]
    Step3 --> CheckRepair{"waitRepairFlag == 'Y' ?\n(Có linh kiện hỏng chờ sửa?)"}
    CheckRepair -->|Có ('Y')| EvalRepair{"Phương án sửa chữa nội bộ\ncó khả thi & hiệu quả (Y/N)?"}
    EvalRepair -->|Khả thi ('Y')| DoRepair["Tạo lệnh sửa chữa / Phục hồi nội bộ"]
    EvalRepair -->|Không hiệu quả / Không kịp tiến độ ('N')| Step4

    CheckRepair -->|Không ('N')| Step4["BƯỚC 4: MỞ CHẶN MUA THƯỜNG (Clear Interlock)"]
    Step4 --> ActionClear["Chuyển stopPoFlag = 'N'\nĐủ điều kiện xuất đơn mua thường"]
    ActionClear --> Step4_Pass
```

---

## 3. Phân Tích Kỹ Thuật Bước 1: Chờ Pháp Nhân Khác Xác Nhận

- **Bản chất giao tiếp**: Gọi API `/emsspareparts/sp40/sp401Nav/retPartsTransferReqList.lgdn` và `/retOtherSitePoRevReqList.lgdn`.
- **Luồng xử lý trên giao diện LEC**:
  - Khi `transferFlag == 'Y'`, hệ thống chuyển trạng thái dòng thành:
    `⏳ PENDING_OTHER_ENTITY_CONFIRMATION`
  - Hệ thống ghi nhận mốc thời gian chờ (SLA quy định: 48 giờ làm việc).
  - Nếu sau 48 giờ pháp nhân bạn chưa xác nhận điều phối hoặc có thông báo vướng mắc thủ tục xuất khẩu liên quốc gia $\rightarrow$ LEC được quyền ghi chú lý do và chuyển tiếp sang Bước 2 mà không bị hệ thống chặn cứng.

---

## 4. Xử Lý Trường Hợp Đặc Biệt: `CheckDisuse` & `holdReasonContent`

- **Tầm quan trọng**: Ngăn ngừa tuyệt đối việc kỹ sư mua nhầm các chi tiết máy đã bị nhà sản xuất thu hồi hoặc bị kỹ thuật cấm sử dụng do lỗi thiết kế.
- **Nguồn dữ liệu trích xuất**:
  - Gọi API `/emsspareparts/sp302/sp330Nav/TargetStockSearchList.lgdn`.
  - Đọc trường **`holdReasonContent`** trong dataset `ds_StockInfomation`.
- **Ví dụ hiển thị trên màn hình**:
  > ⚠️ **CẢNH BÁO DISUSE**: Phụ tùng này bị cấm mua mới trên hệ sinh thái EMS.  
  > **Lý do từ hệ thống**: *"Khai tử theo chỉ thị thay thế cụm đầu gắp Bonding Head V2 model D222 ngày 2026-09-01 (Công văn kỹ thuật HQ-601)"*.  
  > $\rightarrow$ Hệ thống tự động khóa nút Mua Thường, chỉ cho phép LEC bấm `Xác Nhận Hủy (Reject)`.

