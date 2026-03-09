import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOrder } from '../../lib/api'

export default function Confirmation() {
  const location = useLocation()
  const state = location.state as { orderId?: string } | null
  const orderId = state?.orderId

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
  })

  const [copied, setCopied] = useState(false)

  if (!orderId) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ fontSize: '48px' }}>🎟</div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>No order found</div>
        <Link to="/browse" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Browse Events</Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
        Loading your confirmation...
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ fontSize: '48px' }}>❌</div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Error loading order</div>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Please try refreshing the page.</p>
        <Link to="/browse" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Back to Browse</Link>
      </div>
    )
  }

  const event = order?.events as any
  const items = order?.order_items as any[] || []
  const buyer = order?.profiles as any

  const bookingRef = order?.booking_ref || order?.id?.slice(0, 8).toUpperCase() || 'HADATHY'
  const dateStr = event?.start_at
    ? new Date(event.start_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '—'
  const timeStr = event?.start_at
    ? new Date(event.start_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : ''
  const totalPaid = order ? (order.total_cents / 100).toFixed(2) : '0.00'
  const buyerEmail = buyer?.email || '—'

  const handleDownloadPDF = () => window.print()

  const eventUrl = event?.id ? `${window.location.origin}/events/${event.id}` : window.location.href
  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  const handleShareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=I'm attending ${encodeURIComponent(event?.title || 'an event')}!&url=${encodeURIComponent(eventUrl)}`, '_blank')
  const handleShareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`, '_blank')
  const handleShareLinkedIn = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`, '_blank')

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎟</div>
          <div style={{ fontWeight: 800, fontSize: '19px', color: '#0f172a' }}>Hadathy<span style={{ color: '#2563eb' }}>.com</span></div>
        </Link>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>Need help? <a href="#" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Contact Support</a></div>
      </nav>

      {/* STEPS - all done */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '20px 48px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          {['Select Tickets', 'Your Details', 'Confirmation'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, background: '#10b981', color: '#fff' }}>✓</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>{label}</div>
              </div>
              {i < 2 && <div style={{ flex: 1, height: '2px', background: '#10b981', margin: '0 12px' }}></div>}
            </div>
          ))}
        </div>
      </div>

      {/* SUCCESS BANNER */}
      <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', borderBottom: '1px solid #a7f3d0', padding: '40px 48px', textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px' }}>✓</div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.8px', color: '#065f46', marginBottom: '8px' }}>Booking Confirmed!</h1>
        <p style={{ fontSize: '16px', color: '#047857' }}>Your tickets have been sent to {buyerEmail}</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1.5px solid #a7f3d0', borderRadius: '10px', padding: '10px 24px', marginTop: '16px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
          Booking Reference: <span style={{ color: '#10b981', fontSize: '18px' }}>#{bookingRef}</span>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '36px auto', padding: '0 48px 72px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '28px' }}>
        <div>
          {/* TICKET DISPLAY */}
          <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(37,99,235,0.08)', marginBottom: '20px' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}></div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>{event?.title || 'Event'}</div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {dateStr !== '—' && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>📅 {dateStr}{timeStr ? ' · ' + timeStr : ''}</div>}
                {event?.location_name && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>📍 {event.location_name}</div>}
              </div>
            </div>
            <div style={{ padding: '28px' }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No ticket details available</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {items.map((item: any, idx: number) => {
                    const tier = item.ticket_tiers
                    return (
                      <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#eff6ff', borderRadius: '14px', padding: '18px', border: '1.5px dashed #bfdbfe' }}>
                        <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: '1px solid #e2e8f0', flexShrink: 0 }}>▦</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1d4ed8', marginBottom: '4px' }}>{tier?.name || 'Ticket'} × {item.quantity}</div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>Order #{bookingRef}-{String(idx + 1).padStart(2, '0')}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>BOOKING REF: #{bookingRef}</div>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb' }}>
                          ${((item.unit_price_cents || 0) / 100 * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div style={{ background: '#f8fafc', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>🔒 Non-transferable · For entry at venue</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleCopyLink} style={{ padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{copied ? '✓ Copied!' : '↗ Share'}</button>
                <button onClick={handleDownloadPDF} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>⬇ Download PDF</button>
              </div>
            </div>
          </div>

          {/* NEXT STEPS */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>What happens next?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: '📧', title: 'Check your email', sub: `Your tickets + PDF receipt have been sent to ${buyerEmail}` },
                { icon: '📱', title: 'View your tickets', sub: 'Find your tickets in your participant dashboard under My Tickets' },
                { icon: '🗺️', title: 'Plan your journey', sub: event?.location_name ? `Venue: ${event.location_name}` : 'Check the event details for venue information' },
                { icon: '🎟', title: 'At the venue', sub: 'Show your QR code (on your phone or printed) at the entrance gate' },
              ].map(ns => (
                <div key={ns.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{ns.icon}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{ns.title}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{ns.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>Order Summary</div>
            {items.map((item: any) => {
              const tier = item.ticket_tiers
              return (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  <span>{tier?.name || 'Ticket'} × {item.quantity}</span>
                  <span>${((item.subtotal_cents || 0) / 100).toFixed(2)}</span>
                </div>
              )
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              <span>Total Paid</span><span>${totalPaid}</span>
            </div>
          </div>

          {event && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>Event Details</div>
              <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dateStr !== '—' && <div>📅 {dateStr}</div>}
                {timeStr && <div>🕖 Show: {timeStr}</div>}
                {event.location_name && <div>📍 {event.location_name}</div>}
              </div>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>📅 Add to Calendar</button>
                <Link to="/browse" style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>Browse More Events</Link>
              </div>
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Share this event</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button onClick={handleShareTwitter} style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: '#334155' }}>𝕏 Twitter</button>
              <button onClick={handleShareFacebook} style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: '#334155' }}>f Facebook</button>
              <button onClick={handleShareLinkedIn} style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: '#334155' }}>in LinkedIn</button>
              <button onClick={handleCopyLink} style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: '#334155' }}>{copied ? '✓ Copied!' : '🔗 Copy Link'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
