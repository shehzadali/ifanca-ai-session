import fs from 'node:fs'
import { assert, go, noSideScroll, run, tapTargets } from '../test-lib.mjs'

const recipes = JSON.parse(fs.readFileSync(new URL('../../app/public/data/recipes.json', import.meta.url), 'utf8')).items
const byTitle = (t) => recipes.find((r) => r.title === t)
const A = byTitle('Ras Malai Milk Cake')
const B = byTitle('Udang Balado (Indonesian Chili-Tomato Shrimp)')
const C = byTitle('Spicy Honey-Glazed Jalapeño Cornbread')

async function setPlan(page, plan) {
  await page.evaluate((p) => {
    localStorage.setItem('thw.mealplan', JSON.stringify(p))
    localStorage.removeItem('thw.shopping.ticked')
  }, plan)
  await page.reload()
}
const items = (page) => page.locator('[data-testid=shop-item]')

await run('shopping-list', [
  [1, 'Three Recipes tabs, Shopping List opens its route', async ({ page }) => {
    await go(page, 'recipes')
    const tabs = (await page.locator('[data-testid=section-tabs] a').allInnerTexts()).map((t) => t.trim())
    assert(JSON.stringify(tabs) === JSON.stringify(['Recipes', 'Meal Plan', 'Shopping List']), tabs.join(', '))
    await page.locator('[data-testid=section-tabs] a', { hasText: 'Shopping List' }).click()
    await page.waitForTimeout(300)
    assert(page.url().endsWith('#/recipes/shopping'), page.url())
  }],
  [2, 'Empty plan shows the empty state', async ({ page }) => {
    await setPlan(page, {})
    await page.waitForSelector('[data-testid=shopping-empty]')
    assert((await page.locator('[data-testid=shopping-empty] a').getAttribute('href')) === '#/recipes/plan', 'link')
  }],
  [3, 'Sugar from two recipes groups into one item', async ({ page }) => {
    await setPlan(page, { Monday: [A.url], Wednesday: [B.url] })
    await page.waitForSelector('[data-testid=shopping-list]')
    const sugar = page.locator('[data-testid=shop-item][data-key="sugar"]')
    assert((await sugar.count()) === 1, 'no single sugar item')
    const text = await sugar.innerText()
    assert(text.includes(A.title) && text.includes(B.title), 'recipe names missing')
    assert((await sugar.locator('[data-testid=shop-line]').count()) === 2, 'not two lines')
    return text.split('\n').slice(0, 3).join(' / ')
  }],
  [4, 'Every non-heading line appears word for word', async ({ page }) => {
    const shown = await page.locator('[data-testid=shop-line] > span:first-child').allInnerTexts()
    const want = [A, B].flatMap((r) => r.ingredients.filter((l) => !l.trim().endsWith(':')))
    const missing = want.filter((l) => !shown.includes(l))
    assert(missing.length === 0 && shown.length === want.length, `missing ${missing.length}, shown ${shown.length}, want ${want.length}`)
    return `${want.length} lines`
  }],
  [5, 'A recipe planned on two days counts once', async ({ page }) => {
    await setPlan(page, { Monday: [A.url], Tuesday: [A.url] })
    await page.waitForSelector('[data-testid=shopping-list]')
    const n = await page.locator('[data-testid=shop-line]').count()
    const want = A.ingredients.filter((l) => !l.trim().endsWith(':')).length
    assert(n === want, `${n} lines, want ${want}`)
    assert((await page.textContent('[data-testid=shopping-count]')).endsWith('from 1 recipe'), 'count')
  }],
  [6, 'An item with IFANCA guidance opens the sheet', async ({ page }) => {
    await setPlan(page, { Friday: [C.url] })
    const item = page.locator('[data-testid=shop-item]:has([data-testid=guidance-badge])').first()
    await item.waitFor()
    await item.locator('[data-testid=shop-name]').click()
    const sheet = page.locator('[data-testid=sheet]')
    await sheet.waitFor()
    assert((await sheet.locator('[data-testid=ingredient-card][data-name="Cheese"]').count()) === 1, 'no Cheese card')
    assert((await sheet.locator('blockquote').count()) >= 1 && (await sheet.locator('a[href^="https://ifanca.org/"]').count()) >= 1, 'quotes or links missing')
    assert((await sheet.textContent('[data-testid=no-verdict]')).includes('It is not a verdict on the product.'), 'no-verdict line')
    await page.screenshot({ path: new URL('./screenshots/ac-6-sheet.png', import.meta.url).pathname })
    await page.keyboard.press('Escape')
    assert((await sheet.count()) === 0, 'sheet did not close')
  }],
  [7, 'An item without guidance ticks and moves to the end', async ({ page }) => {
    const first = page.locator('[data-testid=shop-item]:not(:has([data-testid=guidance-badge]))').first()
    const key = await first.getAttribute('data-key')
    await first.locator('[data-testid=shop-name]').click()
    const last = items(page).last()
    assert((await last.getAttribute('data-key')) === key && (await last.getAttribute('data-done')) === 'true', 'not ticked or not last')
    return key
  }],
  [8, 'Ticks stay after reload', async ({ page }) => {
    await page.reload()
    await page.waitForSelector('[data-testid=shopping-list]')
    assert((await page.locator('[data-testid=shop-item][data-done=true]').count()) === 1, 'tick lost')
  }],
  [9, 'Clear ticks', async ({ page }) => {
    await page.getByRole('button', { name: 'Clear ticks' }).click()
    assert((await page.locator('[data-testid=shop-item][data-done=true]').count()) === 0, 'still ticked')
  }],
  [10, '390px layout and tap targets, sheet closed and open', async ({ page }) => {
    await noSideScroll(page)
    await tapTargets(page)
    await page.locator('[data-testid=shop-item]:has([data-testid=guidance-badge]) [data-testid=shop-name]').first().click()
    await page.waitForSelector('[data-testid=sheet]')
    await noSideScroll(page)
    await tapTargets(page, '[data-testid=sheet] a, [data-testid=sheet] button')
  }],
])
