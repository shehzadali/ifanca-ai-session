// Article reader tests. AC 7, 9, and 10 use a context with the service worker on, because offline reading
// depends on it. The other criteria use the harness context (service worker blocked).
import fs from 'node:fs'
import { assert, BASE, go, noSideScroll, run, tapTargets } from '../test-lib.mjs'

const dir = new URL('../../app/public/data/articles/', import.meta.url)
const body = (slug) => JSON.parse(fs.readFileSync(new URL(`${slug}.json`, dir), 'utf8'))
const LISTS = 'a-breath-of-fresh-air'
const TABLE = '25th-year-anniversary-ifanca-in-historic-perspective'
const IMAGES = 'a-neat-way-to-stay-fit'
const NO_BODY = 'immune-boosting-roller'
const words = (s) => s.replace(/\s+/g, '')
const fileWords = (b) =>
  words(
    b.blocks
      .map((x) => (x.text ? x.text : x.items ? x.items.join('') : x.rows ? x.rows.flat().join('') : ''))
      .join(''),
  )
const screenWords = (page) =>
  page.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('[data-testid=article-body] [data-block]')) {
      if (el.dataset.block === 'table') el.querySelectorAll('td').forEach((td) => out.push(td.textContent))
      else if (el.dataset.block === 'ul' || el.dataset.block === 'ol') el.querySelectorAll('li').forEach((li) => out.push(li.textContent))
      else out.push(el.textContent)
    }
    return out.join('').replace(/\s+/g, '')
  })
async function open(page, slug) {
  await go(page, `read/${slug}`)
  await page.waitForSelector('[data-testid=article-body] [data-block], [data-testid=article-missing], [data-testid=article-offline]')
}
async function swContext(page) {
  const ctx = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  await ctx.addInitScript(() => sessionStorage.setItem('thw.splash.skip', '1'))
  const p = await ctx.newPage()
  await p.goto(`${BASE}/`)
  await p.evaluate(async () => {
    await navigator.serviceWorker.ready
    for (let i = 0; i < 100 && !navigator.serviceWorker.controller; i++) await new Promise((r) => setTimeout(r, 200))
  })
  return [ctx, p]
}

let ctxS, pS

await run('article-reader', [
  [1, 'Tapping a card title opens the article in the app', async ({ page }) => {
    await go(page, 'read')
    const link = page.locator('[data-testid=article-link]').first()
    const title = (await link.innerText()).trim()
    await link.click()
    await page.waitForSelector('[data-testid=article-body]')
    assert(/#\/read\/[^/]+$/.test(page.url()), page.url())
    assert((await page.locator('main h2').innerText()).trim() === title, 'title')
    return title
  }],
  [2, 'Date, type, attribution, and source link at top and bottom', async ({ page }) => {
    await open(page, LISTS)
    const b = body(LISTS)
    for (const where of ['top', 'bottom']) {
      const box = page.locator(`[data-testid=attribution-${where}]`)
      const t = await box.innerText()
      assert(t.includes('Published') && t.includes(b.type) && t.includes("From IFANCA's resource library. Text as published."), `${where}: ${t}`)
      assert((await box.locator('a').getAttribute('href')) === b.url, `${where} link`)
    }
  }],
  [3, 'Text on screen equals the exported body, word for word', async ({ page }) => {
    const out = []
    for (const slug of [LISTS, TABLE, IMAGES]) {
      await open(page, slug)
      const a = await screenWords(page)
      const b = fileWords(body(slug))
      assert(a === b, `${slug}: ${a.length} vs ${b.length} characters`)
      out.push(`${slug} ${b.length} chars`)
    }
    return `${out.join(', ')}. The export checked all 761 bodies against their pages.`
  }],
  [4, 'Headings and lists render as headings and lists', async ({ page }) => {
    await open(page, LISTS)
    assert((await page.locator('[data-block=h2]').count()) > 0, 'no headings')
    assert((await page.locator('[data-testid=article-body] ul[data-block=ul]').count()) > 0, 'no list')
    await page.locator('[data-block=ul]').first().scrollIntoViewIfNeeded()
  }],
  [5, 'Tables render and the page does not scroll sideways', async ({ page }) => {
    await open(page, TABLE)
    assert((await page.locator('[data-block=table] table').count()) > 0, 'no table')
    await noSideScroll(page)
    await page.locator('[data-block=table]').first().scrollIntoViewIfNeeded()
  }],
  [6, 'Images load from ifanca.org with a shimmer first', async ({ page }) => {
    await page.route('**/wp-content/**', async (r) => {
      await new Promise((x) => setTimeout(x, 1500))
      await r.continue()
    })
    await page.route('**/app/uploads/**', async (r) => {
      await new Promise((x) => setTimeout(x, 1500))
      await r.continue()
    })
    await open(page, IMAGES)
    const img = page.locator('[data-testid=article-img]').first()
    await img.scrollIntoViewIfNeeded()
    assert((await page.locator('[data-testid=shimmer]').count()) > 0, 'no shimmer while loading')
    assert((await img.getAttribute('src')).startsWith('https://ifanca.org/'), 'not from ifanca.org')
    await page.waitForFunction(() => document.querySelector('[data-testid=article-img]')?.naturalWidth > 0, null, { timeout: 15000 })
    await page.unroute('**/wp-content/**')
    await page.unroute('**/app/uploads/**')
    return await img.getAttribute('src')
  }],
  [7, 'Offline: text without images', async ({ page }) => {
    ;[ctxS, pS] = await swContext(page)
    await pS.goto(`${BASE}/#/read/${IMAGES}`)
    await pS.waitForSelector('[data-block=p]')
    await ctxS.setOffline(true)
    await pS.reload()
    await pS.waitForSelector('[data-block=p]', { timeout: 15000 })
    assert((await pS.locator('[data-testid=article-img]').count()) === 0, 'images shown offline')
    assert((await screenWords(pS)).length > 100, 'no text')
    await pS.screenshot({ path: new URL('./screenshots/ac-7-offline.png', import.meta.url).pathname })
  }],
  [8, 'A failed image is left out', async ({ newPage, setPage }) => {
    const page = await newPage()
    setPage(page)
    await page.route(/\.(jpe?g|png|webp|gif)(\?.*)?$/i, (r) => r.abort())
    await open(page, IMAGES)
    // Images load lazily, so scroll through the article to request every one.
    for (let y = 0; y < 30; y++) {
      await page.mouse.wheel(0, 900)
      await page.waitForTimeout(100)
    }
    await page.waitForTimeout(1500)
    assert((await page.locator('[data-testid=article-img]').count()) === 0, 'failed image still shown')
    assert((await page.locator('[data-block=p]').count()) > 0, 'text missing')
  }],
  [9, 'Opened once online, it opens again offline', async () => {
    // AC 7 opened IMAGES online and is still offline.
    await pS.goto(`${BASE}/#/read`)
    await pS.waitForSelector('[data-testid=article-card]', { timeout: 15000 })
    await pS.evaluate((s) => (location.hash = `#/read/${s}`), IMAGES)
    await pS.waitForSelector('[data-block=p]', { timeout: 15000 })
  }],
  [10, 'Never opened and offline: not saved message', async () => {
    try {
      await pS.evaluate((s) => (location.hash = `#/read/${s}`), LISTS)
      await pS.waitForSelector('[data-testid=article-offline]', { timeout: 15000 })
      assert((await pS.locator('[data-testid=attribution-top] a').getAttribute('href')).includes('ifanca.org'), 'no source link')
      await pS.screenshot({ path: new URL('./screenshots/ac-10-not-saved.png', import.meta.url).pathname })
    } finally {
      await ctxS.close()
    }
  }],
  [11, 'Share button on the article', async ({ page }) => {
    await open(page, LISTS)
    assert((await page.getByRole('button', { name: 'Share' }).count()) === 1, 'no Share')
  }],
  [12, '390px layout and tap targets', async ({ page }) => {
    for (const slug of [TABLE, IMAGES, NO_BODY]) {
      await open(page, slug)
      await noSideScroll(page)
      await tapTargets(page)
    }
    assert((await page.locator('[data-testid=article-missing]').count()) === 1, 'missing-body article')
    return 'table, images, and the article without a body'
  }],
])
