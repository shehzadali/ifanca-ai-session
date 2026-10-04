// On-device text recognition with Tesseract.js. Every file loads from this app's /tesseract/ folder.
// The photo never leaves the device.
import type { Worker } from 'tesseract.js'

type Progress = (fraction: number, status: string) => void

let worker: Promise<Worker> | null = null
let onProgress: Progress = () => {}

function getWorker(): Promise<Worker> {
  if (!worker) {
    worker = import('tesseract.js').then(({ createWorker }) =>
      createWorker('eng', 1, {
        workerPath: '/tesseract/worker.min.js',
        corePath: '/tesseract/',
        langPath: '/tesseract/lang',
        workerBlobURL: false,
        logger: (m) => onProgress(m.progress ?? 0, m.status ?? ''),
      }),
    )
    worker.catch(() => (worker = null))
  }
  return worker
}

// Phone photos are large. A long side of 2000px is enough for label text and much faster.
async function shrink(file: Blob): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height))
    if (scale === 1) return file
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), 'image/png'))
  } catch {
    return file
  }
}

export async function readText(file: Blob, progress: Progress): Promise<string> {
  onProgress = progress
  progress(0, 'loading')
  const w = await getWorker()
  const image = await shrink(file)
  const { data } = await w.recognize(image)
  return data.text.trim()
}
