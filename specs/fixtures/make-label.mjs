// Renders a printed ingredient label to specs/fixtures/label.png for OCR tests.
import { createRequire } from 'node:module'
const require = createRequire(new URL('../../app/package.json', import.meta.url))
const { chromium } = require('playwright')
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 900, height: 320 } })
await p.setContent(`<body style="margin:0;background:#fff;font:600 34px/1.4 Arial, sans-serif;padding:30px;color:#111">
INGREDIENTS: SUGAR, GELATIN, SOY LECITHIN, SALT, NATURAL FLAVORS.</body>`)
await p.screenshot({ path: new URL('./label.png', import.meta.url).pathname })
await b.close()
console.log('wrote specs/fixtures/label.png')
