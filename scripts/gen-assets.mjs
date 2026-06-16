import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

mkdirSync(`${root}/public/assets/celestial`, { recursive: true })
mkdirSync(`${root}/public/assets/bg`, { recursive: true })

// ── 행성 (400×400 @2x) ─────────────────────────────────────────────
const PLANET_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
<defs>
  <radialGradient id="sg" cx="37%" cy="32%" r="65%">
    <stop offset="0%"   stop-color="#cac5ba"/>
    <stop offset="28%"  stop-color="#7e7a6e"/>
    <stop offset="62%"  stop-color="#3a3730"/>
    <stop offset="100%" stop-color="#181614"/>
  </radialGradient>
  <clipPath id="top"><rect x="0" y="0" width="400" height="200"/></clipPath>
  <clipPath id="bot"><rect x="0" y="200" width="400" height="200"/></clipPath>
</defs>

<!-- 링 뒤 (top clip) -->
<g clip-path="url(#top)">
  <ellipse cx="200" cy="216" rx="188" ry="50"
    fill="none" stroke="rgba(155,150,140,0.22)" stroke-width="32"
    transform="rotate(-15 200 216)"/>
  <ellipse cx="200" cy="216" rx="162" ry="44"
    fill="none" stroke="rgba(120,116,108,0.18)" stroke-width="14"
    transform="rotate(-15 200 216)"/>
</g>

<!-- 구 본체 -->
<circle cx="200" cy="200" r="150" fill="url(#sg)"/>

<!-- 대기 밴드 -->
<ellipse cx="200" cy="165" rx="150" ry="19" fill="rgba(0,0,0,0.16)"/>
<ellipse cx="200" cy="214" rx="150" ry="15" fill="rgba(255,255,255,0.04)"/>
<ellipse cx="200" cy="240" rx="150" ry="12" fill="rgba(0,0,0,0.12)"/>
<ellipse cx="200" cy="268" rx="150" ry="10" fill="rgba(0,0,0,0.08)"/>

<!-- 가장자리 어두움 (limb darkening) -->
<circle cx="200" cy="200" r="150" fill="none"
  stroke="rgba(12,11,10,0.55)" stroke-width="14"/>

<!-- 하이라이트 -->
<ellipse cx="148" cy="146" rx="36" ry="22"
  fill="rgba(255,255,255,0.14)" transform="rotate(-22 148 146)"/>

<!-- 링 앞 (bot clip) -->
<g clip-path="url(#bot)">
  <ellipse cx="200" cy="216" rx="205" ry="55"
    fill="none" stroke="rgba(100,96,90,0.14)" stroke-width="8"
    transform="rotate(-15 200 216)"/>
  <ellipse cx="200" cy="216" rx="188" ry="50"
    fill="none" stroke="rgba(195,190,180,0.52)" stroke-width="32"
    transform="rotate(-15 200 216)"/>
  <ellipse cx="200" cy="216" rx="162" ry="44"
    fill="none" stroke="rgba(150,146,138,0.38)" stroke-width="14"
    transform="rotate(-15 200 216)"/>
</g>
</svg>`

// ── 블랙홀 (400×400 @2x) ────────────────────────────────────────────
const BLACKHOLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
<defs>
  <radialGradient id="glow" cx="50%" cy="50%" r="50%">
    <stop offset="0%"   stop-color="rgba(6,5,4,1)"/>
    <stop offset="38%"  stop-color="rgba(6,5,4,1)"/>
    <stop offset="58%"  stop-color="rgba(38,36,33,0.85)"/>
    <stop offset="74%"  stop-color="rgba(90,86,80,0.50)"/>
    <stop offset="88%"  stop-color="rgba(160,155,148,0.22)"/>
    <stop offset="100%" stop-color="rgba(80,77,72,0)"/>
  </radialGradient>
  <clipPath id="diskTop"><rect x="0" y="0" width="400" height="195"/></clipPath>
  <clipPath id="diskBot"><rect x="0" y="195" width="400" height="205"/></clipPath>
</defs>

<!-- 외부 헤일로 glow -->
<circle cx="200" cy="200" r="195" fill="url(#glow)"/>

<!-- 강착원반 — 뒤 (top) -->
<g clip-path="url(#diskTop)">
  <ellipse cx="200" cy="208" rx="168" ry="42"
    fill="none" stroke="rgba(120,115,108,0.20)" stroke-width="26"
    transform="rotate(-8 200 208)"/>
  <ellipse cx="200" cy="208" rx="146" ry="36"
    fill="none" stroke="rgba(80,77,72,0.30)" stroke-width="14"
    transform="rotate(-8 200 208)"/>
</g>

<!-- 이벤트 호라이즌 -->
<circle cx="200" cy="200" r="90" fill="#060504"/>

<!-- 중력 렌즈 링 -->
<circle cx="200" cy="200" r="92" fill="none"
  stroke="rgba(190,185,178,0.42)" stroke-width="3.5"/>
<circle cx="200" cy="200" r="97" fill="none"
  stroke="rgba(150,146,140,0.16)" stroke-width="5"/>
<circle cx="200" cy="200" r="103" fill="none"
  stroke="rgba(100,96,92,0.08)" stroke-width="7"/>

<!-- 강착원반 — 앞 (bot) -->
<g clip-path="url(#diskBot)">
  <ellipse cx="200" cy="208" rx="168" ry="42"
    fill="none" stroke="rgba(200,195,188,0.58)" stroke-width="26"
    transform="rotate(-8 200 208)"/>
  <ellipse cx="200" cy="208" rx="146" ry="36"
    fill="none" stroke="rgba(140,136,130,0.42)" stroke-width="14"
    transform="rotate(-8 200 208)"/>
  <ellipse cx="200" cy="208" rx="184" ry="48"
    fill="none" stroke="rgba(80,77,72,0.18)" stroke-width="8"
    transform="rotate(-8 200 208)"/>
</g>

<!-- 이벤트 호라이즌 위 어두운 섀도 -->
<circle cx="200" cy="200" r="88" fill="none"
  stroke="rgba(0,0,0,0.8)" stroke-width="10"/>
</svg>`

// ── 성운 (900×810 — 투명 배경) ──────────────────────────────────────
const NEBULA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="810">
<defs>
  <radialGradient id="n1" cx="52%" cy="44%" r="52%">
    <stop offset="0%"   stop-color="rgba(210,205,196,0.28)"/>
    <stop offset="35%"  stop-color="rgba(160,156,148,0.14)"/>
    <stop offset="70%"  stop-color="rgba(100,97,92,0.06)"/>
    <stop offset="100%" stop-color="rgba(50,48,45,0)"/>
  </radialGradient>
  <radialGradient id="n2" cx="30%" cy="65%" r="48%">
    <stop offset="0%"   stop-color="rgba(190,185,176,0.20)"/>
    <stop offset="45%"  stop-color="rgba(130,126,120,0.09)"/>
    <stop offset="100%" stop-color="rgba(60,58,55,0)"/>
  </radialGradient>
  <radialGradient id="n3" cx="72%" cy="28%" r="42%">
    <stop offset="0%"   stop-color="rgba(230,226,218,0.24)"/>
    <stop offset="40%"  stop-color="rgba(170,165,158,0.10)"/>
    <stop offset="100%" stop-color="rgba(80,77,73,0)"/>
  </radialGradient>
  <radialGradient id="n4" cx="60%" cy="72%" r="38%">
    <stop offset="0%"   stop-color="rgba(180,176,168,0.16)"/>
    <stop offset="50%"  stop-color="rgba(120,116,110,0.06)"/>
    <stop offset="100%" stop-color="rgba(50,48,45,0)"/>
  </radialGradient>
  <filter id="blur" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="55"/>
  </filter>
  <filter id="blur2" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="35"/>
  </filter>
</defs>

<!-- 메인 성운 구름 -->
<ellipse cx="470" cy="355" rx="400" ry="330" fill="url(#n1)" filter="url(#blur)"/>
<ellipse cx="290" cy="490" rx="310" ry="250" fill="url(#n2)" filter="url(#blur)"/>
<ellipse cx="620" cy="260" rx="280" ry="240" fill="url(#n3)" filter="url(#blur2)"/>
<ellipse cx="560" cy="560" rx="240" ry="200" fill="url(#n4)" filter="url(#blur2)"/>

<!-- 별 -->
<circle cx="305" cy="175" r="2"   fill="rgba(236,231,220,0.82)"/>
<circle cx="530" cy="130" r="1.5" fill="rgba(236,231,220,0.60)"/>
<circle cx="700" cy="210" r="2.5" fill="rgba(236,231,220,0.90)"/>
<circle cx="430" cy="320" r="1"   fill="rgba(236,231,220,0.50)"/>
<circle cx="770" cy="345" r="1.5" fill="rgba(236,231,220,0.72)"/>
<circle cx="195" cy="425" r="2"   fill="rgba(236,231,220,0.65)"/>
<circle cx="640" cy="490" r="1.5" fill="rgba(236,231,220,0.55)"/>
<circle cx="820" cy="160" r="1"   fill="rgba(236,231,220,0.45)"/>
<circle cx="150" cy="280" r="1.5" fill="rgba(236,231,220,0.58)"/>
<circle cx="360" cy="640" r="2"   fill="rgba(236,231,220,0.48)"/>
</svg>`

// ── 별자리 (330×162 — 투명 배경) ────────────────────────────────────
const CONSTELLATION_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="330" height="162">
<!-- 연결선 -->
<g stroke="rgba(200,196,188,0.52)" stroke-width="1.2" stroke-linecap="round" fill="none">
  <line x1="32"  y1="122" x2="88"  y2="70"/>
  <line x1="88"  y1="70"  x2="152" y2="44"/>
  <line x1="152" y1="44"  x2="222" y2="80"/>
  <line x1="222" y1="80"  x2="282" y2="36"/>
  <line x1="282" y1="36"  x2="312" y2="74"/>
  <line x1="312" y1="74"  x2="268" y2="120"/>
  <line x1="268" y1="120" x2="222" y2="80"/>
  <line x1="152" y1="44"  x2="182" y2="140"/>
  <line x1="88"  y1="70"  x2="56"  y2="30"/>
</g>

<!-- 별 -->
<circle cx="32"  cy="122" r="3.5" fill="rgba(236,231,220,0.85)"/>
<circle cx="88"  cy="70"  r="5"   fill="rgba(236,231,220,0.95)"/>
<circle cx="152" cy="44"  r="4"   fill="rgba(236,231,220,0.90)"/>
<circle cx="222" cy="80"  r="6.5" fill="rgba(236,231,220,1.0)"/>
<circle cx="282" cy="36"  r="3"   fill="rgba(236,231,220,0.75)"/>
<circle cx="312" cy="74"  r="4.5" fill="rgba(236,231,220,0.88)"/>
<circle cx="268" cy="120" r="3.5" fill="rgba(236,231,220,0.80)"/>
<circle cx="182" cy="140" r="2.5" fill="rgba(236,231,220,0.65)"/>
<circle cx="56"  cy="30"  r="2.5" fill="rgba(236,231,220,0.70)"/>

<!-- 주성 십자 스파클 -->
<g stroke="rgba(236,231,220,0.55)" stroke-width="1" stroke-linecap="round">
  <line x1="222" y1="68"  x2="222" y2="60"/>
  <line x1="222" y1="92"  x2="222" y2="100"/>
  <line x1="210" y1="80"  x2="202" y2="80"/>
  <line x1="234" y1="80"  x2="242" y2="80"/>
</g>
</svg>`

const assets = [
  { svg: PLANET_SVG,        out: 'public/assets/celestial/planet.png',        w: 400, h: 400 },
  { svg: BLACKHOLE_SVG,     out: 'public/assets/celestial/blackhole.png',     w: 400, h: 400 },
  { svg: NEBULA_SVG,        out: 'public/assets/bg/nebula.png',               w: 900, h: 810 },
  { svg: CONSTELLATION_SVG, out: 'public/assets/celestial/constellation.png', w: 330, h: 162 },
]

for (const { svg, out, w, h } of assets) {
  const dest = `${root}/${out}`
  await sharp(Buffer.from(svg))
    .resize(w, h)
    .png({ compressionLevel: 9 })
    .toFile(dest)
  console.log(`✓  ${out}`)
}
console.log('done.')
