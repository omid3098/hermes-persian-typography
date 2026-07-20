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
    require("STATUSBAR_AREAS" in text, "plugin must use a persistent mounted contribution")
    require("THEMES_AREA" not in text, "font override must not register or clone a color theme")
    require("id: 'hermes-vazirmatn-theme'" in text, "plugin id is missing")
    require("MutationObserver" in text, "font override must survive theme changes")
    require("--dt-font-sans" in text, "font override variable is missing")
    require("observer.disconnect()" in text, "font observer must be cleaned up when disabled")
    require("root.style.setProperty(FONT_PROPERTY, underlyingFont)" in text, "disable must restore the active theme font")
    require("@v1.0.0/fonts/vazirmatn.css" in text, "font URL must be release-pinned")
    require("name: 'Hermes Vazirmatn Font'" in text, "plugin display name is stale")
    require(FONT.is_file() and FONT.stat().st_size > 100_000, "vendored variable font is missing")
    require("font-weight: 100 900" in CSS.read_text(encoding="utf-8"), "variable font CSS is invalid")

    subprocess.run(
        ["node", str(ROOT / "scripts" / "test-plugin.mjs")],
        check=True,
        capture_output=True,
        text=True,
    )

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
