import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { getEvent, getWishlist, addToWishlist, removeFromWishlist } from '../../lib/api'

const catEmoji: Record<string, string> = {
  music: '🎵', tech: '💻', art: '🎨', sports: '🏃', food: '🍽️',
  comedy: '🎤', education: '📚', business: '💼', other: '🎪', wellness: '🌿', entertainment: '🎤',
}
const catGradient: Record<string, string> = {
  music: 'linear-gradient(135deg,#1e3a8a,#2563eb)',
  tech: 'linear-gradient(135deg,#0c4a6e,#0ea5e9)',
  art: 'linear-gradient(135deg,#312e81,#6366f1)',
  sports: 'linear-gradient(135deg,#064e3b,#10b981)',
  food: 'linear-gradient(135deg,#78350f,#f59e0b)',
  education: 'linear-gradient(135deg,#4c1d95,#8b5cf6)',
  entertainment: 'linear-gradient(135deg,#881337,#e11d48)',
  wellness: 'linear-gradient(135deg,#134e4a,#0d9488)',
  other: 'linear-gradient(135deg,#1e293b,#475569)',
}

export default function ParticipantEventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [selectedTierIdx, setSelectedTierIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [inWishlist, setInWishlist] = useState(false)

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEvent(id!),
    enabled: !!id,
  })

  useQuery({
    queryKey: ['wishlist-check-participant', user?.id, id],
    queryFn: async () => {
      if (!user?.id || !id) return []
      const wl = await getWishlist(user.id)
      setInWishlist(wl.some((item: any) => item.event_id === id))
      return wl
    },
    enabled: !!user?.id && !!id,
  })

  const wishlistMut = useMutation({
    mutationFn: () => inWishlist
      ? removeFromWishlist(user!.id, id!)
      : addToWishlist(user!.id, id!),
    onSuccess: () => {
      setInWishlist(v => !v)
      qc.invalidateQueries({ queryKey: ['participant-wishlist'] })
    },
  })

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>Loading event...</div>
  }

  if (!event) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>😕</div>
        <div style={{ fontSize: '16px', fontWeight: 700 }}>Event not found</div>
        <Link to="/participant/browse" style={{ color: '#3b82f6', textDecoration: 'none', marginTop: '12px', display: 'inline-block' }}>Browse Events</Link>
      </div>
    )
  }

  const cat = event.category || 'other'
  const emoji = catEmoji[cat] || '🎪'
  const bg = catGradient[cat] || catGradient.other
  const tiers = ((event.ticket_tiers || []) as any[]).filter((t: any) => t.is_active)
  const selectedTier = tiers[selectedTierIdx]
  const available = selectedTier ? (selectedTier.capacity - (selectedTier.sold_count || 0)) : 0
  const soldOut = available <= 0

  const dateStr = event.start_at
    ? new Date(event.start_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '—'
  const timeStr = event.start_at
    ? new Date(event.start_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : ''
  const organizer = (event.profiles as any)?.full_name || 'Organizer'

  const totalPrice = selectedTier ? (selectedTier.price_cents * qty / 100).toFixed(2) : '0.00'

  const handleBuyTickets = () => {
    if (!selectedTier) return
    navigate(`/events/${id}/purchase`, { state: { tierId: selectedTier.id, quantity: qty } })
  }

  return (
    <div>
      <div style={{ marginBottom: '16px', fontSize: '13px', color: '#94a3b8' }}>
        <Link to="/participant/browse" style={{ color: '#3b82f6', textDecoration: 'none' }}>Browse</Link> › {event.title}
      </div>

      {/* Hero */}
      <div style={{
        height: '220px',
        background: event.cover_image_url ? `url(${event.cover_image_url}) center/cover no-repeat` : bg,
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '80px',
        position: 'relative',
        marginBottom: '24px',
        overflow: 'hidden'
      }}>
        {!event.cover_image_url && <span style={{ opacity: 0.4 }}>{emoji}</span>}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 70%)' }}></div>
        <div style={{ position: 'absolute', bottom: '20px', left: '24px', zIndex: 1 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '100px', padding: '5px 16px', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'inline-block' }}>{cat}</div>
        </div>
        {user && (
          <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <button
              onClick={() => wishlistMut.mutate()}
              disabled={wishlistMut.isPending}
              style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.9)', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {inWishlist ? '❤️' : '🤍'}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px' }}>
        {/* LEFT */}
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.8px', color: '#0f172a', marginBottom: '16px' }}>{event.title}</h1>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {dateStr !== '—' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155' }}>
                <span style={{ fontSize: '18px' }}>📅</span>{dateStr}{timeStr && ` · ${timeStr}`}
              </div>
            )}
            {event.location_name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155' }}>
                <span style={{ fontSize: '18px' }}>📍</span>{event.location_name}
              </div>
            )}
          </div>

          {event.description && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>About this event</div>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7 }}>{event.description}</p>
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Organized by</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '18px', flexShrink: 0 }}>
                {organizer[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{organizer}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Event Organizer</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Ticket sidebar */}
        <div style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(37,99,235,0.08)' }}>
            <div style={{ fontSize: '17px', fontWeight: 800, marginBottom: '16px' }}>Get Your Tickets</div>

            {tiers.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0', fontSize: '14px' }}>No tickets available</div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {tiers.map((t: any, i: number) => {
                    const tierAvail = t.capacity - (t.sold_count || 0)
                    const tierSoldOut = tierAvail <= 0
                    return (
                      <div
                        key={t.id}
                        onClick={() => { if (!tierSoldOut) { setSelectedTierIdx(i); setQty(1) } }}
                        style={{
                          border: `2px solid ${selectedTierIdx === i ? '#3b82f6' : '#e2e8f0'}`,
                          borderRadius: '12px', padding: '14px', cursor: tierSoldOut ? 'not-allowed' : 'pointer',
                          background: tierSoldOut ? '#f8fafc' : selectedTierIdx === i ? '#eff6ff' : '#fff',
                          opacity: tierSoldOut ? 0.6 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ fontWeight: 700, color: tierSoldOut ? '#94a3b8' : '#0f172a' }}>{t.name}</div>
                          <div style={{ fontWeight: 800, color: '#2563eb' }}>
                            {t.price_cents === 0 ? 'Free' : `$${(t.price_cents / 100).toFixed(0)}`}
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                          {tierSoldOut ? 'Sold out' : `${tierAvail} remaining`}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {selectedTier && !soldOut && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ fontWeight: 600 }}>Quantity</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '16px' }}>−</button>
                        <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                        <button onClick={() => setQty(Math.min(available, qty + 1))} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '16px' }}>+</button>
                      </div>
                    </div>

                    <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
                        <span>{selectedTier.name} × {qty}</span>
                        <span>${(selectedTier.price_cents * qty / 100).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, borderTop: '1px solid #dbeafe', paddingTop: '8px', marginTop: '4px' }}>
                        <span>Total</span><span>${totalPrice}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleBuyTickets}
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Buy Tickets
                    </button>
                  </>
                )}

                {soldOut && (
                  <div style={{ textAlign: 'center', padding: '14px', background: '#fee2e2', borderRadius: '10px', color: '#991b1b', fontWeight: 600, fontSize: '14px' }}>
                    All tickets sold out
                  </div>
                )}
              </>
            )}
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>🔒 Secure checkout</div>
          </div>
        </div>
      </div>
    </div>
  )
}
