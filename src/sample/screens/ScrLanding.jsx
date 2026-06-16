import * as React from 'react'
import { LUM, Screen, StarField, Nebula, Planet, Constellation, Wordmark, Sparkle, PrimaryBtn, Annot } from '../lumiverse-ui'

export default function ScrLanding() {
  return (
    <Screen padTop={26}>
      <StarField seed={3} density={110} />
      <Nebula top={120} right={-110} size={420} opacity={0.4} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <Wordmark size={20} /><Sparkle size={11} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'relative', height: 250, marginBottom: 36 }}>
          <Planet size={104} style={{ position: 'absolute', left: '50%', top: 56, transform: 'translateX(-50%)' }} />
          <Planet size={30} style={{ position: 'absolute', left: 42, top: 28 }} />
          <Constellation dim style={{ position: 'absolute', right: 10, top: 8 }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 58, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: '-12%', right: '-12%', bottom: -66, height: 120, borderRadius: '50%', background: '#070605', boxShadow: '0 -1px 0 rgba(236,231,220,0.22)' }}></div>
            <div style={{ position: 'absolute', left: '50%', bottom: 26, transform: 'translateX(-50%)', width: 11, height: 26, borderRadius: '5px 5px 2px 2px', background: '#070605', boxShadow: '0 0 0 1px rgba(236,231,220,0.18)' }}></div>
            <div style={{ position: 'absolute', left: '50%', bottom: 50, transform: 'translateX(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#070605', boxShadow: '0 0 0 1px rgba(236,231,220,0.18)' }}></div>
          </div>
        </div>

        <h1 style={{ margin: 0, fontFamily: LUM.serif, fontWeight: 600, fontSize: 30, lineHeight: 1.32, letterSpacing: '-0.01em' }}>
          작은 행동들의 여정을 따라<br />점점 더 또렷해지는 우주
        </h1>
        <p style={{ margin: '16px 0 0', color: LUM.txtMid, fontSize: 14.5, lineHeight: 1.7 }}>
          당신만의 우주 탐험이 시작됩니다.
        </p>
      </div>

      <PrimaryBtn>▸&ensp;시작하기</PrimaryBtn>
      <Annot style={{ textAlign: 'center', marginTop: 12 }}>세션 유효 시 → [ ▸ 이어하기 ] · 대시보드 직행</Annot>
    </Screen>
  );
}
