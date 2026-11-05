@echo off
setlocal enabledelayedexpansion
title Build LaTeX Beamer - Spare Part EMS 2.0 Report

echo =====================================================================
echo   COMPILING SPARE PART EMS 2.0 IMPROVEMENT REPORT (LATEX BEAMER)
echo =====================================================================
echo.

:: 1. Check custom TeX Live path from user configuration
set "TEXLIVE_DIR=D:\Softwares\texlive\2026\bin\windows"
if exist "%TEXLIVE_DIR%\xelatex.exe" (
    echo [INFO] Detected TeX Live at: %TEXLIVE_DIR%
    set "PATH=%TEXLIVE_DIR%;%PATH%"
    set "TEX_ENGINE=xelatex"
) else if exist "%TEXLIVE_DIR%\pdflatex.exe" (
    echo [INFO] Detected TeX Live at: %TEXLIVE_DIR%
    set "PATH=%TEXLIVE_DIR%;%PATH%"
    set "TEX_ENGINE=pdflatex"
) else (
    echo [INFO] TeX Live not found at %TEXLIVE_DIR%. Checking system PATH...
    where xelatex >nul 2>nul
    if !errorlevel! equ 0 (
        set "TEX_ENGINE=xelatex"
    ) else (
        where pdflatex >nul 2>nul
        if !errorlevel! equ 0 (
            set "TEX_ENGINE=pdflatex"
        ) else (
            echo [ERROR] No TeX engine found! Please verify TeX Live 2026 installation.
            echo Expected location: %TEXLIVE_DIR%
            pause
            exit /b 1
        )
    )
)

echo [BUILD] Using TeX engine: %TEX_ENGINE%
echo.

:: 2. Pass 1
echo [PASS 1/2] Compiling main.tex...
%TEX_ENGINE% -synctex=1 -interaction=nonstopmode main.tex
if !errorlevel! neq 0 (
    echo [ERROR] First pass compilation failed. Check main.log for details.
    pause
    exit /b 1
)

:: 3. Pass 2 (resolve total frame count & references)
echo [PASS 2/2] Resolving cross-references & slide numbers...
%TEX_ENGINE% -synctex=1 -interaction=nonstopmode main.tex
if !errorlevel! neq 0 (
    echo [ERROR] Second pass compilation failed. Check main.log for details.
    pause
    exit /b 1
)

echo.
echo =====================================================================
echo [SUCCESS] main.pdf created successfully (16:9 HD Widescreen Slides)!
echo =====================================================================
echo.

:: 4. Option to convert to PPTX
echo Do you want to export/convert main.pdf to PowerPoint PPTX?
set /p CONVERT="Convert to PPTX now? (Y/N): "
if /i "%CONVERT%"=="Y" (
    echo [EXPORT] Running export_to_pptx.py...
    python export_to_pptx.py
)

echo.
echo Done! You can view main.pdf in Full Screen (Ctrl + L) or open the exported PPTX.
pause
