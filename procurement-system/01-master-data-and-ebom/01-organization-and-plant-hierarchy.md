# 01. Cơ Cấu Tổ Chức, Nhà Xưởng & Phân Định Pháp Nhân
> *Cập nhật chuẩn hóa: Factory HW = Smart Watch (SW), phân cấp Team => Part => Process, và vị trí của LEC trong Team*

---

## 1. Cơ Cấu Tổ Chức Nhà Máy & Phân Cấp Nội Bộ (Team => Part => Process)

Hệ thống phục vụ trực tiếp cho hoạt động quản lý phụ tùng tại **Factory HW** (Display Module Plant 1 - Org ID: 28753), trong đó **Factory HW chính là toàn bộ ngành sản xuất Smart Watch (SW)**:

$$\mathbf{Factory\ HW} = \mathbf{Ng\grave{a}nh\ Smart\ Watch\ (SW)}$$

*(Công ty có thể có các nhà máy khác phụ trách các ngành hàng khác như TV, Màn hình ô tô Auto Display...)*.

```
Tập Đoàn / Công Ty (Nhiều Pháp Nhân & Nhiều Nhà Máy)
 └── Factory HW = Smart Watch (SW) (Display Module Plant 1 - Org: 28753)
       │
       ├── Team Management (Ban Lãnh Đạo / Quản Lý Nhà Máy)
       │     ├── Reviewer (Quản lý cấp cao duyệt PRV, Budget)
       │     ├── Assistant (Trợ lý điều phối, theo dõi tiến độ)
       │     └── Cơ chế: Tạm thời CHƯA đưa vào hệ thống, thẩm định OFFLINE hàng tháng
       │
       ├── Team (Ví dụ: PO Module Technology Team 2 - Mã BP: 87321)
       │     │
       │     ├── LEC (Quản Lý Spare Parts Trong Team)
       │     │     ├── Bản chất: Là 1 người hoặc 1 nhóm người chuyên trách TRONG TEAM
       │     │     ├── Đại diện phụ trách: Pham Duc Long (User ID: 658359)
       │     │     └── Vai trò: Xử lý các hạng mục từ kỹ sư, gửi request báo giá sang Purchase,
       │     │                  thẩm định kỹ thuật, mở Interlock, chốt đơn mua tháng và lên PO
       │     │
       │     └── Part (Phân ban / Bộ phận trong Team - ví dụ: CP/SG Part 1)
       │           │
       │           └── Process (Các công đoạn sản xuất trong Part):
       │                 ├── POL (Polarizer - Dán phim phân cực)
       │                 ├── TAB (Tape Automated Bonding - Ép vi mạch màng dẻo)
       │                 ├── DIP (Dual In-line Package / Hàn nhúng chân cắm)
       │                 ├── LT  (Laser Trimming / Low Temperature Process)
       │                 ├── DB  (Die Bonding - Gắn chip bán dẫn)
       │                 └── BD  (Wire/Ball Bonding - Đấu nối dây vi mạch)
       │                 │
       │                 ├── Process Leaders: Quản lý kỹ thuật và giám sát mua sắm của công đoạn
       │                 └── Engineer Process: Kỹ sư trực tiếp vận hành máy (NGƯỜI TẠO HẠNG MỤC MUA)
       │
       └── Bộ Phận Mua Hàng Ngoài (Purchase Dept)
             └── Đơn vị thương mại chuyên trách: Đàm phán giá với nhà cung cấp ngoài (ServeOne, SMC, Trumpf...)
```

---

## 2. Vị Trí & Vai Trò Của LEC Trong Team

- **LEC là 1 người hoặc 1 nhóm người trong Team**:
  - LEC không phải là một phòng ban xa lạ bên ngoài, mà trực thuộc ngay trong Team (ví dụ: `PO Module Technology Team 2`).
  - Là đầu mối chuyên trách am hiểu sâu về kỹ thuật phụ tùng của các `Part` và `Process`.
  - Phụ trách gom nhu cầu từ các `Engineer Process`, chuẩn hóa thông số, cấp mã tạm `TMP-HW-xxxx`, làm việc với bộ phận `Purchase`, điều phối Interlock và tổng hợp kỳ mua sắm trình `Team Management`.

---

## 3. Phân Cấp Thiết Bị Kỹ Thuật (EBOM Core Hierarchy)

Cấu trúc định danh máy móc thiết bị gắn chặt với phân cấp tổ chức:

$$\mathbf{Process\ (C\hat{o}ng\ \text{đ}o\text{ạ}n)} \longrightarrow \mathbf{Machine\ (M\acute{a}y)} \longrightarrow \mathbf{Unit\ (C\text{ụ}m\ m\acute{a}y)} \longrightarrow \mathbf{Line\ (D\hat{a}y\ chuy\text{ề}n)}$$

*   **Vị trí sản xuất Smart Watch tại Factory HW**:
    - **Tòa nhà (Building)**: H1, H2, H3.
    - **Tầng (Floor)**: 2F, 6F... (Quy tắc tự động: `Left(Line, 1) = Floor`).
    - **Dây chuyền (Line)**: `#201 ~ #210` (Tầng 2F), `#601, #604` (Tầng 6F).
    - **Model sản phẩm Smart Watch**: D111, D222, D333.
*   **Machine & Unit**: Mỗi máy trên line (ví dụ máy gắn chip `DB-01`) chia thành các cụm cơ cấu chức năng (`Bonding Head Unit`, `Feeder Unit`), nơi lắp đặt các linh kiện phụ tùng cụ thể.

---

## 4. Bản Chất Giao Dịch Liên Pháp Nhân (Inter-Entity vs Intra-Plant)

Hệ thống phân biệt rõ ràng 2 phạm vi điều chuyển:
1.  **Nội bộ nhà máy Factory HW (Intra-Plant / Same Entity)**: Điều chuyển phụ tùng giữa các kho H1, H2, H3 trong cùng Factory HW.
2.  **Liên pháp nhân (Different Legal Entities)**:
    *   Các giao dịch qua API `/emsspareparts/sp40/sp401Nav/retPartsTransferReqList.lgdn` và `retOtherSitePoRevReqList.lgdn` là với **các pháp nhân độc lập** (ví dụ: LGD Hàn Quốc, LGD Trung Quốc, hoặc các công ty con liên kết).
    *   **Nguyên tắc vận hành**: **Pháp nhân không có quyền từ chối chuyển giao đơn phương**, mà phiếu yêu cầu sẽ ở trạng thái **Chờ pháp nhân khác xác nhận (Pending External Entity Confirmation)**.
    *   Chỉ khi có phản hồi chính thức từ pháp nhân đó (do vướng kiểm kê thực tế thiếu hụt hoặc thủ tục hải quan xuất nhập khẩu giữa 2 quốc gia), hệ thống mới ghi nhận kết quả chuyển bước.
