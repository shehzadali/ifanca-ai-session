// Copies the Tesseract.js files the app needs into public/tesseract/ so OCR runs from the app's own origin.
// Runs before dev and build. The output folder is not committed.
import fs from 'node:fs'
import path from 'node:path'

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname))
const out = path.join(root, 'public', 'tesseract')
const files = [
  ['node_modules/tesseract.js/dist/worker.min.js', 'worker.min.js'],
  // LSTM-only cores. tesseract.js picks one at run time based on the browser's SIMD support.
  ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js', 'tesseract-core-lstm.wasm.js'],
  ['node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js'],
  ['node_modules/tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js', 'tesseract-core-relaxedsimd-lstm.wasm.js'],
  ['node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', 'lang/eng.traineddata.gz'],
]

fs.mkdirSync(path.join(out, 'lang'), { recursive: true })
for (const [from, to] of files) fs.copyFileSync(path.join(root, from), path.join(out, to))
console.log(`copied ${files.length} Tesseract files to public/tesseract/`)
