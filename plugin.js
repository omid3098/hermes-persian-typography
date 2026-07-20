import { STATUSBAR_AREAS } from '@hermes/plugin-sdk'
import { useEffect } from 'react'
import { jsx } from 'react/jsx-runtime'

const FONT_PROPERTY = '--dt-font-sans'
const FONT_STYLESHEET_ID = 'hermes-vazirmatn-font-stylesheet'
const FONT_STYLESHEET_URL =
  'https://cdn.jsdelivr.net/gh/omid3098/hermes-vazirmatn-theme@v1.0.0/fonts/vazirmatn.css'
const EMOJI_FALLBACK =
  '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", emoji'
const VAZIRMATN_STACK =
  '"Vazirmatn", "Segoe WPC", "Segoe UI", -apple-system, BlinkMacSystemFont, system-ui, sans-serif, ' +
  EMOJI_FALLBACK

function ensureFontStylesheet() {
  const existing = document.getElementById(FONT_STYLESHEET_ID)

  if (existing) {
    return
  }

  const link = document.createElement('link')
  link.id = FONT_STYLESHEET_ID
  link.rel = 'stylesheet'
  link.href = FONT_STYLESHEET_URL
  link.dataset.hermesVazirmatn = 'true'
  document.head.appendChild(link)
}

function VazirmatnFontOverride() {
  useEffect(() => {
    const root = document.documentElement
    let applying = false
    let underlyingFont = root.style.getPropertyValue(FONT_PROPERTY)

    ensureFontStylesheet()

    const apply = () => {
      const current = root.style.getPropertyValue(FONT_PROPERTY)

      if (current !== VAZIRMATN_STACK) {
        underlyingFont = current
        applying = true
        root.style.setProperty(FONT_PROPERTY, VAZIRMATN_STACK)
        applying = false
      }
    }

    apply()

    const observer = new MutationObserver(() => {
      if (!applying) {
        apply()
      }
    })

    observer.observe(root, { attributeFilter: ['class', 'style'], attributes: true })

    return () => {
      observer.disconnect()

      if (root.style.getPropertyValue(FONT_PROPERTY) === VAZIRMATN_STACK) {
        root.style.setProperty(FONT_PROPERTY, underlyingFont)
      }
    }
  }, [])

  return null
}

export default {
  id: 'hermes-vazirmatn-theme',
  name: 'Hermes Vazirmatn Font',
  register(ctx) {
    ctx.register({
      id: 'font-override-runtime',
      area: STATUSBAR_AREAS.right,
      order: -10000,
      render: () => jsx(VazirmatnFontOverride, {})
    })
  }
}
