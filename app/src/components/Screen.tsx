import type { ReactNode } from 'react'
import { BackIcon } from './Icons'

// Section color for the header band. Full class names, so Tailwind keeps them.
const TONES = {
  learn: 'bg-learn',
  product: 'bg-product',
  ingredients: 'bg-ingredients',
  recipes: 'bg-recipes',
  plan: 'bg-plan',
  read: 'bg-read',
} as const
export type Tone = keyof typeof TONES

type Props = {
  title: string
  tone: Tone
  back?: { href: string; label: string }
  children: ReactNode
}

export default function Screen({ title, tone, back, children }: Props) {
  return (
    <section>
      <div className={`relative overflow-hidden rounded-3xl ${TONES[tone]} px-5 pt-4 pb-5 text-white shadow-sm`}>
        <div className="geo absolute inset-0 opacity-[0.16]" aria-hidden="true" />
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10" aria-hidden="true" />
        {back && (
          <a href={back.href} className="relative -ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-[14px] font-semibold text-white/90">
            <BackIcon size={18} />
            {back.label}
          </a>
        )}
        <h2 className={`relative text-[26px] leading-tight font-bold tracking-tight ${back ? '' : 'pt-2'}`}>{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}
