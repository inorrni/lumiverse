import * as React from 'react'
import { LUM, Screen, StarField, BackRow, Kicker, Field, StarIcon, PrimaryBtn, Annot } from '../lumiverse-ui'

export default function ScrGoalInput() {
  return (
    <Screen padTop={22}>
      <StarField seed={31} density={55} dim />
      <BackRow label="뒤로" />
      <Kicker>NEW GALAXY</Kicker>
      <h1 style={{ margin: '10px 0 28px', fontFamily: LUM.serif, fontWeight: 600, fontSize: 25, lineHeight: 1.38 }}>
        탐험의 목적지를<br />입력해 주세요
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="목표" value="영어 공부하기" right={<span style={{ fontFamily: LUM.mono, fontSize: 11, color: LUM.txtLow }}>6/30</span>} />
        <Field label="D-Day" value="2026. 07. 12 (일)" mono right={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={LUM.txtMid} strokeWidth="1.6" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="16" rx="2"></rect><line x1="3.5" y1="10" x2="20.5" y2="10"></line>
            <line x1="8" y1="2.8" x2="8" y2="6.5"></line><line x1="16" y1="2.8" x2="16" y2="6.5"></line>
          </svg>
        } />
      </div>

      <div style={{ textAlign: 'center', margin: '30px 0 6px' }}>
        <span style={{ fontFamily: LUM.serif, fontSize: 56, fontWeight: 600, lineHeight: 1 }}>30</span>
        <span style={{ fontSize: 15, color: LUM.txtMid, marginLeft: 8 }}>일의 별</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, opacity: 0.7 }}>
        {Array.from({ length: 15 }).map((_, i) => <StarIcon key={i} size={9} filled={false} />)}
      </div>

      <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', margin: '26px 0 0', padding: '12px 14px', border: `1px dashed ${LUM.line}`, borderRadius: 8 }}>
        <span style={{ fontFamily: LUM.mono, fontSize: 11, color: LUM.txtMid, flex: 'none' }}>ⓘ</span>
        <span style={{ fontSize: 12.5, color: LUM.txtMid, lineHeight: 1.6 }}>별 14개 이상부터 별자리를 만들 수 있어요. 디데이는 자유 — 별 개수 = 일수.</span>
      </div>

      <div style={{ flex: 1 }}></div>
      <PrimaryBtn>AI 항해사에게 분해받기&ensp;▸</PrimaryBtn>
      <Annot style={{ textAlign: 'center', marginTop: 12 }}>알아서모드 → 직접 행성 입력 / 대기: "별을 계산하는 중… ✦"<br />Groq 실패 → 내장 템플릿 폴백 + 토스트</Annot>
    </Screen>
  );
}
