#!/usr/bin/env python3
"""Install or remove the Hermes Persian Typography desktop plugin."""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys
from datetime import datetime, timezone

PLUGIN_ID = "hermes-persian-typography"
LEGACY_PLUGIN_ID = "hermes-vazirmatn-theme"
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


def target_homes(active_home: Path, profile: str | None, all_profiles: bool) -> list[Path]:
    root = active_home.parent.parent if active_home.parent.name == "profiles" else active_home
    profiles_root = root / "profiles"

    if profile:
        if profile == "default":
            return [root]
        candidate = profiles_root / profile
        resolved = candidate.resolve()
        if (
            candidate.is_symlink()
            or resolved.parent != profiles_root.resolve()
            or not (resolved / "SOUL.md").is_file()
        ):
            raise ValueError(f"Hermes profile does not exist: {profile}")
        return [resolved]

    if not all_profiles:
        return [active_home]

    homes = [root]
    if profiles_root.is_dir():
        homes.extend(
            path.resolve()
            for path in sorted(profiles_root.iterdir(), key=lambda item: item.name.lower())
            if path.is_dir() and not path.is_symlink() and (path / "SOUL.md").is_file()
        )
    return homes


def remove_directory(path: Path) -> bool:
    if not path.exists():
        return False
    shutil.rmtree(path)
    print(f"Removed {path}")
    return True


def update_home(home: Path, uninstall: bool) -> None:
    plugins_home = home / "desktop-plugins"
    destination = plugins_home / PLUGIN_ID
    legacy_destination = plugins_home / LEGACY_PLUGIN_ID
    plugin_file = destination / "plugin.js"

    if uninstall:
        removed = remove_directory(destination)
        removed = remove_directory(legacy_destination) or removed
        if not removed:
            print(f"Nothing to remove under {plugins_home}")
        return

    destination.mkdir(parents=True, exist_ok=True)
    if plugin_file.exists() and plugin_file.read_bytes() != SOURCE.read_bytes():
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        backup = destination / f"plugin.js.backup-{stamp}"
        shutil.copy2(plugin_file, backup)
        print(f"Backed up the previous plugin to {backup}")

    shutil.copy2(SOURCE, plugin_file)

    if legacy_destination.exists() and legacy_destination.resolve() != destination.resolve():
        remove_directory(legacy_destination)
        print(f"Migrated installation from {LEGACY_PLUGIN_ID} to {PLUGIN_ID}")

    print(f"Installed {PLUGIN_ID} to {plugin_file}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    target = parser.add_mutually_exclusive_group()
    target.add_argument("--hermes-home", help="Override the Hermes home directory")
    target.add_argument("--profile", help="Install for one named Hermes profile")
    target.add_argument("--all-profiles", action="store_true", help="Install for the default and every named profile")
    parser.add_argument("--uninstall", action="store_true", help="Remove the installed plugin")
    args = parser.parse_args()

    if not args.uninstall and not SOURCE.is_file():
        print(f"Plugin source is missing: {SOURCE}", file=sys.stderr)
        return 1

    try:
        homes = target_homes(hermes_home(args.hermes_home), args.profile, args.all_profiles)
    except ValueError as error:
        parser.error(str(error))

    for home in homes:
        update_home(home, args.uninstall)

    if args.uninstall:
        return 0
    print("Vazirmatn now applies over the current Hermes Desktop color theme.")
    print("Persian-dominant messages and composer text now use smart RTL direction.")
    print("If it is not active yet, use the command palette: Reload desktop plugins.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
