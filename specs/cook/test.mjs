import fs from 'node:fs'
import { assert, go, noSideScroll, run, tapTargets } from '../test-lib.mjs'

const recipes = JSON.parse(fs.readFileSync(new URL('../../app/public/data/recipes.json', import.meta.url), 'utf8')).items
const byUrl = new Map(recipes.map((r) => [r.url, r]))
const rowUrls = (page) => page.locator('[data-testid=recipe-row]').evaluateAll((els) => els.map((e) => e.dataset.url))
const count = (page) => page.textContent('[data-testid=result-count]')
const newest = recipes.map((r) => r.date).sort().at(-1)
const slug = (u) => u.replace(/\/$/, '').split('/').pop()
const fmt = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1]} ${d}, ${y}`
}

// App-written text only: recipe titles and lines from IFANCA are removed before the check.
async function appText(page) {
  return page.evaluate(() => {
    const c = document.body.cloneNode(true)
    c.querySelectorAll('[data-line], [data-testid=recipe-row], h2, [data-testid^=day-] a').forEach((e) => e.remove())
    return c.innerText
  })
}
const BANNED = /\b(diet|diets|calorie|calories|healthy|nutrition|nutritional)\b/i

const target = recipes.find((r) => r.ingredients.some((l) => l.trim().endsWith(':'))) ?? recipes[0]

await run('cook', [
  [1, 'Cook tile mentions the meal plan and opens Cook', async ({ page }) => {
    await go(page, '')
    const tile = page.locator('a[href="#/cook"]')
    assert(/meal plan/i.test(await tile.innerText()), 'tile text')
    await tile.click()
    await page.waitForSelector('[data-testid=result-count]')
    assert(page.url().endsWith('#/cook'), page.url())
  }],
  [2, 'Newest first, with title and date, 341 recipes', async ({ page }) => {
    assert((await count(page)) === '341 recipes', await count(page))
    const first = byUrl.get((await rowUrls(page))[0])
    assert(first.date === newest, `first is ${first.date}, newest ${newest}`)
    const t = await page.locator('[data-testid=recipe-row]').first().innerText()
    assert(t.includes(fmt(first.date)), 'date not shown')
  }],
  [3, 'Search lentil', async ({ page }) => {
    await page.fill('input[type=search]', 'lentil')
    await page.waitForTimeout(200)
    const urls = await rowUrls(page)
    assert(urls.length > 0, 'no results')
    const bad = urls.filter((u) => {
      const r = byUrl.get(u)
      return !/lentil/i.test(`${r.title} ${r.ingredients.join(' ')}`)
    })
    assert(bad.length === 0, `${bad.length} rows without lentil`)
    return `${await count(page)} for lentil`
  }],
  [4, 'Chicken chip filters and clears', async ({ page }) => {
    await page.fill('input[type=search]', '')
    await page.getByRole('button', { name: 'Chicken' }).click()
    const n = await count(page)
    const urls = await rowUrls(page)
    assert(urls.every((u) => /\bchicken\b/i.test(byUrl.get(u).ingredients.join(' '))), 'row without chicken')
    await page.getByRole('button', { name: 'Chicken' }).click()
    assert((await count(page)) === '341 recipes', 'not cleared')
    await page.getByRole('button', { name: 'Chicken' }).click()
    return `${n} with Chicken. Tapping again restored 341.`
  }],
  [5, '8 or fewer ingredients', async ({ page }) => {
    await page.getByRole('button', { name: 'Chicken' }).click()
    await page.getByRole('button', { name: '8 or fewer ingredients' }).click()
    const urls = await rowUrls(page)
    const over = urls.filter((u) => byUrl.get(u).ingredients.filter((l) => !l.trim().endsWith(':')).length > 8)
    assert(urls.length > 0 && over.length === 0, `${over.length} over 8`)
    return await count(page)
  }],
  [6, 'Recipe text equals the data, with source link and date', async ({ page }) => {
    await go(page, `cook/${slug(target.url)}`)
    await page.waitForSelector('[data-testid=ingredients]')
    const ing = await page.locator('[data-testid=ingredients] [data-line]').allInnerTexts()
    const steps = await page.locator('[data-testid=steps] [data-line]').allInnerTexts()
    assert(JSON.stringify(ing) === JSON.stringify(target.ingredients), 'ingredients differ')
    assert(JSON.stringify(steps) === JSON.stringify(target.steps), 'steps differ')
    const src = page.locator('[data-testid=recipe-source]').first()
    assert((await src.innerText()).includes(fmt(target.date)), 'date missing')
    assert((await src.locator('a').getAttribute('href')) === target.url, 'link differs')
    return target.title
  }],
  [7, 'Add to Tuesday shows in the meal plan', async ({ page }) => {
    await page.getByRole('button', { name: 'Add to meal plan' }).click()
    await page.getByRole('button', { name: 'Tuesday' }).click()
    await page.getByRole('link', { name: 'See the meal plan' }).click()
    await page.waitForSelector('[data-testid=day-Tuesday]')
    assert((await page.textContent('[data-testid=day-Tuesday]')).includes(target.title), 'not in Tuesday')
  }],
  [8, 'Meal plan survives a reload', async ({ page }) => {
    await page.reload()
    await page.waitForSelector('[data-testid=day-Tuesday]')
    assert((await page.textContent('[data-testid=day-Tuesday]')).includes(target.title), 'lost after reload')
  }],
  [9, 'Remove takes it out of the plan', async ({ page }) => {
    await page.getByRole('button', { name: `Remove ${target.title} from Tuesday` }).click()
    assert((await page.textContent('[data-testid=day-Tuesday]')).includes('Nothing planned.'), 'still planned')
  }],
  [10, 'No diet, calorie, healthy, or nutrition words in app text', async ({ page }) => {
    for (const h of ['cook', `cook/${slug(target.url)}`, 'cook/plan']) {
      await go(page, h)
      const m = (await appText(page)).match(BANNED)
      assert(!m, `"${m?.[0]}" on ${h}`)
    }
  }],
  [11, 'Snapshot date on every Cook screen', async ({ page }) => {
    for (const h of ['cook', `cook/${slug(target.url)}`, 'cook/plan']) {
      await go(page, h)
      assert((await page.textContent('[data-testid=snapshot]')).includes('October 4, 2026'), h)
    }
  }],
  [12, 'No sideways scroll and 44px tap targets', async ({ page }) => {
    for (const h of ['cook', `cook/${slug(target.url)}`, 'cook/plan']) {
      await go(page, h)
      if (h.includes('/') && h !== 'cook/plan') await page.getByRole('button', { name: 'Add to meal plan' }).click()
      await noSideScroll(page)
      await tapTargets(page)
    }
  }],
])
