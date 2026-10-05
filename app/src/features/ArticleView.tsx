import { useEffect, useState } from 'react'
import RemoteImage from '../components/RemoteImage'
import Screen from '../components/Screen'
import ShareButton from '../components/ShareButton'
import { formatDate } from '../lib/data'

export type ArticleMeta = { title: string; url: string; type: string; theme: string; date: string; first_40_words: string }

type Block =
  | { type: 'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'quote' | 'caption'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'table'; rows: string[][] }
  | { type: 'img'; src: string; alt: string }
  | { type: 'hr' }

type Body = { blocks: Block[] }
type Load = { status: 'loading' } | { status: 'ready'; body: Body } | { status: 'missing' } | { status: 'offline' } | { status: 'error' }

export const articleSlug = (url: string) => url.replace(/\/$/, '').split('/').pop() ?? ''

// The article as published, read from its cached page. Saved on the device the first time it opens.
export default function ArticleView({ article, themeLabel }: { article: ArticleMeta; themeLabel: string }) {
  const slug = articleSlug(article.url)
  const [load, setLoad] = useState<Load>({ status: 'loading' })

  useEffect(() => {
    let live = true
    setLoad({ status: 'loading' })
    fetch(`/data/articles/${slug}.json`)
      .then(async (r) => {
        if (r.status === 404) return { status: 'missing' } as const
        if (!r.ok) throw new Error(String(r.status))
        return { status: 'ready', body: (await r.json()) as Body } as const
      })
      .catch(() => ({ status: navigator.onLine ? 'error' : 'offline' }) as const)
      .then((l) => live && setLoad(l))
    return () => {
      live = false
    }
  }, [slug])

  const attribution = (where: string) => (
    <div className="rounded-2xl bg-read/10 p-3 text-[14px] dark:bg-read/30" data-testid={`attribution-${where}`}>
      <p className="font-semibold">
        Published {formatDate(article.date)}. {article.type}. Theme: {themeLabel}.
      </p>
      <p className="mt-0.5 text-muted">From IFANCA's resource library. Text as published.</p>
      <a href={article.url} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center font-semibold text-brand underline">
        Read on ifanca.org
      </a>
    </div>
  )

  return (
    <Screen title={article.title} tone="read" back={{ href: '#/read', label: 'All articles' }}>
      {attribution('top')}
      <ShareButton title={article.title} sourceUrl={article.url} path={`/#/read/${slug}`} />

      <div className="mt-5" data-testid="article-body">
        {load.status === 'loading' && <p className="text-muted">Loading the article...</p>}
        {load.status === 'offline' && (
          <p className="rounded-2xl border border-dashed border-line p-4" data-testid="article-offline">
            This article is not saved on this device yet. Open it once while online to read it offline.
          </p>
        )}
        {load.status === 'error' && <p>The article could not load. Try again, or read it on ifanca.org.</p>}
        {load.status === 'missing' && (
          <div data-testid="article-missing">
            <p className="text-[17px] leading-relaxed">{article.first_40_words}</p>
            <p className="mt-2 text-[14px] text-muted">The full text of this article was not in the copy of the website. Read it on ifanca.org.</p>
          </div>
        )}
        {load.status === 'ready' && (
          <div className="space-y-4 text-[17px] leading-relaxed text-ink">
            {load.body.blocks.map((b, i) => (
              <BlockView key={i} b={b} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">{attribution('bottom')}</div>
    </Screen>
  )
}

function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case 'p':
      return (
        <p className="whitespace-pre-line" data-block="p">
          {b.text}
        </p>
      )
    case 'h2':
      return <h3 className="pt-2 text-[22px] leading-snug font-bold" data-block="h2">{b.text}</h3>
    case 'h3':
      return <h4 className="pt-1 text-[19px] leading-snug font-bold" data-block="h3">{b.text}</h4>
    case 'h4':
      return <h5 className="text-[17px] font-bold" data-block="h4">{b.text}</h5>
    case 'h5':
      return <h6 className="text-[16px] font-bold" data-block="h5">{b.text}</h6>
    case 'quote':
      return (
        <blockquote className="border-l-4 border-read pl-3 whitespace-pre-line text-ink italic" data-block="quote">
          {b.text}
        </blockquote>
      )
    case 'caption':
      return (
        <p className="-mt-2 text-[14px] whitespace-pre-line text-muted" data-block="caption">
          {b.text}
        </p>
      )
    case 'ul':
    case 'ol': {
      const List = b.type
      return (
        <List className={`space-y-1.5 pl-6 ${b.type === 'ol' ? 'list-decimal' : 'list-disc'} marker:text-read`} data-block={b.type}>
          {b.items.map((item, j) => (
            <li key={j} className="pl-1 whitespace-pre-line">
              {item}
            </li>
          ))}
        </List>
      )
    }
    case 'table':
      return (
        <div className="overflow-x-auto rounded-xl border border-line" data-block="table">
          <table className="min-w-full text-[14px] leading-snug">
            <tbody>
              {b.rows.map((row, r) => (
                <tr key={r} className="border-b border-line last:border-0">
                  {row.map((cell, c) => (
                    <td key={c} className="px-3 py-2 align-top whitespace-pre-line">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'img':
      // Online only, with a shimmer while loading. Offline or on failure the image is left out.
      return (
        <RemoteImage
          src={b.src}
          alt={b.alt}
          frame="w-full rounded-xl"
          loadingClass="min-h-[180px]"
          imgClass="h-auto w-full"
          testId="article-img"
        />
      )
    case 'hr':
      return <hr className="border-line" data-block="hr" />
  }
}
