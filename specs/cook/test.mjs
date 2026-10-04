import fs from 'node:fs'
import { assert, dateInAboutOnly, go, noSideScroll, run, tapTargets } from '../test-lib.mjs'

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
    c.querySelectorAll('[data-line], [data-testid=recipe-row], h2, [data-testid^=day-]').forEach((e) => e.remove())
    return c.innerText
  })
}
const BANNED = /\b(diet|diets|calorie|calories|healthy|nutrition|nutritional)\b/i

const target = recipes.find((r) => r.ingredients.some((l) => l.trim().endsWith(':'))) ?? recipes[0]
const withPhoto = recipes.find((r) => r.image_url)

await run('cook', [
  [1, 'Recipes tile opens Recipes, and no Cook label remains', async ({ page }) => {
    await go(page, '')
    const tile = page.locator('main a[href="#/recipes"]')
    assert((await tile.innerText()).trim() === 'Recipes', 'tile text')
    assert(!/\bcook\b/i.test(await page.evaluate(() => document.body.innerText)), 'Cook label on home')
    await tile.click()
    await page.waitForSelector('[data-testid=result-count]')
    assert(page.url().endsWith('#/recipes'), page.url())
    assert((await page.locator('h2').innerText()) === 'Recipes', 'title')
  }],
  [2, 'Newest first, with title and date, 341 recipes', async ({ page }) => {
    assert((await count(page)) === '340 recipes', await count(page))
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
    assert((await count(page)) === '340 recipes', 'not cleared')
    await page.getByRole('button', { name: 'Chicken' }).click()
    return `${n} with Chicken. Tapping again restored 340.`
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
    await go(page, `recipes/${slug(target.url)}`)
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
    await page.click('[data-testid=day-Tuesday]')
    await page.waitForSelector('[data-testid=day-view]')
    await page.getByRole('button', { name: `Remove ${target.title} from Tuesday` }).click()
    assert((await page.textContent('[data-testid=day-view]')).includes('Nothing planned yet'), 'still planned')
  }],
  [10, 'No diet, calorie, healthy, or nutrition words in app text', async ({ page }) => {
    for (const h of ['recipes', `recipes/${slug(target.url)}`, 'plan']) {
      await go(page, h)
      const m = (await appText(page)).match(BANNED)
      assert(!m, `"${m?.[0]}" on ${h}`)
    }
  }],
  [11, 'No snapshot line on Recipes and Meal plan, date in Settings, About', async ({ page }) => {
    for (const h of ['recipes', `recipes/${slug(target.url)}`, 'plan']) {
      await go(page, h)
      await dateInAboutOnly(page, 'October 4, 2026')
    }
  }],
  [13, 'Photo loads from ifanca.org when online', async ({ page }) => {
    await go(page, `recipes/${slug(withPhoto.url)}`)
    const img = page.locator('[data-testid=recipe-photo]')
    await img.scrollIntoViewIfNeeded()
    await page.waitForFunction(() => document.querySelector('[data-testid=recipe-photo]')?.complete)
    assert((await img.getAttribute('src')) === withPhoto.image_url, 'src differs')
    const w = await img.evaluate((i) => i.naturalWidth)
    assert(w > 0, 'photo did not load')
    return `${withPhoto.title}, ${w}px wide`
  }],
  [14, 'Offline shows the placeholder and requests no photo', async ({ page }) => {
    const photoRequests = []
    const onReq = (r) => r.url().includes('/app/uploads/') && photoRequests.push(r.url())
    await go(page, 'recipes')
    page.on('request', onReq)
    await page.context().setOffline(true)
    try {
      await page.evaluate((h) => (location.hash = h), `#/recipes/${slug(withPhoto.url)}`)
      await page.waitForSelector('[data-testid=photo-placeholder]')
      assert((await page.textContent('[data-testid=photo-placeholder]')).includes('when you are online'), 'wrong note')
      assert(photoRequests.length === 0, `requested ${photoRequests.length}`)
      await page.locator('[data-testid=photo-placeholder]').scrollIntoViewIfNeeded()
      await page.screenshot({ path: new URL('./screenshots/ac-14-offline.png', import.meta.url).pathname })
    } finally {
      page.off('request', onReq)
      await page.context().setOffline(false)
    }
  }],
  [15, 'A failed photo shows the placeholder', async ({ newPage, setPage }) => {
    // A fresh context, so the photo is not served from the memory cache of AC 13.
    const page = await newPage()
    setPage(page)
    await page.route('**/app/uploads/**', (r) => r.abort())
    try {
      await go(page, `recipes/${slug(withPhoto.url)}`)
      await page.waitForSelector('[data-testid=photo-placeholder]')
      assert((await page.textContent('[data-testid=photo-placeholder]')).includes('could not load'), 'wrong note')
      await page.locator('[data-testid=photo-placeholder]').scrollIntoViewIfNeeded()
    } finally {
      await page.unroute('**/app/uploads/**')
    }
  }],
  [16, 'Lemon Tiramisu is hidden', async ({ page }) => {
    assert(!recipes.some((r) => /lemon-tiramisu/.test(r.url)), 'still in recipes.json')
    await go(page, 'recipes')
    await page.fill('input[type=search]', 'tiramisu')
    await page.waitForTimeout(200)
    const titles = await page.locator('[data-testid=recipe-row]').allInnerTexts()
    assert(!titles.some((t) => /lemon tiramisu/i.test(t)), 'listed')
    await go(page, 'recipes/lemon-tiramisu')
    assert((await page.locator('[data-testid=ingredients]').count()) === 0, 'recipe opened')
    return `search "tiramisu" gives ${titles.length} rows`
  }],
  [12, 'No sideways scroll and 44px tap targets', async ({ page }) => {
    for (const h of ['recipes', `recipes/${slug(target.url)}`, 'plan']) {
      await go(page, h)
      if (h.includes('/') && h !== 'plan') await page.getByRole('button', { name: 'Add to meal plan' }).click()
      await noSideScroll(page)
      await tapTargets(page)
    }
  }],
])
