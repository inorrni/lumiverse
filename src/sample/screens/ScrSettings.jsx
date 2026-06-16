import * as React from 'react'
import { LUM, Screen, StarField, BottomNav, BackRow, Kicker, Toggle, StarIcon, Sparkle, Annot } from '../lumiverse-ui'

function SetRow({ label, right, last = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: last ? 'none' : `1px solid ${LUM.lineSoft}` }}>
      <span style={{ fontSize: 14, color: LUM.txtMid }}>{label}</span>
      {right}
    </div>
  );
}

function ThemeSwatch({ label, dark = true, on = false }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 52, height: 52, borderRadius: 10, margin: '0 auto',
        border: on ? `1.6px solid ${LUM.txtHi}` : `1px solid ${LUM.line}`,
        background: dark ? `radial-gradient(circle at 35% 30%, #211d18, ${LUM.ink0})` : `linear-gradient(160deg, ${LUM.paper}, ${LUM.paperDeep})`,
        display: 'grid', placeItems: 'center'
      }}>
        <StarIcon size={15} filled ink={!dark} />
      </div>
      <div style={{ fontSize: 10.5, color: on ? LUM.txtHi : LUM.txtLow, marginTop: 6 }}>{label}</div>
    </div>
  );
}

export default function ScrSettings() {
  return (
    <Screen padTop={22} nav={<BottomNav active="설정" />}>
      <StarField seed={91} density={45} dim />
      <BackRow label="내 우주" />
      <h1 style={{ margin: '0 0 16px', fontFamily: LUM.serif, fontWeight: 600, fontSize: 25 }}>설정</h1>

      <Kicker size={10.5} style={{ marginBottom: 2 }}>알림 설정</Kicker>
      <SetRow label="투두 알리미" right={<Toggle on />} />
      <SetRow label="행성 활성화 · 또렷" right={<Toggle on />} />
      <SetRow label="별자리 생성" right={<Toggle on={false} />} last />

      <Kicker size={10.5} style={{ margin: '22px 0 12px' }}>디자인 설정 · 흑백 + 갱지 프리셋</Kicker>
      <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
        <ThemeSwatch label="먹 (기본)" dark on />
        <ThemeSwatch label="갱지" dark={false} />
      </div>
      <SetRow label="별 모양" right={
        <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ border: `1.4px solid ${LUM.txtHi}`, borderRadius: 6, padding: '4px 7px', display: 'inline-flex' }}><StarIcon size={14} filled /></span>
          <span style={{ padding: '4px 7px', display: 'inline-flex', opacity: 0.5 }}><StarIcon size={14} filled={false} /></span>
          <span style={{ padding: '4px 7px', display: 'inline-flex', opacity: 0.5 }}><Sparkle size={13} /></span>
        </span>
      } last />

      <div style={{ borderTop: `1px solid ${LUM.lineSoft}`, marginTop: 14 }}>
        <SetRow label="일반" right={<span style={{ color: LUM.txtLow }}>›</span>} />
        <SetRow label="데이터 관리" right={<span style={{ color: LUM.txtLow }}>›</span>} />
        <SetRow label="정보" right={<span style={{ fontFamily: LUM.mono, fontSize: 11, color: LUM.txtLow }}>v1.0.0</span>} last />
      </div>

      <div style={{ flex: 1 }}></div>
      <Annot style={{ textAlign: 'center' }}>변경 즉시 저장(profiles.settings · 낙관적) / MVP 최소 골격</Annot>
    </Screen>
  );
}
