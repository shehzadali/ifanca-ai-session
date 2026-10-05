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
      {back && (
        <a
          href={back.href}
          className="-ml-1 mb-1 inline-flex min-h-11 items-center gap-1 px-1 text-[15px] font-semibold text-brand"
          data-testid="back-link"
        >
          <BackIcon size={18} />
          {back.label}
        </a>
      )}
      <div className={`relative overflow-hidden rounded-3xl ${TONES[tone]} px-5 pt-5 pb-5 text-white shadow-sm`}>
        <div className="geo absolute inset-0 opacity-[0.16]" aria-hidden="true" />
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10" aria-hidden="true" />
        <h2 className="relative text-[26px] leading-tight font-bold tracking-tight">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}
