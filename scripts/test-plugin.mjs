import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const source = await fs.readFile(new URL('../plugin.js', import.meta.url), 'utf8')
let cleanup
let contribution
let observerCallback

const styleValues = new Map([['--dt-font-sans', '"Original Theme Font", sans-serif']])
const style = {
  getPropertyValue(name) {
    return styleValues.get(name) ?? ''
  },
  setProperty(name, value) {
    styleValues.set(name, value)
  }
}

const elements = new Map()
const root = { style }
const documentStub = {
  documentElement: root,
  getElementById(id) {
    return elements.get(id) ?? null
  },
  createElement(tag) {
    return { dataset: {}, tag }
  },
  head: {
    appendChild(element) {
      elements.set(element.id, element)
    }
  }
}

class MutationObserverStub {
  constructor(callback) {
    observerCallback = callback
  }

  observe() {}
  disconnect() {}
}

const sdkUrl = `data:text/javascript,${encodeURIComponent("export const STATUSBAR_AREAS = { right: 'statusBar.right' }")}`
const reactUrl = `data:text/javascript,${encodeURIComponent("export const useEffect = fn => { globalThis.__cleanup = fn() }")}`
const jsxUrl = `data:text/javascript,${encodeURIComponent("export const jsx = Component => Component()")}`
const executable = source
  .replace("'@hermes/plugin-sdk'", JSON.stringify(sdkUrl))
  .replace("'react'", JSON.stringify(reactUrl))
  .replace("'react/jsx-runtime'", JSON.stringify(jsxUrl))

globalThis.document = documentStub
globalThis.MutationObserver = MutationObserverStub

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

const vazirmatn = style.getPropertyValue('--dt-font-sans')
assert.match(vazirmatn, /^"Vazirmatn"/)
assert.equal(elements.get('hermes-vazirmatn-font-stylesheet')?.rel, 'stylesheet')

style.setProperty('--dt-font-sans', '"Midnight Theme Font", sans-serif')
observerCallback()
assert.equal(style.getPropertyValue('--dt-font-sans'), vazirmatn)

cleanup()
assert.equal(style.getPropertyValue('--dt-font-sans'), '"Midnight Theme Font", sans-serif')

console.log('Plugin behavior checks passed.')
