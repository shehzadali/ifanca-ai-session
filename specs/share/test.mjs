import { assert, go, noSideScroll, run, tapTargets } from '../test-lib.mjs'

const RECIPE = 'recipes/beef-pasanday'
const LESSON = 'learn/what-is-halal'
const btn = (page) => page.getByRole('button', { name: 'Share' })

// Replaces navigator.share for the page. mode: 'record', 'abort', or 'none' (no Web Share API).
async function stubShare(page, mode) {
  await page.evaluate((m) => {
    window.__shares = []
    if (m === 'none') {
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    } else {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: async (data) => {
          window.__shares.push(data)
          if (m === 'abort') throw new DOMException('closed', 'AbortError')
        },
      })
    }
  }, mode)
}

await run('share', [
  [1, 'Share on a recipe page', async ({ page }) => {
    await go(page, RECIPE)
    await page.waitForSelector('[data-testid=ingredients]')
    assert((await btn(page).count()) === 1, 'no button')
  }],
  [2, 'Share on a lesson page', async ({ page }) => {
    await go(page, LESSON)
    await page.waitForSelector('[data-testid=lesson-text]')
    assert((await btn(page).count()) === 1, 'no button')
  }],
  [3, 'Web Share on a recipe: title, text with source, app link', async ({ page }) => {
    await go(page, RECIPE)
    await stubShare(page, 'record')
    await btn(page).click()
    const s = await page.evaluate(() => window.__shares)
    assert(s.length === 1, `${s.length} calls`)
    assert(s[0].title === 'Beef Pasanday', s[0].title)
    assert(s[0].text.includes('https://ifanca.org/resources/beef-pasanday/') && s[0].text.includes("IFANCA's public content"), s[0].text)
    assert(s[0].url.endsWith('/#/recipes/beef-pasanday'), s[0].url)
    return s[0].text
  }],
  [4, 'Web Share on a lesson', async ({ page }) => {
    await go(page, LESSON)
    await stubShare(page, 'record')
    await btn(page).click()
    const s = await page.evaluate(() => window.__shares)
    assert(s.length === 1 && s[0].title === 'What is halal?' && s[0].url.endsWith('/#/learn/what-is-halal'), JSON.stringify(s))
    assert(s[0].text.includes('https://ifanca.org/faqs/what-is-halal/'), s[0].text)
  }],
  [5, 'No Web Share: copies the link', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    await go(page, RECIPE)
    await stubShare(page, 'none')
    await btn(page).click()
    await page.waitForSelector('text=Link copied')
    const clip = await page.evaluate(() => navigator.clipboard.readText())
    assert(clip.endsWith('/#/recipes/beef-pasanday'), clip)
  }],
  [6, 'Closing the share sheet does nothing', async ({ page }) => {
    await page.evaluate(() => navigator.clipboard.writeText('unchanged'))
    await go(page, LESSON)
    await stubShare(page, 'abort')
    await btn(page).click()
    await page.waitForTimeout(300)
    assert((await page.textContent('[data-testid=share-note]')).trim() === '', 'message shown')
    assert((await page.evaluate(() => navigator.clipboard.readText())) === 'unchanged', 'clipboard changed')
  }],
  [7, 'No Web Share and no clipboard: a selected field', async ({ newPage, setPage }) => {
    const page = await newPage()
    setPage(page)
    await go(page, RECIPE)
    await stubShare(page, 'none')
    await page.evaluate(() =>
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('blocked')) } }),
    )
    await btn(page).click()
    const field = page.locator('[data-testid=share-field]')
    await field.waitFor()
    assert((await field.inputValue()).endsWith('/#/recipes/beef-pasanday'), 'value')
    const selected = await page.evaluate(() => {
      const f = document.querySelector('[data-testid=share-field]')
      return document.activeElement === f || f.selectionEnd - f.selectionStart === f.value.length
    })
    assert(selected, 'not selected')
  }],
  [8, '390px layout and button size', async ({ page }) => {
    for (const h of [RECIPE, LESSON]) {
      await go(page, h)
      await noSideScroll(page)
      await tapTargets(page)
    }
  }],
])
