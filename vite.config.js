import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// 배포는 프로젝트 GitHub Pages 하위경로(https://inorrni.github.io/lumiverse/)라
// 빌드 시에만 base 를 '/lumiverse/' 로 둔다. 로컬 dev 는 '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/lumiverse/' : '/',
  plugins: [react()],
  // 순수 로직 단위 테스트(Vitest) — 브라우저 불필요 → node 환경.
  test: { environment: 'node', include: ['src/**/*.test.{js,jsx}'] },
}))
