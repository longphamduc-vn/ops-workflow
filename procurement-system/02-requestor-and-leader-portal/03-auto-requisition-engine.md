# 03. Động Cơ Sinh Đơn Mua Định Kỳ Tự Động (Auto-Requisition Engine)

## 1. Cơ Chế Hoạt Động Định Kỳ

Động cơ sinh đơn tự động chạy định kỳ vào ngày 25 hàng tháng để tính toán lượng phụ tùng tiêu hao cần bù đắp cho tháng tiếp theo:

```mermaid
flowchart TD
    subgraph Inputs["Dữ Liệu Đầu Vào Tự Động"]
        P_Plan["Kế hoạch sản lượng Smart Watch tháng tới\n(Model D111, D222, D333)"]
        EBOM_Norm["Cây EBOM: Định mức tiêu hao / MTBF\ntheo từng Machine & Unit"]
        Stock["Tồn kho Onhand kho HW + PO Remained đang về\n(Từ Read-Model ops-workflow)"]
    end

    subgraph Calculation["Bộ Máy Tính Toán"]
        Step1["Tính tổng nhu cầu tiêu hao lý thuyết (BOM Demand)"]
        Step2["Khấu trừ tồn khả dụng: Net_Need = BOM Demand - (Onhand + PO)"]
        Step3["So sánh ngưỡng Target Stock & MOQ của nhà sản xuất"]
    end

    subgraph Output["Kết Quả Sinh Đơn"]
        Draft["Tự động sinh Đơn Mua Nháp (Draft Requisitions)\nPhân loại tự động: TRONG TARGET"]
        Notify["Bắn thông báo đến Leader & Kỹ sư từng công đoạn kiểm tra xác nhận"]
    end

    P_Plan & EBOM_Norm --> Step1
    Stock --> Step2
    Step1 --> Step2 --> Step3 --> Draft --> Notify
```

---

## 2. Công Thức Tính Toán Chi Tiết

$$\text{Nhu Cầu Mua Bổ Sung} = \max\left(0, \left(\sum_{\text{Model}} \frac{\text{Sản Lượng Dự Kiến}}{\text{Định Mức Tuổi Thọ Phụ Tùng}} \times \text{SL Lắp/Máy}\right) + \text{Target Buffer} - (\text{Onhand} + \text{PO Remained})\right)$$

*   Nếu kết quả $> 0$: Làm tròn lên theo **Số lượng đặt tối thiểu (MOQ)** hoặc **Quy cách đóng gói (Pack Size)**.
*   Toàn bộ các đơn hàng sinh ra từ động cơ này đều được hệ thống tự động gắn nhãn: **🟢 TRONG TARGET (IN_TARGET)** vì nằm hoàn toàn trong kế hoạch sản lượng định mức.
*   Kỹ sư và Leader công đoạn chỉ cần vào giao diện xem trước (Preview), bấm xác nhận hoặc điều chỉnh nhẹ nếu có lịch dừng bảo trì dài ngày.

