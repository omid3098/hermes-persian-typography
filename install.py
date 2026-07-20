#!/usr/bin/env python3
"""Install or remove the Hermes Vazirmatn desktop theme plugin."""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys
from datetime import datetime, timezone

PLUGIN_ID = "hermes-vazirmatn-theme"
SOURCE = Path(__file__).resolve().parent / "plugin.js"


def hermes_home(explicit: str | None) -> Path:
    if explicit:
        return Path(explicit).expanduser().resolve()
    if os.environ.get("HERMES_HOME"):
        return Path(os.environ["HERMES_HOME"]).expanduser().resolve()

    hermes = shutil.which("hermes")
    if hermes:
        try:
            result = subprocess.run(
                [hermes, "config", "path"],
                check=True,
                capture_output=True,
                text=True,
                timeout=20,
            )
            path = result.stdout.strip().strip('"')
            if path:
                return Path(path).expanduser().resolve().parent
        except (OSError, subprocess.SubprocessError):
            pass

    return (Path.home() / ".hermes").resolve()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--hermes-home", help="Override the Hermes home directory")
    parser.add_argument("--uninstall", action="store_true", help="Remove the installed plugin")
    args = parser.parse_args()

    home = hermes_home(args.hermes_home)
    destination = home / "desktop-plugins" / PLUGIN_ID
    plugin_file = destination / "plugin.js"

    if args.uninstall:
        if destination.exists():
            shutil.rmtree(destination)
            print(f"Removed {destination}")
        else:
            print(f"Nothing to remove: {destination}")
        return 0

    if not SOURCE.is_file():
        print(f"Plugin source is missing: {SOURCE}", file=sys.stderr)
        return 1

    destination.mkdir(parents=True, exist_ok=True)
    if plugin_file.exists() and plugin_file.read_bytes() != SOURCE.read_bytes():
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        backup = destination / f"plugin.js.backup-{stamp}"
        shutil.copy2(plugin_file, backup)
        print(f"Backed up the previous plugin to {backup}")

    shutil.copy2(SOURCE, plugin_file)
    print(f"Installed {PLUGIN_ID} to {plugin_file}")
    print("In Hermes Desktop, open Settings > Appearance and select 'Nous — Vazirmatn'.")
    print("If it is not listed yet, use the command palette: Reload desktop plugins.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
