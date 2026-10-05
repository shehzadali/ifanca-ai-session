import fs from 'node:fs'
import { assert, BASE, go, noSideScroll, run, tapTargets } from '../test-lib.mjs'

const faqs = JSON.parse(fs.readFileSync(new URL('../../app/public/data/faqs.json', import.meta.url), 'utf8')).items
const quote = async (page) => (await page.textContent('[data-testid=fact-quote]')).trim().replace(/^“|”$/g, '')

await run('daily-fact', [
  [1, 'Card with quote, source FAQ, and lesson link', async ({ page }) => {
    await go(page, '')
    await page.waitForSelector('[data-testid=daily-fact]')
    assert((await page.textContent('[data-testid=daily-fact] h2')).includes('Did You Know?'), 'title')
    assert((await quote(page)).length > 10, 'quote')
    assert((await page.textContent('[data-testid=fact-source]')).startsWith("From IFANCA's answer to"), 'source')
    assert((await page.getAttribute('[data-testid=fact-link]', 'href')).startsWith('#/learn/'), 'link')
  }],
  [2, 'The quote is word for word in the named FAQ', async ({ page }) => {
    const q = await quote(page)
    const question = (await page.textContent('[data-testid=fact-source]')).replace("From IFANCA's answer to ", '').replace(/^"|"$/g, '')
    const faq = faqs.find((f) => f.question === question)
    assert(faq, `no FAQ named ${question}`)
    assert(faq.answer.includes(q), 'quote not in the answer')
    return question
  }],
  [3, 'The link opens that lesson', async ({ page }) => {
    const question = (await page.textContent('[data-testid=fact-source]')).replace("From IFANCA's answer to ", '').replace(/^"|"$/g, '')
    await page.click('[data-testid=fact-link]')
    await page.waitForSelector('[data-testid=lesson-text]')
    assert((await page.locator('main h2').innerText()) === question, 'wrong lesson')
  }],
  [4, 'Different days, different facts. Same day, same fact', async ({ newPage, setPage }) => {
    const page = await newPage()
    setPage(page)
    const at = async (iso) => {
      await page.clock.setFixedTime(new Date(iso))
      await page.goto(`${BASE}/`)
      await page.waitForSelector('[data-testid=fact-quote]')
      return quote(page)
    }
    const a = await at('2026-10-05T09:00:00')
    const b = await at('2026-10-06T09:00:00')
    const a2 = await at('2026-10-05T21:00:00')
    assert(a !== b, 'same fact on two days')
    assert(a === a2, 'different fact on the same day')
    return 'October 5 and 6 differ, two times on October 5 match'
  }],
  [5, 'Offline after one visit', async ({ page }) => {
    const ctx = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, isMobile: true })
    await ctx.addInitScript(() => sessionStorage.setItem('thw.splash.skip', '1'))
    const p = await ctx.newPage()
    try {
      await p.goto(`${BASE}/`)
      await p.evaluate(async () => {
        await navigator.serviceWorker.ready
        for (let i = 0; i < 100; i++) {
          for (const k of await caches.keys()) if ((await (await caches.open(k)).keys()).some((r) => r.url.includes('/data/quiz.json'))) return
          await new Promise((r) => setTimeout(r, 300))
        }
      })
      await ctx.setOffline(true)
      await p.reload()
      await p.waitForSelector('[data-testid=daily-fact]', { timeout: 10000 })
    } finally {
      await ctx.close()
    }
  }],
  [6, '390px layout and link size', async ({ page }) => {
    await go(page, '')
    await page.waitForSelector('[data-testid=daily-fact]')
    await noSideScroll(page)
    await tapTargets(page, '[data-testid=daily-fact] a')
  }],
])
