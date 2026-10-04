// Smoke test of all five features and the PWA at 390px.
// Usage: node tests/smoke.mjs [base-url]   (default http://localhost:4173)
// Exits with code 1 if any check fails. Used by /ship before and after deploy.
import { chromium } from 'playwright'
import path from 'node:path'

const BASE = (process.argv[2] || process.env.BASE_URL || 'http://localhost:4173').replace(/\/$/, '')
const LABEL = path.join(path.dirname(new URL(import.meta.url).pathname), '..', '..', 'specs', 'fixtures', 'label.png')
const MISSING = "Not in IFANCA's published list. This does not mean it is not certified or not halal."
const FOOTER = "Demo built from IFANCA's public content. Not an official IFANCA app."

const results = []
const errors = []
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

function assert(c, msg) {
  if (!c) throw new Error(msg)
}
async function go(hash) {
  await page.goto(`${BASE}/#/${hash}`)
  await page.waitForLoadState('networkidle')
}
async function common() {
  const w = await page.evaluate(() => document.documentElement.scrollWidth)
  assert(w <= 390, `page is ${w}px wide`)
  assert((await page.textContent('footer')).includes(FOOTER), 'footer text missing')
}
async function check(name, fn) {
  try {
    const note = await fn()
    results.push([name, 'pass', note || ''])
  } catch (e) {
    results.push([name, 'FAIL', String(e.message || e).split('\n')[0]])
  }
}

await check('home: five tiles and footer', async () => {
  await go('')
  const tiles = await page.locator('main a[href^="#/"]').allInnerTexts()
  assert(tiles.length === 5, `${tiles.length} tiles`)
  assert(tiles.some((t) => t.includes('Learn and quiz')), 'Learn and quiz tile')
  assert(tiles.some((t) => /meal plan/i.test(t)), 'Cook tile subtitle')
  await common()
})

await check('product-check: search, category, missing message', async () => {
  await go('product')
  await page.waitForSelector('[data-testid=result-count]', { timeout: 20000 })
  assert((await page.textContent('[data-testid=snapshot]')).includes('2026'), 'snapshot date')
  await page.selectOption('select', 'Cheese')
  assert((await page.textContent('[data-testid=result-count]')) === '258 products', 'Cheese count')
  await page.selectOption('select', '')
  await page.fill('input[type=search]', 'zzqx')
  assert((await page.textContent('[data-testid=not-in-list]')) === MISSING, 'missing message')
  await common()
})

await check('ingredient-check: paste, side by side, photo OCR', async () => {
  await go('ingredients/paste')
  await page.fill('textarea', 'Sugar, Gelatin, Soy Lecithin, Salt')
  await page.getByRole('button', { name: 'Check ingredients' }).click()
  await page.waitForSelector('[data-testid=results]')
  const names = await page.locator('[data-testid=results] [data-testid=ingredient-card]').evaluateAll((e) => e.map((x) => x.dataset.name))
  assert(names.join() === 'Gelatin,Lecithin', names.join())
  assert((await page.locator('[data-testid=side-by-side]').count()) === 2, 'side by side')
  await common()
  await go('ingredients/photo')
  await page.setInputFiles('[data-testid=choose-photo]', LABEL)
  await page.waitForSelector('textarea', { timeout: 90000 })
  assert(/GELATIN/.test(await page.inputValue('textarea')), 'OCR text')
  return 'OCR read the label'
})

await check('learn-halal: first lesson and quiz', async () => {
  await go('learn')
  await page.waitForSelector('[data-testid=lesson-title]')
  assert((await page.locator('[data-testid=lesson-title]').count()) === 26, 'lesson count')
  assert((await page.locator('[data-testid=lesson-title]').first().innerText()) === 'What is halal?', 'first lesson')
  await common()
  await go('learn/quiz/Beginner')
  await page.locator('[data-testid=option]').first().click()
  assert((await page.locator('[data-testid=quote]').count()) === 1, 'quiz quote')
  await common()
})

await check('cook: list, recipe, meal plan', async () => {
  await go('cook')
  await page.waitForSelector('[data-testid=recipe-row]')
  assert((await page.textContent('[data-testid=result-count]')) === '340 recipes', 'recipe count')
  await page.locator('[data-testid=recipe-row]').first().click()
  await page.waitForSelector('[data-testid=ingredients]')
  await page.locator('[data-testid=recipe-photo], [data-testid=photo-placeholder]').first().waitFor()
  await page.getByRole('button', { name: 'Add to meal plan' }).click()
  await page.getByRole('button', { name: 'Friday' }).click()
  await go('cook/plan')
  assert(!(await page.textContent('[data-testid=day-Friday]')).includes('Nothing planned.'), 'meal plan')
  await common()
})

await check('read: themes and dates', async () => {
  await go('read')
  await page.waitForSelector('[data-testid=article-card]')
  assert((await page.textContent('[data-testid=result-count]')) === '763 articles', 'article count')
  await page.getByRole('button', { name: /^Halal basics/ }).click()
  assert((await page.textContent('[data-testid=result-count]')) === '26 articles', 'theme filter')
  assert((await page.locator('[data-testid=article-date]').first().innerText()).startsWith('Published'), 'date')
  await common()
})

await check('pwa: manifest, noindex, robots.txt', async () => {
  const m = await (await page.request.get(`${BASE}/manifest.webmanifest`)).json()
  assert(m.name === 'The Halal Way', `manifest name ${m.name}`)
  assert(m.icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable'), 'maskable icon')
  assert(m.icons.some((i) => i.sizes === '192x192'), '192 icon')
  await go('')
  assert((await page.getAttribute('meta[name=robots]', 'content'))?.includes('noindex'), 'noindex meta')
  const robots = await (await page.request.get(`${BASE}/robots.txt`)).text()
  assert(/User-agent: \*\s+Disallow: \//.test(robots), 'robots.txt')
})

await check('pwa: works offline after first load', async () => {
  await go('')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    // Wait until the precache holds the largest data file.
    for (let i = 0; i < 100; i++) {
      const keys = await caches.keys()
      for (const k of keys) {
        const c = await caches.open(k)
        const hit = (await c.keys()).some((r) => r.url.includes('/data/products.json'))
        if (hit) return
      }
      await new Promise((r) => setTimeout(r, 300))
    }
    throw new Error('precache not ready')
  })
  await ctx.setOffline(true)
  try {
    await page.reload()
    for (const [hash, sel] of [
      ['product', '[data-testid=result-count]'],
      ['ingredients', 'nav[aria-label="Ways to check"]'],
      ['learn', '[data-testid=lesson-title]'],
      ['cook', '[data-testid=recipe-row]'],
      ['read', '[data-testid=article-card]'],
    ]) {
      await page.goto(`${BASE}/#/${hash}`)
      await page.waitForSelector(sel, { timeout: 15000 })
    }
  } finally {
    await ctx.setOffline(false)
  }
  // Recipe photos must never be stored by the service worker.
  const stored = await page.evaluate(async () => {
    let n = 0
    for (const k of await caches.keys()) n += (await (await caches.open(k)).keys()).filter((r) => r.url.includes('ifanca.org')).length
    return n
  })
  assert(stored === 0, `${stored} ifanca.org files in the service worker cache`)
  return 'all five screens load offline, no photos cached'
})

await browser.close()

console.log(`Smoke test against ${BASE}`)
for (const [n, r, note] of results) console.log(`${r === 'pass' ? 'pass' : 'FAIL'}  ${n}${note ? `  (${note})` : ''}`)
const pageErrors = errors.filter((e) => !/Failed to load resource/.test(e))
if (pageErrors.length) console.log(`page errors:\n  ${pageErrors.join('\n  ')}`)
const failed = results.filter(([, r]) => r !== 'pass').length
console.log(`${results.length - failed} of ${results.length} passed`)
process.exit(failed || pageErrors.length ? 1 : 0)
