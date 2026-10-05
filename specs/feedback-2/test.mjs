// feedback-2 tests: splash, title case, and the Meal Plan day view.
// Splash criteria use their own browser contexts without the harness's splash skip.
import fs from 'node:fs'
import path from 'node:path'
import { assert, BASE, go, noSideScroll, run, tapTargets } from '../test-lib.mjs'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..')
const shots = path.join(root, 'specs/feedback-2/screenshots')

async function fresh(page, options = {}) {
  const ctx = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', ...options })
  return [ctx, await ctx.newPage()]
}

await run('feedback-2', [
  [1, 'Splash shows logo and texts, and is gone within 3 seconds', async ({ page }) => {
    const [ctx, p] = await fresh(page)
    try {
      const t0 = Date.now()
      await p.goto(`${BASE}/`)
      await p.waitForSelector('#splash:not([hidden])')
      await p.waitForTimeout(1400)
      const text = await p.textContent('#splash')
      assert(text.includes('The Halal Way') && text.includes('Halal products, ingredients, recipes, and lessons'), 'texts')
      assert((await p.locator('#splash .sp-sq').count()) === 2 && (await p.locator('#splash .sp-leaf').count()) === 1, 'logo parts')
      await p.screenshot({ path: path.join(shots, 'ac-1-splash.png') })
      await p.waitForSelector('#splash', { state: 'detached', timeout: 3000 })
      return `gone after ${((Date.now() - t0) / 1000).toFixed(1)} s from navigation`
    } finally {
      await ctx.close()
    }
  }],
  [2, 'A tap closes the splash', async ({ page }) => {
    const [ctx, p] = await fresh(page)
    try {
      await p.goto(`${BASE}/`)
      await p.waitForSelector('#splash:not([hidden])')
      await p.waitForTimeout(300)
      const t0 = Date.now()
      await p.locator('#splash').click()
      await p.waitForSelector('#splash', { state: 'detached', timeout: 700 })
      return `closed ${Date.now() - t0} ms after the tap`
    } finally {
      await ctx.close()
    }
  }],
  [3, 'No splash on screen changes or the projector (since feedback-3 it plays on every load)', async ({ page }) => {
    const [ctx, p] = await fresh(page)
    try {
      await p.goto(`${BASE}/`)
      await p.waitForSelector('#splash', { state: 'detached', timeout: 4000 })
      await p.evaluate(() => (location.hash = '#/read'))
      await p.waitForSelector('[data-testid=article-card]')
      assert((await p.locator('#splash').count()) === 0, 'shown on navigation')
      await p.goto(`${BASE}/leaderboard`)
      assert((await p.locator('#splash').count()) === 0, 'shown on projector')
    } finally {
      await ctx.close()
    }
  }],
  [4, 'Reduced motion: no movement, gone within 1.5 seconds', async ({ page }) => {
    const [ctx, p] = await fresh(page, { reducedMotion: 'reduce' })
    try {
      const t0 = Date.now()
      await p.goto(`${BASE}/`)
      const moving = await p.evaluate(() => {
        const s = document.getElementById('splash')
        return s ? [...s.querySelectorAll('*')].filter((e) => getComputedStyle(e).animationName !== 'none').length : 0
      })
      assert(moving === 0, `${moving} animated parts`)
      await p.waitForSelector('#splash', { state: 'detached', timeout: 1500 })
      return `no animated parts, gone after ${((Date.now() - t0) / 1000).toFixed(1)} s`
    } finally {
      await ctx.close()
    }
  }],
  [5, 'No header box on home, Learn and Quiz first', async ({ page }) => {
    await go(page, '')
    assert((await page.locator('main h1').count()) === 0, 'header box still on home')
    const first = await page.locator('[data-testid=tile-label]').first().innerText()
    assert(first === 'Learn and Quiz', first)
  }],
  [6, 'Title case headings', async ({ page }) => {
    const tiles = await page.locator('[data-testid=tile-label]').allInnerTexts()
    assert(JSON.stringify(tiles) === JSON.stringify(['Learn and Quiz', 'Check', 'Recipes', 'Read']), tiles.join(', '))
    await go(page, 'product')
    const nav = await page.locator('nav[aria-label=Sections] a').allInnerTexts()
    // Since feedback-3 Home is first.
    assert(JSON.stringify(nav.map((t) => t.trim())) === JSON.stringify(['Home', 'Learn', 'Check', 'Recipes', 'Read']), nav.join(', '))
    const want = {
      product: 'Check',
      ingredients: 'Check',
      learn: 'Learn and Quiz',
      recipes: 'Recipes',
      plan: 'Recipes',
      read: 'Read',
      profile: 'Sign Up to Play',
      'learn/quiz': 'Sign Up to Play',
    }
    for (const [h, title] of Object.entries(want)) {
      await go(page, h)
      const ok = await page
        .waitForSelector(`main h2:text-is("${title}")`, { timeout: 5000 })
        .then(() => true)
        .catch(() => false)
      assert(ok, `#/${h}: ${await page.locator('main h2').first().innerText()}`)
    }
    await go(page, 'learn')
    const sections = await page.locator('main h3').allInnerTexts()
    assert(sections.map((s) => s.trim().toLowerCase()).includes('halal basics'), 'section list')
    const css = await page.locator('main h3').first().evaluate((e) => getComputedStyle(e).textTransform)
    await page.goto(`${BASE}/leaderboard`)
    const board = await page.locator('h2').innerText()
    assert(board === 'Room Leaderboard', board)
    return `8 screen titles, nav, tiles, and the leaderboard match. Learn section headings use CSS ${css}.`
  }],
  [7, 'Day view shows the Recipes list', async ({ page }) => {
    await go(page, 'plan/Wednesday')
    await page.waitForSelector('[data-testid=day-view]')
    assert((await page.locator('main h3', { hasText: 'Add a Recipe' }).count()) === 1, 'heading')
    assert((await page.getByPlaceholder('Search recipes or ingredients').count()) === 1, 'search')
    for (const chip of ['Chicken', 'Beef', 'Lamb or goat', 'Fish and seafood', '8 or fewer ingredients']) {
      assert((await page.getByRole('button', { name: chip }).count()) === 1, chip)
    }
    assert((await page.textContent('[data-testid=result-count]')) === '340 recipes', 'count')
    assert((await page.locator('[data-testid=recipe-row]').count()) === 30, 'rows')
  }],
  [8, 'Search lentil, tap a row, the recipe page opens', async ({ page }) => {
    await page.fill('input[type=search]', 'lentil')
    await page.waitForTimeout(200)
    await page.locator('[data-testid=recipe-row]').first().click()
    await page.waitForSelector('[data-testid=ingredients]')
    assert((await page.locator('[data-testid=steps] [data-line]').count()) > 0, 'no steps')
    assert(/#\/recipes\/[^/]+\/for\/Wednesday$/.test(page.url()), page.url())
    return await page.locator('main h2').innerText()
  }],
  [9, 'Back to Wednesday and Add to Wednesday', async ({ page }) => {
    assert((await page.locator('main a', { hasText: 'Back to Wednesday' }).count()) >= 1, 'back link')
    const first = page.locator('[data-testid=add-to-plan] button').first()
    assert((await first.innerText()) === 'Add to Wednesday', await first.innerText())
    // Meal Plan lives inside Recipes since the five-tab navigation.
    assert((await page.getAttribute('nav[aria-label=Sections] a[aria-current=page]', 'href')) === '#/recipes', 'nav not on Recipes')
  }],
  [10, 'Add, then back: listed under Wednesday', async ({ page }) => {
    const title = await page.locator('main h2').innerText()
    await page.getByRole('button', { name: 'Add to Wednesday' }).click()
    assert((await page.textContent('[data-testid=add-to-plan]')).includes('Added to Wednesday.'), 'status')
    assert(await page.getByRole('button', { name: 'Added to Wednesday' }).isDisabled(), 'button not disabled')
    await page.locator('main a', { hasText: 'Back to Wednesday' }).first().click()
    await page.waitForSelector('[data-testid=planned]')
    assert((await page.textContent('[data-testid=planned]')).includes(title), 'not listed')
    return title
  }],
  [11, 'A planned recipe opens its page', async ({ page }) => {
    await page.locator('[data-testid=planned] a').first().click()
    await page.waitForSelector('[data-testid=ingredients]')
  }],
  [12, 'From Recipes, the day picker is unchanged', async ({ page }) => {
    await go(page, 'recipes')
    await page.locator('[data-testid=recipe-row]').first().click()
    await page.getByRole('button', { name: 'Add to meal plan' }).click()
    assert((await page.locator('[data-testid=day-picker] button').count()) === 7, 'picker')
    assert((await page.locator('main a', { hasText: 'All recipes' }).count()) === 1, 'back link')
  }],
  [13, '390px layout and tap targets', async ({ page }) => {
    for (const h of ['', 'plan/Wednesday']) {
      await go(page, h)
      await noSideScroll(page)
      await tapTargets(page)
    }
    await page.locator('[data-testid=recipe-row]').first().click()
    await page.getByRole('button', { name: 'Choose another day' }).click()
    await noSideScroll(page)
    await tapTargets(page)
  }],
  [14, 'Earlier tests pass with the new headings and routes', async () => {
    const rows = []
    for (const f of ['product-check', 'ingredient-check', 'learn-halal', 'cook', 'read', 'room-leaderboard', 'app-redesign']) {
      const r = JSON.parse(fs.readFileSync(path.join(root, 'specs', f, 'test-results.json'), 'utf8'))
      const failed = r.results.filter((x) => x.result !== 'Pass').length
      rows.push(`${f} ${r.results.length - failed}/${r.results.length}`)
      assert(failed === 0, `${f} has ${failed} failures`)
    }
    return rows.join(', ')
  }],
])
