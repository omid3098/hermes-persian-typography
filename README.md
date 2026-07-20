# Hermes Vazirmatn Theme

A small, independent [Hermes Desktop](https://hermes-agent.nousresearch.com/) plugin that adds a **Nous — Vazirmatn** theme. It keeps Hermes' Nous color palette and replaces the interface sans-serif stack with [Vazirmatn](https://github.com/rastikerdar/vazirmatn).

- No Hermes source changes
- No `app.asar` or generated CSS patches
- Installed through Hermes Desktop's supported runtime plugin directory
- Removable without affecting Hermes
- Works on Windows, macOS, and Linux

> This first release changes typography only. Smarter mixed Persian/English text-direction handling is intentionally left for a separate plugin feature.

## Ask an agent to install it

Give your agent this repository URL and say:

> Install the Hermes Vazirmatn theme from this repository, run its installer, verify the desktop plugin was copied to my active Hermes profile, and tell me how to select it. Do not modify Hermes source files.

Repository:

```text
https://github.com/omid3098/hermes-vazirmatn-theme
```

An agent should clone the repository and run:

```bash
python install.py
```

On Windows, `py install.py` or `python install.py` both work when Python is available.

## Manual installation

```bash
git clone https://github.com/omid3098/hermes-vazirmatn-theme.git
cd hermes-vazirmatn-theme
python install.py
```

The installer asks Hermes for its active configuration path and copies only `plugin.js` into:

```text
<HERMES_HOME>/desktop-plugins/hermes-vazirmatn-theme/plugin.js
```

Then open Hermes Desktop:

1. Go to **Settings → Appearance**.
2. Select **Nous — Vazirmatn**.
3. If the theme is not visible, open the command palette and run **Reload desktop plugins**.

## Update

```bash
cd hermes-vazirmatn-theme
git pull --ff-only
python install.py
```

If the installed plugin differs, the installer creates a timestamped backup before replacing it.

## Uninstall

```bash
python install.py --uninstall
```

Switch to another theme before uninstalling. If Hermes Desktop still shows the removed theme, run **Reload desktop plugins** or restart the app.

## Font loading and privacy

The plugin loads its vendored Vazirmatn WOFF2 file from jsDelivr's GitHub CDN. This makes installation one-file and cross-platform, but the first theme load requires network access and contacts jsDelivr. After loading, Chromium may cache the font.

If Vazirmatn is already installed on the operating system, it remains the first font in the stack. Hermes still loads the stylesheet because the current theme API exposes a stylesheet URL rather than a local plugin-asset URL.

## What the plugin changes

The plugin registers one official `THEMES_AREA` contribution through `@hermes/plugin-sdk`:

- Theme: `Nous — Vazirmatn`
- UI font: Vazirmatn with system and emoji fallbacks
- Code/terminal font: unchanged system monospace stack
- Colors: based on the Hermes Nous theme available when this plugin was released

A Hermes update may evolve the built-in Nous palette independently. This plugin does not patch or override the built-in theme; it owns a separate selectable theme.

## Security model

Hermes Desktop runtime plugins are trusted local JavaScript, not a sandbox. Review `plugin.js` before installing. This plugin:

- imports only `THEMES_AREA` from `@hermes/plugin-sdk`;
- registers one static theme;
- does not access files, the network API, sessions, prompts, or credentials;
- contains no backend component and no telemetry.

The only network request is the theme font stylesheet/font described above.

## Development and validation

```bash
python scripts/validate.py
```

Validation checks the plugin contract, font asset, pinned font URL, and installer behavior against a temporary Hermes home.

## Licenses

- Plugin and installer: [MIT](LICENSE)
- Vazirmatn font: [SIL Open Font License 1.1](fonts/OFL.txt)

Vazirmatn is Copyright © 2015–2022 Saber Rastikerdar and contributors.
