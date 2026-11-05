#!/usr/bin/env python3
"""
Convert LaTeX Beamer Output (main.pdf) to PowerPoint PPTX.

Usage:
    python export_to_pptx.py [input_pdf] [output_pptx]

Default:
    input_pdf:  main.pdf
    output_pptx: EMS_2.0_From_LaTeX.pptx
"""

import sys
import os
import subprocess
import shutil

INPUT_PDF = sys.argv[1] if len(sys.argv) > 1 else "main.pdf"
OUTPUT_PPTX = sys.argv[2] if len(sys.argv) > 2 else "EMS_2.0_From_LaTeX.pptx"

def convert_via_pymupdf():
    """Convert PDF pages to HD images and embed into PPTX via PyMuPDF + python-pptx"""
    try:
        import fitz  # PyMuPDF
        from pptx import Presentation
        from pptx.util import Inches
    except ImportError:
        return False

    print("[INFO] Converting via PyMuPDF (fitz) and python-pptx...")
    doc = fitz.open(INPUT_PDF)
    prs = Presentation()
    # 16:9 Widescreen dimensions: 13.333 x 7.5 inches
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]  # Blank slide

    temp_dir = "_temp_slide_images"
    os.makedirs(temp_dir, exist_ok=True)

    try:
        zoom = 2.5  # 2.5x zoom = ~180-200 DPI for crisp slides
        mat = fitz.Matrix(zoom, zoom)
        for i, page in enumerate(doc):
            pix = page.get_pixmap(matrix=mat, alpha=False)
            img_path = os.path.join(temp_dir, f"slide_{i+1:02d}.png")
            pix.save(img_path)

            slide = prs.slides.add_slide(blank_layout)
            slide.shapes.add_picture(img_path, 0, 0, width=prs.slide_width, height=prs.slide_height)
            print(f"  [+] Added slide {i+1} / {len(doc)}")

        prs.save(OUTPUT_PPTX)
        print(f"[SUCCESS] Exported high-resolution PPTX: {OUTPUT_PPTX}")
        return True
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

def convert_via_pdf2image():
    """Convert PDF pages to HD images via pdf2image + python-pptx"""
    try:
        from pdf2image import convert_from_path
        from pptx import Presentation
        from pptx.util import Inches
    except ImportError:
        return False

    print("[INFO] Converting via pdf2image and python-pptx...")
    images = convert_from_path(INPUT_PDF, dpi=200)
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    temp_dir = "_temp_slide_images"
    os.makedirs(temp_dir, exist_ok=True)
    try:
        for i, img in enumerate(images):
            img_path = os.path.join(temp_dir, f"slide_{i+1:02d}.png")
            img.save(img_path, "PNG")
            slide = prs.slides.add_slide(blank_layout)
            slide.shapes.add_picture(img_path, 0, 0, width=prs.slide_width, height=prs.slide_height)
            print(f"  [+] Added slide {i+1} / {len(images)}")

        prs.save(OUTPUT_PPTX)
        print(f"[SUCCESS] Exported high-resolution PPTX: {OUTPUT_PPTX}")
        return True
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

def convert_via_libreoffice():
    """Convert via LibreOffice soffice CLI if installed"""
    soffice_cmd = shutil.which("soffice")
    if not soffice_cmd:
        # Check standard Windows paths
        for path in [
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe"
        ]:
            if os.path.exists(path):
                soffice_cmd = path
                break

    if soffice_cmd:
        print("[INFO] Converting via LibreOffice Impress...")
        cmd = [soffice_cmd, "--infilter=impress_pdf_import", "--headless", "--convert-to", "pptx", INPUT_PDF, "--outdir", "."]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            converted_name = os.path.splitext(INPUT_PDF)[0] + ".pptx"
            if converted_name != OUTPUT_PPTX and os.path.exists(converted_name):
                shutil.move(converted_name, OUTPUT_PPTX)
            print(f"[SUCCESS] Exported PPTX: {OUTPUT_PPTX}")
            return True
    return False

def main():
    if not os.path.exists(INPUT_PDF):
        print(f"[ERROR] Input PDF '{INPUT_PDF}' does not exist.")
        print("Please compile main.tex first with compile.bat or pdflatex/xelatex.")
        sys.exit(1)

    print(f"Starting conversion: {INPUT_PDF} -> {OUTPUT_PPTX}")

    if convert_via_pymupdf():
        return
    if convert_via_pdf2image():
        return
    if convert_via_libreoffice():
        return

    print("\n[NOTE] Python libraries 'pymupdf' or 'python-pptx' are not installed yet.")
    print("To enable instant 1-click PDF -> PPTX conversion, run:")
    print("    pip install pymupdf python-pptx")
    print("Then re-run: python export_to_pptx.py\n")

if __name__ == "__main__":
    main()

