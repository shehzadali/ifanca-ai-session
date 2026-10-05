// feedback-3 tests: splash on every load and on a logo tap, Home in the bottom navigation.
// Splash criteria use fresh browser contexts without the harness's splash skip.
import fs from 'node:fs'
import path from 'node:path'
import { assert, BASE, go, noSideScroll, run, tapTargets } from '../test-lib.mjs'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..')
const shots = path.join(root, 'specs/feedback-3/screenshots')
const SPLASH_GONE = 3000

async function fresh(page, options = {}) {
  const ctx = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', ...options })
  return [ctx, await ctx.newPage()]
}
const gone = (p, timeout = SPLASH_GONE) => p.waitForSelector('#splash', { state: 'detached', timeout })
const nav = (p) => p.locator('nav[aria-label=Sections] a')

let ctxA, pA

await run('feedback-3', [
  [1, 'Splash on load and again on reload', async ({ page }) => {
    ;[ctxA, pA] = await fresh(page)
    await pA.goto(`${BASE}/`)
    assert((await pA.locator('#splash').count()) === 1, 'no splash on load')
    await gone(pA)
    await pA.reload()
    assert((await pA.locator('#splash').count()) === 1, 'no splash on reload')
    await gone(pA)
  }],
  [2, 'Logo tap from a section plays the splash, then shows home', async () => {
    await pA.evaluate(() => (location.hash = '#/read'))
    await pA.waitForSelector('[data-testid=article-card]')
    await pA.click('[data-testid=logo-link]')
    await pA.waitForSelector('#splash')
    await pA.waitForTimeout(1300)
    await pA.screenshot({ path: path.join(shots, 'ac-2-logo-splash.png') })
    await gone(pA)
    assert(pA.url().endsWith('#/'), pA.url())
    assert((await pA.locator('[data-testid=tile]').count()) === 6, 'home not shown') // six tiles: Meal Plan and Shopping List have their own
  }],
  [3, 'Logo tap on home plays the splash again', async () => {
    await pA.click('[data-testid=logo-link]')
    await pA.waitForSelector('#splash')
    await gone(pA)
  }],
  [4, 'Home in the navigation: home, no splash', async () => {
    await pA.evaluate(() => (location.hash = '#/recipes'))
    await pA.waitForSelector('[data-testid=recipe-row]')
    let seen = false
    await pA.exposeFunction('splashSeen', () => (seen = true))
    await pA.evaluate(() => {
      new MutationObserver(() => document.getElementById('splash') && window.splashSeen()).observe(document.body, { childList: true })
    })
    await nav(pA).first().click()
    await pA.waitForSelector('[data-testid=tile]')
    await pA.waitForTimeout(1000)
    assert(!seen && (await pA.locator('#splash').count()) === 0, 'splash played')
    assert(pA.url().endsWith('#/'), pA.url())
    await pA.screenshot({ path: path.join(shots, 'ac-4-home-nav.png') })
    await ctxA.close()
  }],
  [5, 'Navigation on home: five items since the five-tab change, Home marked', async ({ page }) => {
    await go(page, '')
    const labels = (await nav(page).allInnerTexts()).map((t) => t.trim())
    assert(JSON.stringify(labels) === JSON.stringify(['Home', 'Learn', 'Check', 'Recipes', 'Meal Plan', 'Read']), labels.join(', '))
    assert((await page.getAttribute('nav[aria-label=Sections] a[aria-current=page]', 'href')) === '#/', 'Home not marked')
  }],
  [6, 'In a section: Home first, section marked', async ({ page }) => {
    await go(page, 'recipes')
    assert((await nav(page).first().innerText()).trim() === 'Home', 'Home not first')
    assert((await nav(page).first().getAttribute('href')) === '#/', 'Home link')
    assert((await page.getAttribute('nav[aria-label=Sections] a[aria-current=page]', 'href')) === '#/recipes', 'Recipes not marked')
  }],
  [7, 'Tap closes a logo splash at once', async ({ page }) => {
    const [ctx, p] = await fresh(page)
    try {
      await p.goto(`${BASE}/#/read`)
      await gone(p)
      await p.click('[data-testid=logo-link]')
      await p.waitForSelector('#splash')
      await p.waitForTimeout(300)
      const t0 = Date.now()
      await p.locator('#splash').click()
      await gone(p, 700)
      return `closed ${Date.now() - t0} ms after the tap`
    } finally {
      await ctx.close()
    }
  }],
  [8, 'Reduced motion on load and on a logo tap', async ({ page }) => {
    const [ctx, p] = await fresh(page, { reducedMotion: 'reduce' })
    const animated = () =>
      p.evaluate(() => {
        const s = document.getElementById('splash')
        return s ? [...s.querySelectorAll('*')].filter((e) => getComputedStyle(e).animationName !== 'none').length : -1
      })
    try {
      let t0 = Date.now()
      await p.goto(`${BASE}/`)
      assert((await animated()) === 0, 'animated on load')
      await gone(p, 1500)
      const load = Date.now() - t0
      await p.click('[data-testid=logo-link]')
      t0 = Date.now()
      assert((await animated()) === 0, 'animated on logo tap')
      await gone(p, 1500)
      return `load ${(load / 1000).toFixed(1)} s, logo tap ${((Date.now() - t0) / 1000).toFixed(1)} s`
    } finally {
      await ctx.close()
    }
  }],
  [9, 'No splash on the projector', async ({ page }) => {
    const [ctx, p] = await fresh(page)
    try {
      await p.goto(`${BASE}/leaderboard`)
      assert((await p.locator('#splash').count()) === 0, 'splash on /leaderboard')
    } finally {
      await ctx.close()
    }
  }],
  [10, '390px: no side scroll, nav items 44px, labels fit', async ({ page }) => {
    for (const h of ['', 'ingredients', 'plan', 'recipes/beef-pasanday/for/Monday']) {
      await go(page, h)
      await noSideScroll(page)
      await tapTargets(page)
      const bad = await page.$$eval('nav[aria-label=Sections] a', (els) =>
        els
          .map((a) => {
            const label = a.querySelector('[data-testid=nav-label]')
            return [label.textContent, Math.round(a.getBoundingClientRect().height), label.scrollWidth - label.clientWidth]
          })
          .filter(([, h, over]) => h < 44 || over > 0),
      )
      assert(bad.length === 0, `#/${h}: ${JSON.stringify(bad)}`)
      // The items fill the bar. (A grid with more columns than items once left them packed to the left.)
      const right = await page.$eval('nav[aria-label=Sections] li:last-child', (li) => Math.round(li.getBoundingClientRect().right))
      assert(right >= 385, `#/${h}: navigation ends at ${right}px of 390`)
    }
  }],
  [11, 'Earlier tests pass after the change', async () => {
    const rows = []
    for (const f of ['product-check', 'ingredient-check', 'learn-halal', 'cook', 'read', 'room-leaderboard', 'app-redesign', 'feedback-2']) {
      const r = JSON.parse(fs.readFileSync(path.join(root, 'specs', f, 'test-results.json'), 'utf8'))
      const failed = r.results.filter((x) => x.result !== 'Pass').length
      rows.push(`${f} ${r.results.length - failed}/${r.results.length}`)
      assert(failed === 0, `${f} has ${failed} failures`)
    }
    return rows.join(', ')
  }],
])
