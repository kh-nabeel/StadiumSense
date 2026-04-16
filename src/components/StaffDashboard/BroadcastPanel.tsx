import React, { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import { useOccupancy } from '../../hooks/useOccupancy'
import type { StadiumAlert, AlertSeverity } from '../../types'

export default function BroadcastPanel() {
  const { sections } = useOccupancy()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<AlertSeverity>('info')
  const [targetZone, setTargetZone] = useState<string>('all')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.')
      return
    }

    setSending(true)
    setError(null)

    const alert: Omit<StadiumAlert, 'id'> = {
      title: title.trim(),
      message: message.trim(),
      severity,
      targetZone,
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 30, // expires in 30 min
      createdBy: auth.currentUser?.uid,
    }

    try {
      await addDoc(collection(db, 'alerts'), alert)
      setSent(true)
      setTitle('')
      setMessage('')
      setTimeout(() => setSent(false), 4000)
    } catch (err) {
      setError('Failed to send alert. Check Firestore connection.')
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const severityOptions: { value: AlertSeverity; label: string; color: string }[] = [
    { value: 'info', label: '📢 Info', color: 'var(--color-primary)' },
    { value: 'warning', label: '⚠️ Warning', color: 'var(--color-amber)' },
    { value: 'critical', label: '🚨 Critical', color: 'var(--color-red)' },
  ]

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Broadcast Alerts</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
          Push real-time notifications to attendees in specific zones or venue-wide
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        {/* Form */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 'var(--space-5)' }}>Compose Alert</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="alert-title">Alert Title *</label>
              <input
                id="alert-title"
                className="form-input"
                type="text"
                placeholder="e.g. Gate C temporarily closed"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={80}
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="alert-message">Message *</label>
              <textarea
                id="alert-message"
                className="form-input"
                placeholder="Provide clear instructions for attendees…"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                maxLength={300}
                style={{ resize: 'vertical' }}
                aria-required="true"
              />
              <p style={{ fontSize: '0.72rem', color: 'var(--color-text-dim)', textAlign: 'right' }}>{message.length}/300</p>
            </div>

            <div className="form-group">
              <p className="form-label">Severity</p>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }} role="radiogroup" aria-label="Alert severity">
                {severityOptions.map(opt => (
                  <button
                    key={opt.value}
                    role="radio"
                    aria-checked={severity === opt.value}
                    aria-label={`Severity: ${opt.label}`}
                    onClick={() => setSeverity(opt.value)}
                    style={{
                      flex: 1, padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius)', border: `1.5px solid ${severity === opt.value ? opt.color : 'var(--color-border)'}`,
                      background: severity === opt.value ? `${opt.color}18` : 'var(--color-bg-2)',
                      color: severity === opt.value ? opt.color : 'var(--color-text-muted)',
                      fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                      transition: 'all var(--transition)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="target-zone">Target Zone</label>
              <select
                id="target-zone"
                className="form-select"
                value={targetZone}
                onChange={e => setTargetZone(e.target.value)}
                aria-label="Select target zone for broadcast"
              >
                <option value="all">🌐 Venue-wide (all attendees)</option>
                {sections.map(s => (
                  <option key={s.id} value={s.name}>{s.name} · {s.occupancyPct}%</option>
                ))}
              </select>
            </div>

            {error && (
              <div style={{ background: 'var(--color-red-bg)', borderRadius: 'var(--radius)', padding: 'var(--space-3)', color: 'var(--color-red)', fontSize: '0.85rem' }} role="alert">
                {error}
              </div>
            )}

            {sent && (
              <div style={{ background: 'var(--color-green-bg)', borderRadius: 'var(--radius)', padding: 'var(--space-3)', color: 'var(--color-green)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }} role="status" aria-live="polite">
                ✅ Alert sent to <strong>{targetZone === 'all' ? 'all attendees' : targetZone}</strong>
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ marginTop: 'var(--space-2)' }}
              onClick={handleSend}
              disabled={sending || !title.trim() || !message.trim()}
              aria-label="Send broadcast alert"
            >
              {sending ? 'Sending…' : '📡 Send Alert'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)' }}>Preview</h2>
          <div
            className="card"
            style={{
              borderLeft: `3px solid ${severity === 'critical' ? 'var(--color-red)' : severity === 'warning' ? 'var(--color-amber)' : 'var(--color-primary)'}`,
              background: severity === 'critical' ? 'var(--color-red-bg)' : severity === 'warning' ? 'var(--color-amber-bg)' : 'rgba(99,102,241,0.07)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: '1.2rem' }}>
                {severity === 'critical' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <strong style={{ fontSize: '0.95rem' }}>{title || 'Alert Title'}</strong>
              <span className={`badge ${severity === 'critical' ? 'badge-red' : severity === 'warning' ? 'badge-amber' : 'badge-blue'}`} style={{ marginLeft: 'auto' }}>
                {targetZone === 'all' ? 'Venue-wide' : targetZone}
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
              {message || 'Your alert message will appear here…'}
            </p>
          </div>

          <div className="card" style={{ marginTop: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--color-text-muted)' }}>Zone Occupancy Overview</h3>
            {sections.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.82rem' }}>
                <span style={{ color: targetZone === s.name || targetZone === 'all' ? 'var(--color-text)' : 'var(--color-text-dim)' }}>{s.name}</span>
                <span style={{ fontWeight: 700, color: s.densityLabel === 'critical' ? 'var(--color-red)' : s.densityLabel === 'medium' || s.densityLabel === 'high' ? 'var(--color-amber)' : 'var(--color-green)' }}>
                  {s.occupancyPct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
