import { useState } from 'react'
import { AVATARS, AvatarPicker } from '../components/Avatar'
import { nameTaken } from '../lib/board'
import { cleanProfileName, saveProfile, validProfileName, type Profile } from '../lib/profile'

// Name and avatar. Used before the first quiz and to edit the profile later.
export default function SignUp({ initial, onDone, editing = false }: { initial?: Profile | null; onDone: () => void; editing?: boolean }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [avatar, setAvatar] = useState(initial?.avatar ?? AVATARS[0].id)
  const ok = validProfileName(name)
  const [taken, setTaken] = useState(false)
  const [checking, setChecking] = useState(false)

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!ok) return
        setChecking(true)
        const isTaken = await nameTaken(name)
        setChecking(false)
        setTaken(isTaken)
        if (isTaken) return
        saveProfile({ name: cleanProfileName(name), avatar })
        onDone()
      }}
      data-testid="signup"
    >
      {!editing && (
        <p className="text-[15px] text-muted">Pick a name and an avatar to play the quiz and join the room leaderboard.</p>
      )}
      <label className="mt-4 block">
        <span className="mb-1 block text-[13px] font-semibold text-muted">Name</span>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setTaken(false)
          }}
          maxLength={24}
          autoComplete="nickname"
          autoCapitalize="words"
          className="h-12 w-full rounded-2xl border border-line bg-card shadow-sm px-4 text-[17px] outline-none focus:border-brand"
          data-testid="profile-name"
        />
      </label>
      {taken && (
        <p className="mt-1 text-[14px] font-semibold text-danger" data-testid="name-taken">
          That name is already on the room leaderboard. Pick another name.
        </p>
      )}
      {name.trim() && !ok && (
        <p className="mt-1 text-[13px] text-muted">
          Use 2 to 20 letters or numbers. Spaces, hyphens, apostrophes, periods, and underscores are fine.
        </p>
      )}
      <p className="mt-4 mb-2 text-[13px] font-semibold text-muted">Avatar</p>
      <AvatarPicker value={avatar} onChange={setAvatar} />
      <p className="mt-4 text-[13px] text-muted">
        Your name and avatar show on the room leaderboard. Saved on this device. No password.
      </p>
      <button
        type="submit"
        disabled={!ok || checking}
        className="mt-3 h-12 w-full rounded-xl bg-brand font-bold text-on-brand disabled:opacity-40"
      >
        {editing ? 'Save profile' : 'Start playing'}
      </button>
    </form>
  )
}
