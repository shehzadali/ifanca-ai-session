import { useState } from 'react'
import { signOut, useProfile } from '../lib/profile'
import Avatar from './Avatar'

// The profile part of Settings.
export default function ProfileBlock({ onNavigate }: { onNavigate: () => void }) {
  const profile = useProfile()
  const [confirm, setConfirm] = useState(false)

  if (!profile) {
    return (
      <div className="flex items-center gap-3">
        <Avatar size={44} />
        <div className="flex-1">
          <p className="text-[14px] text-muted">No profile yet. You need one to play the quiz.</p>
        </div>
        <a href="#/profile" onClick={onNavigate} className="flex h-11 items-center rounded-xl bg-brand px-4 font-bold text-on-brand">
          Sign up
        </a>
      </div>
    )
  }

  return (
    <div data-testid="profile-block">
      <div className="flex items-center gap-3">
        <Avatar id={profile.avatar} name={profile.name} size={52} />
        <p className="min-w-0 flex-1 truncate text-[18px] font-bold" data-testid="profile-name-shown">
          {profile.name}
        </p>
      </div>
      {confirm ? (
        <div className="mt-3 rounded-xl bg-paper p-3">
          <p className="text-[14px]">Sign out? Your profile and quiz progress on this device are removed. Your meal plan stays.</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setConfirm(false)} className="h-11 rounded-xl border border-line bg-card font-semibold">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                signOut()
                window.location.hash = '#/'
                window.location.reload()
              }}
              className="h-11 rounded-xl bg-ink font-semibold text-paper"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href="#/profile" onClick={onNavigate} className="flex h-11 items-center justify-center rounded-xl border border-line font-semibold text-brand">
            Edit profile
          </a>
          <button type="button" onClick={() => setConfirm(true)} className="h-11 rounded-xl border border-line font-semibold">
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
