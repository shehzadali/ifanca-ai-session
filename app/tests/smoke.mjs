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
// The splash plays on every load. The smoke test starts past it.
await ctx.addInitScript(() => sessionStorage.setItem('thw.splash.skip', '1'))
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
  const main = await page.textContent('main')
  assert(!/snapshot/i.test(main), 'snapshot line on screen')
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

await check('home: logo, six tiles in order, footer', async () => {
  await go('')
  const labels = await page.locator('[data-testid=tile-label]').allInnerTexts()
  const want = ['Learn and Quiz', 'Check a Product', 'Check Ingredients', 'Recipes', 'Meal Plan', 'Read']
  assert(JSON.stringify(labels) === JSON.stringify(want), labels.join(', '))
  assert((await page.locator('header svg[aria-label="The Halal Way logo"]').count()) === 1, 'logo')
  await common()
})

await check('product-check: search, category, missing message', async () => {
  await go('product')
  await page.waitForSelector('[data-testid=result-count]', { timeout: 20000 })
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
  // Answer one question only. A finished round would post to the live leaderboard.
  await page.evaluate(() => localStorage.setItem('thw.profile', JSON.stringify({ name: 'Smoke test', avatar: 'star-emerald' })))
  await page.reload()
  await go('learn/quiz/Beginner')
  await page.locator('[data-testid=option]').first().click()
  assert((await page.locator('[data-testid=quote]').count()) === 1, 'quiz quote')
  await common()
})

await check('recipes and meal plan: list, recipe, add to a day', async () => {
  await go('recipes')
  await page.waitForSelector('[data-testid=recipe-row]')
  assert((await page.textContent('[data-testid=result-count]')) === '340 recipes', 'recipe count')
  await page.locator('[data-testid=recipe-row]').first().click()
  await page.waitForSelector('[data-testid=ingredients]')
  await page.locator('[data-testid=recipe-photo], [data-testid=photo-placeholder]').first().waitFor()
  await page.getByRole('button', { name: 'Add to meal plan' }).click()
  await page.getByRole('button', { name: 'Friday' }).click()
  await go('plan/Wednesday')
  await page.fill('input[type=search]', 'lentil')
  await page.locator('[data-testid=recipe-row]').first().click()
  await page.getByRole('button', { name: 'Add to Wednesday' }).click()
  await go('plan')
  assert(!(await page.textContent('[data-testid=day-Friday]')).includes('Nothing planned'), 'Friday')
  assert(!(await page.textContent('[data-testid=day-Wednesday]')).includes('Nothing planned'), 'Wednesday')
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

await check('room-leaderboard: /leaderboard path and QR code', async () => {
  await page.goto(`${BASE}/leaderboard`)
  await page.waitForSelector('[data-testid=qr-panel]')
  assert((await page.locator('h2').innerText()) === 'Room Leaderboard', 'title')
  assert(await page.locator('[data-testid=qr]').evaluate((i) => i.complete && i.naturalWidth > 0), 'QR image')
  const connected = (await page.locator('[data-testid=live-status]').count()) > 0
  await common()
  return connected ? 'connected to Supabase' : 'not connected yet'
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
      ['recipes', '[data-testid=recipe-row]'],
      ['plan', '[data-testid=day-Monday]'],
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
  await page.click('[data-testid=avatar-button]')
  await page.waitForSelector('[data-testid=about] dd')
  await page.keyboard.press('Escape')
  return 'every section and Settings load offline, no photos cached'
})

await browser.close()

console.log(`Smoke test against ${BASE}`)
for (const [n, r, note] of results) console.log(`${r === 'pass' ? 'pass' : 'FAIL'}  ${n}${note ? `  (${note})` : ''}`)
const pageErrors = errors.filter((e) => !/Failed to load resource/.test(e))
if (pageErrors.length) console.log(`page errors:\n  ${pageErrors.join('\n  ')}`)
const failed = results.filter(([, r]) => r !== 'pass').length
console.log(`${results.length - failed} of ${results.length} passed`)
process.exit(failed || pageErrors.length ? 1 : 0)
