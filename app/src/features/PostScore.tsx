import { useCallback, useEffect, useState } from 'react'
import Avatar from '../components/Avatar'
import { boardConfigured, postScore, readBoard, Refused } from '../lib/board'
import { useProfile } from '../lib/profile'

type Status = 'sending' | 'posted' | 'failed' | 'refused'

// Posts the total to the room leaderboard as soon as a round ends. The score is already saved on the device.
export default function PostScore({ total, max, level }: { total: number; max: number; level: string | null }) {
  const profile = useProfile()
  const [status, setStatus] = useState<Status>('sending')

  const send = useCallback(() => {
    if (!profile) return
    setStatus('sending')
    postScore(profile.name, total, level, profile.avatar)
      .then(() => setStatus('posted'))
      .catch((e) => setStatus(e instanceof Refused ? 'refused' : 'failed'))
  }, [profile, total, level])

  useEffect(() => {
    if (boardConfigured) send()
  }, [send])

  // A pending post that goes through later, for example when the device is back online.
  useEffect(() => {
    const onBoard = () => {
      const b = readBoard()
      if (!b.pending && b.postedTotal !== null) setStatus((s) => (s === 'failed' ? 'posted' : s))
    }
    window.addEventListener('thw-board', onBoard)
    return () => window.removeEventListener('thw-board', onBoard)
  }, [])

  if (!boardConfigured || !profile) return null

  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-line bg-paper p-3 text-left" data-testid="post-score">
      <Avatar id={profile.avatar} name={profile.name} size={44} />
      <div className="min-w-0 flex-1" aria-live="polite" data-testid="post-status">
        <p className="font-bold">
          {profile.name}: {total} of {max}
        </p>
        {status === 'sending' && <p className="text-[14px] text-muted">Posting to the room leaderboard...</p>}
        {status === 'posted' && <p className="text-[14px] font-semibold text-brand">Posted to the room leaderboard.</p>}
        {status === 'refused' && (
          <p className="text-[14px]">The leaderboard did not accept this name. Change it in Settings, then play a round again.</p>
        )}
        {status === 'failed' && (
          <>
            <p className="text-[14px]">Saved on this device. It will post when you are back online.</p>
            <button type="button" onClick={send} className="mt-2 h-11 rounded-xl border border-line bg-card px-4 font-semibold text-brand">
              Try again now
            </button>
          </>
        )}
      </div>
    </div>
  )
}
