import { fileURLToPath } from 'node:url'
import { assert, dateInAboutOnly, go, noOwnRuling, noSideScroll, run, tapTargets } from '../test-lib.mjs'

const LABEL = fileURLToPath(new URL('../fixtures/label.png', import.meta.url))
let data

async function open(page, name) {
  await page.fill('input[type=search]', name)
  await page.locator('[data-testid=suggestions] button', { hasText: new RegExp(`^${name}$`) }).click()
  await page.waitForSelector(`[data-testid=ingredient-card][data-name="${name}"]`)
}

async function columnsMatchData(page, name, expectedCols) {
  await open(page, name)
  const card = page.locator(`[data-testid=ingredient-card][data-name="${name}"]`)
  const item = data.items.find((i) => i.name === name)
  assert(await card.getByText("IFANCA's sources say different things").count() === 1, 'no differ line')
  const cols = card.locator('[data-testid=status-column]')
  assert((await cols.count()) === expectedCols, `columns ${await cols.count()}`)
  const boxes = [await cols.nth(0).boundingBox(), await cols.nth(1).boundingBox()]
  assert(Math.abs(boxes[0].y - boxes[1].y) < 2 && boxes[1].x > boxes[0].x, 'columns not side by side')
  const n = await card.locator('[data-testid=statement]').count()
  assert(n === item.statements.length, `${n} statements shown, ${item.statements.length} in data`)
  return `${expectedCols} columns, ${n} statements`
}

async function paste(page, text) {
  await go(page, 'ingredients/paste')
  await page.fill('textarea', text)
  await page.getByRole('button', { name: 'Check ingredients' }).click()
  await page.waitForSelector('[data-testid=results]')
}
const cardNames = (page) => page.locator('[data-testid=results] [data-testid=ingredient-card]').evaluateAll((els) => els.map((e) => e.dataset.name))

await run('ingredient-check', [
  [1, 'Home tile opens the screen with three tabs', async ({ page }) => {
    await go(page, '')
    data = await page.evaluate(() => fetch('/data/ingredients.json').then((r) => r.json()))
    // Since the five-tab navigation: home Check tile, then the Ingredients tab.
    await page.locator('main a[href="#/check"]').click()
    await page.locator('[data-testid=section-tabs] a', { hasText: 'Ingredients' }).click()
    await page.waitForSelector('nav[aria-label="Ways to check"]')
    const tabs = await page.locator('nav[aria-label="Ways to check"] a').allInnerTexts()
    assert(JSON.stringify(tabs) === JSON.stringify(['One ingredient', 'Paste a list', 'Photo']), tabs.join(','))
  }],
  [2, 'Rennet card quotes each statement with source and link', async ({ page }) => {
    await open(page, 'Rennet')
    const item = data.items.find((i) => i.name === 'Rennet')
    const st = page.locator('[data-testid=statement]')
    assert((await st.count()) === item.statements.length, 'statement count')
    for (let i = 0; i < item.statements.length; i++) {
      const q = await st.nth(i).locator('blockquote').innerText()
      assert(q.includes(item.statements[i].source_text), 'quote differs from source text')
      assert((await st.nth(i).locator('a').getAttribute('href')) === item.statements[i].url, 'link differs')
    }
  }],
  [3, 'E471 suggests E-471', async ({ page }) => {
    await page.fill('input[type=search]', 'E471')
    const s = await page.locator('[data-testid=suggestions] button').allInnerTexts()
    assert(s.includes('E-471'), s.join(','))
  }],
  [4, 'No match shows the fixed message', async ({ page }) => {
    await page.fill('input[type=search]', 'quinoa')
    const t = await page.textContent('[data-testid=not-in-list]')
    assert(t === "Not in IFANCA's published list. This does not mean it is not certified or not halal.", t)
    await noOwnRuling(page)
  }],
  [5, 'Gelatin shows statements side by side', async ({ page }) => {
    await page.fill('input[type=search]', '')
    const r = await columnsMatchData(page, 'Gelatin', 3)
    await page.locator('[data-testid=side-by-side]').scrollIntoViewIfNeeded()
    return r
  }],
  [6, 'Lecithin and Mono and diglycerides side by side', async ({ page }) => {
    const a = await columnsMatchData(page, 'Lecithin', 2)
    const b = await columnsMatchData(page, 'Mono and diglycerides', 2)
    await page.locator('[data-testid=side-by-side]').scrollIntoViewIfNeeded()
    return `Lecithin ${a}. Mono and diglycerides ${b}`
  }],
  [7, 'Pasted list matches Gelatin and Lecithin, lists Sugar and Salt as not found', async ({ page }) => {
    await paste(page, 'Sugar, Gelatin, Soy Lecithin, Salt')
    const names = await cardNames(page)
    assert(JSON.stringify(names) === '["Gelatin","Lecithin"]', names.join(','))
    const nf = await page.locator('[data-testid=not-found-item]').allInnerTexts()
    assert(JSON.stringify(nf) === '["Sugar","Salt"]', nf.join(','))
    await page.locator('[data-testid=results]').scrollIntoViewIfNeeded()
  }],
  [8, 'Longest match wins for mono and diglycerides', async ({ page }) => {
    await paste(page, 'Mono- and diglycerides, natural flavors')
    const names = await cardNames(page)
    assert(names.includes('Mono and diglycerides') && names.includes('Artificial and natural flavors'), names.join(','))
    assert(!names.includes('Monoglycerides'), 'Monoglycerides also shown')
    await page.locator('[data-testid=results]').scrollIntoViewIfNeeded()
    return names.join(', ')
  }],
  [9, 'No verdict on the product', async ({ page }) => {
    const text = await page.evaluate(() => document.body.innerText)
    assert(text.includes('It is not a verdict on the product.'), 'no-verdict line missing')
    assert(!/product is (halal|haram)/i.test(text), 'product verdict found')
    await noOwnRuling(page)
  }],
  [10, 'Photo shows progress then editable recognized text', async ({ page, newPage, setPage }) => {
    const p = await newPage()
    setPage(p)
    p.__reqs = []
    p.on('request', (r) => p.__reqs.push(r.url()))
    await go(p, 'ingredients/photo')
    p.__before = p.__reqs.length
    await p.setInputFiles('[data-testid=choose-photo]', LABEL)
    await p.waitForSelector('[data-testid=ocr-progress]', { timeout: 5000 })
    await p.waitForSelector('textarea', { timeout: 60000 })
    const t = await p.inputValue('textarea')
    assert(/GELATIN/.test(t), `recognized: ${t}`)
    return `recognized: ${t.replace(/\n/g, ' ')}`
  }],
  [11, 'Edited text is what gets checked', async ({ page }) => {
    const t = await page.inputValue('textarea')
    await page.fill('textarea', t.replace('SALT', 'LARD'))
    await page.getByRole('button', { name: 'Check ingredients' }).click()
    await page.waitForSelector('[data-testid=results]')
    const names = await cardNames(page)
    assert(names.includes('Lard'), names.join(','))
    await page.locator('[data-testid=results]').scrollIntoViewIfNeeded()
    return names.join(', ')
  }],
  [12, 'OCR files load from the app origin only', async ({ page }) => {
    const origin = new URL(page.url()).origin
    const ocr = page.__reqs.slice(page.__before).filter((u) => !u.startsWith('data:') && !u.startsWith('blob:'))
    const outside = ocr.filter((u) => !u.startsWith(origin))
    assert(outside.length === 0, `outside requests: ${outside.join(', ')}`)
    assert(ocr.some((u) => u.includes('/tesseract/lang/eng.traineddata')), 'language data not from app')
    return `${ocr.length} requests, all on ${origin}`
  }],
  [13, 'No snapshot line on screen, date in Settings, About', async ({ page }) => {
    await go(page, 'ingredients')
    await dateInAboutOnly(page, 'October 3, 2026')
  }],
  [14, 'No page side scroll, tap targets 44px', async ({ page }) => {
    await open(page, 'Gelatin')
    await noSideScroll(page)
    await tapTargets(page)
    await paste(page, 'Sugar, Gelatin, Soy Lecithin, Salt')
    await noSideScroll(page)
    await tapTargets(page)
  }],
  [15, 'No OCR files before the Photo tab', async ({ newPage, setPage }) => {
    const p = await newPage()
    setPage(p)
    const urls = []
    p.on('request', (r) => urls.push(r.url()))
    await go(p, '')
    await p.locator('main a[href="#/check"]').click()
    await p.locator('[data-testid=section-tabs] a', { hasText: 'Ingredients' }).click()
    await p.waitForSelector('input[type=search]')
    await p.fill('input[type=search]', 'gelatin')
    await p.waitForTimeout(300)
    assert(!urls.some((u) => u.includes('/tesseract/') || u.includes('tesseract')), 'OCR file requested early')
  }],
  [16, 'Enter opens the top match', async ({ page }) => {
    await go(page, 'check/ingredients')
    await page.fill('input[type=search]', 'lecit')
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid=ingredient-card][data-name="Lecithin"]')
  }],
])
