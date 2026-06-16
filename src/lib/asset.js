// 정적 에셋(public) 경로를 Vite base(배포 하위경로)에 맞춰 만든다.
// 개발: BASE_URL='/' → '/assets/..' / 배포(Pages): '/lumiverse/' → '/lumiverse/assets/..'
export const asset = (path) => import.meta.env.BASE_URL + String(path).replace(/^\//, '')
