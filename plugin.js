import { STATUSBAR_AREAS } from '@hermes/plugin-sdk'
import { useEffect } from 'react'
import { jsx } from 'react/jsx-runtime'

const FONT_PROPERTY = '--dt-font-sans'
const FONT_STYLESHEET_ID = 'hermes-persian-typography-font'
const FONT_STYLESHEET_URL =
  'https://cdn.jsdelivr.net/gh/omid3098/hermes-persian-typography@v2.0.0/fonts/vazirmatn.css'
const EMOJI_FALLBACK =
  '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", emoji'
const VAZIRMATN_STACK =
  '"Vazirmatn", "Segoe WPC", "Segoe UI", -apple-system, BlinkMacSystemFont, system-ui, sans-serif, ' +
  EMOJI_FALLBACK
const SYSTEM_UI_STACK =
  '"Segoe WPC", "Segoe UI", -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif, ' +
  EMOJI_FALLBACK

const DIRECTION_TARGET_SELECTOR = [
  '[data-slot="aui_assistant-message-content"] .aui-md :where(p, h1, h2, h3, h4, h5, h6, blockquote)',
  '[data-slot="aui_assistant-message-content"] .aui-md :where(ul, ol)',
  '[data-slot="aui_user-inline-text"]',
  '[data-slot="composer-rich-input"]'
].join(', ')
const LIST_SELECTOR = '[data-slot="aui_assistant-message-content"] .aui-md :where(ul, ol)'
const LIST_ITEM_SELECTOR = 'li'
const SIDEBAR_LABEL_SELECTOR = '[data-slot="sidebar"] button span.truncate'
const SIDEBAR_SECTION_LABEL_SELECTOR = '[data-slot="sidebar"] .dither + span'
const EXCLUDED_TEXT_SELECTOR =
  'code, pre, .katex, [data-slot="code-card"], [data-streamdown="code-block"]'
const RTL_LETTERS = /\p{Script=Arabic}/gu
const LTR_LETTERS = /\p{Script=Latin}/gu
const TECHNICAL_TOKEN = /(?:https?:\/\/|www\.)\S+|(?:[A-Za-z]:[\\/]|\.{0,2}[\\/])\S+|\b\S+@\S+\.\S+\b/gu

function ensureFontStylesheet() {
  const existing = document.getElementById(FONT_STYLESHEET_ID)

  if (existing) {
    return
  }

  const link = document.createElement('link')
  link.id = FONT_STYLESHEET_ID
  link.rel = 'stylesheet'
  link.href = FONT_STYLESHEET_URL
  link.dataset.hermesPersianTypography = 'true'
  document.head.appendChild(link)
}

function countMatches(text, pattern) {
  return text.match(pattern)?.length ?? 0
}

function readableText(element) {
  const clone = element.cloneNode(true)

  for (const excluded of clone.querySelectorAll(EXCLUDED_TEXT_SELECTOR)) {
    excluded.remove()
  }

  return (clone.textContent ?? '').replace(TECHNICAL_TOKEN, ' ')
}

function dominantDirection(element) {
  const text = readableText(element)
  const rtl = countMatches(text, RTL_LETTERS)
  const ltr = countMatches(text, LTR_LETTERS)

  if (rtl === 0 && ltr === 0) {
    return null
  }

  return rtl > ltr ? 'rtl' : 'ltr'
}

function PersianTypographyRuntime() {
  useEffect(() => {
    const root = document.documentElement
    const managed = new Map()
    let applyingFont = false
    let frame = 0
    let underlyingFont = root.style.getPropertyValue(FONT_PROPERTY)

    ensureFontStylesheet()

    const applyFont = () => {
      const current = root.style.getPropertyValue(FONT_PROPERTY)

      if (current !== VAZIRMATN_STACK) {
        underlyingFont = current
        applyingFont = true
        root.style.setProperty(FONT_PROPERTY, VAZIRMATN_STACK)
        applyingFont = false
      }
    }

    const remember = element => {
      if (managed.has(element)) {
        return
      }

      managed.set(element, {
        hadDir: element.hasAttribute('dir'),
        dir: element.getAttribute('dir'),
        fontFamily: element.style.getPropertyValue('font-family'),
        textAlign: element.style.getPropertyValue('text-align'),
        unicodeBidi: element.style.getPropertyValue('unicode-bidi')
      })
    }

    const restore = (element, original) => {
      if (original.hadDir) {
        element.setAttribute('dir', original.dir ?? '')
      } else {
        element.removeAttribute('dir')
      }

      if (original.fontFamily) {
        element.style.setProperty('font-family', original.fontFamily)
      } else {
        element.style.removeProperty('font-family')
      }

      if (original.textAlign) {
        element.style.setProperty('text-align', original.textAlign)
      } else {
        element.style.removeProperty('text-align')
      }

      if (original.unicodeBidi) {
        element.style.setProperty('unicode-bidi', original.unicodeBidi)
      } else {
        element.style.removeProperty('unicode-bidi')
      }
    }

    const applyDirection = element => {
      if (!(element instanceof Element)) {
        return
      }

      const direction = dominantDirection(element)

      if (!direction) {
        const original = managed.get(element)

        if (original) {
          restore(element, original)
          managed.delete(element)
        }

        return
      }

      remember(element)
      element.setAttribute('dir', direction)
      element.style.setProperty('unicode-bidi', 'isolate')
      element.style.setProperty('text-align', 'start')
    }

    const restoreListItems = list => {
      for (const item of list.querySelectorAll(LIST_ITEM_SELECTOR)) {
        const original = managed.get(item)

        if (original) {
          restore(item, original)
          managed.delete(item)
        }
      }
    }

    const alignListItems = list => {
      for (const item of list.querySelectorAll(LIST_ITEM_SELECTOR)) {
        remember(item)
        item.removeAttribute('dir')
        item.style.setProperty('unicode-bidi', 'isolate')
        item.style.setProperty('text-align', 'start')
      }
    }

    const scan = () => {
      frame = 0

      for (const list of document.querySelectorAll(LIST_SELECTOR)) {
        restoreListItems(list)
      }

      for (const element of document.querySelectorAll(DIRECTION_TARGET_SELECTOR)) {
        applyDirection(element)
      }

      for (const list of document.querySelectorAll(LIST_SELECTOR)) {
        alignListItems(list)
      }

      for (const label of document.querySelectorAll(SIDEBAR_LABEL_SELECTOR)) {
        applyDirection(label)
      }

      // SidebarPanelLabel's uppercase/dither treatment may contain decorative
      // glyphs that Vazirmatn does not cover. Keep these headings on the native
      // UI stack while leaving ordinary sidebar labels on Vazirmatn.
      for (const heading of document.querySelectorAll(SIDEBAR_SECTION_LABEL_SELECTOR)) {
        remember(heading)
        heading.removeAttribute('dir')
        heading.style.setProperty('font-family', SYSTEM_UI_STACK)
        heading.style.removeProperty('unicode-bidi')
        heading.style.removeProperty('text-align')
      }
    }

    const scheduleScan = () => {
      if (!frame) {
        frame = requestAnimationFrame(scan)
      }
    }

    applyFont()
    scheduleScan()

    const fontObserver = new MutationObserver(() => {
      if (!applyingFont) {
        applyFont()
      }
    })
    fontObserver.observe(root, { attributeFilter: ['class', 'style'], attributes: true })

    const contentObserver = new MutationObserver(scheduleScan)
    contentObserver.observe(document.body, {
      characterData: true,
      childList: true,
      subtree: true
    })

    return () => {
      fontObserver.disconnect()
      contentObserver.disconnect()

      if (frame) {
        cancelAnimationFrame(frame)
      }

      for (const [element, original] of managed) {
        restore(element, original)
      }
      managed.clear()

      if (root.style.getPropertyValue(FONT_PROPERTY) === VAZIRMATN_STACK) {
        root.style.setProperty(FONT_PROPERTY, underlyingFont)
      }
    }
  }, [])

  return null
}

export default {
  id: 'hermes-persian-typography',
  name: 'Hermes Persian Typography',
  register(ctx) {
    ctx.register({
      id: 'persian-typography-runtime',
      area: STATUSBAR_AREAS.right,
      order: -10000,
      render: () => jsx(PersianTypographyRuntime, {})
    })
  }
}
