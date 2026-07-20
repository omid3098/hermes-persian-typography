# Hermes Vazirmatn Theme

This repository is a standalone Hermes Desktop runtime theme plugin.

## Installation task

When a user asks to install or set up this repository:

1. Review `plugin.js` and `install.py`; do not modify Hermes source or packaged app files.
2. Run `python install.py` from the repository root. If `python` is unavailable on Windows, try `py install.py`.
3. Verify that `plugin.js` exists under the active Hermes home's `desktop-plugins/hermes-vazirmatn-theme/` directory.
4. Tell the user to choose **Nous — Vazirmatn** in **Settings → Appearance**. If absent, use **Reload desktop plugins** from the command palette.
5. Do not silently alter the user's current selected theme.

Run `python scripts/validate.py` after changing repository files.
