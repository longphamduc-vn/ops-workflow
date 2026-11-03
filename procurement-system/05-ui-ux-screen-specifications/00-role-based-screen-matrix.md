# 00. Ma Trận Phân Định Màn Hình Theo Vai Trò Người Dùng (Role-Based Screen Matrix)
> *Kiến trúc điều hướng và phân quyền truy cập: Loại bỏ Cổng Thủ Kho (thủ kho không dùng hệ thống, xuất kho lấy tự động từ EMS), Bỏ hệ thống duyệt (duyệt trên EMS, hệ thống chỉ kiểm soát tiến độ), Kỹ sư ngang hàng không chia công đoạn, Cost Management (Reviewer & Assistant là 1 người)*

---

## 1. Khung Phân Quyền 5 Nhóm Vai Trò Cốt Lõi (User Role Architecture)

Hệ thống được thiết kế theo nguyên tắc tối thiểu hóa quyền hạn và phân vùng phạm vi chặt chẽ (Principle of Least Privilege & Scoped Visibility). **Mỗi vai trò sở hữu 1 không gian làm việc chuyên biệt độc lập**:

```mermaid
graph TD
    subgraph Roles["5 Không Gian Giao Diện Độc Lập Theo Vai Trò"]
        R1["1. REQUESTOR PORTAL\n(Kỹ Sư Hiện Trường - Ngang hàng nhau)"]
        R2["2. LEADER DASHBOARD\n(Leader Team / Part - Theo dõi tiến độ)"]
        R3["3. LEC MASTER WORKBENCH\n(Quản Lý Spare Part - Pham Duc Long)"]
        R5["4. ADMIN CONSOLE\n(Quản Trị Viên & Cài Đặt Hệ Thống)"]
        R6["5. COST MANAGEMENT PORTAL\n(Bộ Phận Quản Lý Chi Phí - 1 Người)"]
    end

    subgraph Scope["Phạm Vi Hiển Thị & Thao Tác (Visibility Scope)"]
        S_Mach["Theo máy, cụm máy thân thiện (không phân công đoạn)"]
        S_Team["Toàn bộ tiến độ mua sắm nội bộ Team (Team => Part)"]
        S_LEC["Gom đơn, Interlock, tiến độ nhập hàng thủ công, cầu nối Reviewer-Kỹ sư"]
        S_ADM["Toàn bộ tham số cấu hình, phân quyền, kết nối Gateway"]
        S_CST["Toàn cảnh ngân sách SG, kiểm thảo tồn kho & thẩm định chi phí ĐẦU THÁNG"]
    end

    R1 --> S_Mach
    R2 --> S_Team
    R3 --> S_LEC
    R5 --> S_ADM
    R6 --> S_CST
```

### Danh Mục Không Gian Giao Diện Theo Vai Trò & Màn Hình Chung:
0. [**Màn Hình Chung: Dashboard Kiểm Soát Tiến Độ Tổng Hợp (UI-COMMON-00)**](file:///wsl.localhost/Ubuntu/home/longp/projects/ops-workflow/procurement-system/05-ui-ux-screen-specifications/00-common-dashboard/screen-universal-analytics-dashboard.md): Tháp chỉ huy dữ liệu thời gian thực: Phễu tiến độ mua sắm, KPIs tồn kho & Task giải trình, ngân sách 3-chiều, phân tích 6 mã Over (tách riêng do Mua Hàng vs Xuất Kho từ EMS).
1. [**Giao Diện Kỹ Sư Hiện Trường (Requestor Portal - UI-ROLE-01)**](file:///wsl.localhost/Ubuntu/home/longp/projects/ops-workflow/procurement-system/05-ui-ux-screen-specifications/01-role-requestor/screen-requestor-portal.md): Tạo đơn theo tên máy thân thiện, snapshot tồn kho, lưới Excel, cây EBOM, **chuẩn bị dữ liệu folder CAD để LEC đăng ký QCode**, phản hồi làm rõ thông tin với LEC và **Task Giải Trình Tồn Kho Đầu Tháng**.
2. [**Giao Diện Quản Lý Team / Part (Leader Dashboard - UI-ROLE-02)**](file:///wsl.localhost/Ubuntu/home/longp/projects/ops-workflow/procurement-system/05-ui-ux-screen-specifications/02-role-leader/screen-leader-team-dashboard.md): Giám sát tiến độ mua sắm phân tầng theo `Team => Part`, rà soát sơ bộ lý do Over và đôn đốc Task giải trình tồn kho của kỹ sư *(Tuyệt đối không phê duyệt thay EMS)*.
3. [**Giao Diện LEC Trong Team (LEC Master Workbench - UI-ROLE-03)**](file:///wsl.localhost/Ubuntu/home/longp/projects/ops-workflow/procurement-system/05-ui-ux-screen-specifications/03-role-lec/screen-lec-master-workbench.md): Multi-LEC gom đơn toàn team, Interlock 4 bước (xử lý cờ `agingInterlockFlag` xuất dùng tồn kho Team bạn, `unitPriceFlag`), EOL reclassification, theo dõi RFQ, **nhập tiến độ nhập hàng thủ công**, **cầu nối phản hồi 3 bên** với Reviewer Cost Management.
4. [**Giao Diện Quản Trị Hệ Thống (Admin Settings Console - UI-ROLE-05)**](file:///wsl.localhost/Ubuntu/home/longp/projects/ops-workflow/procurement-system/05-ui-ux-screen-specifications/05-role-admin/screen-admin-settings-portal.md): Cấu hình 6 Tab: Công thức logic mua, nhà xưởng, phân cấp Line `Left(Line,1)=Floor`, Cây Đa Team (bỏ trường công đoạn, kỹ sư ngang hàng), Ngân sách SG No-Rollover, Nexacro Gateway Rate Limiting.
5. [**Giao Diện Bộ Phận Quản Lý Chi Phí (Cost Management Portal - UI-ROLE-06)**](file:///wsl.localhost/Ubuntu/home/longp/projects/ops-workflow/procurement-system/05-ui-ux-screen-specifications/06-role-management/screen-management-audit-portal.md): Dành cho **Reviewer & Assistant (1 người duy nhất)**: Thẩm định chi phí và kiểm thảo giải trình tồn kho ĐẦU THÁNG, rà soát danh sách Over, **nhập yêu cầu cần thêm thông tin gửi cho LEC** *(Phê duyệt chính thức diễn ra trên EMS)*.

---

## 2. Bảng Ma Trận Quyền Hạn Màn Hình

| Không Gian Chức Năng | Kỹ Sư Hiện Trường | Leader Team / Part | LEC Trong Team | Cost Management (1 Người) | System Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **00. Dashboard Tiến Độ Chung** | 👁️ Xem phạm vi máy | 👁️ Xem Team/Part | 👁️ Xem toàn Team | 👁️ Xem toàn xưởng | **Toàn quyền** |
| **01. Cổng Kỹ Sư (Requestor)**<br>• Tạo đơn theo tên thân thiện<br>• Chuẩn bị data folder QCode<br>• Phản hồi làm rõ thông tin<br>• Task giải trình tồn kho đầu tháng | **Toàn quyền**<br>(Tạo, Sửa nháp, Nộp data) | 👁️ Xem theo dõi | 👁️ Xem & Hỗ trợ | 🚫 Không truy cập | **Toàn quyền**<br>(Hỗ trợ kỹ thuật) |
| **02. Bàn Theo Dõi Leader**<br>• Giám sát tiến độ Team => Part<br>• Đôn đốc Task giải trình tồn kho<br>• *(Không phê duyệt)* | 🚫 Không truy cập | **Toàn quyền theo dõi**<br>(Ghi chú nội bộ) | 👁️ Xem liên thông | 👁️ Xem đối soát | **Toàn quyền** |
| **03. Bàn Làm Việc LEC**<br>• Gom đơn cùng trạng thái<br>• Đánh dấu Trong Target vs Over<br>• Mở Interlock & EOL<br>• Cầu nối thông tin Reviewer-Kỹ sư<br>• Nhập tiến độ nhập hàng thủ công | 🚫 Không truy cập | 👁️ Chỉ xem tiến độ | **Toàn quyền điều phối**<br>(Xử lý, Mở chặn, Nhập hàng) | 👁️ Xem hồ sơ chuẩn bị | **Toàn quyền** |
| **04. Bàn Cost Management**<br>• Thẩm định chi phí ĐẦU THÁNG<br>• Kiểm thảo giải trình tồn kho<br>• Gửi yêu cầu thêm thông tin cho LEC<br>• Tra cứu đối soát EMS | 🚫 Không truy cập | 🚫 Không truy cập | 👁️ Xem yêu cầu bổ sung | **Toàn quyền kiểm soát**<br>(Yêu cầu làm rõ, Clearance) | **Toàn quyền** |
| **05. Cài Đặt Hệ Thống (Settings)**<br>• Cấu hình công thức 5 nhu cầu<br>• Cây Đa Team (kỹ sư ngang hàng)<br>• Gateway EMS Rate Limiting | 🚫 Không truy cập | 🚫 Không truy cập | ⚙️ Cài đặt ngân sách Team | 🚫 Không truy cập | **Toàn quyền cấu hình** |
| **06. Kéo - Thả EBOM Máy** | 👁️ Tra cứu & Chọn | 👁️ Tra cứu | **Toàn quyền gán mã** | 👁️ Tra cứu cơ cấu | **Toàn quyền** |
