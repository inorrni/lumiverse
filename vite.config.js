import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 배포는 프로젝트 GitHub Pages 하위경로(https://inorrni.github.io/lumiverse/)라
// 빌드 시에만 base 를 '/lumiverse/' 로 둔다. 로컬 dev 는 '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/lumiverse/' : '/',
  plugins: [react()],
}))
