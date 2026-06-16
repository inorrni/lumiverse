import * as React from 'react'
import { LUM, Screen, StarField, BottomNav, BackRow, Kicker, PaperCard, StarIcon, Sparkle, GhostBtn, Annot } from '../lumiverse-ui'
import { TodayRow } from '../components/TodayRow'

export default function ScrToday() {
  return (
    <Screen padTop={22} nav={<BottomNav active="투두" />}>
      <StarField seed={61} density={80} />
      <BackRow label="내 우주" right={<Kicker size={10}>06.12 FRI</Kicker>} />
      <Kicker>TODAY'S STARS</Kicker>
      <h1 style={{ margin: '10px 0 4px', fontFamily: LUM.serif, fontWeight: 600, fontSize: 25 }}>오늘의 투두</h1>
      <div style={{ fontFamily: LUM.mono, fontSize: 12.5, color: LUM.txtMid, marginBottom: 16 }}>2 / 3 완료</div>

      <PaperCard pad={'4px 18px'}>
        <TodayRow title="단어 30개 외우기" sub="영어 공부하기 · 단어 외우기" done />
        <TodayRow title="쉐도잉 20분" sub="영어 공부하기 · 쉐도잉" done />
        <TodayRow title="운동 30분" sub="헬스 루틴 만들기 · 유산소" done={false} count="0 / 1" last />
      </PaperCard>

      <div style={{ textAlign: 'center', marginTop: 30, position: 'relative' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <StarIcon filled size={42} />
          <Sparkle size={9} style={{ position: 'absolute', top: -4, right: -12, opacity: 0.8 }} />
          <Sparkle size={6} style={{ position: 'absolute', bottom: 2, left: -13, opacity: 0.55 }} />
        </div>
        <div style={{ fontFamily: LUM.serif, fontSize: 19, fontWeight: 600, marginTop: 12 }}>완료! 별이 선명해졌어요</div>
        <div style={{ fontSize: 12.5, color: LUM.txtMid, marginTop: 7, lineHeight: 1.6 }}>별 하나가 잡음을 뚫고 또렷해졌어요.<br />행성 100%가 되면 — 펑, 또렷.</div>
      </div>

      <div style={{ flex: 1 }}></div>
      <GhostBtn>완료된 별 보기</GhostBtn>
      <Annot style={{ textAlign: 'center', marginTop: 10 }}>오늘 별 0 → "오늘 배정된 별이 없어요" / 실패 → 체크 롤백</Annot>
    </Screen>
  );
}
