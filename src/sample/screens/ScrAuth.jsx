import * as React from 'react'
import { LUM, Screen, StarField, Wordmark, Sparkle, Kicker, Field, PrimaryBtn, GhostBtn, Annot } from '../lumiverse-ui'

export default function ScrAuth() {
  return (
    <Screen padTop={26}>
      <StarField seed={11} density={60} dim />
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <Wordmark size={16} /><Sparkle size={9} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
        <Kicker>SIGN IN</Kicker>
        <h1 style={{ margin: '10px 0 30px', fontFamily: LUM.serif, fontWeight: 600, fontSize: 27, lineHeight: 1.35 }}>
          탐험가의 이름으로<br />로그인하세요
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="이메일" placeholder="stargazer@lumiverse.kr" />
          <Field label="비밀번호" placeholder="••••••••" />
        </div>

        <PrimaryBtn style={{ marginTop: 22 }}>계속하기&ensp;→</PrimaryBtn>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
          <div style={{ flex: 1, height: 1, background: LUM.lineSoft }}></div>
          <span style={{ fontSize: 12, color: LUM.txtLow }}>또는</span>
          <div style={{ flex: 1, height: 1, background: LUM.lineSoft }}></div>
        </div>

        <GhostBtn>
          <span style={{ fontFamily: LUM.serif, fontWeight: 700, marginRight: 8 }}>G</span>
          Google로 계속
        </GhostBtn>
      </div>

      <Annot style={{ textAlign: 'center' }}>신규 → 3.모드 선택 / 기존 → 6.대시보드<br />오류 시 토스트 + 입력값 유지</Annot>
    </Screen>
  );
}
