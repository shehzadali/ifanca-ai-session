// Renders the app icons from public/icon.svg. Run by hand after changing the icon. Outputs are committed.
// The icon is original artwork for this demo. It does not use IFANCA's logo or the Crescent-M mark.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const pub = path.join(path.dirname(path.dirname(new URL(import.meta.url).pathname)), 'public')
const svg = fs.readFileSync(path.join(pub, 'icon.svg'), 'utf8')
const art = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<rect[^>]*\/>/, '')
// Full-bleed square for maskable and Apple icons. The art is scaled into the central safe zone.
const square = (scale) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#0f6b55"/>` +
  `<g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${art}</g></svg>`

const outputs = [
  ['pwa-192x192.png', 192, svg],
  ['pwa-512x512.png', 512, svg],
  ['maskable-512x512.png', 512, square(0.72)],
  ['apple-touch-icon.png', 180, square(0.85)],
  ['favicon-32x32.png', 32, svg],
]

const browser = await chromium.launch()
const page = await browser.newPage()
for (const [file, size, source] of outputs) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<style>*{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${source}`)
  await page.screenshot({ path: path.join(pub, file), omitBackground: true })
  console.log(`wrote public/${file}`)
}
await browser.close()
