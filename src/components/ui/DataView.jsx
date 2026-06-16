import styles from './DataView.module.css'
import Button from './Button'

export function Spinner() {
  return <div className={styles.spinner} role="status" aria-label="불러오는 중" />
}

// 로딩: 카드형 데이터는 스켈레톤(실제 개수와 비슷하게)
export function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="불러오는 중">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.skelLine} />
      ))}
    </div>
  )
}

// 에러: 원인 메시지(사용자 친화) + 다시 시도
export function ErrorView({ message = '문제가 생겼어요.', onRetry }) {
  return (
    <div className={styles.state} role="alert">
      <svg className={styles.icon} width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16.5" x2="12" y2="16.5" />
      </svg>
      <p className={styles.msg}>{message}</p>
      {onRetry && <Button variant="ghost" onClick={onRetry}>다시 시도</Button>}
    </div>
  )
}

// 빈: 안내 + 다음 행동 유도(CTA)
export function EmptyView({ title = '아직 비어 있어요', message, action }) {
  return (
    <div className={styles.state}>
      <svg className={styles.icon} width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2.8l2.4 5.3 5.5.5-4.2 3.8 1.2 5.5L12 15.4l-4.9 2.5 1.2-5.5L4.1 8.6l5.5-.5z" />
      </svg>
      <div className={styles.title}>{title}</div>
      {message && <p className={styles.msg}>{message}</p>}
      {action}
    </div>
  )
}

// 4상태 캡슐 — 로딩 → 에러 → 빈 → 성공 순서로 분기.
// status: 'idle' | 'loading' | 'error' | 'success'
// 반복되는 비동기 화면은 이 컴포넌트 하나로 4상태를 일관 처리한다.
export default function DataView({
  status,
  data,
  error,
  onRetry,
  loading,
  empty,
  isEmpty = (d) => !d || (Array.isArray(d) && d.length === 0),
  children,
}) {
  if (status === 'loading' || status === 'idle') {
    return loading ?? <LoadingSkeleton />
  }
  if (status === 'error') {
    return <ErrorView message={error} onRetry={onRetry} />
  }
  if (isEmpty(data)) {
    return empty ?? <EmptyView />
  }
  return children(data)
}
