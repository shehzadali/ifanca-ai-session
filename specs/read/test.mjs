import fs from 'node:fs'
import { assert, dateInAboutOnly, go, noSideScroll, run, tapTargets } from '../test-lib.mjs'

const articles = JSON.parse(fs.readFileSync(new URL('../../app/public/data/articles.json', import.meta.url), 'utf8')).items
const byUrl = new Map(articles.map((a) => [a.url, a]))
const count = (page) => page.textContent('[data-testid=result-count]')
const cards = (page) => page.locator('[data-testid=article-card]')
const urls = (page) => cards(page).evaluateAll((els) => els.map((e) => e.dataset.url))
async function search(page, t) {
  await page.fill('input[type=search]', t)
  await page.waitForTimeout(200)
}

await run('read', [
  [1, 'Read tile opens the screen with search and theme chips', async ({ page }) => {
    await go(page, '')
    await page.locator('main a[href="#/read"]').click()
    await page.waitForSelector('[data-testid=result-count]')
    assert(page.url().endsWith('#/read'), page.url())
    assert((await page.locator('[data-testid=themes] button').count()) === 7, 'chip count')
  }],
  [2, '763 articles, newest first', async ({ page }) => {
    assert((await count(page)) === '763 articles', await count(page))
    const dates = await cards(page).evaluateAll((els) => els.map((e) => e.dataset.date))
    assert(dates.every((d, i) => i === 0 || dates[i - 1] >= d), 'not newest first')
    const newest = articles.map((a) => a.date).sort().at(-1)
    assert(dates[0] === newest, `first ${dates[0]}, newest ${newest}`)
  }],
  [3, 'Card shows date, title, type, theme, preview, and link', async ({ page }) => {
    const c = cards(page).first()
    const a = byUrl.get(await c.getAttribute('data-url'))
    assert((await c.locator('[data-testid=article-date]').innerText()).startsWith('Published '), 'date line')
    assert((await c.locator('h3').innerText()).length > 0, 'title')
    assert((await c.locator('[data-testid=article-type]').innerText()) === a.type, 'type')
    assert((await c.locator('[data-testid=article-theme]').innerText()).toLowerCase() === a.theme, 'theme')
    assert((await c.locator('[data-testid=article-preview]').innerText()).length > 20, 'preview')
    assert((await c.locator('a[href^="https://ifanca.org"]').getAttribute('href')) === a.url, 'link')
    return await c.locator('[data-testid=article-date]').innerText()
  }],
  [4, 'Halal basics gives 26, all Halal basics', async ({ page }) => {
    await page.getByRole('button', { name: /^Halal basics/ }).click()
    assert((await count(page)) === '26 articles', await count(page))
    const themes = await page.locator('[data-testid=article-theme]').allInnerTexts()
    assert(themes.every((t) => t === 'Halal basics'), 'other theme shown')
  }],
  [5, 'Theme and search combine', async ({ page }) => {
    await search(page, 'zabihah')
    const u = await urls(page)
    assert(u.length > 0 && u.length < 26, `${u.length}`)
    assert(u.every((x) => byUrl.get(x).theme === 'halal basics'), 'theme broken')
    assert(u.every((x) => /zabihah/i.test(byUrl.get(x).title + byUrl.get(x).first_40_words)), 'word missing')
    return `${u.length} articles`
  }],
  [6, 'Search gelatin', async ({ page }) => {
    await page.getByRole('button', { name: /^All/ }).click()
    await search(page, 'gelatin')
    const u = await urls(page)
    assert(u.length > 0, 'no results')
    assert(u.every((x) => /gelatin/i.test(byUrl.get(x).title + ' ' + byUrl.get(x).first_40_words)), 'word missing')
    return await count(page)
  }],
  [7, 'No match message', async ({ page }) => {
    await search(page, 'zzqx')
    assert((await page.getByText('No articles match. Try another word or theme.').count()) === 1, 'message missing')
  }],
  [8, 'Show more adds 20', async ({ page }) => {
    await search(page, '')
    assert((await cards(page).count()) === 20, 'not 20')
    await page.getByRole('button', { name: 'Show more' }).click()
    assert((await cards(page).count()) === 40, 'not 40')
  }],
  [9, 'Snapshot date and themes note', async ({ page }) => {
    await go(page, 'read')
    await dateInAboutOnly(page, 'October 4, 2026')
    assert((await page.textContent('main')).includes('Themes are approximate.'), 'note')
  }],
  [10, 'No sideways scroll and 44px tap targets', async ({ page }) => {
    await noSideScroll(page)
    await tapTargets(page)
  }],
])
