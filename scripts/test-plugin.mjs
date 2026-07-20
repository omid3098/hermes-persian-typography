import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const source = await fs.readFile(new URL('../plugin.js', import.meta.url), 'utf8')
let cleanup
let contribution
let animationFrameCallback

class StyleStub {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial))
  }

  getPropertyValue(name) {
    return this.values.get(name) ?? ''
  }

  removeProperty(name) {
    this.values.delete(name)
  }

  setProperty(name, value) {
    this.values.set(name, value)
  }
}

class ElementStub {
  constructor({ matches = [], text = '' } = {}) {
    this.attributes = new Map()
    this.children = []
    this.dataset = {}
    this.matchesSet = new Set(matches)
    this.style = new StyleStub()
    this.textContent = text
  }

  appendChild(child) {
    this.children.push(child)
    child.parentElement = this
    return child
  }

  cloneNode(deep = false) {
    const clone = new ElementStub({ matches: [...this.matchesSet], text: this.textContent })

    if (deep) {
      for (const child of this.children) {
        clone.appendChild(child.cloneNode(true))
      }
    }

    return clone
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null
  }

  hasAttribute(name) {
    return this.attributes.has(name)
  }

  matches(selector) {
    return this.matchesSet.has(selector)
  }

  querySelectorAll(selector) {
    const found = []
    const visit = node => {
      for (const child of node.children) {
        if (child.matches(selector)) {
          found.push(child)
        }
        visit(child)
      }
    }
    visit(this)
    return found
  }

  remove() {
    if (!this.parentElement) {
      return
    }

    this.parentElement.children = this.parentElement.children.filter(child => child !== this)
    this.parentElement = undefined
  }

  removeAttribute(name) {
    this.attributes.delete(name)
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value))
  }
}

const FONT_PROPERTY = '--dt-font-sans'
const styleValues = new Map([[FONT_PROPERTY, '"Original Theme Font", sans-serif']])
const rootStyle = {
  getPropertyValue(name) {
    return styleValues.get(name) ?? ''
  },
  setProperty(name, value) {
    styleValues.set(name, value)
  }
}

const elementsById = new Map()
const root = new ElementStub()
root.style = rootStyle
const body = new ElementStub()
root.appendChild(body)

const assistantPersian = new ElementStub({
  matches: ['[data-slot="aui_assistant-message-content"] .aui-md :where(p, h1, h2, h3, h4, h5, h6, li, blockquote)'],
  text: 'Hermes یک دستیار هوشمند برای مدیریت کارها است'
})
const assistantEnglish = new ElementStub({
  matches: ['[data-slot="aui_assistant-message-content"] .aui-md :where(p, h1, h2, h3, h4, h5, h6, li, blockquote)'],
  text: 'Hermes Desktop supports multiple themes'
})
const assistantCodeHeavyPersian = new ElementStub({
  matches: ['[data-slot="aui_assistant-message-content"] .aui-md :where(p, h1, h2, h3, h4, h5, h6, li, blockquote)'],
  text: 'npm install را اجرا کن تا برنامه نصب شود'
})
const inlineCode = new ElementStub({
  matches: ['code, pre, .katex, [data-slot="code-card"], [data-streamdown="code-block"]'],
  text: 'npm install'
})
assistantCodeHeavyPersian.appendChild(inlineCode)

const userMessage = new ElementStub({ matches: ['[data-slot="aui_user-inline-text"]'], text: 'OpenAI یک شرکت هوش مصنوعی است' })
const composer = new ElementStub({ matches: ['[data-slot="composer-rich-input"]'], text: 'npm install را برای نصب اجرا کن' })
const codeBlock = new ElementStub({ matches: ['[data-slot="code-card"]'], text: 'const value = 1' })

for (const element of [assistantPersian, assistantEnglish, assistantCodeHeavyPersian, userMessage, composer, codeBlock]) {
  body.appendChild(element)
}

const documentStub = {
  body,
  documentElement: root,
  getElementById(id) {
    return elementsById.get(id) ?? null
  },
  createElement(tag) {
    return Object.assign(new ElementStub(), { tag })
  },
  head: {
    appendChild(element) {
      elementsById.set(element.id, element)
    }
  },
  querySelectorAll(selector) {
    if (selector.includes('aui_assistant-message-content') && selector.includes('composer-rich-input')) {
      return [assistantPersian, assistantEnglish, assistantCodeHeavyPersian, userMessage, composer]
    }

    return body.querySelectorAll(selector)
  }
}

const observers = []
class MutationObserverStub {
  constructor(callback) {
    this.callback = callback
    this.disconnected = false
    observers.push(this)
  }

  observe() {}
  disconnect() {
    this.disconnected = true
  }
}

const sdkUrl = `data:text/javascript,${encodeURIComponent("export const STATUSBAR_AREAS = { right: 'statusBar.right' }")}`
const reactUrl = `data:text/javascript,${encodeURIComponent("export const useEffect = fn => { globalThis.__cleanup = fn() }")}`
const jsxUrl = `data:text/javascript,${encodeURIComponent("export const jsx = Component => Component()")}`
const executable = source
  .replace("'@hermes/plugin-sdk'", JSON.stringify(sdkUrl))
  .replace("'react'", JSON.stringify(reactUrl))
  .replace("'react/jsx-runtime'", JSON.stringify(jsxUrl))

globalThis.document = documentStub
globalThis.Element = ElementStub
globalThis.MutationObserver = MutationObserverStub
globalThis.requestAnimationFrame = callback => {
  animationFrameCallback = callback
  return 1
}
globalThis.cancelAnimationFrame = () => {}

const moduleUrl = `data:text/javascript,${encodeURIComponent(executable)}`
const plugin = (await import(moduleUrl)).default
plugin.register({
  register(value) {
    contribution = value
  }
})

assert.equal(contribution.area, 'statusBar.right')
assert.equal(typeof contribution.render, 'function')
contribution.render()
cleanup = globalThis.__cleanup
animationFrameCallback()

const vazirmatn = rootStyle.getPropertyValue(FONT_PROPERTY)
assert.match(vazirmatn, /^"Vazirmatn"/)
assert.equal(elementsById.get('hermes-persian-typography-font')?.rel, 'stylesheet')

assert.equal(assistantPersian.getAttribute('dir'), 'rtl', 'English-leading Persian paragraph should resolve RTL')
assert.equal(assistantEnglish.getAttribute('dir'), 'ltr', 'English paragraph should remain LTR')
assert.equal(assistantCodeHeavyPersian.getAttribute('dir'), 'rtl', 'inline code should not outvote Persian prose')
assert.equal(userMessage.getAttribute('dir'), 'rtl', 'English-leading Persian user message should resolve RTL')
assert.equal(composer.getAttribute('dir'), 'rtl', 'English-leading Persian composer should resolve RTL')
assert.equal(codeBlock.getAttribute('dir'), null, 'code blocks must not be modified')
assert.equal(assistantPersian.style.getPropertyValue('unicode-bidi'), 'isolate')
assert.equal(assistantPersian.style.getPropertyValue('text-align'), 'start')

assistantPersian.textContent = 'Hermes Desktop is written in English'
observers.find(observer => !observer.disconnected)?.callback([{ type: 'characterData', target: assistantPersian }])
animationFrameCallback()
assert.equal(assistantPersian.getAttribute('dir'), 'ltr', 'streaming text updates should recompute direction')

rootStyle.setProperty(FONT_PROPERTY, '"Midnight Theme Font", sans-serif')
for (const observer of observers.filter(observer => !observer.disconnected)) {
  observer.callback([{ type: 'attributes', target: root }])
}
assert.equal(rootStyle.getPropertyValue(FONT_PROPERTY), vazirmatn)

cleanup()
assert.equal(rootStyle.getPropertyValue(FONT_PROPERTY), '"Midnight Theme Font", sans-serif')
assert.equal(assistantPersian.getAttribute('dir'), null, 'cleanup should restore an absent dir attribute')
assert.equal(userMessage.getAttribute('dir'), null)
assert.equal(composer.getAttribute('dir'), null)
assert.equal(assistantPersian.style.getPropertyValue('unicode-bidi'), '')
assert.equal(assistantPersian.style.getPropertyValue('text-align'), '')
assert.ok(observers.every(observer => observer.disconnected), 'all observers should be disconnected')
assert.ok(animationFrameCallback, 'direction scans should be animation-frame batched')

console.log('Plugin behavior checks passed.')
