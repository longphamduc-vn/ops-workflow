#!/usr/bin/env bash
set -e

echo "====================================================================="
echo "  COMPILING SPARE PART EMS 2.0 IMPROVEMENT REPORT (LATEX BEAMER)"
echo "====================================================================="

# Ensure TeX Live Windows path is included if running under WSL
WSL_TEX_PATH="/mnt/d/Softwares/texlive/2026/bin/windows"
if [ -d "$WSL_TEX_PATH" ]; then
    export PATH="$WSL_TEX_PATH:$PATH"
fi

# Detect available engine (checking both Linux native and Windows .exe under WSL)
TEX_ENGINE=""
IS_EXE=false

if command -v xelatex &> /dev/null; then
    TEX_ENGINE="xelatex"
elif command -v pdflatex &> /dev/null; then
    TEX_ENGINE="pdflatex"
elif command -v pdflatex.exe &> /dev/null; then
    TEX_ENGINE="pdflatex.exe"
    IS_EXE=true
elif command -v xelatex.exe &> /dev/null; then
    TEX_ENGINE="xelatex.exe"
    IS_EXE=true
fi

if [ -z "$TEX_ENGINE" ]; then
    echo "[ERROR] Neither xelatex nor pdflatex (nor Windows .exe in WSL) found in PATH."
    echo "Checked locations: /mnt/d/Softwares/texlive/2026/bin/windows and system PATH."
    exit 1
fi

echo "[INFO] Detected engine: $TEX_ENGINE"

# Pass 1
echo "[PASS 1/2] Compiling main.tex..."
if [ "$IS_EXE" = true ]; then
    $TEX_ENGINE -interaction=nonstopmode main.tex </dev/null
else
    $TEX_ENGINE -interaction=nonstopmode main.tex
fi

# Pass 2
echo "[PASS 2/2] Resolving cross-references and total frame count..."
if [ "$IS_EXE" = true ]; then
    $TEX_ENGINE -interaction=nonstopmode main.tex </dev/null
else
    $TEX_ENGINE -interaction=nonstopmode main.tex
fi

echo "====================================================================="
echo "[SUCCESS] main.pdf generated successfully (16:9 Widescreen Presentation)!"
echo "====================================================================="

# Check if user wants to convert to PPTX
if command -v python3 &> /dev/null && [ -f "export_to_pptx.py" ]; then
    echo ""
    echo "[INFO] Running export_to_pptx.py to generate PowerPoint PPTX..."
    python3 export_to_pptx.py main.pdf EMS_2.0_From_LaTeX.pptx || true
fi
