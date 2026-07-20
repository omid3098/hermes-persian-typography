#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
PLUGIN = ROOT / "plugin.js"
FONT = ROOT / "fonts" / "Vazirmatn[wght].woff2"
CSS = ROOT / "fonts" / "vazirmatn.css"
INSTALLER = ROOT / "install.py"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> int:
    text = PLUGIN.read_text(encoding="utf-8")
    require("from '@hermes/plugin-sdk'" in text, "plugin must import the official SDK")
    require("THEMES_AREA" in text, "plugin must register a theme contribution")
    require("id: 'hermes-vazirmatn-theme'" in text, "plugin id is missing")
    require("name: 'nous-vazirmatn'" in text, "theme name is missing")
    require("@v1.0.0/fonts/vazirmatn.css" in text, "font URL must be release-pinned")
    require(FONT.is_file() and FONT.stat().st_size > 100_000, "vendored variable font is missing")
    require("font-weight: 100 900" in CSS.read_text(encoding="utf-8"), "variable font CSS is invalid")

    with tempfile.TemporaryDirectory() as tmp:
        install = subprocess.run(
            [sys.executable, str(INSTALLER), "--hermes-home", tmp],
            check=True,
            capture_output=True,
            text=True,
        )
        installed = Path(tmp) / "desktop-plugins" / "hermes-vazirmatn-theme" / "plugin.js"
        require(installed.read_bytes() == PLUGIN.read_bytes(), "installer copied different bytes")
        require("Installed" in install.stdout, "installer did not report success")

        subprocess.run(
            [sys.executable, str(INSTALLER), "--hermes-home", tmp, "--uninstall"],
            check=True,
            capture_output=True,
            text=True,
        )
        require(not installed.parent.exists(), "uninstaller left the plugin directory behind")

    print("All validation checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
