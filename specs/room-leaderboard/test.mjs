// Room leaderboard tests.
// Client: a build pointed at a stand-in Supabase URL. Playwright answers its REST calls from an
// in-memory store that applies the same rules as supabase/setup.sql. Realtime cannot connect to the
// stand-in, so live updates in these tests come from the 5-second poll.
// Database: AC 12 runs supabase/test-setup.sh on local Postgres (set PGHOST, PGPORT, PGUSER, RESET_CODE).
import { execSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { assert, noSideScroll, run, tapTargets } from '../test-lib.mjs'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..')
const app = path.join(root, 'app')
const MOCK = 'https://mock.supabase.test'
const MOCKED = 'http://localhost:4174'
const PLAIN = 'http://localhost:4175'
const quiz = JSON.parse(fs.readFileSync(path.join(app, 'public/data/quiz.json'), 'utf8'))

// ---------- builds ----------
execSync('npx vite build --outDir dist-mock', {
  cwd: app,
  stdio: 'ignore',
  env: { ...process.env, VITE_SUPABASE_URL: MOCK, VITE_SUPABASE_ANON_KEY: 'test-anon-key' },
})
execSync('npx vite build --outDir dist-plain', {
  cwd: app,
  stdio: 'ignore',
  env: { ...process.env, VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
})
const servers = [
  spawn('npx', ['vite', 'preview', '--outDir', 'dist-mock', '--port', '4174', '--strictPort'], { cwd: app, stdio: 'ignore' }),
  spawn('npx', ['vite', 'preview', '--outDir', 'dist-plain', '--port', '4175', '--strictPort'], { cwd: app, stdio: 'ignore' }),
]
await new Promise((r) => setTimeout(r, 2500))

// ---------- stand-in Supabase ----------
const store = { rows: [], devices: new Map(), calls: [], down: false }
const NAME = /^\p{L}[\p{L} .'-]*$/u
let seq = 0
function postScore({ p_device, p_name, p_score, p_level }) {
  const name = String(p_name ?? '').replace(/\s+/g, ' ').trim()
  if (!p_device) return 'device id is required'
  if (name.length < 1 || name.length > 20 || !NAME.test(name)) return 'name must be 1 to 20 letters'
  if (!(p_score >= 0 && p_score <= 18)) return 'score must be between 0 and 18'
  const id = store.devices.get(p_device)
  const row = store.rows.find((r) => r.id === id)
  if (!row) {
    const r = { id: `e${++seq}`, name, score: p_score, level: p_level, updated_at: new Date(Date.now() + seq).toISOString() }
    store.rows.push(r)
    store.devices.set(p_device, r.id)
  } else {
    if (p_score >= row.score) row.level = p_level ?? row.level
    if (p_score > row.score) row.updated_at = new Date().toISOString()
    row.score = Math.max(row.score, p_score)
    row.name = name
  }
  return null
}
const top = () => [...store.rows].sort((a, b) => b.score - a.score || a.updated_at.localeCompare(b.updated_at)).slice(0, 10)
const refuse = (route, message) =>
  route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ code: 'P0001', message, details: null, hint: null }) })

async function stub(ctx) {
  await ctx.route(`${MOCK}/**`, async (route) => {
    if (store.down) return route.abort('internetdisconnected')
    const req = route.request()
    const url = new URL(req.url())
    if (url.pathname === '/rest/v1/leaderboard') return route.fulfill({ json: top() })
    if (url.pathname === '/rest/v1/rpc/post_score') {
      const body = req.postDataJSON()
      store.calls.push(body)
      const err = postScore(body)
      return err ? refuse(route, err) : route.fulfill({ status: 204, body: '' })
    }
    if (url.pathname === '/rest/v1/rpc/reset_leaderboard') {
      if (req.postDataJSON().p_code !== 'right-code') return refuse(route, 'wrong code')
      const n = store.rows.length
      store.rows = []
      store.devices.clear()
      return route.fulfill({ json: n })
    }
    return route.abort()
  })
}

async function playRound(page, base, level, allRight = true) {
  await page.goto(`${base}/#/learn/quiz/${level}`)
  await page.waitForSelector('[data-testid=option]')
  const qs = quiz.items.filter((q) => q.level === level)
  for (const q of qs) {
    await page.locator('[data-testid=option]').nth(allRight ? q.answer : (q.answer + 1) % q.options.length).click()
    await page.getByRole('button', { name: /Next question|See my score/ }).click()
  }
  await page.waitForSelector('[data-testid=score]')
}
const status = (page) => page.locator('[data-testid=post-status]').innerText()

let pageA
try {
  await run('room-leaderboard', [
    [1, 'Post a score after a round', async ({ page }) => {
      pageA = page
      await stub(page.context())
      await playRound(page, MOCKED, 'Beginner')
      await page.fill('[data-testid=board-name]', 'Amina')
      await page.getByRole('button', { name: 'Post my score' }).click()
      await page.waitForSelector('text=Posted as Amina.')
      assert(store.calls.length === 1 && store.calls[0].p_score === 6 && store.calls[0].p_name === 'Amina', JSON.stringify(store.calls))
      await page.locator('[data-testid=post-score]').scrollIntoViewIfNeeded()
      return 'one post_score call, total 6'
    }],
    [2, 'Posting again updates the same entry', async ({ page }) => {
      await playRound(page, MOCKED, 'Learner')
      assert((await page.inputValue('[data-testid=board-name]')) === 'Amina', 'name not remembered')
      await page.getByRole('button', { name: 'Post my score' }).click()
      await page.waitForSelector('text=Posted as Amina.')
      assert(store.calls.length === 2 && store.calls[0].p_device === store.calls[1].p_device, 'device key differs')
      assert(store.rows.length === 1 && store.rows[0].score === 12, JSON.stringify(store.rows))
      await page.locator('[data-testid=post-score]').scrollIntoViewIfNeeded()
      return 'same device key, one entry, score 12'
    }],
    [3, 'Bad names keep the button disabled', async ({ page }) => {
      const button = page.getByRole('button', { name: 'Post my score' })
      for (const n of ['', '   ', 'Abcdefghijklmnopqrstu', 'Bob<1>', '123']) {
        await page.fill('[data-testid=board-name]', n)
        assert(await button.isDisabled(), `enabled for "${n}"`)
      }
      await page.fill('[data-testid=board-name]', "Jean-Luc O'Neil")
      assert(!(await button.isDisabled()), 'disabled for a good name')
      await page.fill('[data-testid=board-name]', 'Bob<1>')
      await page.locator('[data-testid=post-score]').scrollIntoViewIfNeeded()
    }],
    [4, 'Network failure keeps the score on the device', async ({ page }) => {
      store.down = true
      await playRound(page, MOCKED, 'Advocate')
      await page.fill('[data-testid=board-name]', 'Amina')
      await page.getByRole('button', { name: 'Post my score' }).click()
      await page.waitForSelector('text=Could not reach the leaderboard.')
      assert((await status(page)).includes('Your score is saved on this device.'), 'message')
      const pending = await page.evaluate(() => JSON.parse(localStorage.getItem('thw.board')).pending)
      assert(pending && pending.total === 18, `pending ${JSON.stringify(pending)}`)
      // A second tab on the same device still has the quiz progress.
      const other = await page.context().newPage()
      await other.goto(`${MOCKED}/#/learn/quiz`)
      const level = await other.textContent('[data-testid=level]')
      await other.close()
      assert(level === 'Advocate', `level ${level}`)
      await page.locator('[data-testid=post-score]').scrollIntoViewIfNeeded()
      return 'pending total 18 saved, level Advocate kept'
    }],
    [5, 'Retries by itself when back online', async ({ page }) => {
      store.down = false
      const before = store.calls.length
      await page.context().setOffline(true)
      await page.waitForTimeout(300)
      await page.context().setOffline(false)
      await page.waitForSelector('text=Posted as Amina.', { timeout: 10000 })
      assert(store.calls.length === before + 1, 'no retry call')
      assert(store.rows[0].score === 18, `score ${store.rows[0].score}`)
      await page.locator('[data-testid=post-score]').scrollIntoViewIfNeeded()
    }],
    [6, 'Projector view: top 10, large text, QR visible', async ({ page }) => {
      for (const [i, n] of ['Yusuf', 'Fatima', 'Omar', 'Sara', 'Bilal', 'Maryam', 'Hamza', 'Zainab', 'Ibrahim', 'Noor', 'Adam'].entries()) {
        postScore({ p_device: `seed-${i}`, p_name: n, p_score: 17 - i, p_level: 'Learner' })
      }
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto(`${MOCKED}/leaderboard`)
      await page.waitForSelector('[data-testid=board-row]')
      const names = await page.locator('[data-testid=board-name]').allInnerTexts()
      const scores = (await page.locator('[data-testid=board-score]').allInnerTexts()).map((s) => parseInt(s))
      assert(names.length === 10, `${names.length} rows`)
      assert(names[0] === 'Amina' && scores.every((s, i) => i === 0 || scores[i - 1] >= s), 'order')
      const sizes = await page.evaluate(() =>
        ['board-rank', 'board-name'].map((t) => parseFloat(getComputedStyle(document.querySelector(`[data-testid=${t}]`)).fontSize)),
      )
      assert(sizes.every((s) => s >= 32), `font sizes ${sizes}`)
      const qr = await page.locator('[data-testid=qr]').boundingBox()
      assert(qr && qr.y + qr.height <= 720 && qr.x + qr.width <= 1280, 'QR not fully in view')
      const last = await page.locator('[data-testid=board-row]').last().boundingBox()
      return `12 entries, 10 shown, rank and name ${sizes.join(' and ')}px, row 10 ends at ${Math.round(last.y + last.height)}px of 720`
    }],
    [7, 'A new score appears within 10 seconds without reload', async ({ page }) => {
      const t0 = Date.now()
      postScore({ p_device: 'late-joiner', p_name: 'Khadija', p_score: 18, p_level: 'Advocate' })
      await page.waitForSelector('[data-testid=board-name]:text("Khadija")', { timeout: 10000 })
      return `appeared after ${((Date.now() - t0) / 1000).toFixed(1)} s (poll, realtime cannot reach the stand-in)`
    }],
    [8, 'Wrong reset code', async ({ page }) => {
      const before = store.rows.length
      await page.getByRole('button', { name: 'Reset' }).click()
      await page.fill('[data-testid=reset-code]', 'nope')
      await page.getByRole('button', { name: 'Clear all scores' }).click()
      await page.waitForSelector('text=That code is not right.')
      assert(store.rows.length === before, 'rows removed')
      assert((await page.locator('[data-testid=board-row]').count()) === 10, 'rows gone from screen')
      assert((await page.getAttribute('[data-testid=reset-code]', 'type')) === 'password', 'code visible on projector')
    }],
    [9, 'Right reset code clears the board', async ({ page }) => {
      await page.fill('[data-testid=reset-code]', 'right-code')
      await page.getByRole('button', { name: 'Clear all scores' }).click()
      await page.waitForSelector('text=All scores cleared.')
      await page.waitForSelector('[data-testid=board-empty]')
      assert(store.rows.length === 0, 'store not empty')
      assert((await page.textContent('[data-testid=board-empty]')).includes('No scores yet'), 'empty state')
    }],
    [10, '/leaderboard path opens the screen', async ({ page }) => {
      await page.goto(`${MOCKED}/leaderboard`)
      assert((await page.locator('h2').innerText()) === 'Room leaderboard', 'title')
      await page.setViewportSize({ width: 390, height: 844 })
    }],
    [11, 'Without settings the feature is hidden', async ({ newPage, setPage }) => {
      const page = await newPage()
      setPage(page)
      await playRound(page, PLAIN, 'Beginner')
      assert((await page.locator('[data-testid=post-score]').count()) === 0, 'post section shown')
      await page.goto(`${PLAIN}/leaderboard`)
      assert((await page.textContent('[data-testid=board-empty]')).includes('not connected yet'), 'not connected line')
    }],
    [12, 'Database access rules (local Postgres)', async ({ setPage }) => {
      setPage(pageA)
      const out = execSync(`${path.join(root, 'supabase/test-setup.sh')} 2>&1`, { env: process.env }).toString()
      fs.writeFileSync(path.join(root, 'specs/room-leaderboard/sql-test-output.txt'), out)
      const last = out.trim().split('\n').pop()
      assert(/ 0 failed$/.test(last) && !/^skip /m.test(out), last)
      return `${last}. Output in sql-test-output.txt`
    }],
    [13, 'No sideways scroll and 44px tap targets at 390px', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await playRound(page, MOCKED, 'Beginner')
      await page.fill('[data-testid=board-name]', 'Amina')
      await noSideScroll(page)
      await tapTargets(page)
      await page.goto(`${MOCKED}/leaderboard`)
      await page.waitForSelector('[data-testid=reset]')
      await page.getByRole('button', { name: 'Reset' }).click()
      await noSideScroll(page)
      await tapTargets(page)
    }],
  ])
} finally {
  for (const s of servers) s.kill()
  for (const d of ['dist-mock', 'dist-plain']) fs.rmSync(path.join(app, d), { recursive: true, force: true })
}
