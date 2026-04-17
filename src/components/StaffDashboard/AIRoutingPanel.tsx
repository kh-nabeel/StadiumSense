import React, { useState } from 'react'
import { useOccupancy } from '../../hooks/useOccupancy'
import type { CrowdRoutingResponse, RoutingSuggestion } from '../../types'
import { traceGeminiCall } from '../../performance/traces'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined

async function callGeminiDirect(occupancyData: Record<string, number>): Promise<CrowdRoutingResponse> {
  const prompt = `You are a crowd-safety AI for a large stadium. Based on the following section occupancy percentages, suggest optimal gate redirections to balance crowd flow and prevent dangerous congestion.

Current occupancy:
${Object.entries(occupancyData).map(([k, v]) => `- ${k}: ${v}%`).join('\n')}

Respond with a JSON object (no markdown) with this exact schema:
{
  "suggestions": [
    { "fromSection": "string", "toGate": "string", "reason": "string", "urgency": "low|medium|high" }
  ],
  "summary": "string (2-3 sentence executive summary)"
}

Only include sections that need action (over 75% occupancy). Be specific and actionable.`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
      }),
    }
  )

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`)

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
  const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return {
    suggestions: parsed.suggestions ?? [],
    summary: parsed.summary ?? 'No summary available.',
    generatedAt: Date.now(),
  }
}

// Fallback mock when no API key
function getMockSuggestions(occupancyData: Record<string, number>): CrowdRoutingResponse {
  const suggestions: RoutingSuggestion[] = Object.entries(occupancyData)
    .filter(([, pct]) => pct >= 75)
    .map(([section, pct]) => ({
      fromSection: section,
      toGate: pct >= 90 ? 'Gate D (West Stand — 40% full)' : 'Gate B (South Stand — 48% full)',
      reason: pct >= 90
        ? `Critical density at ${pct}%. Immediate redirect required to prevent crush risk.`
        : `High occupancy at ${pct}%. Proactive redirect to ease congestion.`,
      urgency: pct >= 90 ? 'high' : 'medium',
    }))

  return {
    suggestions,
    summary: `${suggestions.length} section${suggestions.length !== 1 ? 's' : ''} require crowd re-routing. West Stand and South Stand have significant capacity available. Recommend directing stewards to affected gates immediately.`,
    generatedAt: Date.now(),
  }
}

const urgencyColors = {
  high: { bg: 'var(--color-red-bg)', border: 'var(--color-red)', text: 'var(--color-red)', badge: 'badge-red' },
  medium: { bg: 'var(--color-amber-bg)', border: 'var(--color-amber)', text: 'var(--color-amber)', badge: 'badge-amber' },
  low: { bg: 'rgba(99,102,241,0.08)', border: 'var(--color-primary)', text: 'var(--color-primary)', badge: 'badge-blue' },
}

export default function AIRoutingPanel() {
  const { sections } = useOccupancy()
  const [result, setResult] = useState<CrowdRoutingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const occupancyData = Object.fromEntries(sections.map(s => [s.name, s.occupancyPct]))

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      if (GEMINI_API_KEY) {
        const stopGemini = traceGeminiCall()
        const data = await callGeminiDirect(occupancyData)
        stopGemini()
        setResult(data)
      } else {
        // Simulate latency for UX demo
        const stopGemini = traceGeminiCall()
        await new Promise(r => setTimeout(r, 1800))
        setResult(getMockSuggestions(occupancyData))
        stopGemini()
      }
    } catch (err) {
      console.error('AI routing error:', err)
      setError('Failed to get AI suggestions. Using local fallback.')
      setResult(getMockSuggestions(occupancyData))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>AI Crowd Routing</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            Gemini-powered gate redirect suggestions based on live occupancy
          </p>
        </div>
        {!GEMINI_API_KEY && (
          <span className="badge badge-amber">Demo Mode</span>
        )}
      </div>

      {/* Input snapshot */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <h2 style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Current Occupancy Snapshot
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
          {sections.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-bg-2)', borderRadius: 'var(--radius)', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>{s.name}</span>
              <span style={{ fontWeight: 800, color: s.densityLabel === 'critical' ? 'var(--color-red)' : s.densityLabel === 'high' || s.densityLabel === 'medium' ? 'var(--color-amber)' : 'var(--color-green)', fontFamily: 'var(--font-mono)' }}>
                {s.occupancyPct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Analyse button */}
      <button
        className="btn btn-primary"
        style={{ marginBottom: 'var(--space-6)', fontSize: '1rem', padding: 'var(--space-4) var(--space-8)', boxShadow: '0 0 40px rgba(99,102,241,0.3)' }}
        onClick={runAnalysis}
        disabled={loading}
        aria-label="Run AI crowd routing analysis"
      >
        {loading ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Analysing with Gemini…
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            {result ? 'Re-run Analysis' : 'Run AI Analysis'}
          </>
        )}
      </button>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 'var(--space-3)' }} />
              <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 'var(--space-2)' }} />
              <div className="skeleton" style={{ height: 14, width: '75%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="slide-in">
          {/* Summary */}
          <div className="card" style={{
            marginBottom: 'var(--space-5)',
            background: 'rgba(99,102,241,0.07)',
            borderColor: 'rgba(99,102,241,0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: '1.2rem' }}>🤖</span>
              <strong style={{ fontSize: '0.9rem' }}>Gemini Summary</strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-dim)', marginLeft: 'auto' }}>
                {new Date(result.generatedAt).toLocaleTimeString()}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              {result.summary}
            </p>
          </div>

          {/* Suggestions */}
          {result.suggestions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>✅</div>
              <p style={{ color: 'var(--color-text-muted)' }}>All sections within safe occupancy levels. No re-routing needed.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <h2 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                {result.suggestions.length} Routing Suggestion{result.suggestions.length !== 1 ? 's' : ''}
              </h2>
              {result.suggestions.map((s, i) => {
                const uc = urgencyColors[s.urgency]
                return (
                  <div
                    key={i}
                    className="card fade-up"
                    style={{ borderLeft: `3px solid ${uc.border}`, background: uc.bg, animationDelay: `${i * 80}ms` }}
                    role="article"
                    aria-label={`Routing suggestion for ${s.fromSection}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{s.fromSection}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: uc.text }}>
                            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                          </svg>
                          <span style={{ fontWeight: 700, color: uc.text, fontSize: '0.9rem' }}>{s.toGate}</span>
                        </div>
                      </div>
                      <span className={`badge ${uc.badge}`}>{s.urgency} urgency</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{s.reason}</p>
                    <button
                      className="btn btn-ghost"
                      style={{ marginTop: 'var(--space-3)', fontSize: '0.8rem' }}
                      onClick={() => alert(`📡 Steward alert sent: Redirect ${s.fromSection} crowds to ${s.toGate}`)}
                      aria-label={`Alert stewards for ${s.fromSection} redirect`}
                    >
                      📡 Alert Stewards
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-amber-bg)', borderRadius: 'var(--radius)', color: 'var(--color-amber)', fontSize: '0.85rem' }} role="alert">
          ⚠️ {error}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
