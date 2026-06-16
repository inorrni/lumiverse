import * as React from 'react'
import { LUM, Screen, StarField, BottomNav, BackRow, BlackHole, Kicker, HairCard, PrimaryBtn, Annot } from '../lumiverse-ui'

function BHRow({ tag, title, date, selected = false, last = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px', borderRadius: 8,
      border: selected ? `1px solid ${LUM.txtHi}` : '1px solid transparent',
      borderBottom: selected ? `1px solid ${LUM.txtHi}` : (last ? '1px solid transparent' : `1px solid ${LUM.lineSoft}`),
      background: selected ? 'rgba(236,231,220,0.05)' : 'transparent',
    }}>
      <span style={{ fontFamily: LUM.mono, fontSize: 10, letterSpacing: '0.1em', color: LUM.txtLow, border: `1px solid ${LUM.lineSoft}`, borderRadius: 3, padding: '3px 7px', flex: 'none' }}>{tag}</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: selected ? 700 : 400, color: selected ? LUM.txtHi : LUM.txtMid }}>{title}</span>
      <span style={{ fontFamily: LUM.mono, fontSize: 10.5, color: LUM.txtLow, whiteSpace: 'nowrap', flex: 'none' }}>{date}</span>
    </div>
  );
}

export default function ScrBlackhole() {
  return (
    <Screen padTop={22} nav={<BottomNav active="블랙홀" />}>
      <StarField seed={81} density={60} dim />
      <BackRow label="내 우주" />
      <div style={{ textAlign: 'center', margin: '4px 0 8px' }}>
        <BlackHole size={86} style={{ margin: '8px auto 14px' }} />
        <div style={{ fontFamily: LUM.serif, fontWeight: 600, fontSize: 25 }}>블랙홀</div>
        <p style={{ margin: '9px 0 0', fontSize: 12.5, color: LUM.txtMid, lineHeight: 1.65 }}>
          여기 보관된 목표와 행성은 사라지지 않아요.<br />언제든 다시 꺼낼 수 있어요.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '16px 2px 8px' }}>
        <Kicker size={10.5}>폐기 보관 · 목표 / 행성</Kicker>
        <span style={{ fontFamily: LUM.mono, fontSize: 11, color: LUM.txtLow }}>3</span>
      </div>
      <HairCard pad={'4px 4px'}>
        <BHRow tag="목표" title="매일 운동하기" date="2026.05.10" selected />
        <BHRow tag="행성" title="복습 10분 · 영어 공부하기" date="2026.04.21" />
        <BHRow tag="목표" title="독서 30권 읽기" date="2026.03.15" last />
      </HairCard>

      <div style={{ flex: 1 }}></div>
      <PrimaryBtn>되살리기&ensp;— 우주로 복귀&ensp;▸</PrimaryBtn>
      <Annot style={{ textAlign: 'center', marginTop: 10 }}>status=blackhole(보존) → active 복원 · 행성은 원 소속 목표로 귀속<br />보관 0 → "아직 블랙홀이 비어 있어요"</Annot>
    </Screen>
  );
}
