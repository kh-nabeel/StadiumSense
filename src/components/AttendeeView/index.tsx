import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import MapOverlay from './MapOverlay'
import QueueCard from './QueueCard'
import FoodOrderForm from './FoodOrderForm'
import AlertBanner from './AlertBanner'
import GateNavigator from './GateNavigator'
import { useFirestoreCollection } from '../../hooks/useFirestore'
import { SEED_CONCESSIONS } from '../../data/seedData'
import type { ConcessionStand, StadiumAlert, Concession } from '../../types'
import { COLLECTIONS } from '../../constants'

type Tab = 'map' | 'queues' | 'order' | 'alerts'

export default function AttendeeView() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('map')
  const [selectedStand, setSelectedStand] = useState<ConcessionStand | null>(null)

  const { data: firestoreConcessions } = useFirestoreCollection<ConcessionStand>(COLLECTIONS.CONCESSIONS)
  const { data: alerts } = useFirestoreCollection<StadiumAlert>(COLLECTIONS.ALERTS)

  const concessions: ConcessionStand[] = useMemo(() => {
    if (firestoreConcessions.length === 0) return SEED_CONCESSIONS
    return firestoreConcessions.map((fc: Concession | any) => {
      const seedMatch = SEED_CONCESSIONS.find(seed => seed.name === fc.name)
      return {
        id: fc.id ?? 'unknown',
        name: fc.name ?? 'Unnamed Stand',
        section: fc.section ?? fc.location ?? seedMatch?.section ?? '',
        waitTimeMinutes: fc.waitTimeMinutes ?? fc.waitMin ?? seedMatch?.waitTimeMinutes ?? 0,
        isOpen: fc.isOpen ?? true,
        menuItems: fc.menuItems ?? seedMatch?.menuItems ?? [],
        lat: seedMatch?.lat ?? fc.lat ?? 0,
        lng: seedMatch?.lng ?? fc.lng ?? 0,
      } as ConcessionStand
    })
  }, [firestoreConcessions])

  const activeAlerts = alerts.filter(
    (a) => !a.expiresAt || a.expiresAt > Date.now()
  )

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'map',
      label: 'Map',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
          <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
        </svg>
      ),
    },
    {
      id: 'queues',
      label: 'Queues',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      id: 'order',
      label: 'Order',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      ),
    },
    {
      id: 'alerts',
      label: 'Alerts',
      badge: activeAlerts.length,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <header style={{
        padding: 'var(--space-4) var(--space-5)',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M10 38 L24 10 L38 38 Z" fill="white" opacity="0.95"/>
              <path d="M16 28 L32 28" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.2 }}>StadiumSense</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
              Attendee View
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button 
            className="btn btn-danger"
            onClick={() => navigate('/staff')}
            style={{ fontSize: '0.7rem', padding: 'var(--space-1) var(--space-2)', minHeight: 'unset', marginRight: 'var(--space-2)' }}
            aria-label="Staff login"
          >
            Staff View
          </button>
          <span className="live-dot" aria-hidden="true" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-red)' }}>LIVE</span>
        </div>
      </header>

      {/* Alert Banner */}
      {activeAlerts.length > 0 && <AlertBanner alerts={activeAlerts} />}

      {/* Content */}
      <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }} role="main">
        {activeTab === 'map' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <MapOverlay />
            <GateNavigator />
          </div>
        )}
        {activeTab === 'queues' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: 'var(--space-4)' }}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Concession Queues</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                Live wait times — tap a stand to pre-order
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {concessions.map((stand) => (
                <QueueCard
                  key={stand.id}
                  stand={stand}
                  onOrder={() => {
                    setSelectedStand(stand)
                    setActiveTab('order')
                  }}
                />
              ))}
            </div>
          </div>
        )}
        {activeTab === 'order' && (
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <FoodOrderForm
              stands={concessions}
              preselectedStand={selectedStand}
              onBack={() => setActiveTab('queues')}
            />
          </div>
        )}
        {activeTab === 'alerts' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: 'var(--space-4)' }}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Stadium Alerts</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                {activeAlerts.length} active notification{activeAlerts.length !== 1 ? 's' : ''}
              </p>
            </div>
            {activeAlerts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>✅</div>
                <p>No active alerts at this time.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id ?? alert.createdAt}
                    className="card fade-up"
                    style={{
                      borderLeft: `3px solid ${
                        alert.severity === 'critical' ? 'var(--color-red)' :
                        alert.severity === 'warning' ? 'var(--color-amber)' : 'var(--color-primary)'
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                      <span style={{ fontSize: '1.1rem' }}>
                        {alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
                      </span>
                      <strong style={{ fontSize: '0.95rem' }}>{alert.title}</strong>
                      <span className={`badge ${alert.severity === 'critical' ? 'badge-red' : alert.severity === 'warning' ? 'badge-amber' : 'badge-blue'}`} style={{ marginLeft: 'auto' }}>
                        {alert.targetZone === 'all' ? 'Venue-wide' : alert.targetZone}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>{alert.message}</p>
                    <p style={{ fontSize: '0.74rem', color: 'var(--color-text-dim)', marginTop: 'var(--space-2)' }}>
                      {new Date(
                        alert.createdAt || 
                        (alert as any).timestamp?.toMillis?.() || 
                        (alert as any).timestamp || 
                        Date.now()
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar" role="navigation" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.label}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            style={{ position: 'relative' }}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && tab.badge > 0 ? (
              <span style={{
                position: 'absolute', top: 4, right: '50%', transform: 'translateX(10px)',
                background: 'var(--color-red)', color: 'white',
                borderRadius: '99px', fontSize: '0.6rem', fontWeight: 700,
                padding: '1px 5px', lineHeight: 1.4
              }} aria-label={`${tab.badge} alerts`}>
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
    </div>
  )
}
