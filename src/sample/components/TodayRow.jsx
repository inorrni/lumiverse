import * as React from 'react'
import { LUM, StarIcon } from '../lumiverse-ui'

export function DoneOval({ children = 'DONE' }) {
  return (
    <span style={{
      fontFamily: LUM.mono, fontSize: 11.5, letterSpacing: '0.08em', color: LUM.pInk,
      border: `1.5px solid ${LUM.pInk}`, borderRadius: '50%', padding: '5px 13px',
      transform: 'rotate(-4deg)', display: 'inline-block', flex: 'none'
    }}>{children}</span>
  );
}

export function TodayRow({ title, sub, done = true, last = false, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 0', borderBottom: last ? 'none' : `1px solid ${LUM.pLine}` }}>
      <StarIcon filled={done} ink size={21} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: LUM.pInk }}>{title}</div>
        <div style={{ fontSize: 11.5, color: LUM.pMid, marginTop: 3 }}>{sub}</div>
      </div>
      {done ? <DoneOval /> : <span style={{ fontFamily: LUM.mono, fontSize: 12.5, color: LUM.pMid, whiteSpace: 'nowrap', flex: 'none' }}>{count}</span>}
    </div>
  );
}
