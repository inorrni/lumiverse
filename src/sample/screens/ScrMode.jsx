import * as React from 'react'
import { LUM, Screen, StarField, BackRow, Kicker, StarIcon, PrimaryBtn, RadioRow, Annot } from '../lumiverse-ui'

function ModeCard({ title, sub, on = false }) {
  return (
    <div style={{
      flex: 1, borderRadius: 10, padding: '18px 14px', position: 'relative',
      background: on ? LUM.paper : 'rgba(19,17,14,0.55)',
      border: `1px solid ${on ? LUM.paper : LUM.line}`,
      color: on ? LUM.pInk : LUM.txtMid,
      boxShadow: on ? '0 8px 20px rgba(0,0,0,0.4)' : 'none',
    }}>
      {on && <div style={{ position: 'absolute', top: 10, right: 10 }}><StarIcon filled size={13} ink /></div>}
      <div style={{ fontWeight: 800, fontSize: 15.5, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, lineHeight: 1.5, color: on ? LUM.pMid : LUM.txtLow }}>{sub}</div>
    </div>
  );
}

export default function ScrMode() {
  return (
    <Screen padTop={22}>
      <StarField seed={21} density={50} dim />
      <BackRow label="뒤로" />
      <Kicker>NAVIGATION STYLE</Kicker>
      <h1 style={{ margin: '10px 0 6px', fontFamily: LUM.serif, fontWeight: 600, fontSize: 25, lineHeight: 1.38 }}>
        당신만의 항해 스타일을<br />선택하세요
      </h1>
      <p style={{ margin: '0 0 26px', fontSize: 13, color: LUM.txtLow }}>언제든 설정에서 목표별로 바꿀 수 있어요.</p>

      <Kicker size={10.5} style={{ marginBottom: 10 }}>강도 · 목표치</Kicker>
      <div style={{ display: 'flex', gap: 10, marginBottom: 26 }}>
        <ModeCard title="살살모드" sub="여유롭게, 적은 양으로 천천히 가요" on />
        <ModeCard title="스파르타모드" sub="촘촘한 투두로 강하게 끝까지 가요" />
      </div>

      <Kicker size={10.5} style={{ marginBottom: 4 }}>입력 방식</Kicker>
      <div style={{ borderTop: `1px solid ${LUM.lineSoft}` }}>
        <div style={{ borderBottom: `1px solid ${LUM.lineSoft}` }}>
          <RadioRow label="추천" sub="— 우주 항해사가 목표를 분해해줘요" on />
        </div>
          <RadioRow label="알아서" sub="— 우주 항해사 없이 직접 입력할게요" />
      </div>

      <div style={{ flex: 1 }}></div>
      <PrimaryBtn>다음&ensp;▸</PrimaryBtn>
      <Annot style={{ textAlign: 'center', marginTop: 12 }}>기본값 프리선택(살살·추천) → 스킵 방지 · 둘 다 필수</Annot>
    </Screen>
  );
}
