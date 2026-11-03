# 03. Động Cơ Sinh Đơn Mua Định Kỳ Tự Động (Auto-Requisition Engine)

> *Tài liệu đặc tả Động Cơ Gợi Ý Nhu Cầu Phụ Tùng Tự Động (Auto-Requisition Engine)*  
> *Nguyên tắc cốt lõi: Phục vụ kỳ thẩm định đầu tháng; Không tự động phân loại Target/Over (LEC tự tay đánh giá phân loại); Kỹ sư ngang hàng trong Part (không phân chia công đoạn); Kiểm soát tiến độ và chuẩn bị dữ liệu.*

---

## 1. Cơ Chế Hoạt Động Định Kỳ

Động cơ sinh đơn tự động chạy định kỳ vào cuối tháng để tính toán lượng phụ tùng tiêu hao cần bù đắp, sẵn sàng dữ liệu cho **đợt thẩm định chi phí vào ĐẦU THÁNG** giữa LEC và Bộ phận Quản Lý Chi Phí (Cost Management):

```mermaid
flowchart TD
    subgraph Inputs["Dữ Liệu Đầu Vào Tự Động"]
        P_Plan["Kế hoạch sản lượng Smart Watch tháng tới\n(Model D111, D222, D333)"]
        EBOM_Norm["Cây EBOM: Định mức tiêu hao / MTBF\ntheo từng Machine & Unit"]
        Stock["Tồn kho Onhand kho HW + PO Remained đang về\n(Từ Read-Model ops-workflow)"]
    end

    subgraph Calculation["Bộ Máy Tính Toán"]
        Step1["Tính tổng nhu cầu tiêu hao lý thuyết (BOM Demand)"]
        Step2["Khấu trừ tồn khả dụng: Net_Need = BOM Demand - (Onhand + PO Remained)"]
        Step3["So sánh ngưỡng Target Stock & MOQ của nhà sản xuất"]
    end

    subgraph Output["Kết Quả Gợi Ý & Xử Lý"]
        Draft["Tự động sinh Đơn Mua Gợi Ý (Suggested Draft Requisitions)\n(Yêu cầu bắt buộc phải có QCode chính thức)"]
        LECEval["LEC tự tay rà soát và phân loại thủ công:\n[TARGET] hoặc [OVER PHÁT SINH]"]
        Notify["Hiển thị trên màn hình Kỹ sư & Part Leader để rà soát tiến độ"]
    end

    P_Plan & EBOM_Norm --> Step1
    Stock --> Step2
    Step1 --> Step2 --> Step3 --> Draft --> LECEval --> Notify
```

---

## 2. Công Thức Tính Toán Chi Tiết

$$\text{Nhu Cầu Mua Bổ Sung} = \max\left(0, \left(\sum_{\text{Model}} \frac{\text{Sản Lượng Dự Kiến}}{\text{Định Mức Tuổi Thọ Phụ Tùng}} \times \text{SL Lắp/Máy}\right) + \text{Target Buffer} - (\text{Onhand} + \text{PO Remained})\right)$$

*   Nếu kết quả $> 0$: Làm tròn lên theo **Số lượng đặt tối thiểu (MOQ)** hoặc **Quy cách đóng gói (Pack Size)**.
*   **Điều kiện thẩm định**: Chỉ các hạng mục đã có **Mã QCode chính thức** mới đủ điều kiện đưa vào danh sách thẩm định đầu tháng. Các mã tạm (`TMP-HW-xxxx`) phải hoàn tất tải dữ liệu kỹ thuật để LEC đăng ký QCode trước.
*   **Không tự động phân loại**: Hệ thống chỉ đưa ra số liệu tính toán gợi ý. **LEC là người trực tiếp đánh giá và phân loại thủ công** xem hạng mục đó thuộc diện `TARGET` (trong kế hoạch chi phí) hay `OVER` (vượt kế hoạch cần giải trình).
*   **Kiểm soát tiến độ**: Kỹ sư phụ trách máy xem trước danh sách gợi ý, phản hồi thực tế tình trạng máy móc cho LEC trước thời hạn (Deadline) do LEC thiết lập.
