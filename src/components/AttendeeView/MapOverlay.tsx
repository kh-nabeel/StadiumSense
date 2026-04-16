import React, { useEffect, useRef, useState } from 'react'
import { useOccupancy } from '../../hooks/useOccupancy'
import { calcOccupancyPct, getDensityColor } from '../../data/seedData'

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

// Kochi JN Stadium center coords
const STADIUM_CENTER = { lat: 9.9972, lng: 76.3008 }

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(); return }
    const existing = document.getElementById('gmap-script')
    if (existing) { existing.addEventListener('load', () => resolve()); return }
    const script = document.createElement('script')
    script.id = 'gmap-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=visualization`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
}

export default function MapOverlay() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const overlaysRef = useRef<google.maps.OverlayView[]>([])
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [mapsError, setMapsError] = useState(false)
  const { sections } = useOccupancy()

  // Load Google Maps
  useEffect(() => {
    if (!MAPS_API_KEY) { setMapsError(true); return }
    loadGoogleMaps()
      .then(() => setMapsLoaded(true))
      .catch(() => setMapsError(true))
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstanceRef.current) return
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: STADIUM_CENTER,
      zoom: 17,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    })
  }, [mapsLoaded])

  // Draw overlay circles for each zone
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current) return
    const map = mapInstanceRef.current

    // Clear previous overlays
    overlaysRef.current.forEach((o) => o.setMap(null))
    overlaysRef.current = []

    sections.forEach((section) => {
      const pct = section.occupancyPct
      const color = getDensityColor(pct)

      // Custom SVG overlay
      class ZoneOverlay extends google.maps.OverlayView {
        private div: HTMLDivElement | null = null

        onAdd() {
          this.div = document.createElement('div')
          this.div.setAttribute('role', 'img')
          this.div.setAttribute('aria-label', `${section.name}: ${pct}% full`)
          this.div.style.cssText = `
            position: absolute; pointer-events: none;
            display: flex; flex-direction: column; align-items: center;
          `

          const bubble = document.createElement('div')
          bubble.style.cssText = `
            background: #ffffff;
            border: 2.5px solid ${color};
            border-radius: 50%;
            width: 70px; height: 70px;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            animation: zone-pulse 2.5s ease-in-out infinite;
          `
          bubble.innerHTML = `
            <span style="font-size:14px;font-weight:700;color:${color};line-height:1.2">${pct}%</span>
            <span style="font-size:10px;color:#202124;font-weight:600;line-height:1.3;text-align:center;padding:0 4px">${section.name.split(' ')[0]}</span>
          `

          this.div.appendChild(bubble)
          const label = document.createElement('span')
          label.textContent = section.gateNumber
          label.style.cssText = `font-size:10px;color:#5f6368;margin-top:4px;font-weight:600;background:#ffffff;padding:2px 8px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.12);`
          this.div.appendChild(label)

          const panes = this.getPanes()!
          panes.overlayLayer.appendChild(this.div)

          // Inject keyframes once
          if (!document.getElementById('zone-pulse-kf')) {
            const style = document.createElement('style')
            style.id = 'zone-pulse-kf'
            style.textContent = `@keyframes zone-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:0.85}}`
            document.head.appendChild(style)
          }
        }

        draw() {
          if (!this.div) return
          const proj = this.getProjection()
          const pos = proj.fromLatLngToDivPixel(new google.maps.LatLng(section.lat, section.lng))!
          this.div.style.left = `${pos.x - 35}px`
          this.div.style.top = `${pos.y - 35}px`
        }

        onRemove() {
          this.div?.parentNode?.removeChild(this.div)
          this.div = null
        }
      }

      const overlay = new ZoneOverlay()
      overlay.setMap(map)
      overlaysRef.current.push(overlay)
    })
  }, [mapsLoaded, sections])

  // Fallback: zone grid cards when no Maps API
  if (mapsError || !MAPS_API_KEY) {
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-4)' }}>
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Crowd Density</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
            Live zone occupancy — Map view unavailable
          </p>
        </div>
        <DensityLegend />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
          {sections.map((s, i) => {
            const pct = s.occupancyPct
            const color = getDensityColor(pct)
            return (
              <div
                key={s.id}
                className="card fade-up"
                style={{ animationDelay: `${i * 60}ms`, borderLeft: `3px solid ${color}` }}
                role="region"
                aria-label={`${s.name} density zone`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{s.name}</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color }}>{pct}%</span>
                </div>
                <div className="progress-bar-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>
                  <span>{s.gateNumber}</span>
                  <span>{s.currentOccupancy.toLocaleString()} / {s.capacity.toLocaleString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} aria-label="Stadium crowd density map" role="application" />
      {/* Legend overlay */}
      <div
        className="glass"
        style={{
          position: 'absolute', bottom: 'var(--space-3)', left: 'var(--space-3)',
          borderRadius: 'var(--radius)', padding: 'var(--space-3)',
        }}
        aria-label="Map legend"
      >
        <DensityLegend compact />
      </div>
      {/* Loading overlay */}
      {!mapInstanceRef.current && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'var(--color-bg)'
        }}>
          <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 0 }} />
        </div>
      )}
    </div>
  )
}

function DensityLegend({ compact = false }: { compact?: boolean }) {
  const items = [
    { color: '#22c55e', label: 'Low (<70%)' },
    { color: '#f59e0b', label: 'Medium (70-90%)' },
    { color: '#ef4444', label: 'High (>90%)' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: compact ? 'column' : 'row', gap: compact ? 6 : 'var(--space-4)' }}>
      {items.map((item) => (
        <div key={item.color} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
