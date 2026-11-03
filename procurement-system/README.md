# Hệ Thống Kiểm Soát Tiến Độ Mua Bán Phụ Tùng (Spare Parts Procurement Progress & Tracking System)
> **Mô hình hoạt động song song với hệ thống EMS (LG Display Nexacro Platform)**  
> *Ngành sản phẩm: Smart Watch (SW) = Nhà máy: Factory HW (Display Module Plant 1)*

---

## 1. Bối Cảnh Nghiệp Vụ & Các Nguyên Tắc Vận Hành Cốt Lõi (Cập Nhật Toàn Diện)

Hệ thống được thiết kế dựa trên thực tế vận hành dây chuyền sản xuất linh kiện Smart Watch tại **Factory HW** (Display Module Plant 1 - Org ID: 28753), đóng vai trò là **lớp kiểm soát tiến độ, điều phối kỹ thuật, theo dõi các mốc giao hàng trung gian (Vendor Confirm, ETA, Phân bổ chi phí hàng tháng) và giải trình tồn kho**, hoạt động song song với EMS. Mọi hoạt động phê duyệt chính thức diễn ra trên EMS.

```
Tập Đoàn / Công Ty (Nhiều Pháp Nhân & Nhiều Nhà Máy)
 └── Factory HW (Display Module Plant 1 - Ngành Smart Watch) / Factory TV / Auto Display
       │
       ├── Cost Management Team (Bộ Phận Quản Lý Chi Phí - Reviewer & Assistant là 1 người)
       │     ├── Thẩm định chi phí và kiểm thảo giải trình tồn kho ĐẦU THÁNG (Offline)
       │     └── Đưa ra các yêu cầu cần thêm thông tin để LEC điều phối kỹ sư làm rõ
       │
       ├── Team Requestor (Ví dụ: PO Module Technology Team 2 - Mã BP: 87321)
       │     │
       │     ├── Nhóm LEC Trong Team (Multi-LEC: Pham Duc Long - 658359 cùng các đồng sự)
       │     │     ├── Quy định hạn (Deadline) nộp giải trình tồn kho & thẩm định đầu tháng
       │     │     ├── Gom đơn cùng trạng thái, LEC TỰ TAY PHÂN LOẠI Target vs Over (KHÔNG TỰ ĐỘNG)
       │     │     ├── Điều kiện thẩm định: BẮT BUỘC PHẢI CÓ MÃ QCODE (Không duyệt mã tạm TMP)
       │     │     ├── Quản lý các mốc: Vendor confirm ngày nhận, ETA, và Phân bổ chi phí hàng tháng
       │     │     ├── Tiếp nhận yêu cầu bổ sung từ Cost Management -> gửi Kỹ sư -> gửi lại Reviewer
       │     │     └── Nhập budget thủ công hàng tháng (TUYỆT ĐỐI KHÔNG CỘNG DỒN SỐ DƯ)
       │     │
       │     └── Part (Phân ban - ví dụ: CP/SG Part 1)
       │           │
       │           └── Các Kỹ Sư Hiện Trường (NGANG HÀNG NHAU - KHÔNG PHÂN CHIA CÔNG ĐOẠN)
       │                 ├── Làm việc trực tiếp với TÊN Machine, Line, Assembly thân thiện
       │                 ├── Cảnh báo tồn kho Team bạn ngay khi tạo đơn & duy trì TASK BẮT BUỘC đến khi EMS đổi sang 'N'
       │                 ├── Chuẩn bị dữ liệu (Upload folder bản vẽ/catalog) để LEC đăng ký QCode
       │                 └── Nộp Task giải trình tồn kho theo thời hạn LEC quy định
       │
       └── Bộ Phận Mua Hàng Ngoài (Purchase Dept)
             └── Đàm phán giá thương mại độc lập với nhà cung cấp ngoài
```

### 10 Nguyên tắc vận hành cốt lõi:

1. **Bỏ qua hệ thống duyệt — Duyệt trên EMS, hệ thống này chỉ kiểm soát tiến độ**:
   - Mọi hoạt động phê duyệt PRV, phê duyệt mua hàng chính thức đều diễn ra trên hệ thống **EMS**.
   - Hệ thống mới đóng vai trò **kiểm soát tiến độ mua bán, quản lý hạn mức ngân sách SG, giải trình tồn kho và phối hợp kỹ thuật**.
2. **Không có trường công đoạn — Các kỹ sư ngang hàng nhau**:
   - Hệ thống loại bỏ trường phân chia công đoạn (không chia POL, TAB, DIP, LT, DB, BD và không có chức danh duyệt Process Leader).
   - Tất cả các kỹ sư trong Part/Team đều **ngang hàng nhau**, trực tiếp tạo yêu cầu mua và giải trình máy mình phụ trách.
3. **Mượn/Xuất dùng tồn kho của Team khác: Cảnh báo ngay khi tạo & Duy trì Task đến khi EMS báo 'N'**:
   - Khi Kỹ sư tạo đơn/chọn linh kiện, nếu cờ `agingInterlockFlag == 'Y'` (hoặc có tồn kho khả dụng tại Team khác trong nhà máy HW):
     - Hệ thống **hiển thị cảnh báo trực quan ngay lập tức cho Requestor**.
     - Hệ thống tự động kích hoạt một **Task bắt buộc (Persistent Required Task)**: *"Cần xuất mượn/sử dụng tồn kho Team bạn trước khi mua mới"*.
     - Task này **luôn luôn duy trì trên màn hình của Kỹ sư và LEC, không thể đóng thủ công, cho đến khi hệ thống đồng bộ lại từ EMS xác nhận cờ đã chuyển sang 'N'** (đã xuất kho thực tế trên EMS).
4. **Kiểm soát tiến độ: Thông tin hàng về xem trên EMS; Hệ thống kiểm soát Vendor Confirm, ETA & Phân bổ chi phí**:
   - **Thông tin hàng về / nhập kho**: Đọc và đối chiếu trực tiếp từ hệ thống EMS (`po_remained_qty` / `notReceivingQty`), không làm cổng nhập kho thừa thãi.
   - **Hệ thống mới tập trung kiểm soát các mốc tiến độ quan trọng trước khi hàng về**:
     * **Vendor confirm ngày nhận**: Ngày nhà cung cấp chính thức xác nhận giao đơn hàng.
     * **ETA (Estimated Time of Arrival)**: Ngày dự kiến hàng cập bến xưởng HW.
     * **Sắp xếp phân bổ sử dụng hàng tháng**: Lập kế hoạch phân bổ sử dụng linh kiện theo từng tháng để phục vụ việc **phân bổ chi phí sản xuất chính xác**.
5. **Điều kiện để được đưa vào Thẩm định: BẮT BUỘC PHẢI CÓ QCODE**:
   - Các linh kiện mới chỉ có mã tạm thời `TMP-HW-xxxx` **KHÔNG ĐƯỢC PHÉP đưa vào thẩm định chi phí**.
   - Bắt buộc Kỹ sư phải chuẩn bị đủ hồ sơ $\rightarrow$ LEC hoàn tất việc đăng ký và có mã QCode chính thức trên EMS thì mới được đưa vào danh sách Thẩm định đầu tháng.
6. **LEC TỰ TAY PHÂN LOẠI Target vs Over — TUYỆT ĐỐI KHÔNG TỰ ĐỘNG**:
   - Hệ thống **không tự động phân loại** `Trong Target` hay `Over`.
   - **LEC là người tự tay đánh giá và bấm phân loại** từng dòng dựa trên đối chiếu kỹ thuật, hiện trạng máy của kỹ sư và hạn mức ngân sách tháng.
7. **Thẩm định & Giải trình tồn kho ĐẦU THÁNG — DO LEC QUY ĐỊNH HẠN**:
   - Phiên thẩm định chi phí và kiểm thảo giải trình tồn kho diễn ra vào **ĐẦU MỖI THÁNG**.
   - **Thời hạn chốt nộp Task giải trình tồn kho và chốt gói hồ sơ thẩm định DO LEC QUY ĐỊNH HẠN (Deadline)** trên hệ thống theo thực tế từng kỳ.
8. **Cơ chế phản hồi thông tin 3 bên sau thẩm định offline**:
   - Reviewer (Cost Management - 1 người duy nhất) họp offline đầu tháng với LEC.
   - Nếu Reviewer cần thêm thông tin $\rightarrow$ Reviewer báo LEC $\rightarrow$ **LEC nhập yêu cầu lên hệ thống gửi Kỹ sư** $\rightarrow$ **Kỹ sư phản hồi cho LEC** $\rightarrow$ **LEC tổng hợp gửi lại cho Reviewer**.
9. **Bỏ qua Cổng Thủ Kho — Tình trạng xuất kho chỉ lấy từ EMS**:
   - Thủ kho không dùng app này. Dữ liệu xuất kho và chi phí sử dụng máy được hệ thống tự động đọc từ EMS.
10. **Ngân sách SG: Nhập thủ công & TUYỆT ĐỐI KHÔNG CỘNG DỒN SỐ DƯ (No Rollover)**:
    - LEC nhập hạn mức SG Budget đầu mỗi tháng. Ngân sách tháng nào khóa sổ dứt điểm tháng đó, **tuyệt đối không cộng dồn số dư sang tháng sau**.

---

## 2. Bản Đồ Thư Mục Phân Tách Theo Nhiệm Vụ (Task-Based Architecture)

```
procurement-system/
│
├── 01-master-data-and-ebom/                    # NHIỆM VỤ 1: Master Data, Cây Thiết Bị EBOM & Chuẩn Bị Dữ Liệu QCode
│   ├── 01-organization-and-plant-hierarchy.md  # Factory HW, Multi-Team, Kỹ sư ngang hàng, Cost Management (1 người)
│   ├── 02-ebom-structure-and-equipment-tree.md # Tên thân thiện vs EM No 14 ký tự, Drag-and-Drop Slot Mapper, Late Declaration
│   └── 03-batch-qcode-registration-and-media.md# Upload Folder -> Chuẩn bị data cho LEC cấp QCode (Bắt buộc có QCode mới được thẩm định)
│
├── 02-requestor-and-leader-portal/             # NHIỆM VỤ 2: Cổng Kỹ Sư & Bàn Theo Dõi Tiến Độ Nội Bộ Team
│   ├── 01-requestor-requisition-workbench.md   # Cảnh báo tồn kho team bạn ngay khi tạo, Task duy trì đến khi EMS báo 'N'
│   ├── 02-leader-team-monitoring-dashboard.md  # Leader giám sát tiến độ mua sắm nội bộ theo Team => Part (Không phê duyệt)
│   └── 03-auto-requisition-engine.md           # Động cơ tự động tính nhu cầu theo sản lượng Smart Watch & MTBF
│
├── 03-lec-workbench-and-interlock/             # NHIỆM VỤ 3: Bàn Làm Việc LEC, Báo Giá & Interlock
│   ├── 01-interlock-resolution-process.md      # agingInterlockFlag (Xuất dùng tồn team bạn, task duy trì), EOL reclassification
│   ├── 02-purchase-quotation-coordination.md   # Theo dõi RFQ, Vendor confirm, ETA, Phân bổ chi phí sử dụng hàng tháng
│   └── 03-batch-interlock-resolver.md          # LEC tự phân loại Target/Over (không tự động), quy định hạn thẩm định/giải trình
│
├── 04-budget-cost-and-over-management/         # NHIỆM VỤ 4: Ngân Sách SG, Chi Phí Mua/Xuất & Xử Lý Over
│   ├── 01-sg-budget-and-cost-accounting.md     # Ngân sách tháng LEC nhập thủ công, TUYỆT ĐỐI KHÔNG ROLLOVER, Chi phí Mua vs Xuất
│   ├── 02-unplanned-over-budget-tracking.md    # Phân loại Over do LEC tự đánh dấu, chuẩn hóa 6 mã OVR
│   └── 03-monthly-offline-management-audit.md  # Thẩm định chi phí & giải trình tồn kho ĐẦU THÁNG (do LEC quy định hạn)
│
├── 05-ui-ux-screen-specifications/             # NHIỆM VỤ 5: Đặc Tả Giao Diện Tách Nhỏ Riêng Biệt Cho Từng Vai Trò
│   ├── 00-role-based-screen-matrix.md          # Ma trận phân định & bản đồ điều hướng theo vai trò (Đã bỏ Cổng Thủ Kho)
│   ├── 00-common-dashboard/                    # MÀN HÌNH CHUNG / DASHBOARD TIẾN ĐỘ TOÀN NHÀ MÁY
│   │   └── screen-universal-analytics-dashboard.md # Dashboard: Tiến độ Vendor Confirm, ETA, tồn kho, ngân sách SG, phân tích Over
│   ├── 01-role-requestor/                      # VAI TRÒ 1: Kỹ Sư Hiện Trường (Kỹ sư ngang hàng)
│   │   └── screen-requestor-portal.md          # Cổng Kỹ Sư: Cảnh báo tồn team khác ngay khi tạo, Task treo đến khi EMS='N'
│   ├── 02-role-leader/                         # VAI TRÒ 2: Quản Lý Team / Part (Theo dõi tiến độ, không phê duyệt)
│   │   └── screen-leader-team-dashboard.md     # Bàn Leader: Giám sát Team => Part, theo dõi tiến độ giải trình tồn kho
│   ├── 03-role-lec/                            # VAI TRÒ 3: LEC Quản Lý Spare Part (Pham Duc Long - 658359)
│   │   └── screen-lec-master-workbench.md      # Bàn LEC: Tự phân loại, chỉnh hạn Deadline, Vendor confirm, ETA, cầu nối 3 bên
│   ├── 05-role-admin/                          # VAI TRÒ 4: Quản Trị Hệ Thống (System Administrator)
│   │   └── screen-admin-settings-portal.md     # Cổng Admin: Cấu hình công thức, nhà xưởng, Đa Team, Gateway EMS
│   ├── 06-role-management/                     # VAI TRÒ 5: Cost Management (Reviewer & Assistant là 1 người)
│   │   └── screen-management-audit-portal.md   # Cổng Cost Management: Thẩm định chi phí & giải trình tồn kho đầu tháng
│   ├── 07-screen-ebom-visual-tree-explorer.md  # Bàn thiết kế kéo - thả EBOM trực quan (Drag-and-Drop EBOM Slot Mapper)
│   └── phan-tich-phan-bien-man-hinh-chuc-nang.md # TÀI LIỆU PHÂN TÍCH & PHẢN BIỆN CHUYÊN SÂU CÁC MÀN HÌNH CHỨC NĂNG
│
├── 06-process-workflows-and-diagrams/          # NHIỆM VỤ 6: Toàn Bộ Sơ Đồ Workflow & Process Chi Tiết
│   ├── 01-end-to-end-procurement-workflow.md   # Sơ đồ Swimlane kiểm soát tiến độ đầu - cuối các tác nhân
│   ├── 02-inter-entity-transfer-workflow.md    # Sơ đồ Giao dịch liên pháp nhân: 2 nhánh (Transfer & Mua giá thấp nhất)
│   ├── 03-rfq-and-purchase-tracking-flow.md    # Sơ đồ Vendor confirm, ETA & phân bổ chi phí hàng tháng
│   ├── 04-target-vs-over-evaluation-flow.md    # Cây quyết định phân loại do LEC tự tay đánh dấu chính thức (Không tự động)
│   └── 05-monthly-offline-audit-workflow.md    # Quy trình thẩm định đầu tháng, kiểm thảo giải trình tồn kho & luồng 3 bên
│
└── 07-integration-and-api-specs/               # NHIỆM VỤ 7: Tích Hợp EMS & Hợp Đồng REST API v1
    ├── 01-ems-nexacro-integration-strategy.md  # Bản đồ 18 API EMS, đọc holdReasonContent, đồng bộ PRV/PO Phase 1 & 2
    └── 02-ops-workflow-api-contracts.md        # Hợp đồng REST API v1, JSON Schemas & Docker setup
```
