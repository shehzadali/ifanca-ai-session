// Appearance setting: system, light, or dark. Saved on the device and applied to <html data-theme>.
import { useEffect, useState } from 'react'
import { readStored, writeStored } from './storage'

export type ThemeChoice = 'system' | 'light' | 'dark'
const KEY = 'thw.theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

export function resolve(choice: ThemeChoice): 'light' | 'dark' {
  return choice === 'system' ? (media().matches ? 'dark' : 'light') : choice
}

export function applyTheme(choice: ThemeChoice) {
  const mode = resolve(choice)
  document.documentElement.dataset.theme = mode
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', mode === 'dark' ? '#0b1513' : '#0f6b55')
}

export function useTheme(): [ThemeChoice, (c: ThemeChoice) => void] {
  const [choice, setChoice] = useState<ThemeChoice>(() => readStored<ThemeChoice>(KEY, 'system'))
  useEffect(() => {
    applyTheme(choice)
    if (choice !== 'system') return
    const m = media()
    const onChange = () => applyTheme('system')
    m.addEventListener('change', onChange)
    return () => m.removeEventListener('change', onChange)
  }, [choice])
  return [
    choice,
    (c) => {
      writeStored(KEY, c)
      setChoice(c)
    },
  ]
}
