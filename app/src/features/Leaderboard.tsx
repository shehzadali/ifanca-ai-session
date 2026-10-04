import { useCallback, useEffect, useState } from 'react'
import Avatar from '../components/Avatar'
import { boardConfigured, Refused, resetBoard, topTen, watchBoard, type Entry } from '../lib/board'

const POLL_MS = 5000

export default function Leaderboard(_: { params: string[] }) {
  const [entries, setEntries] = useState<Entry[] | null>(null)
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
      .then((e) => {
        setEntries(e)
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
          <h2 className="text-3xl font-semibold tracking-tight lg:text-[44px]">Room leaderboard</h2>
          <p className="mt-1 text-[15px] text-muted lg:text-xl">Quiz scores from The Halal Way. Top 10.</p>
        </div>
        {boardConfigured && (
          <p className="flex items-center gap-2 text-[14px] text-muted lg:text-lg" data-testid="live-status">
            <span className={`h-2.5 w-2.5 rounded-full ${live && reachable ? 'bg-brand' : 'bg-gold'}`} aria-hidden="true" />
            {!reachable ? 'Cannot reach the leaderboard. Retrying.' : live ? 'Live' : `Reconnecting. Checking every ${POLL_MS / 1000} seconds.`}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>
          {!boardConfigured && <p className="text-xl" data-testid="board-empty">The room leaderboard is not connected yet.</p>}
          {boardConfigured && entries === null && reachable && <p className="text-xl text-muted">Loading...</p>}
          {boardConfigured && entries?.length === 0 && (
            <p className="text-2xl lg:text-4xl" data-testid="board-empty">
              No scores yet. Scan the code to play.
            </p>
          )}
          {entries && entries.length > 0 && (
            <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card" data-testid="board">
              {entries.map((e, i) => (
                <li key={e.id} className="flex items-center gap-4 px-4 py-1 lg:px-6 lg:py-1.5" data-testid="board-row">
                  <span className="w-10 shrink-0 text-2xl leading-tight font-semibold text-muted tabular-nums lg:w-14 lg:text-[34px]" data-testid="board-rank">
                    {i + 1}
                  </span>
                  <Avatar id={e.avatar} name={e.name} size={40} />
                  <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3">
                    <span className="truncate text-2xl leading-tight font-semibold lg:text-[34px] lg:leading-[1.15]" data-testid="board-name">
                      {e.name}
                    </span>
                    {e.level && <span className="text-[14px] text-muted lg:text-lg">{e.level}</span>}
                  </span>
                  <span className="shrink-0 text-2xl leading-tight font-bold text-brand tabular-nums lg:text-[36px]" data-testid="board-score">
                    {e.score}
                    <span className="text-[15px] font-medium text-muted lg:text-xl"> of 18</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <aside className="rounded-2xl border border-line bg-card p-4 text-center lg:p-5" data-testid="qr-panel">
          <p className="text-xl font-semibold lg:text-2xl">Scan to play</p>
          <img src="/qr.svg" alt="QR code for The Halal Way" className="mx-auto mt-3 w-full max-w-[260px]" data-testid="qr" />
          {qr?.url && <p className="mt-2 text-[15px] font-medium break-all lg:text-lg">{qr.url.replace(/^https:\/\//, '')}</p>}
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
