import Screen from '../components/Screen'
import { useProfile } from '../lib/profile'
import SignUp from './SignUp'

export default function ProfileScreen(_: { params: string[] }) {
  const profile = useProfile()
  return (
    <Screen tone="learn" title={profile ? 'Edit profile' : 'Sign up to play'} back={{ href: '#/learn', label: 'Learn and quiz' }}>
      <SignUp initial={profile} editing={!!profile} onDone={() => (window.location.hash = profile ? '#/' : '#/learn/quiz')} />
    </Screen>
  )
}
