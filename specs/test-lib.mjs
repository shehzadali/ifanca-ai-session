// Shared Playwright harness for specs/<feature>/test.mjs.
// Each criterion runs in its own try block, takes a screenshot, and records Pass or Fail.
import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const require = createRequire(new URL('../app/package.json', import.meta.url))
const { chromium } = require('playwright')

export const BASE = process.env.BASE_URL || 'http://localhost:4173'

export async function run(feature, criteria) {
  const dir = path.join(path.dirname(new URL(import.meta.url).pathname), feature)
  const shots = path.join(dir, 'screenshots')
  fs.mkdirSync(shots, { recursive: true })
  const browser = await chromium.launch()
  const newPage = async () => {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      serviceWorkers: 'block',
    })
    const page = await ctx.newPage()
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
    page.on('pageerror', (e) => consoleErrors.push(String(e)))
    return page
  }
  const consoleErrors = []
  const results = []
  let page = await newPage()
  for (const [n, text, fn] of criteria) {
    let result = 'Pass'
    let notes = ''
    try {
      notes = (await fn({ page, newPage, BASE, setPage: (p) => (page = p) })) || ''
    } catch (e) {
      result = 'Fail'
      notes = String(e.message || e).split('\n')[0]
    }
    try {
      await page.screenshot({ path: path.join(shots, `ac-${n}.png`) })
    } catch {}
    results.push({ n, text, result, notes })
    console.log(`AC ${n}: ${result} ${notes}`)
  }
  await browser.close()
  const out = { feature, date: new Date().toISOString().slice(0, 10), commit: commit(), base: BASE, results, consoleErrors }
  fs.writeFileSync(path.join(dir, 'test-results.json'), JSON.stringify(out, null, 2))
  const failed = results.filter((r) => r.result === 'Fail').length
  console.log(`${results.length - failed} passed, ${failed} failed, ${consoleErrors.length} console errors`)
  return out
}

function commit() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

export function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

export async function go(page, hash) {
  await page.goto(`${BASE}/#/${hash}`)
  await page.waitForLoadState('networkidle')
}

export async function noSideScroll(page) {
  const w = await page.evaluate(() => document.documentElement.scrollWidth)
  assert(w <= 390, `page is ${w}px wide`)
}

// Every visible button, link, input, and select must be at least 44px tall.
export async function tapTargets(page, selector = 'main a, main button, main input, main select, main textarea') {
  const small = await page.$$eval(selector, (els) =>
    els
      .filter((e) => e.offsetParent !== null && !e.closest('[data-inline-link]'))
      .map((e) => [e.textContent?.trim().slice(0, 30) || e.tagName, Math.round(e.getBoundingClientRect().height)])
      .filter(([, h]) => h < 44),
  )
  assert(small.length === 0, `small tap targets: ${JSON.stringify(small.slice(0, 5))}`)
}

// The only allowed use of the words "not halal" is the fixed missing-item message.
export async function noOwnRuling(page) {
  const text = await page.evaluate(() => document.body.innerText)
  const allowed = "Not in IFANCA's published list. This does not mean it is not certified or not halal."
  const rest = text.split(allowed).join('')
  assert(!/not halal/i.test(rest), 'found "not halal" outside the fixed message')
}
