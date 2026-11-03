# Giao Diện Dành Riêng Cho Vai Trò: Cost Management (Bộ Phận Quản Lý Chi Phí)
> **Mã Giao Diện: UI-ROLE-06 — Cost Management Audit Portal**  
> *Dành riêng cho: Bộ Phận Quản Lý Chi Phí — Reviewer & Assistant LÀ 1 NGƯỜI DUY NHẤT (Chuyên viên thẩm định chi phí / Cost Controller, KHÔNG PHẢI Ban Giám Đốc hay Ban Lãnh Đạo)*

---

## 1. Tổng Quan Không Gian Làm Việc Của Cost Management (Workspace Anatomy)

Theo nguyên tắc vận hành chuẩn hóa:
> *"Cost Management là bộ phận chuyên trách quản lý chi phí, kiểm soát ngân sách SG và giải trình tồn kho. Đầu mỗi tháng, Reviewer (Cost Management) họp thẩm định offline với các LEC để thẩm tra chi tiết về tồn kho chưa dùng và các khoản chi Over. Sau khi thẩm định offline, nếu cần thêm thông tin, Reviewer nhập yêu cầu gửi LEC; LEC gửi Kỹ sư phản hồi rồi chuyển lại cho Reviewer. Khi hoàn tất xác nhận chi phí, việc phê duyệt chính thức diễn ra trên hệ thống EMS."*

Giao diện **Cost Management Audit Portal** đóng vai trò là **Công cụ kiểm soát chi phí & Cầu nối thông tin số hóa**:
- Thẩm định chi phí và kiểm thảo giải trình tồn kho vào **ĐẦU MỖI THÁNG**.
- Rà soát danh mục 100% các dòng phát sinh **Over Ngoài Kế Hoạch** (tách riêng Over do Mua Hàng vs Over do Xuất Kho từ EMS).
- Rà soát các **Task Giải Trình Tồn Kho Chưa Dùng (>30 ngày)** của các kỹ sư hiện trường để kiểm soát hiện tượng găm hàng.
- **Nhập yêu cầu cần thêm thông tin** gửi cho LEC điều phối kỹ sư làm rõ.
- Tra cứu đối soát trước khi thao tác duyệt chính thức trên hệ thống EMS.

Cấu trúc giao diện gồm **3 Chế Độ Xem Chuyên Biệt**:
1.  **View 1: 📑 Bảng Thẩm Định Chi Phí & Tồn Kho Đầu Tháng**: So sánh hạn mức SG tháng (nhập thủ công, No-Rollover) với cam kết Trong Target và danh sách Over (`OVR-01..06`).
2.  **View 2: 💬 Quản Lý Yêu Cầu Làm Rõ Thông Tin**: Nhập các câu hỏi / yêu cầu giải trình gửi cho LEC để kỹ sư trả lời.
3.  **View 3: 📂 Kho Lưu Trữ Biên Bản & Đối Soát EMS**: Lưu trữ bản scan biên bản thẩm định và tra cứu mã PRV/PO đã đối soát từ EMS.

---

## 2. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  CỔNG THẨM ĐỊNH CHI PHÍ — COST MANAGEMENT (FACTORY HW)                [🔔 2 Cần Làm Rõ] [👤 Reviewer (Cost Control)]   │
│ Phạm vi: Toàn bộ Nhà máy HW (Display Module Plant 1)                             Kỳ thẩm định: ĐẦU THÁNG 11/2026                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CÁC CHẾ ĐỘ XEM CỦA COST MANAGEMENT:                                                                                              │
│ [📑 VIEW 1: THẨM ĐỊNH CHI PHÍ ĐẦU THÁNG]   [💬 VIEW 2: YÊU CẦU LÀM RÕ (GỬI LEC)]   [📂 VIEW 3: KHO BIÊN BẢN & ĐỐI SOÁT EMS]      │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📌 ĐANG XEM: VIEW 1 — HỒ SƠ THẨM ĐỊNH CHI PHÍ & TỒN KHO ĐẦU THÁNG 11/2026                                                        │
│                                                                                                                                  │
│ 1.1. BẢNG CÂN ĐỐI NGÂN SÁCH MUA SẮM SG THÁNG 11 (TUYỆT ĐỐI KHÔNG ROLLOVER):                                                      │
│ ┌────────────────────────────────────────┬───────────────────────────────────────┬─────────────────────────────────────────────┐ │
│ │ Hạn Mức SG Tháng 11 (LEC Nhập Thủ Công)│ Tổng Cam Kết Đề Xuất Trong Target     │ Tổng Phát Sinh Mua Ngoài Kế Hoạch (Over)    │ │
│ │              $150,000 USD              │      $122,000 USD (81.3% ngân sách)   │         $28,000 USD (18.7% ngân sách)       │ │
│ └────────────────────────────────────────┴───────────────────────────────────────┴─────────────────────────────────────────────┘ │
│ • Tình trạng ngân sách tháng: 🟢 Tổng chi tiêu đề xuất ($150,000 USD) vừa khít trần ngân sách phân bổ tháng 11.                   │
│                                                                                                                                  │
│ 1.2. DANH MỤC CÁC HẠNG MỤC PHÁT SINH OVER CẦN THẨM TRA (OVR-01 ĐẾN OVR-06):                                                      │
│ ┌──┬────────────┬─────────────────────────────┬───────────┬─────────────┬─────────────┬──────────┬──────────────┬──────────────────┐ │
│ │ST│ Mã QCode   │ Tên Phụ Tùng & Maker        │ Vị Trí    │ Số Lượng Mua│ Thành Tiền  │ Mã Lý Do │ Mã Lệnh Máy  │ Thao Tác Của     │ │
│ │T │ / Mã Tạm   │                             │ Máy & Line│             │ Dự Kiến     │ Over     │ (Work Order) │ Reviewer         │ │
│ ├──┼────────────┼─────────────────────────────┼───────────┼─────────────┼─────────────┼──────────┼──────────────┼──────────────────┤ │
│ │1 │ QDAD12236  │ Board nguồn CPX V4 Trumpf   │ DB-01/#201│ 1 EA        │ $3,150.00   │ OVR-01   │ WO-248926091 │[❓ Yêu Cầu Làm Rõ│ │
│ │  │            │ ↳ Lý do kỹ sư: Cháy board do xung sét ca đêm, dừng máy DB-01                         │   Gửi Cho LEC]   │ │
│ ├──┼────────────┼─────────────────────────────┼───────────┼─────────────┼─────────────┼──────────┼──────────────┼──────────────────┤ │
│ │2 │ QCAD38190  │ Xylanh trượt kép SMC MXQ16  │ TAB-02/#20│ 2 EA        │ $440.00     │ OVR-03   │ WO-248926098 │[✅ Đồng Ý Duyệt] │ │
│ │  │            │ ↳ Lý do kỹ sư: LGD Korea chưa transfer kịp, mua gấp tránh dừng chuyền                │                  │ │
│ └──┴────────────┴─────────────────────────────┴───────────┴─────────────┴─────────────┴──────────┴──────────────┴──────────────────┘ │
│                                                                                                                                  │
│  [📥 XUẤT BÁO CÁO EXCEL FORM CỐ ĐỊNH]      [✍️ KÝ BIÊN BẢN XÁC NHẬN CHI PHÍ (COST CLEARANCE)]     [↗️ CHUYỂN SANG DUYỆT TRÊN EMS] │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. View 2 Chi Tiết: Gửi Yêu Cầu Cần Thêm Thông Tin Cho LEC

Khi Reviewer phát hiện một dòng chi phí chưa đủ bằng chứng hoặc nghi ngờ tính xác thực:
1. Reviewer bấm **`[❓ Yêu Cầu Làm Rõ Gửi Cho LEC]`**.
2. Form popup mở ra:
   - Reviewer nhập nội dung câu hỏi (ví dụ: *"Cần bổ sung biên bản giám định hỏng hóc và giải trình tại sao không xuất dùng tồn kho của Team 1?"*).
3. Hệ thống chuyển nội dung này trực tiếp đến tab `Cầu Nối Reviewer` trên Bàn làm việc của LEC.
4. Sau khi Kỹ sư phản hồi và LEC gửi lại, Reviewer nhận được thông báo để xem xét phê duyệt.
