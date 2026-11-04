# BỘ ĐẶC TẢ GIAO DIỆN & CẤU TRÚC MÀN HÌNH NGHIỆP VỤ (PHIÊN BẢN V2)
# (MASTER SCREEN SPECIFICATIONS & UI/UX ARCHITECTURE - V2)

> **Dự án**: Spare Parts Procurement Tracking & Engineering Operations Platform  
> **Phân xưởng áp dụng**: Smart Watch (SW) — Factory HW (Display Module Plant 1 - Org ID: `28753`)  
> **Kiến trúc vận hành**: Song song & Đồng bộ với Nexacro EMS (Core ERP Mainframe)  
> **Phiên bản tài liệu**: 2.0 - Hoàn chỉnh, Liền Mạch & Không Rời Rạc (Zero Fragmentation)  
> **Nguyên tắc bất biến**: KHÔNG chỉnh sửa source code dự án web (`services/procurement-web`); Toàn bộ tài liệu chuẩn hóa cấu trúc dữ liệu, luồng nghiệp vụ, bố cục wireframe và tương tác 10 màn hình.

---

## 1. TỔNG QUAN PHIÊN BẢN V2 & CÁC ĐỘT PHÁ NGHIỆP VỤ

Phiên bản V2 được xây dựng nhằm giải quyết triệt để sự "phân hóa" dữ liệu và tình trạng thiếu các màn hình trọng yếu (đặc biệt là màn hình Đăng ký hạng mục mua hàng) theo yêu cầu phản biện hiện trường:

1. **Bổ Sung Màn Hình Đăng Ký Hạng Mục Mua Hàng Chuyên Dụng (`UI-REG-01`)**:
   - **Bộ máy tìm kiếm QCode thông minh (Omni-Search Typeahead / Modal thay vì dropdown)**: Ánh xạ chuẩn từ workflow `procurement-rfq-stock-optimization.yml` với đầy đủ thông số: QCode, Tên phụ tùng, Maker, Model, Đơn giá hợp đồng, ĐVT, Tồn kho thực tế, Định mức tồn, PO chờ duyệt, PO đang về, Tồn chuyển giao và Link CAD FDM.
   - Cấu trúc thiết bị 4 tầng chuẩn xưởng: `Line` $\rightarrow$ `Machine` $\rightarrow$ `Unit` $\rightarrow$ `Assembly`.
   - Kiểm tra tức thời cờ tồn kho/đơn giá (<50ms).
   - Tự động khóa trạng thái `CROSS_TEAM_STOCK` khi có tồn kho liên team; khi mở khóa, hệ thống kích hoạt **2 nhánh tiếp theo**: Chuyển giao liên pháp nhân (Inter-entity transfer) HOẶC Mua thường cục bộ với giá thấp nhất.
2. **Onboarding QCode & Tải Trọn Gói Thư Mục CAD/Catalog (`UI-QCODE-01`)**:
   - Cho phép kéo thả cả folder chứa bản vẽ CAD (`.dwg`), tài liệu Catalog (`.pdf`) và bảng kích thước.
   - Tự động trích xuất bảng thông tin cần điền và nộp cho LEC hoàn thiện trên ERP.
   - Quản trị mã tạm `TMP-HW-xxxx` với cơ chế chặn cứng không cho tham gia thẩm định chi phí đầu tháng.
3. **Hộp Thư Tác Vụ Bắt Buộc & Giải Trình Tồn Kho Định Kỳ (`UI-TASK-01`)**:
   - Buộc kỹ sư phải giải trình tại sao tồn kho không sử dụng trước ngày 05 đầu tháng.
   - Không cho phép đóng tác vụ bằng một checkbox đơn giản; phải có lý do kỹ thuật, kế hoạch đưa vào máy, ngày cam kết và ảnh chụp hiện trường.
   - Cầu nối trao đổi 3 bên trực tiếp: Kỹ sư $\leftrightarrow$ LEC $\leftrightarrow$ Quản lý Chi phí.
4. **Cây Thiết Bị EBOM Kéo Thả Trực Quan, Ma Trận Số Lượng & Máy Dùng Chung Đa Chuyền (`UI-EBOM-01`)**:
   - Giảm độ phức tạp của hệ thống EBOM truyền thống thông qua bàn kéo - thả 3 khung trực quan.
   - Cấu trúc 4 tầng: `Line` $\rightarrow$ `Machine` $\rightarrow$ `Unit` $\rightarrow$ `Assembly` $\rightarrow$ `Slot`.
   - Quản lý toàn diện các chỉ số số lượng: Số lượng lắp trên máy (`Installed Qty`), Định mức tồn an toàn (`Target Stock Qty`), Tồn kho thực tế (`Onhand Qty`), Giới hạn mua bảo dưỡng.
   - **Tối ưu cho các máy giống nhau giữa các line**: Khái niệm Master Machine Template (`TEMPLATE-DB-800`), kế thừa cấu trúc 1-click và đồng bộ hóa đa chuyền (Multi-Line Sync).
   - Hàng đợi khai báo muộn (Late Declaration Queue) 7 ngày cho các sự cố dừng máy khẩn cấp.
5. **Bàn Điều Phối LEC Master Đa Năng (`UI-LEC-01`)**:
   - Hỗ trợ đa LEC và chuyển đổi linh hoạt giữa các Phân xưởng / Team khác nhau.
   - Gom mẻ các hạng mục cùng trạng thái để xử lý đồng loạt.
   - Đăng ký mã định danh thiết bị EM No 14 ký tự (`HWBMTL21EC0101`).
   - Theo dõi trạng thái báo giá RFQ qua email từ Mua hàng, xử lý bất thường và phản hồi cho Requestor.
   - Đánh dấu thủ công Target/Over với 6 mã sự cố chuẩn (`OVR-01` đến `OVR-06`).
   - Phân loại lại mã EOL (kể cả khi EMS vẫn hiển thị Active) và phản hồi kỹ sư.
   - Cấu hình ngân sách SG thủ công không cộng dồn số dư (`Strict No-Rollover`).
6. **Giám Sát Trưởng Nhóm / Part & Đối Soát Work Order (`UI-LEAD-01`)**:
   - Giám sát tiến độ theo phân cấp Team $\rightarrow$ Part $\rightarrow$ Kỹ sư đồng nghiệp ngang hàng.
   - **Tuyệt đối 100% không có nút phê duyệt** (phê duyệt thực hiện trên Nexacro EMS).
   - Modal đối soát hồ sơ Work Order dừng chuyền phục vụ kiểm thảo.
7. **Thẩm Định Chi Phí Đầu Tháng & Xuất Báo Cáo 4 Sheet Tiêu Chuẩn (`UI-CST-01`)**:
   - Duy nhất 1 chuyên viên Quản lý Chi phí (Trần Thị Hường) thực hiện thẩm định ngày 01–05.
   - Bắt buộc có mã QCode chính thức (chặn mã tạm `TMP-`).
   - Cấp chứng chỉ Cost Clearance để mở khóa tạo PRV/PO trên EMS.
   - **Ngày 25 hàng tháng xuất duy nhất 1 file Excel 4 Sheet chuẩn hóa** trình Ban Giám Đốc.
8. **Dashboard Tổng Quan & Truy Vấn Chi Tiết Danh Mục Gây Over (`UI-DASH-01`)**:
   - Phễu 7 giai đoạn tương tác lọc dữ liệu.
   - Đồng hồ 3 trục ngân sách SG (Thực chi PO, Xuất kho `ds_Inv`, Vượt mức Over).
   - **Công cụ bóc tách danh mục gây Over**: Trả về danh sách chi tiết các hạng mục gây Over của cả mua mới và xuất kho, theo 6 mã OVR.
9. **Cài Đặt Hệ Thống, Topology & Gateway EMS (`UI-ADM-01`)**:
   - Nhân bản 1-click cấu hình sang Phân xưởng khác / Nhà máy khác trong tập đoàn.
   - Quy tắc tầng tự động `Left(Line, 1) = Floor`.
   - Giám sát bộ điều tiết Token Bucket Rate Limiter (5 req/s) bảo vệ máy chủ EMS.

---

## 2. MA TRẬN 10 TÀI LIỆU ĐẶC TẢ CHI TIẾT V2

| STT | Mã Màn Hình | Tên Màn Hình Nghiệp Vụ | Vai Trò Chính | Đường Dẫn File Chi Tiết |
| :---: | :---: | :--- | :---: | :--- |
| **00** | `SYS-ARCH` | **Tổng Quan Kiến Trúc Hệ Thống Màn Hình** | Toàn bộ | [**`00-tong-quan-kien-truc-he-thong-man-hinh.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/00-tong-quan-kien-truc-he-thong-man-hinh.md) |
| **01** | `UI-REG-01` | **Đăng Ký Hạng Mục Mua Hàng** | Kỹ sư hiện trường / LEC | [**`01-man-hinh-dang-ky-hang-muc-mua-hang.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/01-man-hinh-dang-ky-hang-muc-mua-hang.md) |
| **02** | `UI-QCODE-01`| **Onboarding QCode & Tải Folder Tài Liệu** | Kỹ sư / LEC | [**`02-man-hinh-onboarding-qcode-va-tai-folder.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/02-man-hinh-onboarding-qcode-va-tai-folder.md) |
| **03** | `UI-TASK-01` | **Hộp Thư Tác Vụ & Giải Trình Tồn Kho** | Kỹ sư / LEC / Cost Mgmt| [**`03-man-hinh-hop-thu-tac-vu-va-giai-trinh-ton-kho.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/03-man-hinh-hop-thu-tac-vu-va-giai-trinh-ton-kho.md) |
| **04** | `UI-EBOM-01` | **EBOM Kéo Thả & Matching Cơ Cấu** | Kỹ sư / LEC | [**`04-man-hinh-ebom-keo-tha-co-cau.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/04-man-hinh-ebom-keo-tha-co-cau.md) |
| **05** | `UI-LEC-01`  | **Bàn Điều Phối LEC Master Workbench** | Chuyên viên LEC | [**`05-man-hinh-dieu-phoi-lec-master-workbench.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/05-man-hinh-dieu-phoi-lec-master-workbench.md) |
| **06** | `UI-LEAD-01` | **Giám Sát Trưởng Nhóm / Part & Work Order**| Trưởng nhóm Part | [**`06-man-hinh-giam-sat-leader-va-work-order.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/06-man-hinh-giam-sat-leader-va-work-order.md) |
| **07** | `UI-CST-01`  | **Thẩm Định Chi Phí Đầu Tháng & Báo Cáo**| Quản lý Chi phí (1 người)| [**`07-man-hinh-tham-dinh-chi-phi-dau-thang.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/07-man-hinh-tham-dinh-chi-phi-dau-thang.md) |
| **08** | `UI-DASH-01` | **Dashboard Tổng Quan Vận Hành Toàn Xưởng**| Toàn bộ ban ngành | [**`08-man-hinh-dashboard-tong-quan-toan-xuan.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/08-man-hinh-dashboard-tong-quan-toan-xuan.md) |
| **09** | `UI-ADM-01`  | **Cài Đặt Hệ Thống, Topology & Cổng EMS** | Quản trị hệ thống | [**`09-man-hinh-cai-dat-he-thong-va-gateway-ems.md`**](file:///home/longp/projects/company/ops-workflow/procurement-system/05-ui-ux-screen-specifications-v2/09-man-hinh-cai-dat-he-thong-va-gateway-ems.md) |

---

## 3. BẢNG TRUY XUẤT ĐỐI ỨNG 10 NGUYÊN TẮC VÀNG (TRACEABILITY MATRIX)

| STT | Nguyên Tắc Vàng (Master Specification) | Màn Hình Hiện Thực Hóa Cốt Lõi | Cơ Chế Bảo Đảm Kỹ Thuật |
| :-: | :--- | :---: | :--- |
| **#1** | Phê duyệt PRV/PO 100% trên Nexacro EMS | `UI-LEAD-01`, `UI-REG-01` | Triệt tiêu hoàn toàn nút Approve trên web; giao diện chỉ hiển thị trạng thái EMS. |
| **#2** | Kỹ sư là đồng nghiệp ngang hàng | `UI-REG-01`, `UI-LEAD-01` | Xóa các phân cấp công đoạn POL/TAB; làm việc theo Tên Máy Thân Thiện. |
| **#3** | Quét cờ tồn kho liên team & Tác vụ mượn kho | `UI-REG-01`, `UI-TASK-01` | Quét <50ms; khóa `CROSS_TEAM_STOCK`; bắt buộc mượn kho trước khi mua cục bộ. |
| **#4** | Thẩm định chi phí kỳ đầu tháng (01–05) | `UI-CST-01`, `UI-TASK-01` | Cửa sổ thẩm định ngày 01–05; giải trình tồn kho >30 ngày trước khi cấp Clearance. |
| **#5** | Bắt buộc có mã QCode chính thức trên ERP | `UI-QCODE-01`, `UI-CST-01` | Mã tạm `TMP-HW-xxxx` sinh từ folder bị chặn cứng khỏi danh mục thẩm định đầu tháng. |
| **#6** | Đánh dấu Target/Over thủ công (6 mã OVR) | `UI-LEC-01`, `UI-DASH-01` | Không tự động phân loại; LEC gán 1 trong 6 mã `OVR-01..06` kèm mã Work Order. |
| **#7** | LEC toàn quyền cấu hình deadline kiểm thảo | `UI-LEC-01`, `UI-ADM-01` | Cấu hình hạn nộp giải trình (ngày 05), hạn khóa thẩm định (ngày 07). |
| **#8** | Cầu nối giải trình 3 bên trực tuyến | `UI-TASK-01`, `UI-LEC-01` | Reviewer phát hành câu hỏi $\rightarrow$ LEC chỉ dẫn kỹ thuật $\rightarrow$ Kỹ sư gửi ảnh/giải trình. |
| **#9** | Xuất báo cáo duy nhất 1 file Excel 4 Sheet | `UI-CST-01`, `UI-DASH-01` | Ngày 25 hàng tháng xuất 4 Sheet cố định: Ngân sách SG, Hạng mục Over, Inbound, Tồn kho. |
| **#10**| Ngân sách SG không lũy kế (No-Rollover) | `UI-LEC-01`, `UI-DASH-01` | Số dư tháng trước bị hủy về $0; trần ngân sách kiểm soát thực chi PO & xuất kho `ds_Inv`. |

---

## 4. BẢNG SO SÁNH V1 VÀ V2 TOÀN DIỆN

```
+─────────────────────────────────+──────────────────────────────+─────────────────────────────────────────+
| TIÊU CHÍ SO SÁNH                | PHIÊN BẢN CŨ (V1)            | PHIÊN BẢN V2 CHUẨN HÓA MỚI              |
+─────────────────────────────────+──────────────────────────────+─────────────────────────────────────────+
| Màn hình Đăng ký mua hàng       | Không có (bị gộp sơ sài)     | UI-REG-01 chuyên biệt, tên thân thiện   |
| Xử lý khóa Interlock            | Chỉ báo cờ chung chung       | Khóa CROSS_TEAM_STOCK, 2 nhánh sau mở   |
| Quy trình xin cấp QCode         | Nhập tay từng trường         | Kéo thả cả folder CAD/Catalog UI-QCODE  |
| Hộp thư giải trình tồn kho      | Không có, nhắc việc miệng    | UI-TASK-01 bắt buộc nộp trước ngày 05   |
| Thao tác Cây thiết bị EBOM      | Danh mục text tĩnh cồng kềnh | UI-EBOM-01 Kéo-Thả trực quan 3 khung    |
| Tác nghiệp của LEC              | Duyệt đơn lẻ, mất thời gian  | Gom mẻ theo trạng thái, theo dõi RFQ mail|
| Giám sát của Leader             | Dễ nhầm có nút phê duyệt     | UI-LEAD-01: Tuyệt đối 0 nút duyệt nội bộ|
| Thẩm tra Quản lý Chi phí        | Làm việc ngày 25, thiếu tool | UI-CST-01: Thẩm định 01-05, chặn mã TMP |
| Báo cáo Ban Giám Đốc            | Nhiều file rời rạc           | Duy nhất 1 file Excel 4 Sheet chuẩn hóa |
| Phân tích chi phí vượt mức      | Chỉ báo tổng số tiền Over    | Bóc tách danh mục gây Over (mua & kho)  |
| Nhân bản cho Team/Nhà máy khác  | Phải code lại từ đầu         | UI-ADM-01: 1-Click nhân bản cấu hình    |
+─────────────────────────────────+──────────────────────────────+─────────────────────────────────────────+
```
