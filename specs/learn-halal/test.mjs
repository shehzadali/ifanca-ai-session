import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { assert, dateInAboutOnly, go, noSideScroll, run, setProfile, tapTargets } from '../test-lib.mjs'

const app = new URL('../../app/', import.meta.url).pathname
const faqs = JSON.parse(fs.readFileSync(path.join(app, 'public/data/faqs.json'), 'utf8')).items
const quiz = JSON.parse(fs.readFileSync(path.join(app, 'public/data/quiz.json'), 'utf8'))
const slug = (u) => u.replace('https://ifanca.org/faqs/', '').replace(/\/$/, '')
const lessonText = (page) => page.locator('[data-testid=lesson-text] [data-text]').allInnerTexts().then((ps) => ps.join(' '))

await run('learn-halal', [
  [1, 'Tile reads Learn and quiz and opens Learn', async ({ page }) => {
    await go(page, '')
    const tile = page.locator('a[href="#/learn"]')
    assert((await tile.innerText()).includes('Learn and quiz'), 'tile label')
    await tile.click()
    await page.waitForSelector('[data-testid=lesson-row]')
    assert(page.url().endsWith('#/learn'), page.url())
  }],
  [2, '26 lessons, first is What is halal?', async ({ page }) => {
    const titles = await page.locator('[data-testid=lesson-title]').allInnerTexts()
    assert(titles.length === 26, `${titles.length} lessons`)
    assert(titles[0] === 'What is halal?', titles[0])
  }],
  [3, 'What is halal? is word for word with a source link', async ({ page }) => {
    await page.locator('[data-testid=lesson-row]').first().click()
    await page.waitForSelector('[data-testid=lesson-text]')
    const faq = faqs.find((f) => f.question === 'What is halal?')
    assert((await lessonText(page)) === faq.answer, 'text differs')
    assert((await page.getAttribute('[data-testid=faq-link]', 'href')) === 'https://ifanca.org/faqs/what-is-halal/', 'link')
  }],
  [4, 'All 26 lessons are word for word', async ({ page }) => {
    const bad = []
    for (const f of faqs) {
      await go(page, `learn/${slug(f.url)}`)
      await page.waitForSelector('[data-testid=lesson-text]')
      if ((await lessonText(page)) !== f.answer) bad.push(slug(f.url))
      if ((await page.getAttribute('[data-testid=faq-link]', 'href')) !== f.url) bad.push(`${slug(f.url)} link`)
    }
    assert(bad.length === 0, bad.join(', '))
    return '26 of 26 match'
  }],
  [5, 'Next moves through lessons and ends at the quiz', async ({ page }) => {
    await go(page, 'learn/what-is-halal')
    await page.getByRole('link', { name: 'Next' }).click()
    await page.waitForTimeout(300)
    const t = await page.locator('h2').innerText()
    assert(t === 'What is the verdict on halal and haram lists?', t)
    await go(page, 'learn')
    await page.locator('[data-testid=lesson-row]').last().click()
    await page.waitForSelector('[data-testid=lesson-text]')
    await page.getByRole('link', { name: 'Take the quiz' }).click()
    await page.waitForTimeout(300)
    assert(page.url().endsWith('#/learn/quiz'), page.url())
  }],
  [6, 'Read lessons stay marked after reload', async ({ page }) => {
    await go(page, 'learn')
    await page.reload()
    await page.waitForSelector('[data-testid=lesson-row]')
    assert((await page.locator('[data-testid=lesson-row]').first().getAttribute('data-read')) === 'true', 'first not marked')
    const p = await page.textContent('[data-testid=progress]')
    assert(p.startsWith('26 of 26'), p)
    return p
  }],
  [7, 'quiz.json has 15 to 20 questions with word-for-word quotes, and the check fails on a bad quote', async () => {
    assert(quiz.items.length >= 15 && quiz.items.length <= 20, `${quiz.items.length}`)
    const ok = execFileSync('node', [path.join(app, 'scripts/check-quiz.mjs')]).toString()
    const bad = structuredClone(quiz)
    bad.items[0].source_quote += ' changed'
    const tmp = path.join(os.tmpdir(), 'thw-bad-quiz.json')
    fs.writeFileSync(tmp, JSON.stringify(bad))
    let failed = false
    try {
      execFileSync('node', [path.join(app, 'scripts/check-quiz.mjs'), tmp], { stdio: 'pipe' })
    } catch {
      failed = true
    }
    fs.unlinkSync(tmp)
    assert(failed, 'check did not fail on a changed quote')
    return ok.trim()
  }],
  [8, 'Feedback shows the quote and links', async ({ page }) => {
    await setProfile(page)
    await go(page, 'learn/quiz/Beginner')
    const q = quiz.items.find((x) => x.level === 'Beginner')
    await page.locator('[data-testid=option]').nth(q.answer).click()
    const quote = await page.textContent('[data-testid=quote]')
    assert(quote.includes(q.source_quote), 'quote differs')
    assert((await page.getAttribute('[data-testid=lesson-link]', 'href')) === `#/learn/${slug(q.faq_url)}`, 'lesson link')
    assert((await page.getAttribute('[data-testid=faq-link]', 'href')) === q.faq_url, 'faq link')
  }],
  [9, 'Six right answers give 6 of 6, level Beginner, Learner opens', async ({ page }) => {
    const qs = quiz.items.filter((x) => x.level === 'Beginner')
    for (let i = 0; i < qs.length; i++) {
      if (i > 0) await page.locator('[data-testid=option]').nth(qs[i].answer).click()
      await page.getByRole('button', { name: /Next question|See my score/ }).click()
    }
    const s = await page.textContent('[data-testid=score]')
    assert(s === `${qs.length} of ${qs.length}`, s)
    await go(page, 'learn/quiz')
    assert((await page.textContent('[data-testid=level]')) === 'Beginner', 'level')
    assert((await page.locator('[data-testid=round-Learner]').evaluate((e) => e.tagName)) === 'A', 'Learner not open')
  }],
  [10, 'Locked round is disabled with a reason', async ({ newPage, setPage }) => {
    const page = await newPage()
    setPage(page)
    await go(page, '')
    await setProfile(page)
    await go(page, 'learn/quiz')
    const b = page.locator('[data-testid=round-Learner]')
    assert(await b.isDisabled(), 'not disabled')
    assert((await b.innerText()).includes('Pass the Beginner round to open this one.'), 'no reason')
  }],
  [11, 'Level survives a reload', async ({ newPage, setPage }) => {
    const page = await newPage()
    setPage(page)
    await go(page, '')
    await page.evaluate(() => localStorage.setItem('thw.quiz', JSON.stringify({ best: { Beginner: 5, Learner: 4 }, level: 'Learner' })))
    await go(page, 'learn')
    await page.reload()
    await page.waitForSelector('[data-testid=level]')
    assert((await page.textContent('[data-testid=level]')) === 'Learner', 'level not kept')
  }],
  [12, 'No snapshot line on Learn screens, date in Settings, About', async ({ page }) => {
    await setProfile(page)
    for (const h of ['learn', 'learn/what-is-halal', 'learn/quiz']) {
      await go(page, h)
      await dateInAboutOnly(page, 'October 3, 2026')
    }
  }],
  [14, 'Lists from the source show as lists in all 10 lessons that have them', async ({ page }) => {
    const withLists = faqs.filter((f) => f.blocks.some((b) => b.type !== 'p'))
    const bad = []
    for (const f of withLists) {
      await go(page, `learn/${slug(f.url)}`)
      const want = f.blocks.filter((b) => b.type !== 'p').map((b) => `${b.type}:${b.items.join('|')}`)
      const got = await page.locator('[data-testid=lesson-text] ul, [data-testid=lesson-text] ol').evaluateAll((els) =>
        els.map((e) => `${e.tagName.toLowerCase()}:${[...e.children].map((li) => li.textContent).join('|')}`),
      )
      if (JSON.stringify(want) !== JSON.stringify(got)) bad.push(slug(f.url))
    }
    await go(page, 'learn/what-is-halal')
    await page.locator('[data-testid=lesson-text] ol').scrollIntoViewIfNeeded()
    assert(bad.length === 0, bad.join(', '))
    return `${withLists.length} lessons with lists, all match`
  }],
  [13, 'No sideways scroll and 44px tap targets', async ({ page }) => {
    for (const h of ['learn', 'learn/what-is-halal', 'learn/quiz', 'learn/quiz/Beginner']) {
      await go(page, h)
      await noSideScroll(page)
      await tapTargets(page)
    }
    await page.locator('[data-testid=option]').first().click()
    await noSideScroll(page)
    await tapTargets(page)
  }],
])
