import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../../components/layout/Navbar'
import { getEvent, addToWishlist, removeFromWishlist, getWishlist } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

const catEmoji: Record<string, string> = {
  music: '🎵', tech: '💻', art: '🎨', sports: '🏃', food: '🍽️',
  comedy: '🎤', education: '📚', business: '💼', other: '🎪',
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [selectedTierIdx, setSelectedTierIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [inWishlist, setInWishlist] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEvent(id!),
    enabled: !!id,
  })

  // Check wishlist status
  useQuery({
    queryKey: ['wishlist-check', user?.id, id],
    queryFn: async () => {
      if (!user?.id || !id) return []
      const wl = await getWishlist(user.id)
      const found = wl.some((item: any) => item.event_id === id)
      setInWishlist(found)
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
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '64px' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>Loading event...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '64px' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>Event not found.</div>
      </div>
    )
  }

  const tiers = (event.ticket_tiers || []).filter((t: any) => t.is_active)
  const selectedTier = tiers[selectedTierIdx] || tiers[0]
  const subtotal = selectedTier ? (selectedTier.price_cents / 100) * qty : 0
  const total = subtotal

  const cat = event.category || 'other'
  const emoji = catEmoji[cat] || '🎪'
  const dateStr = event.start_at
    ? new Date(event.start_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '—'
  const timeStr = event.start_at
    ? new Date(event.start_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : ''
  const organizer = event.profiles as any

  const totalCapacity = tiers.reduce((s: number, t: any) => s + (t.capacity || 0), 0)
  const totalSold = tiers.reduce((s: number, t: any) => s + (t.sold_count || 0), 0)
  const soldPct = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0

  const handleBuyTickets = () => {
    if (!selectedTier) return
    navigate(`/events/${id}/purchase`, { state: { tierId: selectedTier.id, quantity: qty } })
  }

  return (
    <div style={{ background: '#f8fafc', paddingTop: '64px' }}>
      <Navbar />

      {/* HERO */}
      <div style={{
        height: '360px',
        background: event.cover_image_url ? `url(${event.cover_image_url}) center/cover no-repeat` : 'linear-gradient(135deg, #1e3a8a, #2563eb, #0ea5e9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {!event.cover_image_url && <div style={{ fontSize: '100px', opacity: 0.3 }}>{emoji}</div>}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,22,40,0.8) 0%, rgba(10,22,40,0.2) 60%, transparent 100%)' }}></div>
        <div style={{ position: 'absolute', bottom: '28px', left: '48px', right: '48px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '100px', padding: '5px 16px', color: '#fff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{emoji} {cat}</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {user && (
              <button
                onClick={() => wishlistMut.mutate()}
                disabled={wishlistMut.isPending}
                style={{ padding: '8px 18px', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >{inWishlist ? '♥ Saved' : '🤍 Save'}</button>
            )}
            <button onClick={handleShare} style={{ padding: '8px 18px', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{copied ? '✓ Copied!' : '↗ Share'}</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 48px', fontSize: '13px', color: '#94a3b8' }}>
        <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Home</Link> › <Link to="/browse" style={{ color: '#3b82f6', textDecoration: 'none' }}>Events</Link> › {event.title}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', maxWidth: '1200px', margin: '0 auto', padding: '0 48px 72px' }}>
        {/* LEFT */}
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-1px', color: '#0f172a', marginBottom: '16px', lineHeight: 1.15 }}>{event.title}</h1>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '28px', flexWrap: 'wrap' }}>
            {[
              { icon: '📅', label: 'Date & Time', val: `${dateStr}${timeStr ? ' · ' + timeStr : ''}` },
              { icon: '📍', label: 'Location', val: event.location_name || 'Online' },
              { icon: '👥', label: 'Capacity', val: totalCapacity > 0 ? `${totalCapacity.toLocaleString()} seats` : 'Limited' },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{m.icon}</div>
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{m.val}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>About this event</div>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{event.description || 'No description available.'}</p>
          </div>

          {organizer && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>Organizer</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: '#fff', fontWeight: 700 }}>
                  {organizer.full_name?.[0]?.toUpperCase() || 'O'}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{organizer.full_name}</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Verified Organizer</div>
                </div>
              </div>
            </div>
          )}

          {event.location_name && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>Location</div>
              <div style={{ height: '200px', background: 'linear-gradient(135deg, #eff6ff, #e0f2fe)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', border: '1px solid #dbeafe' }}>
                <span style={{ fontSize: '32px' }}>🗺️</span>
                <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{event.location_name}</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT - Ticket Card */}
        <div>
          <div style={{ position: 'sticky', top: '88px', background: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(37,99,235,0.08)' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Get Your Tickets</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>Select a ticket type below</div>

            {tiers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '14px' }}>No tickets available</div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {tiers.map((t: any, i: number) => {
                    const remaining = (t.capacity || 0) - (t.sold_count || 0)
                    const warn = remaining < 50
                    return (
                      <div key={t.id} onClick={() => { setSelectedTierIdx(i); setQty(1) }} style={{ border: `2px solid ${selectedTierIdx === i ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', background: selectedTierIdx === i ? '#eff6ff' : '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb' }}>
                            {t.price_cents === 0 ? 'Free' : `$${(t.price_cents / 100).toFixed(0)}`}
                          </div>
                        </div>
                        {warn && remaining > 0 && (
                          <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '6px', fontWeight: 600 }}>⚠ Only {remaining} left</div>
                        )}
                        {remaining === 0 && (
                          <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '6px', fontWeight: 600 }}>Sold out</div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {soldPct > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                      <span>Seats filling fast</span><span>{soldPct}% sold</span>
                    </div>
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${soldPct}%`, background: 'linear-gradient(90deg, #3b82f6, #0ea5e9)', borderRadius: '100px' }}></div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Quantity</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>−</button>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', minWidth: '24px', textAlign: 'center' }}>{qty}</div>
                    <button onClick={() => setQty(qty + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>+</button>
                  </div>
                </div>

                {selectedTier && selectedTier.price_cents > 0 && (
                  <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '8px' }}><span>{selectedTier.name} × {qty}</span><span>${subtotal.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#0f172a', borderTop: '1px solid #dbeafe', paddingTop: '10px', marginTop: '4px' }}><span>Total</span><span>${total.toFixed(2)}</span></div>
                  </div>
                )}

                <button
                  onClick={handleBuyTickets}
                  disabled={!selectedTier || ((selectedTier.capacity || 0) - (selectedTier.sold_count || 0)) === 0}
                  style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginBottom: '16px', opacity: !selectedTier ? 0.5 : 1 }}
                >
                  {selectedTier?.price_cents === 0 ? 'Register Free' : 'Buy Tickets'}
                </button>
              </>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontSize: '12px', color: '#94a3b8' }}>🔒 Secure checkout · Free cancellation up to 48h</div>
          </div>
        </div>
      </div>
    </div>
  )
}
