import * as React from 'react'
import { asset } from '../lib/asset'

// Lumiverse 공유 UI — v2 흑백 먹·그레이스케일
// 레퍼런스: Image #1 (COSTAR 모바일) / Image #3 (SNR 웹 대시보드)

const LUM = {
  ink0: '#060504',      // 순수 우주 검정
  ink1: '#0e0d0b',
  ink2: '#181614',
  line: 'rgba(236,231,220,0.13)',
  lineSoft: 'rgba(236,231,220,0.07)',
  txtHi: '#ece9e2',
  txtMid: '#9e9888',
  txtLow: '#625c52',
  paper: '#e6ddca',     // 갱지
  paperDeep: '#d8ccb2',
  pInk: '#171310',
  pMid: '#574f3e',
  pLine: 'rgba(23,19,16,0.20)',
  sans: "'Pretendard Variable', Pretendard, sans-serif",
  serif: "'Source Serif 4', 'Noto Serif KR', serif",
  mono: "'IBM Plex Mono', monospace",
};

const GRAIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="200" height="200" filter="url(#n)" opacity="0.9"/></svg>`;
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}")`;

// 결정적 별밭 — 밝기 다양화 + 가끔 큰 별
function starShadows(seed, n, w, h) {
  let s = seed, out = [];
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    const x = Math.round(rnd() * w), y = Math.round(rnd() * h);
    const o = (0.15 + rnd() * 0.85).toFixed(2);
    const big = rnd() > 0.93;
    out.push(`${x}px ${y}px ${big ? '1px 1px' : '0 0'} rgba(236,231,220,${o})`);
  }
  return out.join(',');
}

function StarField({ seed = 7, density = 90, dim = false, style }) {
  const sh1 = React.useMemo(() => starShadows(seed, density, 390, 900), [seed, density]);
  const sh2 = React.useMemo(() => starShadows(seed + 13, Math.round(density / 3.5), 390, 900), [seed, density]);
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: dim ? 0.35 : 1, ...style }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1, borderRadius: '50%', boxShadow: sh1 }}></div>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: 2, borderRadius: '50%', boxShadow: sh2 }}></div>
    </div>
  );
}

// 은하 성운 — 이미지 플레이스홀더 (실제 파일: public/assets/bg/nebula.png)
function Nebula({ top = -60, right = -80, size = 380, opacity = 0.55 }) {
  return (
    <img
      src={asset('assets/bg/nebula.png')}
      alt="galaxy nebula"
      aria-hidden="true"
      style={{
        position: 'absolute', top, right,
        width: size, height: size * 0.9,
        pointerEvents: 'none', opacity,
        objectFit: 'contain',
      }}
    />
  );
}

function Screen({ children, nav = null, padTop = 18 }) {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: '#060504',
      color: LUM.txtHi, fontFamily: LUM.sans, display: 'flex', flexDirection: 'column',
    }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: '200px', opacity: 0.06, pointerEvents: 'none', mixBlendMode: 'screen' }}></div>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', padding: `${padTop}px 20px 20px`, minHeight: 0 }}>
        {children}
      </div>
      {nav}
    </div>
  );
}

function Kicker({ children, color = LUM.txtMid, size = 11, style }) {
  return <div style={{ fontFamily: LUM.mono, fontSize: size, letterSpacing: '0.22em', textTransform: 'uppercase', color, whiteSpace: 'nowrap', flex: 'none', ...style }}>{children}</div>;
}

function Wordmark({ size = 19 }) {
  return <div style={{ fontFamily: LUM.serif, fontSize: size, letterSpacing: '0.12em', fontWeight: 600, color: LUM.txtHi }}>LUMIVERSE</div>;
}

function HairCard({ children, style, pad = 16 }) {
  return <div style={{ border: `1px solid ${LUM.line}`, borderRadius: 12, padding: pad, background: 'rgba(14,13,11,0.60)', position: 'relative', ...style }}>{children}</div>;
}

// 갱지 카드 — Image #1 TODAY 섹션 스타일
function PaperCard({ children, style, pad = 16 }) {
  return (
    <div style={{ position: 'relative', background: `linear-gradient(168deg, ${LUM.paper}, ${LUM.paperDeep})`, borderRadius: 10, color: LUM.pInk, boxShadow: '0 12px 32px rgba(0,0,0,0.55)', overflow: 'hidden', ...style }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: '200px', opacity: 0.28, mixBlendMode: 'multiply', pointerEvents: 'none' }}></div>
      <div style={{ position: 'relative', padding: pad }}>{children}</div>
    </div>
  );
}

function StarIcon({ filled = true, size = 18, ink = false, style }) {
  const c = ink ? LUM.pInk : LUM.txtHi;
  const dimC = ink ? 'rgba(23,19,16,0.40)' : 'rgba(236,231,220,0.38)';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: 'none', ...style }} aria-hidden="true">
      <path d="M12 2.6l2.8 6 6.5.6-4.9 4.4 1.4 6.4L12 16.7 6.2 20l1.4-6.4L2.7 9.2l6.5-.6z"
        fill={filled ? c : 'none'} stroke={filled ? c : dimC} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function Sparkle({ size = 12, color = LUM.txtHi, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: 'none', ...style }} aria-hidden="true">
      <path d="M12 1.5L14.2 9.8 22.5 12 14.2 14.2 12 22.5 9.8 14.2 1.5 12 9.8 9.8z" fill={color} />
    </svg>
  );
}

// 행성 — 이미지 플레이스홀더 (실제 파일: public/assets/celestial/planet.png)
function Planet({ size = 64, style }) {
  return (
    <img
      src={asset('assets/celestial/planet.png')}
      alt="planet"
      aria-hidden="true"
      width={size}
      height={size}
      style={{ flex: 'none', objectFit: 'contain', ...style }}
    />
  );
}

// 블랙홀 — 이미지 플레이스홀더 (실제 파일: public/assets/celestial/blackhole.png)
function BlackHole({ size = 56, style }) {
  return (
    <img
      src={asset('assets/celestial/blackhole.png')}
      alt="black hole"
      aria-hidden="true"
      width={size}
      height={size}
      style={{ flex: 'none', objectFit: 'contain', ...style }}
    />
  );
}

// 별자리 미니 — 이미지 플레이스홀더 (실제 파일: public/assets/celestial/constellation.png)
function Constellation({ w = 110, h = 54, dim = false, style }) {
  return (
    <img
      src={asset('assets/celestial/constellation.png')}
      alt="constellation"
      aria-hidden="true"
      width={w}
      height={h}
      style={{ flex: 'none', opacity: dim ? 0.36 : 0.88, objectFit: 'contain', ...style }}
    />
  );
}

// 버튼 — 갱지 솔리드 / 잉크 보더 고스트
function PrimaryBtn({ children, style, dim = false }) {
  return (
    <div style={{
      background: dim ? 'rgba(230,221,202,0.26)' : LUM.paper,
      color: dim ? 'rgba(23,19,16,0.78)' : LUM.pInk,
      borderRadius: 8, padding: '15px 18px', textAlign: 'center', fontWeight: 700, fontSize: 15.5,
      letterSpacing: '0.01em', boxShadow: dim ? 'none' : '0 6px 20px rgba(0,0,0,0.45)', cursor: 'pointer', ...style
    }}>{children}</div>
  );
}
function GhostBtn({ children, style, ink = false }) {
  return (
    <div style={{
      border: `1px solid ${ink ? LUM.pLine : LUM.line}`, color: ink ? LUM.pInk : LUM.txtHi,
      borderRadius: 8, padding: '13px 16px', textAlign: 'center', fontWeight: 600, fontSize: 14, cursor: 'pointer', ...style
    }}>{children}</div>
  );
}

function BackRow({ label = '내 우주', right = null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: LUM.txtMid, fontSize: 13.5 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><polyline points="15 4 7 12 15 20"/></svg>
        <span>{label}</span>
      </div>
      {right}
    </div>
  );
}

function Field({ label, value, placeholder, right = null, mono = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Kicker size={10.5}>{label}</Kicker>
      <div style={{
        border: `1px solid ${LUM.line}`, borderRadius: 8, padding: '13px 14px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', gap: 10, background: 'rgba(14,13,11,0.65)'
      }}>
        <span style={{
          fontSize: 14.5, color: value ? LUM.txtHi : LUM.txtLow, whiteSpace: 'nowrap',
          fontFamily: mono ? LUM.mono : LUM.sans, letterSpacing: mono ? '0.06em' : 0
        }}>{value || placeholder}</span>
        {right && <span style={{ flex: 'none', display: 'inline-flex' }}>{right}</span>}
      </div>
    </div>
  );
}

function RadioRow({ label, sub, on = false, ink = false }) {
  const c = ink ? LUM.pInk : LUM.txtHi;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0' }}>
      <span style={{
        width: 17, height: 17, borderRadius: '50%', flex: 'none',
        border: `1.4px solid ${on ? c : (ink ? LUM.pLine : LUM.line)}`,
        display: 'grid', placeItems: 'center'
      }}>
        {on && <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }}></span>}
      </span>
      <span style={{ fontSize: 14.5, fontWeight: on ? 700 : 400, color: on ? c : (ink ? LUM.pMid : LUM.txtMid) }}>{label}</span>
      {sub && <span style={{ fontSize: 12.5, color: ink ? LUM.pMid : LUM.txtLow }}>{sub}</span>}
    </div>
  );
}

function Toggle({ on = true }) {
  return (
    <div style={{
      width: 40, height: 23, borderRadius: 20, flex: 'none', position: 'relative',
      background: on ? LUM.paper : 'transparent',
      border: `1px solid ${on ? LUM.paper : LUM.line}`, transition: 'all .2s'
    }}>
      <div style={{
        position: 'absolute', top: 2.5, left: on ? 19 : 2.5, width: 16, height: 16, borderRadius: '50%',
        background: on ? LUM.ink0 : LUM.txtMid
      }}></div>
    </div>
  );
}

// 선명도 바
function ClarityBar({ pct = 62, ink = false, w = '100%' }) {
  const segs = 12, on = Math.round(segs * pct / 100);
  return (
    <div style={{ display: 'flex', gap: 3, width: w }}>
      {Array.from({ length: segs }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 9, borderRadius: 1.5,
          background: i < on ? (ink ? LUM.pInk : LUM.paper) : 'transparent',
          border: `1px solid ${ink ? LUM.pLine : LUM.lineSoft}`
        }}></div>
      ))}
    </div>
  );
}

// 하단 내비 — Image #1 스타일 라인 아이콘
function NavIcon({ kind }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.45, strokeLinecap: 'round', strokeLinejoin: 'round' };
  // 우주: 토성 형태 (원 + 기울어진 타원 링)
  if (kind === 'universe') return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="12" r="4.8"/>
      <ellipse cx="12" cy="12" rx="10.2" ry="3.4" transform="rotate(-20 12 12)"/>
    </svg>
  );
  // 투두: 별 (Image #1 두번째 아이콘)
  if (kind === 'todo') return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...s}>
      <path d="M12 2.8l2.4 5.3 5.5.5-4.2 3.8 1.2 5.5L12 15.4l-4.9 2.5 1.2-5.5L4.1 8.6l5.5-.5z"/>
    </svg>
  );
  // 블랙홀: 나선 + 중심 채운 원
  if (kind === 'blackhole') return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="12" r="2.8" fill="currentColor" stroke="none"/>
      <path d="M12 3.2a8.8 8.8 0 1 0 8.8 8.8"/>
      <path d="M12 7a5 5 0 1 0 5 5"/>
    </svg>
  );
  // 점검: 원 + 체크
  if (kind === 'check') return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="12" r="8.4"/>
      <polyline points="8.2 12 11 14.8 15.8 9.2"/>
    </svg>
  );
  // 설정: 슬라이더 두 줄
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...s}>
      <line x1="3.5" y1="8" x2="20.5" y2="8"/>
      <line x1="3.5" y1="16" x2="20.5" y2="16"/>
      <circle cx="9" cy="8" r="2.2" fill={LUM.ink0}/>
      <circle cx="15" cy="16" r="2.2" fill={LUM.ink0}/>
    </svg>
  );
}

function BottomNav({ active = '우주' }) {
  const tabs = [['우주', 'universe'], ['투두', 'todo'], ['블랙홀', 'blackhole'], ['점검', 'check'], ['설정', 'settings']];
  return (
    <div style={{ position: 'relative', borderTop: `1px solid ${LUM.lineSoft}`, background: 'rgba(6,5,4,0.94)', display: 'flex', padding: '10px 8px 18px' }}>
      {tabs.map(([label, kind]) => {
        const on = label === active;
        return (
          <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, color: on ? LUM.txtHi : LUM.txtLow, position: 'relative', paddingTop: 6 }}>
            {on && <div style={{ position: 'absolute', top: -1, width: 26, height: 2.5, background: LUM.txtHi, borderRadius: 2 }}></div>}
            <NavIcon kind={kind} />
            <span style={{ fontSize: 10.5, letterSpacing: '0.04em' }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Annot({ children, style }) {
  return <div style={{ fontFamily: LUM.mono, fontSize: 10.5, color: '#8a8478', letterSpacing: '0.04em', lineHeight: 1.6, ...style }}>{children}</div>;
}

export {
  LUM, GRAIN, StarField, Nebula, Screen, Kicker, Wordmark, HairCard, PaperCard,
  StarIcon, Sparkle, Planet, BlackHole, Constellation, PrimaryBtn, GhostBtn,
  BackRow, Field, RadioRow, Toggle, ClarityBar, BottomNav, Annot,
};
