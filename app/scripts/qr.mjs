// Writes slides/qr.png (1000px) and slides/qr.svg for a URL, and records the URL in slides/qr-url.txt.
// Usage: node scripts/qr.mjs https://example.vercel.app
import fs from 'node:fs'
import path from 'node:path'
import QRCode from 'qrcode'

const url = process.argv[2]
if (!url || !/^https:\/\//.test(url)) {
  console.error('Usage: node scripts/qr.mjs https://<production-url>')
  process.exit(1)
}
const out = path.join(path.dirname(path.dirname(path.dirname(new URL(import.meta.url).pathname))), 'slides')
fs.mkdirSync(out, { recursive: true })
const options = { errorCorrectionLevel: 'M', margin: 2, color: { dark: '#1d2a26', light: '#ffffff' } }
await QRCode.toFile(path.join(out, 'qr.png'), url, { ...options, width: 1000 })
fs.writeFileSync(path.join(out, 'qr.svg'), await QRCode.toString(url, { ...options, type: 'svg' }))
fs.writeFileSync(path.join(out, 'qr-url.txt'), `${url}\n`)
console.log(`wrote slides/qr.png, slides/qr.svg, slides/qr-url.txt for ${url}`)
