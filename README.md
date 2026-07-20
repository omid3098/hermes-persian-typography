# Hermes Persian Typography

A small, independent [Hermes Desktop](https://hermes-agent.nousresearch.com/) plugin for better Persian typography:

- applies [Vazirmatn](https://github.com/rastikerdar/vazirmatn) over **any** selected color theme;
- detects the dominant Persian/English script of chat blocks;
- fixes Persian-dominant sentences that begin with an English word;
- updates direction while assistant responses stream and while you type;
- keeps code blocks and technical typography LTR;
- restores the active theme font and original direction attributes when disabled.

It does not modify Hermes source, `app.asar`, generated CSS, stored messages, or the selected color theme.

## Ask an agent to install it

Give your agent this repository URL and say:

> Install Hermes Persian Typography from this repository. Run its installer, migrate any older hermes-vazirmatn-theme installation, verify the plugin was copied to my active Hermes profile, and do not modify Hermes source files or change my selected color theme.

Repository:

```text
https://github.com/omid3098/hermes-persian-typography
```

The repository contains `AGENTS.md`, so a capable coding agent can follow the safe procedure directly.

## Manual installation

```bash
git clone https://github.com/omid3098/hermes-persian-typography.git
cd hermes-persian-typography
python install.py
```

On Windows, `py install.py` also works when the Python launcher is available.

The installer resolves the active Hermes home and copies only `plugin.js` to:

```text
<HERMES_HOME>/desktop-plugins/hermes-persian-typography/plugin.js
```

If an older installation exists at `desktop-plugins/hermes-vazirmatn-theme`, the installer removes it after installing the replacement. This avoids loading both plugins at once.

Hermes Desktop watches the plugin directory, so activation normally happens within a few seconds. Otherwise run **Reload desktop plugins** from the command palette.

## How smart direction works

Hermes normally determines each line's direction from its first strong character. That makes this Persian sentence render LTR:

```text
Hermes یک دستیار هوشمند است
```

This plugin counts Arabic-script and Latin-script letters across the visible prose block. If Persian/Arabic letters dominate, it applies `dir="rtl"`; otherwise it applies `dir="ltr"`.

The plugin processes:

- assistant paragraphs, headings, and blockquotes;
- each ordered or unordered list as one paragraph-level direction unit, so every item inherits one consistent marker side and text alignment;
- user messages;
- the main and edit composers;
- sidebar leaf labels such as session, navigation, project, and cron titles, without changing their row layout.

Sidebar section headings keep a native system UI font instead of Vazirmatn. Their uppercase/dither presentation can contain decorative glyphs that Vazirmatn does not cover.

It excludes inline/fenced code, KaTeX, code cards, URLs, emails, and common file/path tokens from the direction vote. Code blocks themselves are never modified.

A frame-batched `MutationObserver` recomputes direction during streaming and editing without scanning once per token. Direction changes affect only presentation; message text and Markdown are untouched.

## Font behavior

The plugin applies a Vazirmatn-first stack to Hermes' root `--dt-font-sans` token. A separate observer reapplies it after color-theme changes while remembering the font selected by the underlying theme. Disabling the plugin restores that remembered font.

`--dt-font-sans` and the `data-slot` selectors used for direction are current Hermes Desktop internal contracts, not dedicated public typography APIs. This is cleaner and safer than patching Hermes files, but a future Hermes update that renames them may require a plugin update.

## Update

For clones made after the repository rename:

```bash
cd hermes-persian-typography
git pull --ff-only
python install.py
```

Older clones named `hermes-vazirmatn-theme` continue to work because GitHub redirects the old repository URL. After pulling, run `python install.py` to migrate the installed plugin directory.

## Disable or uninstall

Temporarily disable **Hermes Persian Typography** in **Settings → Plugins**. The plugin then restores:

- the active theme's font;
- pre-existing `dir` attributes;
- pre-existing inline `unicode-bidi` and `text-align` values.

To remove both current and legacy install directories:

```bash
python install.py --uninstall
```

## Font loading and privacy

The plugin loads its vendored Vazirmatn WOFF2 through jsDelivr's GitHub CDN, pinned to release `v2.0.0`. The first load requires network access and contacts jsDelivr; Chromium may cache the files afterward.

The plugin otherwise has no telemetry or backend. It does not read sessions, prompts, credentials, files, or gateway data.

## Development and validation

```bash
python scripts/validate.py
```

Validation covers:

- font application and restoration;
- dominant-script direction for English-leading Persian prose;
- genuine English prose remaining LTR;
- code exclusion;
- streaming direction recomputation;
- composer and user-message handling;
- full DOM cleanup on disable;
- migration from the legacy plugin directory;
- install/uninstall behavior in a temporary Hermes home.

## Compatibility

- Hermes Desktop with runtime desktop plugin support
- Windows, macOS, and Linux
- Built-in, VS Code, and third-party color themes using Hermes' standard font token

## Licenses

- Plugin and installer: [MIT](LICENSE)
- Vazirmatn font: [SIL Open Font License 1.1](fonts/OFL.txt)

Vazirmatn is Copyright © 2015–2022 Saber Rastikerdar and contributors.
