import Screen from '../components/Screen'
import { useProfile } from '../lib/profile'
import SignUp from './SignUp'

export default function ProfileScreen(_: { params: string[] }) {
  const profile = useProfile()
  return (
    <Screen tone="learn" title={profile ? 'Edit Profile' : 'Sign Up to Play'} back={{ href: '#/learn', label: 'Learn and Quiz' }}>
      <SignUp initial={profile} editing={!!profile} onDone={() => (window.location.hash = profile ? '#/' : '#/learn/quiz')} />
    </Screen>
  )
}
