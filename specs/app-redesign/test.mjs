// Redesign tests. Most criteria run against the preview on :4173 (a build without Supabase settings).
// AC 9 and AC 10 use a build pointed at a stand-in Supabase URL on :4176, answered by Playwright.
// AC 15 reads the latest results of the earlier feature tests, which are run separately.
import { execSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { assert, BASE, go, noSideScroll, run, setProfile, tapTargets } from '../test-lib.mjs'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..')
const app = path.join(root, 'app')
const MOCK = 'https://mock.supabase.test'
const MOCKED = 'http://localhost:4176'
const quiz = JSON.parse(fs.readFileSync(path.join(app, 'public/data/quiz.json'), 'utf8'))

execSync('npx vite build --outDir dist-mock', {
  cwd: app,
  stdio: 'ignore',
  env: { ...process.env, VITE_SUPABASE_URL: MOCK, VITE_SUPABASE_ANON_KEY: 'test-anon-key' },
})
const server = spawn('npx', ['vite', 'preview', '--outDir', 'dist-mock', '--port', '4176', '--strictPort'], { cwd: app, stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 2500))

// Stand-in backend. "legacy" acts like the live project before 002_profiles.sql runs.
const store = { rows: [], calls: [], down: false, legacy: false }
async function stub(ctx) {
  await ctx.route(`${MOCK}/**`, async (route) => {
    if (store.down) return route.abort('internetdisconnected')
    const req = route.request()
    const url = new URL(req.url())
    if (url.pathname === '/rest/v1/leaderboard') {
      if (store.legacy && url.searchParams.get('select')?.includes('avatar')) {
        return route.fulfill({ status: 400, json: { code: '42703', message: 'column leaderboard.avatar does not exist' } })
      }
      return route.fulfill({ json: store.rows })
    }
    if (url.pathname === '/rest/v1/rpc/post_score') {
      const b = req.postDataJSON()
      store.calls.push(b)
      if (store.legacy && 'p_avatar' in b) return route.fulfill({ status: 404, json: { code: 'PGRST202', message: 'not found' } })
      store.rows = [{ id: 'e1', name: b.p_name, score: b.p_score, level: b.p_level, avatar: b.p_avatar ?? null, updated_at: new Date().toISOString() }]
      return route.fulfill({ status: 204, body: '' })
    }
    return route.abort()
  })
}

async function playBeginner(page, base) {
  await page.goto(`${base}/#/learn/quiz/Beginner`)
  await page.waitForSelector('[data-testid=option]')
  for (const q of quiz.items.filter((x) => x.level === 'Beginner')) {
    await page.locator('[data-testid=option]').nth(q.answer).click()
    await page.getByRole('button', { name: /Next question|See my score/ }).click()
  }
  await page.waitForSelector('[data-testid=score]')
}

// WCAG contrast of an element's text against the page or card background.
function contrastCheck() {
  const rgb = (c) => c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number)
  const lum = (c) => {
    const [r, g, b] = rgb(c).map((v) => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
    return (x + 0.05) / (y + 0.05)
  }
  const css = getComputedStyle(document.documentElement)
  const probe = (prop) => {
    const d = document.createElement('div')
    d.style.color = `var(${prop})`
    document.body.appendChild(d)
    const c = getComputedStyle(d).color
    d.remove()
    return c
  }
  const [ink, muted, paper, card, brand] = ['--ink', '--muted', '--paper', '--card', '--brand'].map(probe)
  void css
  return {
    'ink on paper': ratio(ink, paper),
    'muted on paper': ratio(muted, paper),
    'muted on card': ratio(muted, card),
    'brand on card': ratio(brand, card),
  }
}

try {
  await run('app-redesign', [
    [1, 'Logo in the header, tiles have one line each', async ({ page }) => {
      await go(page, '')
      assert((await page.locator('main svg[aria-label="The Halal Way logo"]').count()) === 1, 'no logo on home')
      const tiles = await page.locator('[data-testid=tile]').all()
      for (const t of tiles) {
        const lines = (await t.innerText()).split('\n').filter((l) => l.trim())
        // The Learn tile also holds the level bar. Its label is the first line.
        assert(lines[0] && !/IFANCA/.test(lines.slice(0, 2).join(' ')), `tile has a tagline: ${lines.join(' / ')}`)
      }
      const plain = await page.locator('[data-testid=tile]:not(:has([data-testid=level-bar]))').allInnerTexts()
      assert(plain.every((t) => t.trim().split('\n').length === 1), plain.join(' | '))
      return `${tiles.length} tiles`
    }],
    [2, 'Learn and quiz first, then the given order', async ({ page }) => {
      const labels = await page.locator('[data-testid=tile-label]').allInnerTexts()
      const want = ['Learn and quiz', 'Check a product', 'Check ingredients', 'Recipes', 'Meal plan', 'Read']
      assert(JSON.stringify(labels) === JSON.stringify(want), labels.join(', '))
    }],
    [3, 'Level bar shows Beginner and at least one third', async ({ page }) => {
      await page.evaluate(() => localStorage.setItem('thw.quiz', JSON.stringify({ best: { Beginner: 5 }, level: 'Beginner' })))
      await page.reload()
      assert((await page.textContent('[data-testid=home-level]')) === 'Beginner', 'level text')
      const pct = await page.locator('[data-testid=level-fill]').evaluate((e) => parseFloat(e.style.width))
      assert(pct >= 33, `fill ${pct}%`)
      return `fill ${pct}%`
    }],
    [4, 'No snapshot outside About, dates inside About', async ({ page }) => {
      for (const h of ['', 'product', 'ingredients', 'learn', 'learn/what-is-halal', 'recipes', 'plan', 'read']) {
        await go(page, h)
        const main = await page.textContent('main')
        assert(!/snapshot/i.test(main) && !/October [34], 2026|2026-10-0/.test(main), `date or snapshot on #/${h}`)
        assert(
          (await page.textContent('footer')).trim() === "Demo built from IFANCA's public content. Not an official IFANCA app.",
          `footer on #/${h}`,
        )
      }
      await page.click('[data-testid=avatar-button]')
      await page.waitForSelector('[data-testid=about] dd')
      const about = await page.textContent('[data-testid=about]')
      assert(about.includes('October 3, 2026') && about.includes('October 4, 2026'), 'dates missing in About')
      await page.screenshot({ path: new URL('./screenshots/ac-4-about.png', import.meta.url).pathname })
      await page.keyboard.press('Escape')
      return '8 screens checked'
    }],
    [5, 'Bottom navigation inside sections', async ({ page }) => {
      await go(page, 'product')
      const nav = page.locator('nav[aria-label=Sections] a')
      assert((await nav.count()) === 6, `${await nav.count()} items`)
      assert((await page.getAttribute('nav[aria-label=Sections] a[aria-current=page]', 'href')) === '#/product', 'current')
      await page.locator('nav[aria-label=Sections] a[href="#/read"]').click()
      await page.waitForSelector('[data-testid=article-card]')
      assert(page.url().endsWith('#/read'), page.url())
      await go(page, '')
      assert((await page.locator('nav[aria-label=Sections]').count()) === 0, 'nav shown on home')
    }],
    [6, 'Avatar button opens Settings', async ({ page }) => {
      await go(page, 'recipes')
      await page.click('[data-testid=avatar-button]')
      const t = await page.textContent('[data-testid=settings]')
      assert(['Profile', 'Appearance', 'About'].every((x) => t.includes(x)), 'sections missing')
    }],
    [7, 'Dark theme is applied and kept after reload', async ({ page }) => {
      await page.getByRole('radio', { name: 'dark' }).click()
      await page.keyboard.press('Escape')
      const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor)
      assert((await page.getAttribute('html', 'data-theme')) === 'dark', 'not dark')
      const dark = await bg()
      await page.reload()
      assert((await page.getAttribute('html', 'data-theme')) === 'dark' && (await bg()) === dark, 'not kept')
      return `body ${dark}`
    }],
    [8, 'Sign up before the quiz', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.removeItem('thw.profile')
        localStorage.setItem('thw.theme', '"light"')
      })
      await go(page, 'learn/quiz')
      await page.reload()
      await page.waitForSelector('[data-testid=signup]')
      await page.fill('[data-testid=profile-name]', 'Yusuf')
      await page.locator('[data-testid=avatar-option]').nth(6).click()
      await page.getByRole('button', { name: 'Start playing' }).click()
      await page.waitForSelector('[data-testid=round-Beginner]')
      assert((await page.locator('[data-testid=avatar-button] [data-avatar="sun-amber"]').count()) === 1, 'no avatar in top bar')
      await go(page, 'learn')
      assert((await page.locator('[data-testid=signup]').count()) === 0, 'lessons gated')
      await go(page, 'learn/quiz')
    }],
    [9, 'Score posts with avatar, leaderboard shows it, and the fallback works before 002', async ({ newPage, setPage }) => {
      const page = await newPage()
      setPage(page)
      await stub(page.context())
      await page.goto(MOCKED)
      await setProfile(page, 'Yusuf', 'sun-amber')
      await playBeginner(page, MOCKED)
      await page.waitForSelector('text=Posted to the room leaderboard.')
      assert(store.calls.at(-1).p_avatar === 'sun-amber', JSON.stringify(store.calls))
      await page.goto(`${MOCKED}/leaderboard`)
      await page.waitForSelector('[data-testid=board-row] [data-avatar="sun-amber"]')
      // Before 002: the app retries without the avatar and reads without the column.
      store.legacy = true
      store.calls = []
      await playBeginner(page, MOCKED)
      await page.waitForSelector('text=Posted to the room leaderboard.')
      assert(store.calls.length === 2 && 'p_avatar' in store.calls[0] && !('p_avatar' in store.calls[1]), JSON.stringify(store.calls))
      await page.goto(`${MOCKED}/leaderboard`)
      await page.waitForSelector('[data-testid=board-row] [data-avatar=initials]')
      store.legacy = false
      return 'avatar sent and shown. Before 002: posted without avatar, initials shown'
    }],
    [10, 'Network down: saved on device, posts later', async ({ page }) => {
      store.down = true
      await playBeginner(page, MOCKED)
      await page.waitForSelector('text=Saved on this device. It will post when you are back online.')
      const pending = await page.evaluate(() => JSON.parse(localStorage.getItem('thw.board')).pending)
      assert(pending && pending.avatar === 'sun-amber', JSON.stringify(pending))
      store.down = false
      await page.context().setOffline(true)
      await page.context().setOffline(false)
      await page.waitForSelector('text=Posted to the room leaderboard.', { timeout: 10000 })
    }],
    [11, 'Recipes everywhere, no Cook label', async ({ newPage, setPage }) => {
      const page = await newPage()
      setPage(page)
      for (const h of ['', 'recipes', 'plan']) {
        await go(page, h)
        const text = await page.evaluate(() => document.body.innerText)
        assert(!/\bCook\b/.test(text), `Cook on #/${h}`)
      }
      assert((await page.locator('nav[aria-label=Sections] a[href="#/recipes"]').innerText()).trim() === 'Recipes', 'nav label')
    }],
    [12, 'Meal plan: Wednesday, search lentil, Add, kept after reload', async ({ page }) => {
      await go(page, 'plan')
      await page.click('[data-testid=day-Wednesday]')
      await page.waitForSelector('[data-testid=day-view]')
      await page.fill('input[type=search]', 'lentil')
      const first = page.locator('[data-testid=add-results] li').first()
      const title = (await first.locator('span span').first().innerText()).trim()
      await first.getByRole('button').click()
      assert((await page.textContent('[data-testid=planned]')).includes(title), 'not in day')
      await page.reload()
      await page.waitForSelector('[data-testid=planned]')
      assert((await page.textContent('[data-testid=planned]')).includes(title), 'lost after reload')
      return title
    }],
    [13, 'Offline after one visit: home, sections, Settings, profile, fonts', async ({ page }) => {
      const ctx = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
      const p = await ctx.newPage()
      try {
        await p.goto(`${BASE}/`)
        await p.evaluate(async () => {
          await navigator.serviceWorker.ready
          for (let i = 0; i < 100; i++) {
            for (const k of await caches.keys()) {
              if ((await (await caches.open(k)).keys()).some((r) => r.url.includes('/data/products.json'))) return
            }
            await new Promise((r) => setTimeout(r, 300))
          }
          throw new Error('precache not ready')
        })
        await p.evaluate(() => localStorage.setItem('thw.profile', JSON.stringify({ name: 'Offline', avatar: 'leaf-teal' })))
        await ctx.setOffline(true)
        await p.reload()
        await p.waitForSelector('[data-testid=tile]')
        for (const [h, sel] of [
          ['learn', '[data-testid=lesson-title]'],
          ['learn/quiz', '[data-testid=round-Beginner]'],
          ['product', '[data-testid=result-count]'],
          ['ingredients', 'nav[aria-label="Ways to check"]'],
          ['recipes', '[data-testid=recipe-row]'],
          ['plan', '[data-testid=day-Monday]'],
          ['read', '[data-testid=article-card]'],
        ]) {
          await p.goto(`${BASE}/#/${h}`)
          await p.waitForSelector(sel, { timeout: 15000 })
        }
        await p.click('[data-testid=avatar-button]')
        await p.waitForSelector('[data-testid=profile-block]')
        await p.waitForSelector('[data-testid=about] dd')
        const font = await p.evaluate(async () => {
          await document.fonts.ready
          return document.fonts.check('16px "Plus Jakarta Sans Variable"')
        })
        assert(font, 'font not available offline')
        await p.screenshot({ path: new URL('./screenshots/ac-13-offline.png', import.meta.url).pathname })
      } finally {
        await ctx.close()
      }
      return 'all sections, quiz, Settings with profile, and the font work offline'
    }],
    [14, '390px layout, tap targets, and contrast in both themes', async ({ page }) => {
      const out = []
      for (const theme of ['light', 'dark']) {
        await page.evaluate((t) => localStorage.setItem('thw.theme', JSON.stringify(t)), theme)
        for (const h of ['', 'product', 'ingredients', 'learn', 'learn/quiz', 'recipes', 'plan', 'plan/Monday', 'read', 'profile']) {
          await go(page, h)
          await page.reload()
          await page.waitForTimeout(300)
          await noSideScroll(page)
          await tapTargets(page)
        }
        const c = await page.evaluate(contrastCheck)
        for (const [k, v] of Object.entries(c)) assert(v >= 4.5, `${theme}: ${k} is ${v.toFixed(2)}`)
        out.push(`${theme}: lowest ${Math.min(...Object.values(c)).toFixed(2)}`)
      }
      await page.evaluate(() => localStorage.setItem('thw.theme', '"light"'))
      return out.join(', ')
    }],
    [15, 'Earlier feature tests pass after the redesign', async ({ page }) => {
      await go(page, '')
      const rows = []
      for (const f of ['product-check', 'ingredient-check', 'learn-halal', 'cook', 'read', 'room-leaderboard']) {
        const r = JSON.parse(fs.readFileSync(path.join(root, 'specs', f, 'test-results.json'), 'utf8'))
        const failed = r.results.filter((x) => x.result !== 'Pass').length
        rows.push(`${f} ${r.results.length - failed}/${r.results.length}`)
        assert(failed === 0, `${f} has ${failed} failures`)
      }
      return rows.join(', ')
    }],
  ])
} finally {
  server.kill()
  fs.rmSync(path.join(app, 'dist-mock'), { recursive: true, force: true })
}
