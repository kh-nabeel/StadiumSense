import React from 'react'
import { useOccupancy } from '../../hooks/useOccupancy'
import { getDensityColor } from '../../data/seedData'

export default function OccupancyTable() {
  const { sections, loading, totalAttendance, averageOccupancyPct } = useOccupancy()

  return (
    <div className="fade-up">
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Live Occupancy</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            Real-time section fill rates — updates via Firestore stream
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="live-dot" aria-hidden="true" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-red)' }}>LIVE</span>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Total Attendance', value: totalAttendance.toLocaleString(), icon: '👥' },
          { label: 'Avg Occupancy', value: `${averageOccupancyPct}%`, icon: '📊' },
          { label: 'Critical Zones', value: sections.filter(s => s.occupancyPct >= 90).length.toString(), icon: '🚨', danger: sections.some(s => s.occupancyPct >= 90) },
        ].map(card => (
          <div
            key={card.label}
            className="card"
            style={{ borderColor: card.danger ? 'rgba(239,68,68,0.4)' : undefined }}
            role="status"
            aria-label={`${card.label}: ${card.value}`}
          >
            <p style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>{card.icon}</p>
            <p style={{ fontWeight: 800, fontSize: '1.8rem', fontFamily: 'var(--font-mono)', color: card.danger ? 'var(--color-red)' : 'var(--color-text)' }}>{card.value}</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: 2 }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table
          style={{ width: '100%', borderCollapse: 'collapse' }}
          role="table"
          aria-label="Section occupancy data"
        >
          <thead>
            <tr style={{ background: 'var(--color-bg-2)', borderBottom: '1px solid var(--color-border)' }}>
              {['Section', 'Gate', 'Occupancy', 'Fill Rate', 'Current / Max', 'Status'].map(h => (
                <th
                  key={h}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    textAlign: 'left',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                  scope="col"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
                        <div className="skeleton" style={{ height: 16, width: j === 2 ? 80 : 120 }} />
                      </td>
                    ))}
                  </tr>
                ))
              : sections.map((s, i) => {
                  const color = getDensityColor(s.occupancyPct)
                  return (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                        transition: 'background var(--transition)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)')}
                    >
                      <td style={{ padding: 'var(--space-4)', fontWeight: 700, fontSize: '0.9rem' }}>
                        {s.name}
                      </td>
                      <td style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-accent)' }}>
                        {s.gateNumber}
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <span style={{ fontWeight: 900, fontSize: '1.1rem', color, fontFamily: 'var(--font-mono)' }}>
                          {s.occupancyPct}%
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-4)', width: 180 }}>
                        <div className="progress-bar-track" role="progressbar" aria-valuenow={s.occupancyPct} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.name} ${s.occupancyPct}% full`}>
                          <div className="progress-bar-fill" style={{ width: `${s.occupancyPct}%`, background: color }} />
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                        {s.currentOccupancy.toLocaleString()} / {s.capacity.toLocaleString()}
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <span className={`badge ${s.densityLabel === 'critical' || s.densityLabel === 'high' ? 'badge-red' : s.densityLabel === 'medium' ? 'badge-amber' : 'badge-green'}`}>
                          {s.densityLabel}
                        </span>
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
