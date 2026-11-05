# Spare Part EMS 2.0 — LaTeX Beamer Presentation Project

Dự án này là bản chuyển đổi hoàn chỉnh và nâng cấp thiết kế từ tệp PowerPoint gốc **`EMS_2.0_Improvement_Report.pptx`** sang định dạng **LaTeX Beamer (16:9 HD Widescreen)** chuẩn mực cho doanh nghiệp.

---

## 📁 Cấu Trúc Thư Mục

```
ems-improvement-report-latex/
├── main.tex                    # Tệp LaTeX chính (Cấu hình Beamer, theme màu sắc, nạp slide)
├── compile.bat                 # Script biên dịch tự động trên Windows (TeX Live 2026)
├── compile.sh                  # Script biên dịch trên Linux / macOS
├── export_to_pptx.py           # Công cụ xuất từ main.pdf sang PowerPoint PPTX
├── README.md                   # Hướng dẫn chi tiết sử dụng và xuất file
├── images/                     # Toàn bộ icon & hình ảnh trích xuất từ file PPTX gốc
│   ├── image-2-1.png           # Icon: Fragmented data
│   ├── image-2-2.png           # Icon: Missed purchase info
│   ├── image-2-3.png           # Icon: No cost control
│   ├── image-2-4.png           # Icon: Wrong EBOM & WO
│   ├── image-8-1.png           # Icon: Sensor
│   ├── image-8-2.png           # Icon: Cable
│   └── image-8-3.png           # Icon: Actuator
└── slides/                     # 10 Slide độc lập, dễ bảo trì và chỉnh sửa nội dung
    ├── 01_title.tex            # Slide 1: Title slide (Dark Navy, Mint badge, 6 Module ribbons)
    ├── 02_problem.tex          # Slide 2: Today's process (4 problem cards with icons)
    ├── 03_modules.tex          # Slide 3: One platform, six connected modules (3x2 grid)
    ├── 04_comparison.tex       # Slide 4: Before and after at a glance (Comparison table)
    ├── 05_modules_0_1.tex      # Slide 5: Modules 0–1 (Forecast & Safety Stock, Mass Search)
    ├── 06_module_2.tex         # Slide 6: Module 2 (4 PO routes, auto-escalation waterfall)
    ├── 07_module_3.tex         # Slide 7: Module 3 (Cost counted on consumption, 4 pillars)
    ├── 08_module_4.tex         # Slide 8: Module 4 (EBOM tree, sanity rules, Sensor/Cable/Actuator)
    ├── 09_module_5.tex         # Slide 9: Module 5 (10 lines WO allocation, 1 action)
    └── 10_impact.tex           # Slide 10: Executive Summary (4 Pillars: Speed, Accuracy, Traceability, Cost)
```

---

## 🎨 Bảng Màu Chuẩn Doanh Nghiệp (Exact Theme Colors)

Hệ màu được định nghĩa chính xác từ Theme gốc của EMS 2.0:

| Tên biến màu LaTeX | Mã HEX | Mô tả & Ứng dụng |
| :--- | :---: | :--- |
| `brandnavy` | `#0B2545` | Xanh Navy Đêm (Nền Slide 1 & Slide 10, tiêu đề chính) |
| `slatenavy` | `#1B2A3A` | Xanh Phiến (Màu chữ chính, tiêu đề Slide 2–9) |
| `brandteal` | `#0E8F80` | Xanh Ngọc Lục Bảo (Màu nhận diện module, hộp `AFTER`) |
| `brandmint` | `#5EEAD4` | Xanh Bạc Hà (Huy hiệu nổi bật, điểm nhấn trên nền tối) |
| `brandorange` | `#D9480F` | Cam Đất / Terracotta (Cảnh báo, hộp `BEFORE`, missing part) |
| `brandblue` | `#2F6FDB` | Xanh Công nghệ (Các bước quy trình và cơ cấu EBOM) |
| `cardbg` | `#F1F5F9` | Xám Phiến nhạt (Nền các thẻ card, dễ đọc, dịu mắt) |
| `mutedgray` | `#5B6B7B` | Xám trung tính (Mô tả chi tiết và số trang footer) |

---

## ⚙️ Hướng Dẫn Biên Dịch Trên Windows (TeX Live 2026)

Đường dẫn cài đặt TeX Live của bạn: `D:\Softwares\texlive\2026\bin\windows`

### Cách 1: Chạy trực tiếp `compile.bat` (Khuyên dùng)
1. Mở thư mục `ems-improvement-report-latex`.
2. Nhấp đúp chuột vào tệp `compile.bat`.
3. Script sẽ tự động:
   - Nhận diện bộ biên dịch tại `D:\Softwares\texlive\2026\bin\windows`.
   - Biên dịch 2 lượt qua `xelatex` (hoặc `pdflatex`) để tính toán chính xác tổng số trang và liên kết.
   - Xuất ra tệp `main.pdf` chuẩn tỉ lệ 16:9 sắc nét.
   - Hỏi bạn có muốn chuyển đổi sang PPTX ngay lập tức hay không.

### Cách 2: Chạy lệnh từ Command Prompt (CMD / PowerShell)
```cmd
cd /d "D:\path\to\ops-workflow\ems-improvement-report-latex"
set PATH=D:\Softwares\texlive\2026\bin\windows;%PATH%
xelatex -interaction=nonstopmode main.tex
xelatex -interaction=nonstopmode main.tex
```

---

## 📊 Cách Trình Chiếu & Xuất Ra PowerPoint (PPT / PPTX)

### 1. Trình chiếu trực tiếp từ `main.pdf` (Chất lượng đồ họa Vector cao nhất)
- Mở `main.pdf` bằng **Adobe Acrobat Reader**, **SumatraPDF**, hoặc bất kỳ trình duyệt nào.
- Nhấn phím tắt `Ctrl + L` (hoặc `F11` trên trình duyệt) để vào chế độ **Full Screen Slideshow**.
- **Ưu điểm vượt trội**: Không bao giờ bị lệch font, công thức toán học và biểu đồ TikZ hiển thị sắc nét 100% trên mọi màn hình máy chiếu 2K/4K.

### 2. Xuất sang PowerPoint PPTX qua `export_to_pptx.py`
Tệp script `export_to_pptx.py` đã được tích hợp sẵn. Để xuất file `.pptx`:
```bash
pip install pymupdf python-pptx
python export_to_pptx.py
```
File kết quả sẽ là `EMS_2.0_From_LaTeX.pptx` với tỉ lệ 16:9, mở và trình chiếu bình thường trên Microsoft PowerPoint.

### 3. Xuất qua LibreOffice Impress (Nếu có cài đặt)
```bash
soffice --infilter="impress_pdf_import" --headless --convert-to pptx main.pdf
```
