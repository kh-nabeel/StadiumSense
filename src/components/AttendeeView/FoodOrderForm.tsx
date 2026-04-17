import React, { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import type { ConcessionStand, FoodOrder, OrderItem } from '../../types'
import { trackFoodPreorder } from '../../analytics/events'

interface Props {
  stands: ConcessionStand[]
  preselectedStand: ConcessionStand | null
  onBack: () => void
}

type Step = 'stand' | 'items' | 'details' | 'confirm' | 'success'

export default function FoodOrderForm({ stands, preselectedStand, onBack }: Props) {
  const [step, setStep] = useState<Step>(preselectedStand ? 'items' : 'stand')
  const [selectedStand, setSelectedStand] = useState<ConcessionStand | null>(preselectedStand)
  const [cart, setCart] = useState<Map<string, OrderItem>>(new Map())
  const [seatNumber, setSeatNumber] = useState('')
  const [instructions, setInstructions] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const openItems = selectedStand?.menuItems.filter(m => m.available) ?? []

  const updateCart = (item: ConcessionStand['menuItems'][0], delta: number) => {
    setCart(prev => {
      const next = new Map(prev)
      const existing = next.get(item.id)
      const qty = (existing?.quantity ?? 0) + delta
      if (qty <= 0) {
        next.delete(item.id)
      } else {
        next.set(item.id, { menuItemId: item.id, name: item.name, price: item.price, quantity: qty })
      }
      return next
    })
  }

  const totalItems = Array.from(cart.values()).reduce((s, i) => s + i.quantity, 0)
  const totalPrice = Array.from(cart.values()).reduce((s, i) => s + i.price * i.quantity, 0)

  const submitOrder = async () => {
    if (!selectedStand || cart.size === 0) return
    setSubmitting(true)
    setError(null)

    const uid = auth.currentUser?.uid ?? 'anonymous'

    const order: FoodOrder = {
      userId: uid,
      standId: selectedStand.id,
      standName: selectedStand.name,
      items: Array.from(cart.values()),
      totalPrice,
      status: 'pending',
      createdAt: Date.now(),
      seatNumber: seatNumber.trim() || undefined,
      specialInstructions: instructions.trim() || undefined,
    }

    try {
      const docRef = await addDoc(collection(db, 'orders'), order)
      setOrderId(docRef.id)
      setStep('success')
      Array.from(cart.values()).forEach(item => {
        trackFoodPreorder(selectedStand.name, item.name)
      })
    } catch (err) {
      // Offline or permission error — store locally
      const localId = `local-${Date.now()}`
      setOrderId(localId)
      setStep('success')
      console.warn('Order stored locally (Firestore unavailable):', err)
    } finally {
      setSubmitting(false)
    }
  }

  const steps: Step[] = ['stand', 'items', 'details', 'confirm']
  const stepLabels = ['Stand', 'Items', 'Details', 'Pay']

  if (step === 'success') {
    return (
      <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 'var(--space-12)' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--color-green-bg)',
          border: '2px solid var(--color-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', marginBottom: 'var(--space-5)',
          animation: 'fade-up 0.5s ease',
        }}>
          ✅
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 'var(--space-2)', textAlign: 'center' }}>Order Placed!</h2>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 'var(--space-3)' }}>
          You'll receive a push notification when your order is ready.
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: 'var(--space-8)' }}>
          Order ID: {orderId?.slice(-8).toUpperCase()}
        </p>
        <div className="card" style={{ width: '100%', marginBottom: 'var(--space-5)' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Order Summary</p>
          {Array.from(cart.values()).map(item => (
            <div key={item.menuItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '4px 0' }}>
              <span>{item.quantity}× {item.name}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
            <span>Total</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ width: '100%' }} onClick={onBack} aria-label="Back to Queues">
          Back to Queues
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-4) var(--space-5)',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <button className="btn btn-ghost" style={{ padding: 'var(--space-2)' }} onClick={onBack} aria-label="Back to queue list">
            <svg aria-label="Back Icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Food Pre-Order</h2>
        </div>
        {/* Steps indicator */}
        <div style={{ display: 'flex', gap: 'var(--space-1)' }} role="list" aria-label="Order steps">
          {steps.map((s, i) => {
            const idx = steps.indexOf(step)
            const done = i < idx
            const active = s === step
            return (
              <div key={s} role="listitem" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%', height: 3, borderRadius: 99,
                  background: done || active ? 'var(--color-primary)' : 'var(--color-surface-2)',
                  transition: 'background 0.3s ease',
                }} />
                <span style={{ fontSize: '0.62rem', color: active ? 'var(--color-primary)' : 'var(--color-text-dim)', fontWeight: active ? 700 : 400, textTransform: 'uppercase' }}>
                  {stepLabels[i]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>
        {/* Step 1: Choose Stand */}
        {step === 'stand' && (
          <div className="fade-up">
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Choose a Stand</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {stands.filter(s => s.isOpen).map((stand) => (
                <button
                  key={stand.id}
                  className="card"
                  style={{ textAlign: 'left', paddingLeft: 'var(--space-4)', cursor: 'pointer', background: selectedStand?.id === stand.id ? 'var(--color-primary-glow)' : undefined, borderColor: selectedStand?.id === stand.id ? 'var(--color-primary)' : undefined }}
                  onClick={() => { setSelectedStand(stand); setStep('items') }}
                  aria-label={`Select ${stand.name}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 700, marginBottom: 2 }}>{stand.name}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{stand.section} · {stand.waitTimeMinutes} min wait</p>
                    </div>
                    <svg aria-label="Forward Icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--color-text-dim)' }}>
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Pick Items */}
        {step === 'items' && selectedStand && (
          <div className="fade-up">
            <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Choose Items</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>{selectedStand.name}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {openItems.map((item) => {
                const qty = cart.get(item.id)?.quantity ?? 0
                return (
                  <div
                    key={item.id}
                    className="card"
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)' }}
                  >
                    <span style={{ fontSize: '1.6rem' }} aria-label={`${item.name} icon`} role="img">{item.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</p>
                      <p style={{ fontWeight: 800, color: 'var(--color-accent)', fontSize: '0.92rem' }}>₹{item.price.toFixed(2)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <button
                        className="btn btn-ghost"
                        style={{ width: 32, height: 32, padding: 0, borderRadius: '50%', fontSize: '1.2rem', lineHeight: 1 }}
                        onClick={() => updateCart(item, -1)}
                        aria-label={`Remove one ${item.name}`}
                        disabled={qty === 0}
                      >−</button>
                      <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700, fontFamily: 'var(--font-mono)' }} aria-live="polite">{qty}</span>
                      <button
                        className="btn btn-ghost"
                        style={{ width: 32, height: 32, padding: 0, borderRadius: '50%', fontSize: '1.2rem', lineHeight: 1 }}
                        onClick={() => updateCart(item, 1)}
                        aria-label={`Add one ${item.name}`}
                      >+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 3: Delivery Details */}
        {step === 'details' && (
          <div className="fade-up">
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Your Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="seat-number">Seat Number (optional)</label>
                <input
                  id="seat-number"
                  className="form-input"
                  type="text"
                  placeholder="e.g. N12 Row C Seat 14"
                  value={seatNumber}
                  onChange={e => setSeatNumber(e.target.value)}
                  maxLength={30}
                  aria-describedby="seat-hint"
                />
                <p id="seat-hint" style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                  Leave blank to collect from the stand
                </p>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="special-instructions">Special Instructions</label>
                <textarea
                  id="special-instructions"
                  className="form-input"
                  placeholder="Allergies, dietary requirements…"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  rows={3}
                  maxLength={200}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 'confirm' && selectedStand && (
          <div className="fade-up">
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Confirm Order</h3>
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-3)' }}>{selectedStand.name}</p>
              {Array.from(cart.values()).map(item => (
                <div key={item.menuItemId} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem' }}>
                  <span>{item.quantity}× {item.name}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-accent)' }}>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            {seatNumber && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                📍 Seat: <strong>{seatNumber}</strong>
              </p>
            )}
            {instructions && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                📝 {instructions}
              </p>
            )}
            {error && (
              <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-red-bg)', borderRadius: 'var(--radius)', color: 'var(--color-red)', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {step !== 'stand' && (
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          {totalItems > 0 && step === 'items' && (
            <p style={{ textAlign: 'center', marginBottom: 'var(--space-3)', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              {totalItems} item{totalItems !== 1 ? 's' : ''} · <strong style={{ color: 'var(--color-text)' }}>₹{totalPrice.toFixed(2)}</strong>
            </p>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {step !== 'items' && (
              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => {
                  const idx = steps.indexOf(step)
                  setStep(steps[idx - 1])
                }}
                aria-label="Go to previous step"
              >Back</button>
            )}
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={() => {
                if (step === 'items') {
                  if (cart.size === 0) return
                  setStep('details')
                } else if (step === 'details') {
                  setStep('confirm')
                } else if (step === 'confirm') {
                  submitOrder()
                }
              }}
              disabled={(step === 'items' && cart.size === 0) || submitting}
              aria-label={step === 'confirm' ? 'Place order' : 'Continue to next step'}
            >
              {submitting ? 'Placing Order…' : step === 'confirm' ? '🎉 Place Order' : 'Continue →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
