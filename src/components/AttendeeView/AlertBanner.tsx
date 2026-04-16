import React, { useState, useEffect } from 'react'
import type { StadiumAlert } from '../../types'

interface Props {
  alerts: StadiumAlert[]
}

export default function AlertBanner({ alerts }: Props) {
  const [dismissed, setDismissed] = useState<Set<string | number>>(new Set())
  const [idx, setIdx] = useState(0)

  const visible = alerts.filter(a => !dismissed.has(a.id ?? a.createdAt))
  const current = visible[idx % Math.max(1, visible.length)]

  useEffect(() => {
    if (visible.length <= 1) return
    const timer = setInterval(() => setIdx(i => i + 1), 5000)
    return () => clearInterval(timer)
  }, [visible.length])

  if (!current || visible.length === 0) return null

  const bgColor =
    current.severity === 'critical' ? 'rgba(239,68,68,0.15)' :
    current.severity === 'warning' ? 'rgba(245,158,11,0.12)' :
    'rgba(99,102,241,0.12)'

  const borderColor =
    current.severity === 'critical' ? 'var(--color-red)' :
    current.severity === 'warning' ? 'var(--color-amber)' :
    'var(--color-primary)'

  const icon = current.severity === 'critical' ? '🚨' : current.severity === 'warning' ? '⚠️' : 'ℹ️'

  return (
    <div
      className="slide-in"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      style={{
        background: bgColor,
        borderBottom: `2px solid ${borderColor}`,
        padding: 'var(--space-3) var(--space-4)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.3 }}>{current.title}</p>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4, marginTop: 2 }}>{current.message}</p>
        {current.targetZone !== 'all' && (
          <span style={{ fontSize: '0.7rem', color: borderColor, fontWeight: 600 }}>→ {current.targetZone}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
        {visible.length > 1 && (
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>{(idx % visible.length) + 1}/{visible.length}</span>
        )}
        <button
          onClick={() => setDismissed(prev => new Set([...prev, current.id ?? current.createdAt]))}
          style={{
            background: 'none', border: 'none', color: 'var(--color-text-dim)',
            cursor: 'pointer', padding: 4, lineHeight: 1
          }}
          aria-label="Dismiss alert"
        >✕</button>
      </div>
    </div>
  )
}
