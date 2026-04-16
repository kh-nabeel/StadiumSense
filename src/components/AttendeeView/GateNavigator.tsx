import React, { useState, useEffect, useRef } from 'react'
import { useOccupancy } from '../../hooks/useOccupancy'
import { useGeolocation } from '../../hooks/useGeolocation'

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
const STADIUM_CENTER = { lat: 51.5552, lng: -0.2797 }

export default function GateNavigator() {
  const { nearestOpenGate, sections } = useOccupancy()
  const { state: geoState, request: requestGeo } = useGeolocation()
  const [directions, setDirections] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const miniMapRef = useRef<google.maps.Map | null>(null)

  const gate = nearestOpenGate

  const getDirections = async () => {
    if (!MAPS_API_KEY || !window.google?.maps) {
      setDirections(`Head to ${gate.gateNumber} on the ${gate.name} side. Approx 3-5 min walk from central concourse.`)
      return
    }

    if (geoState.status !== 'success') {
      requestGeo()
      return
    }

    setLoading(true)
    const svc = new google.maps.DirectionsService()
    svc.route({
      origin: new google.maps.LatLng(geoState.lat, geoState.lng),
      destination: new google.maps.LatLng(gate.lat, gate.lng),
      travelMode: google.maps.TravelMode.WALKING,
    }, (result, status) => {
      setLoading(false)
      if (status === 'OK' && result) {
        const leg = result.routes[0].legs[0]
        setDirections(`${leg.duration?.text} walk (${leg.distance?.text}) — ${leg.steps[0]?.instructions.replace(/<[^>]*>/g, '')}`)
      } else {
        setDirections(`Head to ${gate.gateNumber} — estimated 4 min walk.`)
      }
    })
  }

  // Initialize mini-map after choosing gate
  useEffect(() => {
    if (!directions || !mapRef.current || !window.google?.maps) return
    if (miniMapRef.current) return
    miniMapRef.current = new google.maps.Map(mapRef.current, {
      center: { lat: gate.lat, lng: gate.lng },
      zoom: 17,
      mapTypeId: 'satellite',
      disableDefaultUI: true,
    })
    new google.maps.Marker({
      position: { lat: gate.lat, lng: gate.lng },
      map: miniMapRef.current,
      title: gate.gateNumber,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10, fillColor: '#6366f1', fillOpacity: 1,
        strokeColor: 'white', strokeWeight: 2,
      }
    })
  }, [directions, gate])

  return (
    <div
      className="glass"
      style={{
        margin: 'var(--space-3)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        flexShrink: 0,
      }}
      role="region"
      aria-label="Nearest open gate navigator"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '1.1rem' }}>🚪</span>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Nearest Open Gate
            </p>
            <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-accent)' }}>
              {gate?.gateNumber ?? 'Gate A'}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="badge badge-green" aria-label={`${gate.occupancyPct}% full`}>
            {gate.occupancyPct}% full
          </span>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-text-dim)', marginTop: 4 }}>{gate.name}</p>
        </div>
      </div>

      {directions ? (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{
            background: 'var(--color-bg-2)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-3)',
            fontSize: '0.85rem',
            color: 'var(--color-text)',
            marginBottom: 'var(--space-2)',
            display: 'flex',
            gap: 'var(--space-2)',
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>🚶</span>
            <span>{directions}</span>
          </div>
          {MAPS_API_KEY && (
            <div ref={mapRef} style={{ height: 120, borderRadius: 'var(--radius)', overflow: 'hidden' }} aria-label="Mini navigation map" />
          )}
        </div>
      ) : null}

      <button
        className="btn btn-accent"
        style={{ width: '100%' }}
        onClick={getDirections}
        disabled={loading}
        aria-label="Get walking directions to nearest open gate"
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#042830', animation: 'spin 0.7s linear infinite' }} />
            Getting directions…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
            {directions ? 'Recalculate Route' : 'Get Directions'}
          </>
        )}
      </button>

      {geoState.status === 'error' && !directions && (
        <p style={{ fontSize: '0.75rem', color: 'var(--color-amber)', marginTop: 'var(--space-2)', textAlign: 'center' }}>
          ⚠️ {geoState.message}
        </p>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
