# Hermes Vazirmatn Font

A small, independent [Hermes Desktop](https://hermes-agent.nousresearch.com/) plugin that applies [Vazirmatn](https://github.com/rastikerdar/vazirmatn) to the interface **without replacing or cloning your selected color theme**.

- Works with Nous, Midnight, VS Code themes, and third-party themes
- Keeps code and terminal typography unchanged
- Survives theme switches in the running app
- No Hermes source, `app.asar`, or generated CSS modifications
- Uses Hermes Desktop's supported runtime plugin directory
- Can be disabled live from **Settings → Plugins**

> This release changes typography only. Smarter mixed Persian/English text-direction handling remains a separate future feature.

## Ask an agent to install it

Give your agent this repository URL and say:

> Install the Hermes Vazirmatn font override from this repository, run its installer, verify the desktop plugin was copied to my active Hermes profile, and confirm it works with my current theme. Do not modify Hermes source files or change my selected theme.

Repository:

```text
https://github.com/omid3098/hermes-vazirmatn-theme
```

The repository includes `AGENTS.md`, so a capable coding agent can follow the safe installation procedure directly.

## Manual installation

```bash
git clone https://github.com/omid3098/hermes-vazirmatn-theme.git
cd hermes-vazirmatn-theme
python install.py
```

On Windows, `py install.py` also works when the Python launcher is available.

The installer asks Hermes for its active configuration path and copies only `plugin.js` into:

```text
<HERMES_HOME>/desktop-plugins/hermes-vazirmatn-theme/plugin.js
```

Hermes Desktop watches that directory, so the plugin normally activates within a few seconds. If it does not, open the command palette and run **Reload desktop plugins**.

There is no theme to select anymore: keep using whichever color theme you prefer. The plugin applies Vazirmatn over it.

## How it works

Hermes stores the active interface font in the root CSS custom property:

```css
--dt-font-sans
```

The plugin mounts a tiny lifecycle component through the official desktop plugin SDK. It:

1. loads the pinned Vazirmatn stylesheet;
2. applies a Vazirmatn-first font stack to `--dt-font-sans`;
3. watches the root theme attributes and reapplies the override after theme changes;
4. remembers the latest font value supplied by the active theme;
5. restores that value when the plugin is disabled or hot-reloaded.

The `--dt-font-sans` override is currently an internal desktop CSS contract rather than a dedicated typography extension API. It is substantially cleaner than patching Hermes files, but a future Hermes update that renames this variable may require a plugin update.

## Update

```bash
cd hermes-vazirmatn-theme
git pull --ff-only
python install.py
```

If the installed plugin differs, the installer creates a timestamped backup before replacing it.

## Disable or uninstall

To disable temporarily, use **Settings → Plugins → Hermes Vazirmatn Font**. Disabling it restores the current theme's own font immediately.

To remove it:

```bash
python install.py --uninstall
```

If Hermes Desktop still inventories the removed plugin, run **Reload desktop plugins** or restart the app.

## Font loading and privacy

The plugin loads its vendored Vazirmatn WOFF2 file through jsDelivr's GitHub CDN. The URL is pinned to release `v1.0.0`, so later changes to `main` cannot silently alter existing installations.

The first load requires network access and contacts jsDelivr; Chromium may cache the stylesheet and font afterward. If Vazirmatn is already installed on the operating system, it remains the first family in the stack, but the stylesheet request is still made because Hermes' runtime plugin loader does not expose local plugin assets as browser URLs.

## Security model

Hermes Desktop runtime plugins are trusted local JavaScript, not a sandbox. Review `plugin.js` before installing. This plugin:

- imports only the official SDK plus Hermes' own React runtime;
- registers one invisible lifecycle contribution;
- does not read sessions, prompts, files, credentials, or gateway data;
- has no backend component and no telemetry;
- makes only the font stylesheet/font request described above.

## Development and validation

```bash
python scripts/validate.py
```

Validation checks:

- official SDK imports and absence of a cloned theme;
- application across theme changes;
- cleanup and restoration when disabled;
- the pinned font asset;
- installation and uninstallation in a temporary Hermes home.

## Compatibility

- Hermes Desktop with runtime desktop plugin support
- Windows, macOS, and Linux
- Any active Hermes color theme that uses the standard `--dt-font-sans` token

The plugin id and install directory remain `hermes-vazirmatn-theme` for backward-compatible updates from v1.0.0.

## Licenses

- Plugin and installer: [MIT](LICENSE)
- Vazirmatn font: [SIL Open Font License 1.1](fonts/OFL.txt)

Vazirmatn is Copyright © 2015–2022 Saber Rastikerdar and contributors.
