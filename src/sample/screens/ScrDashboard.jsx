import * as React from 'react'
import { LUM, Screen, StarField, Nebula, BottomNav, Wordmark, Sparkle, HairCard, PaperCard, Kicker, Planet, BlackHole, StarIcon, Constellation, Annot, GhostBtn } from '../lumiverse-ui'
import { TodayRow } from '../components/TodayRow'

export default function ScrDashboard() {
  return (
    <Screen padTop={20} nav={<BottomNav active="우주" />}>
      <StarField seed={5} density={120} />
      <Nebula top={-30} right={-90} size={400} opacity={0.55} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Wordmark size={17} /><Sparkle size={9} /></div>
        <div style={{ display: 'flex', gap: 16, color: LUM.txtMid }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"></path><path d="M10 19a2 2 0 0 0 4 0"></path></svg>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="8.5" r="3.6"></circle><path d="M4.5 20c1.4-3.6 4.2-5 7.5-5s6.1 1.4 7.5 5"></path></svg>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '22px 0 20px', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: LUM.serif, fontWeight: 600, fontSize: 26, lineHeight: 1.34, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            Good evening,<br />stargazer.
          </h1>
          <p style={{ margin: '13px 0 0', fontSize: 13.5, color: LUM.txtMid, lineHeight: 1.65, whiteSpace: 'nowrap' }}>
            오늘의 작은 행동이<br />너의 우주를 선명하게 만들어.
          </p>
        </div>
        <HairCard pad={'12px 14px'} style={{ flex: 'none', textAlign: 'left' }}>
          <Kicker size={9.5}>Daily Stars</Kicker>
          <div style={{ margin: '7px 0 5px', display: 'flex', alignItems: 'baseline', gap: 4, whiteSpace: 'nowrap' }}>
            <span style={{ fontFamily: LUM.serif, fontSize: 27, fontWeight: 600, lineHeight: 1 }}>7</span>
            <span style={{ fontFamily: LUM.mono, fontSize: 12, color: LUM.txtMid }}>/ 12</span>
            <StarIcon filled={false} size={13} style={{ marginLeft: 3 }} />
          </div>
          <Kicker size={9.5} color={LUM.txtLow}>Today</Kicker>
        </HairCard>
      </div>

      <HairCard pad={0} style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Sparkle size={10} /><Kicker color={LUM.txtHi}>My Universe</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: LUM.txtMid }}>전체 보기 →</span>
            <span style={{ fontFamily: LUM.mono, color: LUM.txtLow, letterSpacing: 2 }}>⋯</span>
          </div>
        </div>

        <div style={{ position: 'relative', height: 252, margin: '4px 6px 0' }}>
          <div style={{ position: 'absolute', left: '6%', top: '16%', width: '88%', height: '74%', border: `1px solid ${LUM.lineSoft}`, borderRadius: '50%', transform: 'rotate(-9deg)' }}></div>

          <div style={{ position: 'absolute', left: 26, top: 26, textAlign: 'center' }}>
            <Planet size={62} />
            <div style={{ marginTop: 12, fontWeight: 800, fontSize: 14.5 }}>영어 공부하기</div>
            <div style={{ fontFamily: LUM.mono, fontSize: 10.5, color: LUM.txtLow, margin: '4px 0' }}>D-30</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
              <span style={{ fontFamily: LUM.mono, fontSize: 11.5 }}>72%</span>
              <StarIcon size={11} filled /><StarIcon size={11} filled /><StarIcon size={11} filled={false} />
            </div>
          </div>

          <div style={{ position: 'absolute', left: '46%', top: 96, textAlign: 'center' }}>
            <Planet size={42} />
            <div style={{ marginTop: 10, fontWeight: 700, fontSize: 13, color: LUM.txtMid }}>헬스 루틴 만들기</div>
            <div style={{ fontFamily: LUM.mono, fontSize: 10, color: LUM.txtLow, margin: '3px 0' }}>D-45</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
              <span style={{ fontFamily: LUM.mono, fontSize: 10.5, color: LUM.txtMid }}>46%</span>
              <StarIcon size={10} filled /><StarIcon size={10} filled={false} /><StarIcon size={10} filled={false} />
            </div>
          </div>

          <div style={{ position: 'absolute', right: 16, top: 14, textAlign: 'center' }}>
            <BlackHole size={44} style={{ margin: '0 auto' }} />
            <Kicker size={9} style={{ marginTop: 6 }}>Black Hole</Kicker>
            <div style={{ fontFamily: LUM.mono, fontSize: 10, color: LUM.txtLow, marginTop: 2 }}>◍ 3</div>
          </div>

          <div style={{ position: 'absolute', right: 24, bottom: 16, textAlign: 'center' }}>
            <div style={{ width: 46, height: 46, margin: '0 auto', border: `1px dashed ${LUM.line}`, borderRadius: '50%', display: 'grid', placeItems: 'center', color: LUM.txtMid, fontSize: 17 }}>＋</div>
            <div style={{ fontSize: 11, color: LUM.txtLow, marginTop: 6 }}>새 목표 추가</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderTop: `1px solid ${LUM.lineSoft}`, padding: '11px 16px 13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Constellation w={66} h={32} dim />
            <span style={{ fontSize: 11.5, color: LUM.txtMid }}>영어공부 별 21개 — 별자리 가능</span>
          </div>
          <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${LUM.line}`, borderRadius: 999, padding: '6px 12px', fontSize: 11.5, fontWeight: 700 }}>
            <Sparkle size={8} /> 별자리 만들기
          </span>
        </div>
      </HairCard>

      <PaperCard pad={'14px 18px 8px'} style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: `1.5px solid ${LUM.pInk}` }}>
          <Kicker size={11.5} color={LUM.pInk}>Today</Kicker>
          <span style={{ fontFamily: LUM.mono, fontSize: 11.5, color: LUM.pMid, whiteSpace: 'nowrap', flex: 'none' }}>06.12 FRI</span>
        </div>
        <TodayRow title="단어 30개 외우기" sub="영어 공부하기 · 단어 외우기" done />
        <TodayRow title="쉐도잉 20분" sub="영어 공부하기 · 쉐도잉" done />
        <TodayRow title="운동 30분" sub="헬스 루틴 만들기 · 유산소" done={false} count="0 / 1" last />
        <div style={{ textAlign: 'center', padding: '4px 0 10px', fontSize: 12.5, fontWeight: 700, color: LUM.pInk }}>모두 보기 →</div>
      </PaperCard>

      <HairCard pad={'14px 16px'} style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Sparkle size={10} /><Kicker color={LUM.txtHi}>Mid-Check AI Agent</Kicker>
          </div>
          <span style={{ fontFamily: LUM.mono, fontSize: 10, color: LUM.txtLow, whiteSpace: 'nowrap', flex: 'none' }}>최근 점검 · 06.10</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Planet size={40} />
          <div style={{ flex: 1, fontSize: 13, lineHeight: 1.55, color: LUM.txtMid }}>
            잘 하고 있어요, stargazer.<br />강도를 조금 올려볼까요?
          </div>
          <GhostBtn style={{ padding: '10px 13px', fontSize: 12.5, flex: 'none' }}>결과 보기 →</GhostBtn>
        </div>
      </HairCard>

      <Annot style={{ marginTop: 10 }}>목표 0 → "첫 목표를 입력해 우주를 만들어요" / 기록 3일 미만 → MID-CHECK 비활성</Annot>
    </Screen>
  );
}
