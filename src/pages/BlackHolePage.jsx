import { useEffect, useState } from 'react'
import AppScreen from '../components/layout/AppScreen'
import BottomNav from '../components/layout/BottomNav'
import BackRow from '../components/ui/BackRow'
import Kicker from '../components/ui/Kicker'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { EmptyView } from '../components/ui/DataView'
import { BlackHole } from '../components/ui/Celestial'
import { useGoals } from '../store/GoalStore'
import { useAsync } from '../hooks/useAsync'
import { friendlyError } from '../lib/errors'
import styles from './BlackHolePage.module.css'

const fmtDate = (iso) => (iso ? iso.slice(0, 10).replaceAll('-', '.') : '')

// 블랙홀 보관함 — 보관된 행성 조회 + 선택 복원(되살리기). 영구 삭제 없음.
export default function BlackHolePage() {
  const { loadBlackholePlanets, restorePlanets } = useGoals()
  const { status, data, error, run } = useAsync(loadBlackholePlanets)
  const [selected, setSelected] = useState(() => new Set())
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    run().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const items = data || []
  const toggle = (id) =>
    setSelected((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

  const restore = async () => {
    if (selected.size === 0 || restoring) return
    setRestoring(true)
    try {
      await restorePlanets([...selected])
      setSelected(new Set())
      await run() // 목록 재로드(복원된 항목 제거)
    } catch {
      /* friendlyError 는 status=error 로 노출 */
    } finally {
      setRestoring(false)
    }
  }

  const loading = status === 'loading' || status === 'idle'

  return (
    <AppScreen padTop={22} seed={81} density={60} nav={<BottomNav />}>
      <BackRow label="내 우주" to="/app/universe" />

      <div className={styles.head}>
        <BlackHole size={84} />
        <h1 className={styles.title}>블랙홀</h1>
        <p className={styles.desc}>
          여기 보관된 행성은 사라지지 않아요.<br />언제든 다시 꺼낼 수 있어요.
        </p>
      </div>

      {loading ? (
        <p className={styles.loading}>블랙홀을 여는 중…</p>
      ) : status === 'error' ? (
        <p className={styles.error}>
          {friendlyError(error)} <button className={styles.retry} onClick={() => run().catch(() => {})}>다시 시도</button>
        </p>
      ) : items.length === 0 ? (
        <EmptyView title="아직 블랙홀이 비어 있어요" message="보완하며 보낸 행성이 여기 모여요." />
      ) : (
        <>
          <div className={styles.listHead}>
            <Kicker>보관된 행성</Kicker>
            <span className={styles.count}>{items.length}</span>
          </div>
          <Card pad="4px 4px" className={styles.list}>
            {items.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className={`${styles.row} ${selected.has(p.id) ? styles.rowOn : ''} ${i === items.length - 1 ? styles.rowLast : ''}`}
                onClick={() => toggle(p.id)}
                aria-pressed={selected.has(p.id)}
              >
                <span className={styles.tag}>행성</span>
                <span className={styles.body}>
                  <span className={styles.name}>{p.symbol ? `${p.symbol} ` : ''}{p.name}{p.galaxyName ? ` · ${p.galaxyName}` : ''}</span>
                </span>
                <span className={styles.date}>{fmtDate(p.created_at)}</span>
              </button>
            ))}
          </Card>

          <div className={styles.spacer} />
          <Button fullWidth onClick={restore} disabled={selected.size === 0 || restoring}>
            {restoring ? '되살리는 중…' : `되살리기 — 우주로 복귀${selected.size ? ` (${selected.size})` : ''} ▸`}
          </Button>
        </>
      )}
    </AppScreen>
  )
}
