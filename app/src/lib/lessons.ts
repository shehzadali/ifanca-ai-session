// Paragraph and list structure from the cached FAQ HTML. Joining every text with one space gives "answer".
export type Block = { type: 'p'; text: string } | { type: 'ul' | 'ol'; items: string[] }

export type Faq = { question: string; answer: string; blocks?: Block[]; url: string }

export type Lesson = Faq & { slug: string; section: string; minutes: number }

const F = 'https://ifanca.org/faqs/'

// Lesson order. "What is halal?" comes first. Grouping is by topic only. The text is not changed.
const SECTIONS: [string, string[]][] = [
  ['Halal basics', ['what-is-halal', 'what-is-the-verdict-on-halal-and-haram-lists', 'are-kosher-products-halal', 'what-is-halal-certification']],
  [
    'Ingredients',
    [
      'may-we-eat-gelatin',
      'is-lecithin-halal',
      'are-mono-and-diglycerides-halal',
      'what-is-the-source-of-rennet',
      'isnt-all-cheese-halal',
      'is-yellow-no-5-halal',
      'is-chocolate-liquor-haram',
    ],
  ],
  ['Eating out', ['may-i-eat-in-fast-food-restaurants', 'may-i-eat-the-food-served-on-airlines']],
  [
    'Certification for companies',
    [
      'why-do-i-need-halal-certification',
      'what-is-the-benefit-of-ifanca-halal-certification',
      'what-is-the-market-for-halal-certified-products',
      'what-are-the-fees-for-certification',
      'what-certification-schemes-does-ifanca-follow',
      'how-does-iso-9000-fit-in-with-halal-certification',
      'where-do-i-find-halal-certified-ingredients',
    ],
  ],
  [
    'IFANCA policies',
    [
      'can-ifanca-refuse-to-grant-a-halal-certificate',
      'is-ifancas-certification-process-impartial',
      'how-can-i-request-information-file-a-complaint-or-submit-an-appeal',
      'what-is-the-policy-for-maintaining-extending-and-renewing-the-halal-certificate',
      'what-is-the-policy-on-suspension-withdrawal-or-reduction-of-the-halal-certification',
      'what-is-the-procedure-for-suspension-withdrawal-reduction-maintenance-extension-or-renewal-of-a-halal-certificate',
    ],
  ],
]

export function slugOf(url: string): string {
  return url.replace(F, '').replace(/\/$/, '')
}

export function buildLessons(faqs: Faq[]): Lesson[] {
  const bySlug = new Map(faqs.map((f) => [slugOf(f.url), f]))
  const out: Lesson[] = []
  const add = (f: Faq, section: string) =>
    out.push({ ...f, slug: slugOf(f.url), section, minutes: Math.max(1, Math.round(f.answer.split(/\s+/).length / 200)) })
  for (const [section, slugs] of SECTIONS) {
    for (const s of slugs) {
      const f = bySlug.get(s)
      if (f) {
        add(f, section)
        bySlug.delete(s)
      }
    }
  }
  // Any FAQ not placed above still gets a lesson.
  for (const f of bySlug.values()) add(f, 'More questions')
  return out
}

// The source structure, with long source paragraphs split at sentence breaks for a phone screen.
// Older data without blocks falls back to one paragraph.
export function lessonBlocks(f: Faq): Block[] {
  const blocks: Block[] = f.blocks?.length ? f.blocks : [{ type: 'p', text: f.answer }]
  return blocks.flatMap((b): Block[] => (b.type === 'p' ? paragraphs(b.text).map((text) => ({ type: 'p', text })) : [b]))
}

// Sentence breaks only, then about 60 words per paragraph. Joining paragraphs with one space
// gives back the original answer exactly.
export function paragraphs(answer: string): string[] {
  const sentences = answer.split(/(?<=[.?!])\s+(?=[A-Z])/)
  const out: string[] = []
  let current = ''
  for (const s of sentences) {
    current = current ? `${current} ${s}` : s
    if (current.split(/\s+/).length >= 60) {
      out.push(current)
      current = ''
    }
  }
  if (current) out.push(current)
  return out
}
