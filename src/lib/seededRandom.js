// 결정적 난수 유틸 — 같은 seed는 항상 같은 시퀀스를 낸다.
// 3D 우주(은하 위치·행성 궤도·별 구름)를 매 렌더 동일하게 재현하기 위함.
// ConstellationArt 의 문자열→숫자 seed 발상을 공유한다.

// 문자열/숫자 seed → 32bit 정수 해시.
export function hashSeed(seed) {
  const s = String(seed ?? '')
  let h = 2166136261 >>> 0 // FNV-1a offset basis
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// mulberry32 PRNG — seed(숫자) 받아 [0,1) 난수를 내는 함수 반환.
export function mulberry32(seedNum) {
  let a = seedNum >>> 0
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 편의 함수: seed(문자열 가능)로 바로 난수 생성기 만들기.
export function rngFor(seed) {
  return mulberry32(hashSeed(seed))
}
