import React, { useState } from 'react'
import { calcWaitTimeDisplay } from '../../data/seedData'
import type { ConcessionStand } from '../../types'

interface Props {
  stand: ConcessionStand
  onOrder: () => void
}

export default function QueueCard({ stand, onOrder }: Props) {
  const [expanded, setExpanded] = useState(false)
  const waitColor =
    stand.waitTimeMinutes <= 5 ? 'var(--color-green)' :
    stand.waitTimeMinutes <= 12 ? 'var(--color-amber)' :
    'var(--color-red)'

  const statusLabel = !stand.isOpen ? 'Closed' : stand.waitTimeMinutes <= 5 ? 'Open' : 'Busy'
  const statusClass = !stand.isOpen ? 'badge-red' : stand.waitTimeMinutes <= 5 ? 'badge-green' : 'badge-amber'

  return (
    <article
      className="card fade-up"
      style={{ padding: 'var(--space-4)', cursor: 'pointer' }}
      onClick={() => setExpanded(!expanded)}
      role="button"
      aria-expanded={expanded}
      aria-label={`${stand.name}, ${statusLabel}, wait time ${calcWaitTimeDisplay(stand.waitTimeMinutes)}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{stand.name}</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{stand.section}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-1)' }}>
          <span className={`badge ${statusClass}`}>{statusLabel}</span>
          {stand.isOpen && (
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-dim)' }}>
              {stand.menuItems.filter(m => m.available).length} items available
            </span>
          )}
        </div>
      </div>

      {/* Wait time bar */}
      {stand.isOpen && (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Wait Time</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: waitColor }}>
              {calcWaitTimeDisplay(stand.waitTimeMinutes)}
            </span>
          </div>
          <div className="progress-bar-track" role="progressbar" aria-valuenow={Math.min(100, stand.waitTimeMinutes * 4)} aria-valuemin={0} aria-valuemax={100} aria-label={`Queue length: ${stand.waitTimeMinutes} minutes`}>
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(100, stand.waitTimeMinutes * 4)}%`, background: waitColor }}
            />
          </div>
        </div>
      )}

      {/* Menu preview */}
      {expanded && (
        <div style={{ marginBottom: 'var(--space-3)', animation: 'fade-up 0.25s ease' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-2)' }}>
            Menu
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {stand.menuItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--color-bg-2)', borderRadius: 'var(--radius)',
                  padding: 'var(--space-2) var(--space-3)',
                  opacity: item.available ? 1 : 0.45,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: '1.1rem' }}>{item.emoji}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.name}</span>
                  {!item.available && <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>(sold out)</span>}
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text)' }}>
                  ₹{item.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {stand.isOpen && (
        <button
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '0.85rem' }}
          onClick={(e) => { e.stopPropagation(); onOrder() }}
          aria-label={`Pre-order from ${stand.name}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Pre-order · Skip the Queue
        </button>
      )}

      {!stand.isOpen && (
        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-dim)', padding: 'var(--space-2) 0' }}>
          This stand is currently closed
        </div>
      )}
    </article>
  )
}
