// 천체 PNG 최적화 — 표시 크기에 맞춰 리사이즈 + 팔레트 압축(알파 유지, 경로/파일명 불변).
// 사용 중인 에셋만 대상. 데드 에셋(galaxy.png·background.png)은 건드리지 않는다.
import sharp from 'sharp'
import { readFileSync, writeFileSync, statSync } from 'node:fs'

const DIR = 'public/assets/celestial/'
const JOBS = [
  { f: 'planet.png', max: 512 },     // 2D 행성(최대 ~130px)
  { f: 'planet_2.png', max: 420 },   // 3D 스프라이트 텍스처
  { f: 'galaxy-ink.png', max: 360 }, // 은하 뱃지(~85px)
  { f: 'galaxy-paper.png', max: 360 },
]

for (const { f, max } of JOBS) {
  const path = DIR + f
  const before = statSync(path).size
  const buf = await sharp(readFileSync(path))
    .resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
    .png({ palette: true, quality: 72, effort: 10, compressionLevel: 9 })
    .toBuffer()
  writeFileSync(path, buf)
  const after = statSync(path).size
  console.log(`${f}: ${Math.round(before/1024)}KB → ${Math.round(after/1024)}KB (-${Math.round((1-after/before)*100)}%)`)
}
