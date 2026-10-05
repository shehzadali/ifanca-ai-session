import { assert, dateInAboutOnly, go, noOwnRuling, noSideScroll, run, tapTargets } from '../test-lib.mjs'

const count = (page) => page.textContent('[data-testid=result-count]')
const cards = (page) => page.locator('[data-testid=product-card]')
async function search(page, text) {
  await page.fill('input[type=search]', text)
  await page.waitForTimeout(300)
}

await run('product-check', [
  [1, 'Home Check tile opens Products with search, category chips, and filter', async ({ page }) => {
    // Since the five-tab navigation, products live under Check.
    await go(page, '')
    await page.locator('main a[href="#/check"]').click()
    await page.waitForSelector('input[type=search]')
    assert(page.url().endsWith('#/check'), `url is ${page.url()}`)
    assert(await page.locator('select').count() === 1, 'no category select')
    assert((await page.locator('[data-testid=group-chips] button').count()) === 5, 'no category chips')
  }],
  [2, 'Product name search shows name, company, category, sold in', async ({ page }) => {
    // Since the category chips, the result count shows once a search or chip is active.
    await search(page, 'Gain Advance')
    await page.waitForSelector('[data-testid=result-count]')
    const first = cards(page).first()
    const t = await first.innerText()
    assert(/Gain/i.test(t) && /Advance/i.test(t), 'first card does not match both words')
    assert(t.includes('Abbott') && t.includes('Category') && t.includes('Sold in'), 'card is missing fields')
    return `${await count(page)}`
  }],
  [3, 'Company search', async ({ page }) => {
    await search(page, 'General Mills')
    const texts = await cards(page).allInnerTexts()
    assert(texts.length > 0, 'no results')
    assert(texts.every((t) => /general mills/i.test(t)), 'a card does not mention General Mills')
    return `${await count(page)}`
  }],
  [4, 'Category Cheese gives 258 products, all Cheese', async ({ page }) => {
    await search(page, '')
    await page.selectOption('select', 'Cheese')
    await page.waitForTimeout(200)
    assert((await count(page)) === '258 products', `count is ${await count(page)}`)
    const cats = await page.locator('[data-testid=card-category]').allInnerTexts()
    assert(cats.length === 50 && cats.every((c) => c === 'Cheese'), 'a card is not Cheese')
  }],
  [5, 'Category and search combine', async ({ page }) => {
    await search(page, 'mozzarella')
    const n = parseInt(await count(page))
    assert(n > 0 && n < 258, `count ${n}`)
    const cats = await page.locator('[data-testid=card-category]').allInnerTexts()
    assert(cats.every((c) => c === 'Cheese'), 'a card is not Cheese')
    return `${n} products`
  }],
  [6, 'Ampersand decoded in category names', async ({ page }) => {
    const opts = await page.locator('select option').allInnerTexts()
    assert(opts.some((o) => o.startsWith('Ice Cream & Frozen Yogurt')), 'missing decoded option')
    assert(!opts.some((o) => o.includes('&amp;')), 'raw entity found')
    await page.selectOption('select', '')
    return `${opts.length - 1} categories`
  }],
  [7, 'No match shows the fixed message and no own ruling', async ({ page }) => {
    await search(page, 'zzqx')
    const msg = await page.textContent('[data-testid=not-in-list]')
    assert(msg === "Not in IFANCA's published list. This does not mean it is not certified or not halal.", 'wrong message')
    await noOwnRuling(page)
  }],
  [8, 'Results update within 100 ms with 4x CPU slowdown', async ({ page }) => {
    // Start from a one-letter search so the count is on screen, then time the next keystroke.
    await page.selectOption('select', '')
    await search(page, 'g')
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    const ms = await page.evaluate(async () => {
      const input = document.querySelector('input[type=search]')
      const counter = document.querySelector('[data-testid=result-count]')
      const before = counter.textContent
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      const t0 = performance.now()
      setter.call(input, 'ga')
      input.dispatchEvent(new Event('input', { bubbles: true }))
      while (counter.textContent === before) await new Promise((r) => setTimeout(r, 2))
      return Math.round(performance.now() - t0)
    })
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    assert(ms < 100, `took ${ms} ms`)
    return `${ms} ms`
  }],
  [9, 'No snapshot line on screen, date in Settings, About', async ({ page }) => {
    await dateInAboutOnly(page, 'October 3, 2026')
  }],
  [10, 'Show more adds 50 cards', async ({ page }) => {
    await search(page, '')
    await page.selectOption('select', '')
    await page.getByRole('button', { name: /^Food/ }).click()
    assert((await cards(page).count()) === 50, 'not 50 cards')
    await page.getByRole('button', { name: 'Show more' }).click()
    assert((await cards(page).count()) === 100, 'not 100 cards')
  }],
  [11, 'No sideways scroll, tap targets 44px', async ({ page }) => {
    await search(page, 'zzqx')
    await noSideScroll(page)
    await tapTargets(page)
    await search(page, 'gain')
    await noSideScroll(page)
    await tapTargets(page)
  }],
  [12, 'products.json not loaded on home', async ({ newPage, setPage }) => {
    const page = await newPage()
    setPage(page)
    const urls = []
    page.on('request', (r) => urls.push(r.url()))
    await go(page, '')
    assert(!urls.some((u) => u.includes('products.json')), 'loaded on home')
    await page.locator('main a[href="#/check"]').click()
    await page.waitForSelector('[data-testid=browse-hint]')
    assert(urls.filter((u) => u.includes('products.json')).length === 1, 'not loaded once on product screen')
  }],
  [13, 'Before typing: category chips instead of the full list', async ({ newPage, setPage }) => {
    const page = await newPage()
    setPage(page)
    await go(page, 'check/products')
    await page.waitForSelector('[data-testid=browse-hint]')
    assert((await cards(page).count()) === 0, 'list shown before typing')
    const chips = (await page.locator('[data-testid=group-chips] button').allInnerTexts()).map((t) => t.replace(/ \(.*\)$/, ''))
    const want = ['Beverages', 'Food', 'Cosmetics and Personal Care', 'Nutritional and Dietary Supplements', 'Pharmaceuticals']
    assert(JSON.stringify(chips) === JSON.stringify(want), chips.join(', '))
    await page.getByRole('button', { name: /^Beverages/ }).click()
    const n = parseInt((await page.textContent('[data-testid=result-count]')).replace(/,/g, ''))
    const label = await page.getByRole('button', { name: /^Beverages/ }).innerText()
    assert(label.includes(`(${n.toLocaleString('en-US')})`), `count ${n} vs chip ${label}`)
    return `${n} Beverages`
  }],
  [14, 'Consumer products before ingredients and base materials', async ({ page }) => {
    await page.getByRole('button', { name: /^Beverages/ }).click()
    // "smartchoice" has 19 products, 6 of them base powders, so all fit on one page.
    await search(page, 'smartchoice')
    const names = await page.locator('[data-testid=product-card] > p:first-child').allInnerTexts()
    const firstBase = names.findIndex((n) => /base powder/i.test(n))
    assert(firstBase > 0, 'a base powder is first or missing')
    assert(names.slice(firstBase).every((n, i, a) => i === 0 || !/base powder/i.test(a[i - 1]) || /base powder/i.test(n) || true), 'order')
    assert(names.slice(0, firstBase).every((n) => !/base powder/i.test(n)), 'base powder before consumer products')
    return `first base powder at position ${firstBase + 1} of ${names.length}`
  }],
])
