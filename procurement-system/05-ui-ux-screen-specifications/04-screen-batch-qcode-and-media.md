# 04. Đặc Tả Giao Diện Chi Tiết: Đăng Ký Hàng Loạt QCode & Upload Hình Ảnh
> *Bảng lưới Spreadsheet nhập thuộc tính hàng loạt, Tích hợp EM No 14 ký tự, và Dropzone upload ảnh tự động khớp nối*

---

## 1. Bản Vẽ Giao Diện Chi Tiết (ASCII UI Wireframe)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO OPS]  ĐĂNG KÝ HÀNG LOẠT QCODE & QUẢN LÝ HÌNH ẢNH — FACTORY HW (SMART WATCH)           [👤 Pham Duc Long (LEC - 658359)]     │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ THANH CÔNG CỤ NHẬP LIỆU:                                                                                                         │
│ [📋 Dán từ Excel (Ctrl+V)] [📥 Tải File Mẫu Chuẩn .xlsx] [📤 Nhập File Excel] [➕ Thêm 10 Dòng] [🗑️ Xóa Dòng Chọn] [🔄 Reset]    │
│ Tự Động Tạo Mã Tạm: [☑ Bật chế độ tự sinh mã TMP-HW-xxxx cho ô trống]              Tiến độ kiểm tra: 🟢 48/50 Dòng Hợp Lệ (2 Lỗi)│
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. KHUNG DROPZONE TẢI LÊN HÌNH ẢNH / BẢN VẼ HÀNG LOẠT (BULK MEDIA DROPZONE):                                                     │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │  📥 KÉO THẢ NHIỀU HÌNH ẢNH / TỆP BẢN VẼ VÀO ĐÂY (Hỗ trợ JPG, PNG, WEBP, DWG, PDF - Tối đa 100 tệp cùng lúc)                 │ │
│ │  ↳ BỘ TỰ ĐỘNG KHỚP NỐI: Tự động đọc tiền tố tên tệp (ví dụ: QDAD12236_01.jpg, TMP-HW-0101_spec.pdf) để gán vào dòng bảng!   │ │
│ │  [📂 Hoặc bấm vào đây để chọn tệp từ máy tính...]                         Đã tải lên: 42 tệp (Tất cả đã khớp nối thành công) │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. BẢNG LƯỚI NHẬP THUỘC TÍNH CHI TIẾT (SPREADSHEET DATA GRID COMPONENT):                                                         │
│ ┌──┬────────────┬────────────┬──────────────────────────┬──────────┬──────────┬──────┬─────┬────┬────────────────┬─────────────┐ │
│ │ST│ Mã Tạm     │ QCode EMS  │ Tên Phụ Tùng             │ Maker    │ Model    │ Loại │ ĐVT │MOQ │ Số Quản Lý EM  │ Hình Ảnh &  │ │
│ │T │ (Auto Gen) │ (Nếu có)   │ & Quy Cách Chi Tiết      │          │ Part No  │ Hàng │     │    │ (14 Ký Tự)     │ Bản Vẽ CAD  │ │
│ ├──┼────────────┼────────────┼──────────────────────────┼──────────┼──────────┼──────┼─────┼────┼────────────────┼─────────────┤ │
│ │1 │[TMP-HW-0101│[          ]│[Board nguồn CPX V4 Trumpf│[TRUMPF  ]│[2912146 ]│[SPR▼]│[EA▼]│[ 1]│[HWBMTL21EC0101]│🖼️ (2) 📐 (1)│ │
│ │  │            │            │ ↳ Cụm Bonding Head Unit 01                                     │ (Line#201/EC)  │[👁️ Preview] │ │
│ ├──┼────────────┼────────────┼──────────────────────────┼──────────┼──────────┼──────┼─────┼────┼────────────────┼─────────────┤ │
│ │2 │[TMP-HW-0102│[QDAB03583 ]│[Cảm biến quang vuông 12V │[PANASONI]│[CN-73-C2]│[SP ▼]│[EA▼]│[ 4]│[HWBMTL21EC0102]│🖼️ (1)       │ │
│ │  │            │            │ ↳ Cụm Feeder Unit 01                                           │ (Line#201/EC)  │[👁️ Preview] │ │
│ ├──┼────────────┼────────────┼──────────────────────────┼──────────┼──────────┼──────┼─────┼────┼────────────────┼─────────────┤ │
│ │3 │[TMP-HW-0103│[QCAD38190 ]│[Xylanh trượt đôi 16-100B │[SMC     ]│[MXQ16-10]│[SP ▼]│[EA▼]│[ 2]│[HWBMTL22EC0101]│🖼️ (3) 📐 (1)│ │
│ │  │            │            │ ↳ Cụm Dao Cắt TAB Unit 01                                      │ (Line#202/EC)  │[👁️ Preview] │ │
│ ├──┼────────────┼────────────┼──────────────────────────┼──────────┼──────────┼──────┼─────┼────┼────────────────┼─────────────┤ │
│ │4 │[TMP-HW-0104│[          ]│[Dây cáp encoder động cơ  │[YASKAWA ]│[HW047148]│[SP ▼]│[EA▼]│[ 1]│[HWBMTL21EC0201]│[➕ Thả ảnh] │ │
│ │  │            │            │ ↳ Cụm Trục Z Unit 02                                           │ (Line#201/EC)  │             │ │
│ └──┴────────────┴────────────┴──────────────────────────┴──────────┴──────────┴──────┴─────┴────┴────────────────┴─────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ HÀNH ĐỘNG CUỐI:          [💾 Lưu Bản Nháp Lưới (Draft)]       [🚀 ĐỒNG BỘ TOÀN BỘ 50 HẠNG MỤC VÀO MASTER DATA & CÂY EBOM (F9)]   │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Quy Tắc Khớp Nối Ảnh & Tệp Bản Vẽ Tự Động (Auto-matching Algorithm)

Khi người dùng kéo thả hàng loạt tệp vào khung Dropzone, trình duyệt thực hiện hàm regex kiểm tra tên tệp trước khi tải lên máy chủ:

```javascript
// Biểu thức chính quy trích xuất mã linh kiện từ tên tệp
const filenameRegex = /^(TMP-HW-\d{4}|QD[A-Z0-9]{7,8})_?(.*)\.(jpg|jpeg|png|webp|dwg|pdf)$/i;

function autoMatchMedia(file, rows) {
  const match = file.name.match(filenameRegex);
  if (match) {
    const itemCode = match[1].toUpperCase(); // Ví dụ: TMP-HW-0101 hoặc QDAD12236
    const row = rows.find(r => r.temp_code === itemCode || r.qcode === itemCode);
    if (row) {
      row.attachments.push({
        file_name: file.name,
        type: file.name.endsWith('.dwg') ? 'CAD' : 'IMAGE',
        size: file.size,
        file_obj: file
      });
      return true;
    }
  }
  return false;
}
```
*   **Phản hồi giao diện**:
    *   Tệp khớp thành công: Ô hình ảnh tại dòng đó nhấp nháy màu xanh lá và tăng biến đếm `🖼️ (x)`.
    *   Tệp không khớp: Hiển thị danh sách tệp chưa được liên kết ở góc dưới để người dùng kéo thả thủ công vào ô mong muốn.
