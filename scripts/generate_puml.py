#!/usr/bin/env python3
"""
PlantUML Diagram Generator & Real-time Live Watcher
Generates high-resolution SVG and PNG diagrams in real-time from .puml files.

Usage:
    python3 scripts/generate_puml.py [file.puml]              # One-time generation
    python3 scripts/generate_puml.py [file.puml] --watch      # Real-time watcher
"""

import sys
import os
import time
import argparse
import plantuml

def render_diagram(puml_path: str, output_formats=("svg", "png")):
    """Read a puml file and render it to SVG and PNG using the PlantUML engine."""
    if not os.path.isfile(puml_path):
        print(f"[ERROR] File not found: {puml_path}")
        return False

    base_name = os.path.splitext(puml_path)[0]
    success = True

    for fmt in output_formats:
        out_file = f"{base_name}.{fmt}"
        endpoint = 'http://www.plantuml.com/plantuml/svg/' if fmt == 'svg' else 'http://www.plantuml.com/plantuml/img/'
        try:
            server = plantuml.PlantUML(url=endpoint)
            server.processes_file(puml_path, outfile=out_file)
            size = os.path.getsize(out_file)
            print(f"[OK] Generated: {out_file} ({size:,} bytes)")
        except Exception as e:
            print(f"[FAIL] Error generating {out_file}: {e}")
            success = False

    return success

def watch_mode(puml_path: str, output_formats=("svg", "png")):
    """Watch puml file and re-render automatically on file modification."""
    print(f"==================================================")
    print(f"  PLANTUML REAL-TIME WATCHER ACTIVE               ")
    print(f"  Watching: {puml_path}                           ")
    print(f"  Formats:  {', '.join(output_formats)}           ")
    print(f"  Press Ctrl+C to stop.                           ")
    print(f"==================================================")
    
    # Initial render
    render_diagram(puml_path, output_formats)
    last_mtime = os.path.getmtime(puml_path) if os.path.isfile(puml_path) else 0

    try:
        while True:
            if os.path.isfile(puml_path):
                mtime = os.path.getmtime(puml_path)
                if mtime != last_mtime:
                    last_mtime = mtime
                    now_str = time.strftime('%H:%M:%S')
                    print(f"\n[DETECT] Change detected in {puml_path} at {now_str} -> Re-generating...")
                    render_diagram(puml_path, output_formats)
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[WATCH] Real-time watcher stopped.")

def main():
    parser = argparse.ArgumentParser(description="PlantUML real-time diagram generator and live watcher")
    parser.add_argument("file", nargs="?", default="procurement-item-registration-flow.puml", help="Path to .puml file")
    parser.add_argument("--watch", "-w", action="store_true", help="Watch file and re-render in real-time upon changes")
    parser.add_argument("--format", "-f", nargs="+", default=["svg", "png"], choices=["svg", "png"], help="Output formats")

    args = parser.parse_args()

    if args.watch:
        watch_mode(args.file, args.format)
    else:
        render_diagram(args.file, args.format)

if __name__ == "__main__":
    main()
