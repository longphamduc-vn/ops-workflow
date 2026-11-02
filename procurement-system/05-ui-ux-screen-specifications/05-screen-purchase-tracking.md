# 05. Đặc Tả Giao Diện Chi Tiết: Màn Hình Theo Dõi Tiến Độ Báo Giá Purchase
> *Cầu nối thủ công giữa LEC trong Team (Pham Duc Long) và Bộ Phận Mua Hàng ngoài (Purchase Dept)*

---

## 1. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  THEO DÕI TIẾN ĐỘ BÁO GIÁ VỚI PURCHASE (QUOTATION TRACKING)         User: Pham Duc Long (LEC Trong Team - ID: 658359)  │
│ Phạm Vi: Factory HW = Smart Watch (SW) > PO Module Tech Team 2                 Đơn vị thụ lý thương mại: Purchase Dept           │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. BỘ LỌC ĐA NĂNG HẠNG MỤC BÁO GIÁ:                                                                                              │
│ Chuyên Viên Purchase: [ Tất Cả Chuyên Viên (Nam, Mai...) ▼ ]  Trạng Thái: [ 🟡 Đang đàm phán giảm giá ▼ ]  NCC: [ Tất cả NCC ▼ ]│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. BẢNG TIẾN ĐỘ BÁO GIÁ CHI TIẾT (PURCHASE PROGRESS MATRIX):                                                                     │
│ ┌──┬──────────────┬────────────┬──────────────────────────┬───────────┬─────────────┬──────────────┬─────────────┬─────────────┐ │
│ │ST│ Số Quản Lý EM│ Mã QCode   │ Tên Phụ Tùng & Maker     │ Ngày Gửi  │ Chuyên Viên │ Trạng Thái   │ Giá Đàm Phán│ Hành Động   │ │
│ │T │ (14 Ký Tự)   │ / Mã Tạm   │                          │ RFQ       │ Purchase    │ Tiến Độ      │ Sơ Bộ (USD) │ Xử Lý       │ │
│ ├──┼──────────────┼────────────┼──────────────────────────┼───────────┼─────────────┼──────────────┼─────────────┼─────────────┤ │
│ │1 │ HWBMTL21EC010│ TMP-HW-0101│ Board nguồn Trumpf       │ 2026-11-03│ Nguyen V.Nam│ 🟡 Đang chờ  │ $3,150.00   │ [✏️ Cập Nhật]│ │
│ │  │ (Line#201/EC)│            │ Maker: TRUMPF (Đức)      │ (3 ngày)  │ (Ext: 3421) │ NCC gửi giá  │ (Dự kiến)   │ [📎 File]   │ │
│ ├──┼──────────────┼────────────┼──────────────────────────┼───────────┼─────────────┼──────────────┼─────────────┼─────────────┤ │
│ │2 │ HWBMTL21EC010│ QDAB03583  │ Sensor quang vuông       │ 2026-10-28│ Tran Thi Mai│ 🟢 ĐÃ CÓ GIÁ │ $6.39       │ [👁️ Xem Giá]│ │
│ │  │ (Line#201/EC)│            │ Maker: PANASONIC         │ (Đã xong) │ (Ext: 3425) │ CHÍNH THỨC   │ (ServeOne)  │ [✅ Chốt Giá]│ │
│ ├──┼──────────────┼────────────┼──────────────────────────┼───────────┼─────────────┼──────────────┼─────────────┼─────────────┤ │
│ │3 │ HWBMTL21EC020│ TMP-HW-0104│ Cáp encoder động cơ      │ 2026-11-01│ Nguyen V.Nam│ 🟡 Đang đàm  │ $145.00     │ [✏️ Cập Nhật]│ │
│ │  │ (Line#201/EC)│            │ Maker: YASKAWA           │ (5 ngày)  │ (Ext: 3421) │ phán giảm giá│ (Đang ép $12│ [📞 Nhật Ký]│ │
│ └──┴──────────────┴────────────┴──────────────────────────┴───────────┴─────────────┴──────────────┴─────────────┴─────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. POPUP NHẬP LIỆU THỦ CÔNG KHI LIÊN HỆ PURCHASE (KHI BẤM [✏️ Cập Nhật]):                                                         │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 📝 CẬP NHẬT THÔNG TIN TỪ CHUYÊN VIÊN PURCHASE THỤ LÝ (NGUYEN VAN NAM - EXT: 3421):                                          │ │
│ │ • Hạng Mục: TMP-HW-0101 (Board nguồn CPX Controls) — Vị Trí Máy: HWBMTL21EC0101 (Line #201, Machine EC, Unit 01, Assy 01)    │ │
│ │ • Ngày gửi RFQ: [ 2026-11-03 ]         Hạn cam kết có giá chính thức: [ 2026-11-08 📅 ]                                     │ │
│ │ • Trạng Thái Purchase: [ 🟡 Đang đàm phán giảm giá (PRICE_NEGOTIATING)                                                    ▼ ]│ │
│ │ • Nhà Cung Cấp Đối Tác:[ LGDVN_CÔNG TY TNHH SERVEONE (VIỆT NAM)                                                           ▼ ]│ │
│ │ • Đơn Giá Đàm Phán:    [ 3,150.00             ] Tiền tệ: [ USD ▼ ]   Thời gian giao hàng (Lead Time): [ 14 ngày ]            │ │
│ │ • Đính Kèm Báo Giá PDF:[ quote_serveone_cpx_v4.pdf (1.2MB) 📄 ]  [ ➕ Đổi tệp... ]                                           │ │
│ │ • Nhật Ký Liên Hệ:     [ "Đã gọi điện lúc 14h30 với anh Nam Purchase. NCC ServeOne cam kết giảm thêm 5% nếu chốt PO trước   │ │
│ │                          ngày 15/11. Đang hoàn thiện tờ trình giá nội bộ."                                                 ]│ │
│ │                                                                              [❌ Hủy Bỏ]   [💾 CẬP NHẬT VÀO HỆ THỐNG (F4)]   │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
