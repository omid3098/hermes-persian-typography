import { THEMES_AREA } from '@hermes/plugin-sdk'

const EMOJI_FALLBACK =
  '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", emoji'

const SYSTEM_MONO =
  '"Cascadia Code", "JetBrains Mono", "SF Mono", ui-monospace, Menlo, Monaco, Consolas, monospace, ' +
  EMOJI_FALLBACK

const NOUS_BLUE = '#0053FD'
const PSYCHE_BLUE = '#1540B1'
const PSYCHE_WARM = '#FFE6CB'

const tint = percent => `color-mix(in srgb, ${NOUS_BLUE} ${percent}%, #FFFFFF)`
const tintTransparent = percent => `color-mix(in srgb, ${NOUS_BLUE} ${percent}%, transparent)`

const vazirmatnTheme = {
  name: 'nous-vazirmatn',
  label: 'Nous — Vazirmatn',
  description: 'The Nous desktop theme with Vazirmatn typography for Persian and Arabic text',
  colors: {
    background: '#F8FAFF',
    foreground: '#17171A',
    card: '#FFFFFF',
    cardForeground: '#17171A',
    muted: tint(5),
    mutedForeground: '#666678',
    popover: '#FFFFFF',
    popoverForeground: '#17171A',
    primary: NOUS_BLUE,
    primaryForeground: '#FCFCFC',
    secondary: tint(7),
    secondaryForeground: '#242432',
    accent: tint(10),
    accentForeground: '#202030',
    border: tintTransparent(22),
    input: tintTransparent(30),
    ring: NOUS_BLUE,
    midground: NOUS_BLUE,
    composerRing: NOUS_BLUE,
    destructive: '#C72E4D',
    destructiveForeground: '#FFFFFF',
    sidebarBackground: '#F3F7FF',
    sidebarBorder: tintTransparent(18),
    userBubble: tint(6),
    userBubbleBorder: tintTransparent(24)
  },
  darkColors: {
    background: '#0D2F86',
    foreground: PSYCHE_WARM,
    card: '#12378F',
    cardForeground: PSYCHE_WARM,
    muted: '#183F9A',
    mutedForeground: '#B5C7F3',
    popover: '#123A96',
    popoverForeground: PSYCHE_WARM,
    primary: PSYCHE_WARM,
    primaryForeground: '#0D2F86',
    secondary: '#1B45A4',
    secondaryForeground: '#E0E8FF',
    accent: PSYCHE_BLUE,
    accentForeground: '#F0F4FF',
    border: '#3158AD',
    input: '#0B2566',
    ring: PSYCHE_WARM,
    midground: NOUS_BLUE,
    composerRing: PSYCHE_WARM,
    destructive: '#C0473A',
    destructiveForeground: '#FEF2F2',
    sidebarBackground: '#09286F',
    sidebarBorder: '#234A9C',
    userBubble: '#143B91',
    userBubbleBorder: '#3A63BD'
  },
  typography: {
    fontSans:
      '"Vazirmatn", "Segoe WPC", "Segoe UI", -apple-system, BlinkMacSystemFont, system-ui, sans-serif, ' +
      EMOJI_FALLBACK,
    fontMono: SYSTEM_MONO,
    fontUrl:
      'https://cdn.jsdelivr.net/gh/omid3098/hermes-vazirmatn-theme@v1.0.0/fonts/vazirmatn.css'
  }
}

export default {
  id: 'hermes-vazirmatn-theme',
  name: 'Hermes Vazirmatn Theme',
  register(ctx) {
    ctx.register({
      id: 'nous-vazirmatn',
      area: THEMES_AREA,
      data: vazirmatnTheme
    })
  }
}
