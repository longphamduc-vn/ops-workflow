#!/usr/bin/env bash
set -e

echo "====================================================================="
echo "  COMPILING SPARE PART EMS 2.0 IMPROVEMENT REPORT (LATEX BEAMER)"
echo "====================================================================="

TEX_ENGINE="xelatex"
if ! command -v xelatex &> /dev/null; then
    if command -v pdflatex &> /dev/null; then
        TEX_ENGINE="pdflatex"
    else
        echo "[ERROR] Neither xelatex nor pdflatex found in PATH."
        exit 1
    fi
fi

echo "[BUILD] Using engine: $TEX_ENGINE"
$TEX_ENGINE -interaction=nonstopmode main.tex
$TEX_ENGINE -interaction=nonstopmode main.tex

echo "====================================================================="
echo "[SUCCESS] main.pdf generated successfully!"
echo "====================================================================="
