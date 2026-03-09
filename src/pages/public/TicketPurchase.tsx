import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getEvent, createOrder } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

export default function TicketPurchase() {
  const { id: eventId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const state = location.state as { tierId?: string; quantity?: number } | null

  const [selectedTierId, setSelectedTierId] = useState(state?.tierId || '')
  const [qty, setQty] = useState(state?.quantity || 1)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', country: 'United States',
  })

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId!),
    enabled: !!eventId,
  })

  useEffect(() => {
    if (user && event) {
      const profile = user as any
      const parts = (profile.full_name || profile.name || '').split(' ')
      setForm(f => ({
        ...f,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        email: profile.email || '',
      }))
    }
  }, [user, event])

  useEffect(() => {
    if (event && !selectedTierId) {
      const tiers = (event.ticket_tiers || []).filter((t: any) => t.is_active)
      if (tiers.length > 0) setSelectedTierId(tiers[0].id)
    }
  }, [event, selectedTierId])

  const orderMut = useMutation({
    mutationFn: () => createOrder({
      buyerId: user!.id,
      eventId: eventId!,
      tierId: selectedTierId,
      quantity: qty,
      buyerName: `${form.firstName} ${form.lastName}`.trim() || undefined,
    }),
    onSuccess: (order) => {
      navigate('/confirmation', { state: { orderId: order.id } })
    },
  })

  const handleChange = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { navigate('/login', { state: { returnTo: location.pathname } }); return }
    if (!selectedTierId) return
    orderMut.mutate()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
    fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', boxSizing: 'border-box',
  }

  if (isLoading) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
        Loading...
      </div>
    )
  }

  const tiers = event ? (event.ticket_tiers || []).filter((t: any) => t.is_active) : []
  const selectedTier = tiers.find((t: any) => t.id === selectedTierId)
  const subtotal = selectedTier ? (selectedTier.price_cents / 100) * qty : 0
  const total = subtotal

  const dateStr = event?.start_at
    ? new Date(event.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '—'

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎟</div>
          <div style={{ fontWeight: 800, fontSize: '19px', color: '#0f172a' }}>Hadathy<span style={{ color: '#2563eb' }}>.com</span></div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#94a3b8' }}>🔒 Secure Checkout · SSL Encrypted</div>
      </nav>

      {/* STEPS */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '20px 48px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          {[
            { n: '✓', label: 'Select Tickets', state: 'done' },
            { n: '2', label: 'Your Details', state: 'active' },
            { n: '3', label: 'Confirmation', state: 'pending' },
          ].map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0, background: s.state === 'done' ? '#10b981' : s.state === 'active' ? '#2563eb' : '#e2e8f0', color: s.state === 'pending' ? '#94a3b8' : '#fff' }}>{s.n}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: s.state === 'done' ? '#10b981' : s.state === 'active' ? '#2563eb' : '#94a3b8' }}>{s.label}</div>
              </div>
              {i < 2 && <div style={{ flex: 1, height: '2px', background: s.state === 'done' ? '#10b981' : '#e2e8f0', margin: '0 12px' }}></div>}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ maxWidth: '900px', margin: '36px auto', padding: '0 48px 72px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '28px' }}>
          <div>
            {/* TICKET SELECTION */}
            {tiers.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>Ticket Type</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {tiers.map((t: any) => (
                    <div key={t.id} onClick={() => { setSelectedTierId(t.id); setQty(1) }} style={{ border: `2px solid ${selectedTierId === t.id ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '10px', padding: '14px', cursor: 'pointer', background: selectedTierId === t.id ? '#eff6ff' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>{t.price_cents === 0 ? 'Free' : `$${(t.price_cents / 100).toFixed(0)}`}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Quantity:</div>
                  <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>−</button>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', minWidth: '24px', textAlign: 'center' }}>{qty}</div>
                  <button type="button" onClick={() => setQty(qty + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>+</button>
                </div>
              </div>
            )}

            {/* CONTACT INFO */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>Contact Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div><label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>First Name</label><input style={inputStyle} type="text" required value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} /></div>
                <div><label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Last Name</label><input style={inputStyle} type="text" required value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} /></div>
              </div>
              <div style={{ marginBottom: '16px' }}><label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Email Address</label><input style={inputStyle} type="email" required value={form.email} onChange={e => handleChange('email', e.target.value)} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Phone Number</label><input style={inputStyle} type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+1 (555) 000-0000" /></div>
                <div><label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Country</label>
                  <select style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }} value={form.country} onChange={e => handleChange('country', e.target.value)}>
                    <option>United States</option><option>United Kingdom</option><option>Canada</option><option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PAYMENT BYPASS INFO */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>Finalize Order</div>
              <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#15803d', fontSize: '14px', fontWeight: 600 }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚀</div>
                Your order will be processed immediately. Tickets will be available in your profile.
              </div>
              {orderMut.isError && (
                <div style={{ marginTop: '12px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '13px' }}>
                  Error processing order. Please ensure you have run the setup SQL script.
                </div>
              )}
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', position: 'sticky', top: '20px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>Order Summary</div>
              {event && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🎟</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{event.title}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>📅 {dateStr}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>📍 {event.location_name || 'Online'}</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {selectedTier && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                      <span>{selectedTier.name} × {qty}</span>
                      <span style={{ color: '#334155', fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1.5px solid #e2e8f0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {!user && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#fef3c7', borderRadius: '10px', fontSize: '13px', color: '#92400e', textAlign: 'center' }}>
                  <Link to="/login" state={{ returnTo: location.pathname }} style={{ color: '#d97706', fontWeight: 700 }}>Sign in</Link> to complete your purchase
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedTierId || !user || orderMut.isPending}
                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginTop: '16px', opacity: (!selectedTierId || !user || orderMut.isPending) ? 0.7 : 1 }}
              >
                {orderMut.isPending ? 'Processing...' : 'Confirm and Get Tickets →'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '10px' }}>🔒 Your payment is 100% secure</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                {['✅ Free cancellation up to 48h before', '✅ Instant ticket delivery via email', '✅ 24/7 customer support'].map(g => (
                  <div key={g} style={{ fontSize: '12px', color: '#64748b' }}>{g}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
