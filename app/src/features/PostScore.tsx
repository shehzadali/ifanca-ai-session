import { useEffect, useState } from 'react'
import { boardConfigured, cleanName, postScore, readBoard, Refused, validName } from '../lib/board'

type Status = 'idle' | 'sending' | 'posted' | 'failed' | 'refused'

export default function PostScore({ total, max, level }: { total: number; max: number; level: string | null }) {
  const [name, setName] = useState(() => (boardConfigured ? readBoard().name : ''))
  const [status, setStatus] = useState<Status>('idle')
  const [postedAs, setPostedAs] = useState('')

  // A pending post that goes through later (for example when the device comes back online) updates this screen.
  useEffect(() => {
    const onBoard = () => {
      const b = readBoard()
      if (!b.pending && b.postedTotal !== null && status === 'failed') {
        setPostedAs(b.name)
        setStatus('posted')
      }
    }
    window.addEventListener('thw-board', onBoard)
    return () => window.removeEventListener('thw-board', onBoard)
  }, [status])

  if (!boardConfigured) return null

  const send = async () => {
    setStatus('sending')
    try {
      await postScore(name, total, level)
      setPostedAs(cleanName(name))
      setStatus('posted')
    } catch (e) {
      setStatus(e instanceof Refused ? 'refused' : 'failed')
    }
  }

  const ok = validName(name)

  return (
    <div className="mt-5 rounded-xl border border-line bg-paper p-4 text-left" data-testid="post-score">
      <p className="font-semibold">Room leaderboard</p>
      <p className="mt-1 text-[15px]">
        Your total is {total} of {max}.
      </p>
      <label className="mt-3 block">
        <span className="mb-1 block text-[13px] font-medium text-muted">First name</span>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (status !== 'sending') setStatus('idle')
          }}
          maxLength={24}
          autoComplete="given-name"
          enterKeyHint="send"
          className="h-12 w-full rounded-xl border border-line bg-card px-4 text-[17px] outline-none focus:border-brand"
          data-testid="board-name"
        />
      </label>
      {name.trim() && !ok && (
        <p className="mt-1 text-[13px] text-muted">Use 1 to 20 letters. Spaces, hyphens, apostrophes, and periods are fine.</p>
      )}
      <button
        type="button"
        disabled={!ok || status === 'sending'}
        onClick={send}
        className="mt-2 h-12 w-full rounded-xl bg-brand font-semibold text-on-brand disabled:opacity-40"
      >
        {status === 'sending' ? 'Posting...' : 'Post my score'}
      </button>
      <div aria-live="polite" data-testid="post-status">
        {status === 'posted' && <p className="mt-2 font-medium text-brand">Posted as {postedAs}.</p>}
        {status === 'refused' && <p className="mt-2">The leaderboard did not accept this name. Try another first name.</p>}
        {status === 'failed' && (
          <div className="mt-2">
            <p>Could not reach the leaderboard. Your score is saved on this device.</p>
            <button type="button" onClick={send} className="mt-2 h-11 w-full rounded-xl border border-line bg-card font-medium text-brand">
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
