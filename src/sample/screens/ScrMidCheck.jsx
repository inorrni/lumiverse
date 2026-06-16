import * as React from 'react'
import { LUM, Screen, StarField, BottomNav, BackRow, Kicker, HairCard, Planet, Sparkle, PrimaryBtn, Annot } from '../lumiverse-ui'

export default function ScrMidCheck() {
  return (
    <Screen padTop={22} nav={<BottomNav active="점검" />}>
      <StarField seed={71} density={70} />
      <BackRow label="내 우주" />
      <Kicker>MID-CHECK</Kicker>
      <h1 style={{ margin: '10px 0 18px', fontFamily: LUM.serif, fontWeight: 600, fontSize: 25 }}>중간점검 결과</h1>

      <HairCard pad={'18px 18px'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ background: LUM.paper, color: LUM.pInk, borderRadius: 4, padding: '4px 10px', fontFamily: LUM.mono, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}>GOOD</span>
          <span style={{ fontSize: 14.5, fontWeight: 700 }}>지금 흐름 좋아요</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr', rowGap: 9, fontSize: 13, color: LUM.txtMid }}>
          <Kicker size={10} style={{ alignSelf: 'center' }}>판단</Kicker>
          <span style={{ fontFamily: LUM.mono, fontSize: 14, color: LUM.txtHi }}>go ↑ <span style={{ fontSize: 11, color: LUM.txtLow }}>(강도 올리기)</span></span>
          <Kicker size={10}>이유</Kicker>
          <span style={{ lineHeight: 1.6 }}>최근 7일 달성률 72% — 꾸준히 유지되고 있어요. 주중 오전이 가장 강해요.</span>
        </div>
      </HairCard>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginTop: 22 }}>
        <div style={{ position: 'relative', flex: 'none' }}>
          <Planet size={46} />
          <Sparkle size={8} style={{ position: 'absolute', top: -3, right: -3 }} />
        </div>
        <div style={{ flex: 1, border: `1px solid ${LUM.line}`, borderRadius: '2px 12px 12px 12px', padding: '13px 15px', fontSize: 13.5, lineHeight: 1.65, color: LUM.txtMid }}>
          지금처럼만 하면 목표 달성 충분히 가능해요.<br />
          <span style={{ color: LUM.txtHi, fontWeight: 700 }}>토요일 별 하나만 더 잡아볼까요?</span>
          <div style={{ fontFamily: LUM.mono, fontSize: 9.5, color: LUM.txtLow, marginTop: 9, letterSpacing: '0.1em' }}>— 항해사</div>
        </div>
      </div>

      <div style={{ flex: 1 }}></div>
      <PrimaryBtn>목표 진행하기&ensp;▸</PrimaryBtn>
      <Annot style={{ textAlign: 'center', marginTop: 10 }}>판단 3종: go / 보완 / finish · 이력 주입(Groq)<br />데이터 3일 미만 → 분석 생략 안내 / 실패 → 패턴만 + 재시도</Annot>
    </Screen>
  );
}
