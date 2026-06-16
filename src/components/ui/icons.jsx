// 작은 SVG 아이콘 atom 모음 — 모두 currentColor 를 따르므로 부모의
// color(토큰) 로 색을 제어한다. 장식용은 aria-hidden.

export function Sparkle({ size = 12, className, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      className={className} style={{ flex: 'none', ...style }}>
      <path d="M12 1.5L14.2 9.8 22.5 12 14.2 14.2 12 22.5 9.8 14.2 1.5 12 9.8 9.8z" fill="currentColor" />
    </svg>
  );
}

export function StarIcon({ filled = true, size = 18, className, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      className={className} style={{ flex: 'none', ...style }}>
      <path d="M12 2.6l2.8 6 6.5.6-4.9 4.4 1.4 6.4L12 16.7 6.2 20l1.4-6.4L2.7 9.2l6.5-.6z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
        opacity={filled ? 1 : 0.55} />
    </svg>
  );
}

// 별밭/우주 아이콘 (하단 내비용) — kind 로 모양 선택
export function NavIcon({ kind, size = 22 }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.45, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const wrap = (children) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...s}>{children}</svg>
  );
  if (kind === 'universe') return wrap(<>
    <circle cx="12" cy="12" r="4.8" />
    <ellipse cx="12" cy="12" rx="10.2" ry="3.4" transform="rotate(-20 12 12)" />
  </>);
  if (kind === 'todo') return wrap(
    <path d="M12 2.8l2.4 5.3 5.5.5-4.2 3.8 1.2 5.5L12 15.4l-4.9 2.5 1.2-5.5L4.1 8.6l5.5-.5z" />
  );
  if (kind === 'blackhole') return wrap(<>
    <circle cx="12" cy="12" r="2.8" fill="currentColor" stroke="none" />
    <path d="M12 3.2a8.8 8.8 0 1 0 8.8 8.8" />
    <path d="M12 7a5 5 0 1 0 5 5" />
  </>);
  if (kind === 'check') return wrap(<>
    <circle cx="12" cy="12" r="8.4" />
    <polyline points="8.2 12 11 14.8 15.8 9.2" />
  </>);
  // settings
  return wrap(<>
    <line x1="3.5" y1="8" x2="20.5" y2="8" />
    <line x1="3.5" y1="16" x2="20.5" y2="16" />
    <circle cx="9" cy="8" r="2.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="16" r="2.2" fill="currentColor" stroke="none" />
  </>);
}
