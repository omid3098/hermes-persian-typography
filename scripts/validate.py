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
PLUGIN_ID = "hermes-persian-typography"
LEGACY_PLUGIN_ID = "hermes-vazirmatn-theme"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> int:
    text = PLUGIN.read_text(encoding="utf-8")
    require("from '@hermes/plugin-sdk'" in text, "plugin must import the official SDK")
    require("STATUSBAR_AREAS" in text, "plugin must use a persistent mounted contribution")
    require("THEMES_AREA" not in text, "typography plugin must not register or clone a color theme")
    require("id: 'hermes-persian-typography'" in text, "plugin id is stale")
    require("name: 'Hermes Persian Typography'" in text, "plugin display name is stale")
    require("MutationObserver" in text, "plugin must survive theme and streaming changes")
    require("--dt-font-sans" in text, "font override variable is missing")
    require("DIRECTION_TARGET_SELECTOR" in text, "smart direction targets are missing")
    require("LIST_SELECTOR" in text and "LIST_ITEM_SELECTOR" in text, "list-level direction handling is missing")
    require("h1, h2, h3, h4, h5, h6, li, blockquote" not in text, "list items must not be independent direction targets")
    require("Script=Arabic" in text and "Script=Latin" in text, "dominant-script detection is missing")
    require("EXCLUDED_TEXT_SELECTOR" in text, "technical content exclusions are missing")
    require("requestAnimationFrame" in text, "streaming scans must be frame-batched")
    require("fontObserver.disconnect()" in text, "font observer must be cleaned up")
    require("contentObserver.disconnect()" in text, "content observer must be cleaned up")
    require("restore(element, original)" in text, "direction attributes/styles must be restored")
    require("root.style.setProperty(FONT_PROPERTY, underlyingFont)" in text, "active theme font must be restored")
    require("@v2.0.0/fonts/vazirmatn.css" in text, "font URL must be pinned to v2.0.0")
    require(FONT.is_file() and FONT.stat().st_size > 100_000, "vendored variable font is missing")
    require("font-weight: 100 900" in CSS.read_text(encoding="utf-8"), "variable font CSS is invalid")

    subprocess.run(
        ["node", str(ROOT / "scripts" / "test-plugin.mjs")],
        check=True,
        capture_output=True,
        text=True,
    )

    with tempfile.TemporaryDirectory() as tmp:
        plugins_home = Path(tmp) / "desktop-plugins"
        legacy = plugins_home / LEGACY_PLUGIN_ID
        legacy.mkdir(parents=True)
        (legacy / "plugin.js").write_text("legacy", encoding="utf-8")

        install = subprocess.run(
            [sys.executable, str(INSTALLER), "--hermes-home", tmp],
            check=True,
            capture_output=True,
            text=True,
        )
        installed = plugins_home / PLUGIN_ID / "plugin.js"
        require(installed.read_bytes() == PLUGIN.read_bytes(), "installer copied different bytes")
        require(not legacy.exists(), "installer did not remove the legacy plugin directory")
        require("Migrated installation" in install.stdout, "installer did not report legacy migration")
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
