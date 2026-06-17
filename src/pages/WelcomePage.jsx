import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import Kicker from '../components/ui/Kicker'
import TextInput from '../components/ui/TextInput'
import Button from '../components/ui/Button'
import { Sparkle } from '../components/ui/icons'
import { useAuth } from '../store/AuthStore'
import styles from './WelcomePage.module.css'

const MAX = 12

// 가입 후 닉네임 설정 — 닉네임을 lumiverse_profiles 에 저장하고 목표 설정(/mode)으로.
export default function WelcomePage() {
  const navigate = useNavigate()
  const { updateNickname } = useAuth()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    const text = name.trim()
    if (text.length < 2) { setError('2자 이상 입력해 주세요.'); return }
    if (text.length > MAX) { setError(`${MAX}자 이내로 입력해 주세요.`); return }
    setSaving(true)
    const { error: err } = await updateNickname(text)
    setSaving(false)
    if (err) { setError('저장에 실패했어요. 다시 시도해 주세요.'); return }
    navigate('/mode')
  }

  return (
    <AppScreen padTop={48} seed={31} density={70}>
      <div className={styles.head}>
        <Sparkle size={20} className={styles.spark} />
        <Kicker>WELCOME</Kicker>
        <h1 className={styles.title}>뭐라고 불러드릴까요?</h1>
        <p className={styles.sub}>당신의 우주에서 부를 이름을 정해요.<br />언제든 바꿀 수 있어요.</p>
      </div>

      <TextInput
        label="닉네임"
        value={name}
        maxLength={MAX}
        placeholder="예: 별지기"
        error={error}
        right={`${name.length}/${MAX}`}
        onChange={(e) => { setName(e.target.value); if (error) setError('') }}
        onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
        autoFocus
      />

      <div className={styles.spacer} />
      <Button fullWidth onClick={submit} disabled={saving}>
        {saving ? '저장 중…' : '시작하기 ✦'}
      </Button>
    </AppScreen>
  )
}
