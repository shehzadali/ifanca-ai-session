import { useCallback, useEffect, useRef, useState } from 'react'
import Avatar from '../components/Avatar'
import { boardConfigured, Refused, resetBoard, topTen, watchBoard, type Entry } from '../lib/board'

const POLL_MS = 5000

export default function Leaderboard(_: { params: string[] }) {
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [total, setTotal] = useState(0)
  // Rows whose score just arrived or changed get a short highlight.
  const seen = useRef<Map<string, string> | null>(null)
  const [fresh, setFresh] = useState<Set<string>>(new Set())
  const [live, setLive] = useState(false)
  const [reachable, setReachable] = useState(true)
  const [qr, setQr] = useState<{ url: string } | null>(null)

  useEffect(() => {
    fetch('/qr.json')
      .then((r) => r.json())
      .then(setQr)
      .catch(() => setQr(null))
  }, [])

  const load = useCallback(() => {
    topTen()
      .then(({ entries: e, total: t }) => {
        const before = seen.current
        const now = new Map(e.map((x) => [x.id, `${x.score}|${x.updated_at}`]))
        if (before) {
          const changed = new Set(e.filter((x) => before.get(x.id) !== now.get(x.id)).map((x) => x.id))
          if (changed.size) {
            setFresh(changed)
            window.setTimeout(() => setFresh(new Set()), 3000)
          }
        }
        seen.current = now
        setEntries(e)
        setTotal(t)
        setReachable(true)
      })
      .catch(() => setReachable(false))
  }, [])

  useEffect(() => {
    if (!boardConfigured) return
    load()
    const stop = watchBoard(load, setLive)
    // Backup for venues where the live connection is blocked.
    const timer = window.setInterval(load, POLL_MS)
    return () => {
      stop()
      window.clearInterval(timer)
    }
  }, [load])

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight lg:text-[clamp(2.25rem,6.2vh,4.5rem)] lg:leading-none">Room Leaderboard</h2>
          <p className="mt-1 text-[15px] text-muted lg:mt-2 lg:text-[clamp(1.1rem,2.6vh,1.9rem)]">
            Quiz scores from The Halal Way. Top 10.
            {boardConfigured && entries && (
              <span className="ml-2 font-bold text-ink" data-testid="player-count">
                {total} {total === 1 ? 'player' : 'players'}
              </span>
            )}
          </p>
        </div>
        {boardConfigured && (
          <p className="flex items-center gap-2 text-[14px] text-muted lg:text-[clamp(1rem,2.2vh,1.6rem)]" data-testid="live-status">
            <span className={`h-2.5 w-2.5 rounded-full ${live && reachable ? 'bg-brand' : 'bg-gold'}`} aria-hidden="true" />
            {!reachable ? 'Cannot reach the leaderboard. Retrying.' : live ? 'Live' : `Reconnecting. Checking every ${POLL_MS / 1000} seconds.`}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-6 lg:mt-[2.5vh] lg:grid-cols-[1fr_min(28vw,50vh)] lg:items-start lg:gap-[3vw]">
        <div>
          {!boardConfigured && <p className="text-xl" data-testid="board-empty">The room leaderboard is not connected yet.</p>}
          {boardConfigured && entries === null && reachable && <p className="text-xl text-muted">Loading...</p>}
          {boardConfigured && entries?.length === 0 && (
            <p className="text-2xl lg:text-[clamp(2rem,5vh,3.5rem)]" data-testid="board-empty">
              No scores yet. Scan the code to play.
            </p>
          )}
          {entries && entries.length > 0 && (
            <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card" data-testid="board">
              {entries.map((e, i) => (
                <li
                  key={e.id}
                  className={`flex items-center gap-4 px-4 py-1 lg:gap-[2vh] lg:px-6 lg:py-[0.55vh] ${fresh.has(e.id) ? 'flash' : ''}`}
                  data-testid="board-row"
                  data-fresh={fresh.has(e.id) || undefined}
                >
                  <span
                    className="w-10 shrink-0 text-2xl leading-tight font-semibold text-muted tabular-nums lg:w-[7vh] lg:text-[clamp(2rem,5.2vh,3.75rem)]"
                    data-testid="board-rank"
                  >
                    {i + 1}
                  </span>
                  <Avatar id={e.avatar} name={e.name} size={40} className="lg:h-[5.6vh] lg:w-[5.6vh]" />
                  <span className="flex min-w-0 flex-1 items-baseline gap-x-3">
                    <span
                      className="truncate text-2xl leading-tight font-semibold lg:text-[clamp(2rem,5.2vh,3.75rem)] lg:leading-[1.15]"
                      data-testid="board-name"
                    >
                      {e.name}
                    </span>
                    {e.level && <span className="shrink-0 text-[14px] text-muted lg:text-[clamp(1rem,2.3vh,1.6rem)]">{e.level}</span>}
                  </span>
                  <span
                    className="shrink-0 text-2xl leading-tight font-bold text-brand tabular-nums lg:text-[clamp(2.1rem,5.4vh,4rem)]"
                    data-testid="board-score"
                  >
                    {e.score}
                    <span className="text-[15px] font-medium text-muted lg:text-[clamp(1rem,2.3vh,1.6rem)]"> of 18</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
          {entries && entries.length > 1 && (
            <p className="mt-2 text-[13px] text-muted lg:text-[clamp(0.9rem,1.8vh,1.2rem)]">Equal scores: the player who reached the score first ranks higher.</p>
          )}
        </div>

        <aside className="rounded-2xl border border-line bg-card p-4 text-center lg:p-[2.2vh]" data-testid="qr-panel">
          <p className="text-xl font-semibold lg:text-[clamp(1.5rem,3.6vh,2.6rem)]">Scan to play</p>
          <img src="/qr.svg" alt="QR code for The Halal Way" className="mx-auto mt-3 w-full max-w-[260px] lg:max-w-none" data-testid="qr" />
          {qr?.url && (
            <p className="mt-2 text-[15px] font-medium break-all lg:text-[clamp(1rem,2.4vh,1.7rem)]">{qr.url.replace(/^https:\/\//, '')}</p>
          )}
        </aside>
      </div>

      {boardConfigured && <ResetControl onCleared={load} />}
    </section>
  )
}

function ResetControl({ onCleared }: { onCleared: () => void }) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const clear = async () => {
    setBusy(true)
    setMessage('')
    try {
      await resetBoard(code.trim())
      setMessage('All scores cleared.')
      setCode('')
      onCleared()
    } catch (e) {
      setMessage(e instanceof Refused ? 'That code is not right.' : 'Could not reach the leaderboard. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-8 border-t border-line pt-3" data-testid="reset">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="min-h-11 px-1 text-[14px] text-muted underline"
      >
        Reset
      </button>
      {open && (
        <div className="mt-2 flex max-w-md flex-col gap-2 sm:flex-row">
          <label className="flex-1">
            <span className="sr-only">Reset code</span>
            {/* Hidden as typed, because this screen is on a projector. */}
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Reset code"
              autoComplete="off"
              className="h-12 w-full rounded-2xl border border-line bg-card shadow-sm px-4 text-[16px] outline-none focus:border-brand"
              data-testid="reset-code"
            />
          </label>
          <button
            type="button"
            disabled={!code.trim() || busy}
            onClick={clear}
            className="h-12 rounded-xl bg-ink px-4 font-medium text-paper disabled:opacity-40"
          >
            Clear all scores
          </button>
        </div>
      )}
      <p className="mt-2 text-[14px]" aria-live="polite" data-testid="reset-message">
        {message}
      </p>
    </div>
  )
}
