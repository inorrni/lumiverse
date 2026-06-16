import * as React from 'react'
import { LUM, Screen, StarField, BottomNav, BackRow, Planet, Kicker, ClarityBar, HairCard, Annot, BlackHole, RadioRow, GhostBtn, StarIcon } from '../lumiverse-ui'

function PlanetStarRow({ title, done, count, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: last ? 'none' : `1px solid ${LUM.lineSoft}` }}>
      <StarIcon filled={done} size={19} />
      <span style={{ flex: 1, fontSize: 14, fontWeight: done ? 700 : 400, color: done ? LUM.txtHi : LUM.txtMid }}>{title}</span>
      <span style={{ fontFamily: LUM.mono, fontSize: 11.5, color: LUM.txtLow, whiteSpace: 'nowrap', flex: 'none' }}>{done ? '완료' : count}</span>
    </div>
  );
}

export default function ScrPlanetDetail() {
  return (
    <Screen padTop={22} nav={<BottomNav active="우주" />}>
      <StarField seed={51} density={70} />
      <BackRow label="내 우주" right={
        <div style={{ display: 'flex', gap: 16, color: LUM.txtMid }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"></path></svg>
          <BlackHole size={17} />
        </div>
      } />

      <div style={{ textAlign: 'center', margin: '6px 0 20px' }}>
        <Planet size={92} style={{ margin: '14px auto 18px' }} />
        <div style={{ fontFamily: LUM.serif, fontWeight: 600, fontSize: 23 }}>단어 외우기</div>
        <div style={{ fontSize: 12, color: LUM.txtLow, marginTop: 5 }}>영어 공부하기 · D-30</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <Kicker size={10}>선명도</Kicker>
        <ClarityBar pct={62} />
        <span style={{ fontFamily: LUM.mono, fontSize: 13 }}>62%</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Kicker size={10.5}>오늘의 별</Kicker>
        <span style={{ fontFamily: LUM.mono, fontSize: 11.5, color: LUM.txtMid, whiteSpace: 'nowrap', flex: 'none' }}>3 / 5 완료</span>
      </div>
      <HairCard pad={'2px 16px'} style={{ marginTop: 9 }}>
        <PlanetStarRow title="단어 30개 외우기" done />
        <PlanetStarRow title="예문 만들기" done />
        <PlanetStarRow title="플래시 카드 복습" done />
        <PlanetStarRow title="복습 테스트 10분" done={false} count="0/1" />
        <PlanetStarRow title="단어장 정리" done={false} count="0/1" last />
      </HairCard>

      <div style={{ display: 'flex', alignItems: 'center', gap: 22, margin: '16px 2px 0' }}>
        <Kicker size={10.5}>강도</Kicker>
        <RadioRow label="살살" />
        <RadioRow label="스파르타" on />
      </div>

      <div style={{ flex: 1 }}></div>
      <GhostBtn>＋&ensp;별 추가</GhostBtn>
      <Annot style={{ textAlign: 'center', marginTop: 10 }}>체크 → PATCH /stars/:id/check · 50% 활성화 / 100% 또렷<br />◍ 폐기 = 블랙홀 보존(삭제 아님)</Annot>
    </Screen>
  );
}
