# 06. Đặc Tả Giao Diện Chi Tiết: Màn Hình Chốt Kỳ Tháng & Thẩm Định Offline
> *Tổng hợp ngân sách SG 33-33-34, Tách bạch Chi phí Mua vs Chi phí Xuất, Phân loại Trong Target vs Over OVR-01..06, và Tải biên bản scan*

---

## 1. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  CHỐT KỲ MUA SẮM THÁNG 11/2026 & HỒ SƠ THẨM ĐỊNH OFFLINE           User: Pham Duc Long (LEC Trong Team - ID: 658359)  │
│ Phạm Vi: Factory HW = Smart Watch (SW) > PO Module Tech Team 2                 Đơn vị thẩm định: Team Management (Offline)       │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. BẢNG CÂN ĐỐI TỔNG THỂ NGÂN SÁCH SG THÁNG 11/2026 (TỶ TRỌNG 33% - THÁNG THỨ NHẤT QUÝ 4):                                      │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬─────────────────────────────────────────────────────────┐ │
│ │ Hạn Mức Mua Phân Bổ  │ Tổng Cam Kết Mua (PO)│ Chi Phí Thực Xuất Kho│ Tình Trạng Chênh Lệch So Với Hạn Mức                    │ │
│ │   $150,000.00 USD    │   $165,000.00 USD    │   $120,000.00 USD    │ 🔴 PHÁT SINH OVER NGOÀI KẾ HOẠCH: +$15,000.00 USD (10%) │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴─────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. BẢNG PHÂN BỔ NGUYÊN NHÂN OVER NGOÀI KẾ HOẠCH (OVER-BUDGET BREAKDOWN):                                                        │
│ ┌──┬──────────┬─────────────────────────────┬──────────┬─────────────┬─────────────┬──────────────────────────┬──────────────────┐ │
│ │ST│ Mã Lý Do │ Nhóm Nguyên Nhân Over       │ Số Dòng  │ Tổng Tiền   │ Tỷ Trọng    │ Căn Cứ Lệnh Máy / Chứng Từ│ Tình Trạng Duyệt │ │
│ ├──┼──────────┼─────────────────────────────┼──────────┼─────────────┼─────────────┼──────────────────────────┼──────────────────┤ │
│ │1 │ OVR-01   │ Sự cố máy hỏng bất thường   │ 3 dòng   │ $10,000.00  │ 66.7%       │ 📄 WO-248926091 (Máy EC) │ Chờ Mgmt ký giấy │ │
│ │2 │ OVR-03   │ Pháp nhân bạn chậm transfer │ 1 dòng   │ $5,000.00   │ 33.3%       │ 📄 Trích xuất API 401    │ Chờ Mgmt ký giấy │ │
│ └──┴──────────┴─────────────────────────────┴──────────┴─────────────┴─────────────┴──────────────────────────┴──────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. DANH SÁCH CHI TIẾT TỪNG DÒNG MUA TRONG KỲ (IN-TARGET & OVER):                                                                 │
│ ┌──┬──────────────┬────────────┬──────────────────────────┬───────────┬─────────────┬──────────────────────────┬─────────────────┐ │
│ │ST│ Số Quản Lý EM│ Mã QCode   │ Tên Phụ Tùng & Maker     │ Công Đoạn │ Số Tiền Mua │ Phân Loại Kế Hoạch       │ Mã Lý Do Over   │ │
│ │T │ (14 Ký Tự)   │ / Mã Tạm   │                          │ & Dây Ch  │ Dự Kiến     │ (Plan Classification)    │ Giải Trình      │ │
│ ├──┼──────────────┼────────────┼──────────────────────────┼───────────┼─────────────┼──────────────────────────┼─────────────────┤ │
│ │1 │ HWBMTL21EC010│ QDAD12236  │ Board nguồn CPX V4 Trumpf│ DB/#201   │ $3,150.00   │ 🔴 OVER NGOÀI KẾ HOẠCH   │ OVR-01 (Sự cố)  │ │
│ │2 │ HWBMTL21EC010│ QDAB03583  │ Sensor quang PANASONIC   │ DB/#201   │ $25.56      │ 🟢 TRONG TARGET (BÙ TỒN) │ —               │ │
│ │3 │ HWBMTL22EC010│ TMP-HW-0104│ Cáp encoder YASKAWA      │ DB/#202   │ $220.00     │ 🔴 OVER NGOÀI KẾ HOẠCH   │ OVR-03 (Transfer│ │
│ └──┴──────────────┴────────────┴──────────────────────────┴───────────┴─────────────┴──────────────────────────┴─────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ BƯỚC 1: XUẤT HỒ SƠ THẨM ĐỊNH OFFLINE:                                                                                            │
│ [📥 XUẤT TOÀN BỘ FILE EXCEL BẢO TRÌ .XLSX]          [📄 XUẤT BỘ HỒ SƠ TỜ TRÌNH KÝ DUYỆT PDF CHUẨN IN (KÈM VĂN BẢN GIẢI TRÌNH OVER)]│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ BƯỚC 2: CẬP NHẬT KẾT QUẢ PHÊ DUYỆT TỪ TEAM MANAGEMENT (SAU CUỘC HỌP OFFLINE):                                                    │
│ Trạng Thái Phê Duyệt: [ 🟢 ĐÃ ĐƯỢC MANAGEMENT PHÊ DUYỆT OFFLINE (Bùi Văn Minh - Reviewer ký xác nhận)                       ▼ ]  │
│ Ngày Ký Biên Bản:     [ 2026-11-26 📅 ]                                                                                          │
│ Đính Kèm File Scan:   [ 📄 Bien_ban_hop_duyet_mua_sam_T11_signed.pdf (3.5MB) ]  [ ➕ Đổi tệp scan... ]                            │
│ Ý Kiến Quản Lý:       [ "Đồng ý phê duyệt phát sinh Over $15,000 USD cho sự cố máy EC Line #201 để đảm bảo sản lượng Smart Watch."]│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ HÀNH ĐỘNG CUỐI:  [🔒 KHÓA DỮ LIỆU KỲ THÁNG 11 & GỌI API save130PrvData.lgdn ĐẨY SANG EMS PHÁT HÀNH PO CHÍNH THỨC (F10)]         │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
