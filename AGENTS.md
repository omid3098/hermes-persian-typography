# Hermes Vazirmatn Font

This repository is a standalone Hermes Desktop runtime font-override plugin.

## Installation task

When a user asks to install or set up this repository:

1. Review `plugin.js` and `install.py`; do not modify Hermes source or packaged app files.
2. Run `python install.py` from the repository root. If `python` is unavailable on Windows, try `py install.py`.
3. Verify that `plugin.js` exists under the active Hermes home's `desktop-plugins/hermes-vazirmatn-theme/` directory.
4. Do not change the user's selected color theme. The plugin applies Vazirmatn to the current and future themes automatically.
5. If the plugin does not activate within a few seconds, tell the user to run **Reload desktop plugins** from the command palette.
6. Run `python scripts/validate.py` after changing repository files.

The install directory keeps the historical `hermes-vazirmatn-theme` id for backward-compatible updates.
