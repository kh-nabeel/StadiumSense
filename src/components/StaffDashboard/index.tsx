import React, { useState } from 'react'
import OccupancyTable from './OccupancyTable'
import BroadcastPanel from './BroadcastPanel'
import AIRoutingPanel from './AIRoutingPanel'
import EventTimeline from './EventTimeline'
import { useOccupancy } from '../../hooks/useOccupancy'
import { useRemoteConfig } from '../../hooks/useRemoteConfig'

type Panel = 'occupancy' | 'broadcast' | 'ai-routing' | 'timeline'

export default function StaffDashboard() {
  const [activePanel, setActivePanel] = useState<Panel>('occupancy')
  const { totalAttendance, averageOccupancyPct, sections } = useOccupancy()
  const { halftimeMode, exitRoutingActive } = useRemoteConfig()

  const nav: { id: Panel; label: string; icon: React.ReactNode }[] = [
    {
      id: 'occupancy',
      label: 'Occupancy',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
    },
    {
      id: 'broadcast',
      label: 'Broadcast',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07"/><path d="M22 2 11 13M2 2l20 20"/><path d="M14 2H6a2 2 0 0 0-2 2v7"/></svg>,
    },
    {
      id: 'ai-routing',
      label: 'AI Routing',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
  ]

  const criticalSections = sections.filter(s => s.occupancyPct >= 90).length

  return (
    <div style={{ display: 'flex', height: '100dvh', background: 'var(--color-bg)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
        aria-label="Staff Dashboard navigation"
      >
        {/* Logo */}
        <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                <path d="M10 38 L24 10 L38 38 Z" fill="white" opacity="0.95"/>
                <path d="M16 28 L32 28" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>StadiumSense</p>
              <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>Staff Operations</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div style={{ background: 'var(--color-bg-2)', borderRadius: 'var(--radius)', padding: 'var(--space-3)' }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Attendance</p>
              <p style={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{(totalAttendance / 1000).toFixed(1)}k</p>
            </div>
            <div style={{ background: criticalSections > 0 ? 'var(--color-red-bg)' : 'var(--color-bg-2)', borderRadius: 'var(--radius)', padding: 'var(--space-3)' }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Fill</p>
              <p style={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-mono)', marginTop: 2, color: criticalSections > 0 ? 'var(--color-red)' : 'var(--color-text)' }}>
                {averageOccupancyPct}%
              </p>
            </div>
          </div>
          {criticalSections > 0 && (
            <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--color-red-bg)', borderRadius: 'var(--radius)', padding: 'var(--space-2) var(--space-3)' }}>
              <span className="live-dot" />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-red)', fontWeight: 600 }}>
                {criticalSections} critical zone{criticalSections !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: 'var(--space-3)' }} aria-label="Dashboard sections">
          {nav.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              aria-current={activePanel === item.id ? 'page' : undefined}
              aria-label={item.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                width: '100%', padding: 'var(--space-3) var(--space-3)',
                borderRadius: 'var(--radius)', marginBottom: 4,
                background: activePanel === item.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: activePanel === item.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: activePanel === item.id ? 700 : 500,
                fontSize: '0.88rem',
                transition: 'all var(--transition)',
                cursor: 'pointer', border: 'none',
              }}
            >
              <span style={{ width: 18, height: 18, flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
          <a
            href="/"
            style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            aria-label="Switch to attendee view"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Attendee View
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', padding: 'var(--space-6)' }} role="main" aria-label="Staff dashboard content">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {halftimeMode && (
            <div className="card fade-up" style={{ background: 'var(--color-amber)', color: '#000', border: 'none', marginBottom: 'var(--space-4)', padding: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: '1.5rem' }}>⏱️</span>
              <div>
                <strong style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Half Time Mode Active</strong>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: 2 }}>Queue algorithms are optimized for mass egress.</p>
              </div>
            </div>
          )}
          {exitRoutingActive && (
            <div className="card fade-up" style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', marginBottom: 'var(--space-4)', padding: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: '1.5rem' }}>🚪</span>
              <div>
                <strong style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exit Routing Advisory Active</strong>
                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: 2 }}>Attendees are currently being guided to the nearest exits.</p>
              </div>
            </div>
          )}

          {activePanel === 'occupancy' && <OccupancyTable />}
          {activePanel === 'broadcast' && <BroadcastPanel />}
          {activePanel === 'ai-routing' && <AIRoutingPanel />}
          {activePanel === 'timeline' && <EventTimeline />}
        </div>
      </main>
    </div>
  )
}
