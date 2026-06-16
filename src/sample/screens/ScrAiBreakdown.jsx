import * as React from 'react'
import { LUM, Screen, StarField, BackRow, Kicker, HairCard, GhostBtn, PrimaryBtn, Planet, Annot } from '../lumiverse-ui'

function PlanetRow({ name, desc }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 2px' }}>
      <Planet size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{name}</div>
        <div style={{ fontSize: 12, color: LUM.txtLow, marginTop: 3 }}>{desc}</div>
      </div>
      <div style={{ display: 'flex', gap: 14, color: LUM.txtLow }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"></path></svg>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line></svg>
      </div>
    </div>
  );
}

export default function ScrAiBreakdown() {
  return (
    <Screen padTop={22}>
      <StarField seed={41} density={55} dim />
      <BackRow label="뒤로" right={<Kicker size={10}>RECOMMENDED · 살살</Kicker>} />
      <Kicker>AI NAVIGATOR</Kicker>
      <h1 style={{ margin: '10px 0 8px', fontFamily: LUM.serif, fontWeight: 600, fontSize: 25, lineHeight: 1.38 }}>
        항해사가 경로를<br />설계했어요
      </h1>
      <p style={{ margin: '0 0 18px', fontSize: 13, color: LUM.txtLow }}>행성(세부목표) 3~5개 · 수정하거나 추가할 수 있어요.</p>

      <HairCard pad={'4px 16px'}>
        <div style={{ borderBottom: `1px solid ${LUM.lineSoft}` }}><PlanetRow name="단어 외우기" desc="매일 새로운 단어를 꾸준히 학습해요 · 별 30개" /></div>
        <div style={{ borderBottom: `1px solid ${LUM.lineSoft}` }}><PlanetRow name="쉐도잉 연습" desc="듣고 말하기 실력을 키워요 · 별 30개" /></div>
        <PlanetRow name="문법 정리" desc="핵심 문법을 이해하고 활용해요 · 별 30개" />
      </HairCard>

      <GhostBtn style={{ marginTop: 12 }}>＋&ensp;행성 추가</GhostBtn>

      <div style={{ flex: 1 }}></div>
      <PrimaryBtn>확인하고 우주로 떠나기&ensp;▸</PrimaryBtn>
      <Annot style={{ textAlign: 'center', marginTop: 12 }}>3~5개 범위 밖 → 확정 비활성 / POST /galaxies (별 90개 일괄 생성)</Annot>
    </Screen>
  );
}
