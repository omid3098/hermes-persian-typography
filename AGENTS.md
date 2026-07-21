# Hermes Persian Typography

This repository is a standalone Hermes Desktop runtime plugin for Vazirmatn and smart Persian/English text direction.

## Installation task

When a user asks to install or set up this repository:

1. Review `plugin.js` and `install.py`; do not modify Hermes source or packaged app files.
2. Run `python install.py` from the repository root. Use `--profile <name>` for one named profile or `--all-profiles` only when the user requests every existing profile. If `python` is unavailable on Windows, try `py install.py`.
3. Verify `plugin.js` exists under each targeted Hermes home's `desktop-plugins/hermes-persian-typography/` directory.
4. Verify the legacy `desktop-plugins/hermes-vazirmatn-theme/` directory is absent after migration.
5. Do not change the user's selected color theme. Vazirmatn and smart direction apply automatically.
6. If activation does not occur within a few seconds, tell the user to run **Reload desktop plugins** from the command palette.
7. Run `python scripts/validate.py` after changing repository files.

The plugin changes presentation only. It must not rewrite message text or stored conversation data.
