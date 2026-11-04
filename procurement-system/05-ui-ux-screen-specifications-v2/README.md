# BỘ ĐẶC TẢ GIAO DIỆN MÀN HÌNH THÔNG TIN (PHIÊN BẢN V2)
# (INFORMATION SCREENS & UI/UX SPECIFICATIONS - V2)

> **Phân xưởng**: Smart Watch (SW) — Factory HW (Display Module Plant 1 - Org ID: `28753`)  
> **Kiến trúc vận hành**: Song song & Đồng bộ với Nexacro EMS (Core ERP)  
> **Mục tiêu phiên bản**: Chuẩn hóa toàn diện các **Màn Hình Thông Tin**, bảng biểu, trường dữ liệu, wireframe ASCII và dòng chảy tương tác, không chỉnh sửa dự án web.

---

## 1. TỔNG QUAN PHIÊN BẢN V2 & ĐẶC ĐIỂM CỐT LÕI

Phiên bản V2 này khắc phục triệt để sự "phân hóa" dữ liệu và tình trạng thiếu chức năng ở phiên bản cũ bằng cách tập trung vào **Kiến trúc Thông tin (Information Architecture)**:
1. **Triệt tiêu phân cấp công đoạn**: Xóa bỏ các cổng phê duyệt rườm rà (POL, TAB, DIP); toàn bộ kỹ sư hiện trường trong Part/Team là **đồng nghiệp ngang hàng**.
2. **Loại bỏ vai trò Kho vận**: Nhân viên kho không sử dụng hệ thống này; dữ liệu xuất nhập kho được tự động đồng bộ từ EMS `ds_Inv`.
3. **Tuyệt đối không có nút phê duyệt**: Phê duyệt chính thức PRV và PO diễn ra 100% trên **Nexacro EMS**. Hệ thống chỉ tập trung vào kiểm soát tiến độ, đối soát và điều phối tác nghiệp.
4. **Hợp nhất vai trò Thẩm định chi phí**: Reviewer & Assistant được hợp nhất thành **1 cá nhân duy nhất** tại Bộ phận Quản lý Chi phí.
5. **Hỗ trợ Đa LEC (Multi-LEC)**: Nhóm điều phối thiết bị gồm Phạm Đức Long (658359) và các đồng nghiệp LEC có thể chuyển đổi linh hoạt.
6. **Thời điểm thẩm định chi phí**: Diễn ra định kỳ vào **Đầu Mỗi Tháng (Ngày 01-05)** thay vì ngày 25.
7. **Điều kiện tiên quyết để thẩm định**: **Bắt buộc phải có mã QCode chính thức**; toàn bộ mã tạm `TMP-HW-xxxx` sinh ra từ việc tải folder bản vẽ/catalog chỉ là bước chuẩn bị dữ liệu kỹ thuật và bị chặn khỏi kỳ thẩm định.
8. **Đánh dấu thủ công Target/Over**: Tuyệt đối không tự động phân loại; LEC trực tiếp đánh dấu dựa trên mã Work Order và lý do kỹ sư cung cấp, gắn 1 trong 6 mã `OVR-01..06`.
9. **Cầu nối giải trình 3 bên**: Reviewer $\leftrightarrow$ LEC $\leftrightarrow$ Kỹ sư hiện trường.
10. **Ngân sách SG không lũy kế (Strict No-Rollover)**: LEC nhập ngân sách hàng tháng thủ công; số dư chuyển sang tháng sau bắt buộc bằng $0.

---

## 2. DANH MỤC 7 TÀI LIỆU ĐẶC TẢ CHI TIẾT TRONG BỘ V2

| TT | Tài Liệu Đặc Tả | Mã Màn Hình | Vai Trò Chính | Trọng Tâm Nghiệp Vụ & Thông Tin |
| :-: | :--- | :---: | :---: | :--- |
| **00** | [**`00-tong-quan-kien-truc-man-hinh-thong-tin.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/00-tong-quan-kien-truc-man-hinh-thong-tin.md) | **Architecture** | Toàn bộ hệ thống | Ma trận phân quyền 5 vai trò, chuẩn màu sắc, phân tầng thông tin |
| **01** | [**`01-man-hinh-thong-tin-tong-quan-toan-xuan-dashboard.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/01-man-hinh-thong-tin-tong-quan-toan-xuan-dashboard.md) | **`UI-INFO-00`** | Toàn xưởng | Phễu tiến độ 7 giai đoạn, 3 trục ngân sách SG, phân tích 6 mã Over, xuất Excel 4 sheet |
| **02** | [**`02-man-hinh-thong-tin-ky-su-va-tien-do-mua-sam.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/02-man-hinh-thong-tin-ky-su-va-tien-do-mua-sam.md) | **`UI-INFO-01`** | Field Engineer | Đăng ký theo tên máy thân thiện, sinh mã EM 14 ký tự, folder QCode, tác vụ bắt buộc |
| **03** | [**`03-man-hinh-thong-tin-cay-thiet-bi-ebom-va-co-cau.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/03-man-hinh-thong-tin-cay-thiet-bi-ebom-va-co-cau.md) | **`UI-INFO-02`** | Kỹ sư & LEC | Cây thiết bị trực quan, kéo-thả slot cơ cấu, định mức thay thế, hàng đợi khai báo muộn |
| **04** | [**`04-man-hinh-thong-tin-giam-sat-leader-va-work-order.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/04-man-hinh-thong-tin-giam-sat-leader-va-work-order.md) | **`UI-INFO-03`** | Leader Team/Part | Giám sát Team => Part, đôn đốc giải trình tồn kho đầu tháng, đối soát kỹ thuật Work Order |
| **05** | [**`05-man-hinh-thong-tin-dieu-phoi-lec-master-workbench.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/05-man-hinh-thong-tin-dieu-phoi-lec-master-workbench.md) | **`UI-INFO-04`** | Điều Phối LEC | Gom mẻ theo trạng thái, giải tỏa Interlock, đánh dấu Target/Over, cấp QCode, mốc Inbound |
| **06** | [**`06-man-hinh-thong-tin-tham-dinh-chi-phi-dau-thang.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/06-man-hinh-thong-tin-tham-dinh-chi-phi-dau-thang.md) | **`UI-INFO-05`** | Cost Management | Thẩm định đầu tháng (01-05), chặn mã tạm, kiểm thảo tồn kho >30d, cấp Cost Clearance |
| **07** | [**`07-man-hinh-thong-tin-cau-hinh-he-thong-va-gateway-ems.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/07-man-hinh-thong-tin-cau-hinh-he-thong-va-gateway-ems.md) | **`UI-INFO-06`** | System Admin | Cấu trúc phân xưởng đa nhà máy, quy tắc tầng, định mức 5 nhu cầu, giám sát cổng EMS |

---

## 3. SO SÁNH NÂNG CẤP V1 VÀ V2

```
+───────────────────────────────+─────────────────────────────────────────────────────────────+
| TIÊU CHÍ SO SÁNH              | PHIÊN BẢN CŨ (V1)           | PHIÊN BẢN THÔNG TIN MỚI (V2)  |
+───────────────────────────────+─────────────────────────────────────────────────────────────+
| Phân chia vai trò             | 6-7 vai trò rời rạc         | 5 vai trò tinh gọn, đúng RACI |
| Vai trò Thủ kho               | Tồn tại màn hình riêng      | Đã loại bỏ (đồng bộ từ EMS)   |
| Quy trình phê duyệt           | Có nút duyệt trên màn hình  | Không phê duyệt (duyệt trên EMS)
| Cơ cấu kỹ sư                  | Chia theo công đoạn POL/TAB | Đồng nghiệp ngang hàng        |
| Quản lý Chi phí               | Chia Reviewer & Assistant   | 1 chuyên viên duy nhất        |
| Thời điểm thẩm định           | Thẩm định ngày 25           | Thẩm định đầu tháng (01-05)   |
| Điều kiện thẩm định           | Chưa kiểm soát mã tạm       | Bắt buộc có QCode chính thức  |
| Đánh dấu Target/Over          | Mơ hồ, dễ nhầm tự động hóa  | Thủ công 100% do LEC đánh dấu |
| Giải trình tồn kho            | Báo cáo đơn lẻ              | Tác vụ bắt buộc trên màn hình |
| Cây thiết bị EBOM             | Danh sách tĩnh              | Bàn kéo - thả trực quan 3 khung|
| Xuất báo cáo                  | Nhiều biểu mẫu phân tán     | Duy nhất 1 file Excel 4 sheet |
+───────────────────────────────+─────────────────────────────────────────────────────────────+
```
