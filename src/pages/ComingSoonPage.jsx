import AppScreen from '../components/layout/AppScreen'
import BottomNav from '../components/layout/BottomNav'
import { EmptyView } from '../components/ui/DataView'

// 하단 내비의 아직 안 만든 탭(투두·블랙홀·점검·설정) 공통 자리표시 화면.
// 내비는 살아있어 탐색은 되고, 본문만 "준비 중".
export default function ComingSoonPage({ title = '준비 중이에요' }) {
  return (
    <AppScreen padTop={20} nav={<BottomNav />}>
      <EmptyView title={title} message="이 화면은 곧 찾아올 예정이에요." />
    </AppScreen>
  )
}
