import React, { useState, useEffect, useCallback } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { SEED_EVENT } from '../../data/seedData'
import type { EventPhase, EventTimeline as EventTimelineType } from '../../types'

const PHASE_ORDER: EventPhase[] = ['pre-match', 'kick-off', 'half-time', 'second-half', 'full-time']
const PHASE_LABELS: Record<EventPhase, string> = {
  'pre-match':   '🔵 Pre-Match',
  'kick-off':    '🟢 Kick-Off',
  'half-time':   '🟡 Half-Time',
  'second-half': '🔵 Second Half',
  'full-time':   '🔴 Full-Time',
}
const PHASE_COLORS: Record<EventPhase, string> = {
  'pre-match':   'var(--color-primary)',
  'kick-off':    'var(--color-green)',
  'half-time':   'var(--color-amber)',
  'second-half': 'var(--color-accent)',
  'full-time':   'var(--color-red)',
}

function formatDuration(ms: number): string {
  const totalSecs = Math.max(0, Math.floor(ms / 1000))
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatElapsed(startMs: number): string {
  const elapsed = Math.floor((Date.now() - startMs) / 60000)
  return `${elapsed}'`
}

export default function EventTimeline() {
  const [event, setEvent] = useState<EventTimelineType>(SEED_EVENT)
  const [now, setNow] = useState(Date.now())
  const [saving, setSaving] = useState(false)

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const advancePhase = useCallback(async () => {
    const currentIdx = PHASE_ORDER.indexOf(event.phase)
    if (currentIdx >= PHASE_ORDER.length - 1) return

    const nextPhase = PHASE_ORDER[currentIdx + 1]
    const updated: EventTimelineType = { ...event, phase: nextPhase }

    if (nextPhase === 'half-time') updated.halfTimeStarted = Date.now()
    if (nextPhase === 'second-half') updated.secondHalfStarted = Date.now()
    if (nextPhase === 'full-time') updated.fullTimeAt = Date.now()

    setSaving(true)
    try {
      await setDoc(doc(db, 'events', event.id ?? 'main-event'), updated)
    } catch {
      // offline fallback — update local state anyway
    } finally {
      setSaving(false)
    }
    setEvent(updated)
  }, [event])

  const matchMinutes = event.phase === 'kick-off'
    ? Math.floor((now - event.kickoffTime) / 60000)
    : event.phase === 'second-half' && event.secondHalfStarted
    ? 45 + Math.floor((now - event.secondHalfStarted) / 60000)
    : null

  const phaseIdx = PHASE_ORDER.indexOf(event.phase)
  const progressPct = Math.round((phaseIdx / (PHASE_ORDER.length - 1)) * 100)

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Event Timeline</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
          Track match phases and advance the timeline for attendees
        </p>
      </div>

      {/* Match card */}
      <div
        className="card"
        style={{
          marginBottom: 'var(--space-6)',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.06) 100%)',
          borderColor: 'rgba(99,102,241,0.3)',
        }}
      >
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-4)' }}>
          {event.eventName}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: '1.3rem', fontWeight: 900 }}>{event.homeTeam}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Home</p>
          </div>
          <div style={{ textAlign: 'center', padding: '0 var(--space-4)' }}>
            <div style={{
              background: 'var(--color-bg)',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-3) var(--space-5)',
              border: '1px solid var(--color-border)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 900, letterSpacing: 2 }}>
                {matchMinutes !== null ? (
                  <span style={{ color: 'var(--color-green)' }}>{matchMinutes}'</span>
                ) : (
                  <span style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem' }}>
                    {PHASE_LABELS[event.phase]}
                  </span>
                )}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: '1.3rem', fontWeight: 900 }}>{event.awayTeam}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Away</p>
          </div>
        </div>

        {/* Current phase badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
          <span
            className="badge"
            style={{
              background: `${PHASE_COLORS[event.phase]}22`,
              color: PHASE_COLORS[event.phase],
              border: `1px solid ${PHASE_COLORS[event.phase]}44`,
              fontSize: '0.8rem',
              padding: '4px 16px',
            }}
          >
            {PHASE_LABELS[event.phase]}
          </span>
        </div>

        {/* Progress bar through phases */}
        <div className="progress-bar-track" style={{ height: 8 }} role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label={`Match progress: ${event.phase}`}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, var(--color-primary), ${PHASE_COLORS[event.phase]})`,
            }}
          />
        </div>
      </div>

      {/* Phase timeline */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <h2 style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-4)' }}>Match Phases</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {PHASE_ORDER.map((phase, i) => {
            const isPast = i < phaseIdx
            const isCurrent = phase === event.phase
            const isFuture = i > phaseIdx
            const color = PHASE_COLORS[phase]

            let timestamp: string | null = null
            if (phase === 'kick-off' && event.kickoffTime) timestamp = new Date(event.kickoffTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            if (phase === 'half-time' && event.halfTimeStarted) timestamp = new Date(event.halfTimeStarted).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            if (phase === 'second-half' && event.secondHalfStarted) timestamp = new Date(event.secondHalfStarted).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            if (phase === 'full-time' && event.fullTimeAt) timestamp = new Date(event.fullTimeAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

            return (
              <div
                key={phase}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                  opacity: isFuture ? 0.4 : 1,
                  transition: 'opacity 0.3s ease',
                }}
              >
                {/* Dot */}
                <div style={{
                  width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                  background: isCurrent ? color : isPast ? '#374151' : 'var(--color-surface-2)',
                  border: `2px solid ${isCurrent ? color : isPast ? '#4b5563' : 'var(--color-border)'}`,
                  boxShadow: isCurrent ? `0 0 10px ${color}` : 'none',
                  animation: isCurrent ? 'pulse-dot 1.4s infinite' : 'none',
                }} />
                {/* Line */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: isCurrent ? 800 : 500, color: isCurrent ? color : 'var(--color-text)', fontSize: '0.88rem' }}>
                      {PHASE_LABELS[phase]}
                    </span>
                    {timestamp && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>{timestamp}</span>
                    )}
                    {isCurrent && !timestamp && (
                      <span style={{ fontSize: '0.75rem', color, fontWeight: 600 }}>NOW</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Advance phase control */}
      {event.phase !== 'full-time' && (
        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: 'var(--space-4)', fontSize: '1rem' }}
          onClick={advancePhase}
          disabled={saving}
          aria-label={`Advance to ${PHASE_LABELS[PHASE_ORDER[phaseIdx + 1]] ?? 'next phase'}`}
        >
          {saving ? 'Updating…' : `Advance to ${PHASE_LABELS[PHASE_ORDER[phaseIdx + 1]] ?? 'Next Phase'} →`}
        </button>
      )}

      {event.phase === 'full-time' && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)', borderColor: 'rgba(239,68,68,0.3)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>🏁</div>
          <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Full-Time</p>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)', fontSize: '0.85rem' }}>
            The event has concluded. Monitor exits and deployment.
          </p>
          {event.fullTimeAt && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-text-dim)', marginTop: 'var(--space-3)' }}>
              Ended at {new Date(event.fullTimeAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
