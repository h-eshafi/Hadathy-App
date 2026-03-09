import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { getTicket, cancelTicket } from '../../lib/api'

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => getTicket(id!),
    enabled: !!id,
  })

  const cancelMut = useMutation({
    mutationFn: () => cancelTicket(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['participant-tickets'] })
      qc.invalidateQueries({ queryKey: ['ticket', id] })
      navigate('/participant/tickets')
    },
  })

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this ticket? This cannot be undone.')) {
      cancelMut.mutate()
    }
  }

  const handleDownload = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading ticket...</div>
    )
  }

  if (!ticket) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>😕</div>
        <div style={{ fontSize: '16px', fontWeight: 700 }}>Ticket not found</div>
        <Link to="/participant/tickets" style={{ color: '#3b82f6', textDecoration: 'none', marginTop: '12px', display: 'inline-block' }}>Back to My Tickets</Link>
      </div>
    )
  }

  const event = ticket.events as any
  const tier = ticket.ticket_tiers as any
  const orderItem = Array.isArray(ticket.order_items) ? ticket.order_items[0] : ticket.order_items as any
  const order = orderItem?.orders as any

  const bookingRef = order?.id?.slice(0, 8).toUpperCase() || ticket.id.slice(0, 8).toUpperCase()
  const dateStr = event?.start_at
    ? new Date(event.start_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '—'
  const timeStr = event?.start_at
    ? new Date(event.start_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : ''
  const purchaseDate = ticket.created_at
    ? new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'
  const pricePaid = orderItem?.unit_price_cents
    ? `$${(orderItem.unit_price_cents / 100).toFixed(2)}`
    : tier?.price_cents ? `$${(tier.price_cents / 100).toFixed(2)}` : 'Free'
  const totalPaid = order?.total_cents
    ? `$${(order.total_cents / 100).toFixed(2)}`
    : pricePaid

  const isActive = ticket.status === 'active'
  const isCancelled = ticket.status === 'cancelled'
  const isCheckedIn = !!ticket.checked_in_at

  const statusColor = isActive ? '#10b981' : isCancelled ? '#ef4444' : '#94a3b8'
  const statusLabel = isActive ? (isCheckedIn ? 'Checked In' : 'Active') : isCancelled ? 'Cancelled' : ticket.status

  return (
    <div>
      <div style={{ marginBottom: '16px', fontSize: '13px', color: '#94a3b8' }}>
        <Link to="/participant/tickets" style={{ color: '#3b82f6', textDecoration: 'none' }}>My Tickets</Link> › #{bookingRef}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* LEFT — Ticket Visual */}
        <div>
          <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(37,99,235,0.08)' }}>
            {/* Ticket Header */}
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}></div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>{event?.title || 'Event'}</div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {dateStr !== '—' && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>📅 {dateStr}{timeStr && ` · ${timeStr}`}</div>}
                {event?.location_name && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>📍 {event.location_name}</div>}
              </div>
            </div>

            {/* Ticket Body */}
            <div style={{ padding: '28px' }}>
              {/* QR Code area */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#eff6ff', borderRadius: '14px', padding: '18px', border: '1.5px dashed #bfdbfe', marginBottom: '24px' }}>
                <div style={{ width: '100px', height: '100px', background: '#fff', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', flexShrink: 0, padding: '8px' }}>
                  {/* QR code visual representation */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '2px', width: '72px' }}>
                    {Array.from({ length: 25 }, (_, i) => (
                      <div key={i} style={{ width: '100%', paddingBottom: '100%', background: [0,1,5,6,2,7,10,11,15,16,18,20,22,24,4,9,14,19,23].includes(i) ? '#0f172a' : '#fff', borderRadius: '1px' }}></div>
                    ))}
                  </div>
                  <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '4px', fontFamily: 'monospace' }}>{ticket.qr_code?.slice(0, 10)}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1d4ed8', marginBottom: '4px' }}>{tier?.name || 'Standard'}</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>{user?.full_name || user?.name || 'Attendee'}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '4px' }}>TICKET #{bookingRef}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Show QR at venue entrance</div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>{pricePaid}</div>
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Event Date', val: event?.start_at ? new Date(event.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                  { label: 'Show Time', val: timeStr || '—' },
                  { label: 'Ticket Type', val: tier?.name || 'Standard' },
                  { label: 'Venue', val: event?.location_name || '—' },
                  { label: 'Order ID', val: `#${bookingRef}` },
                  { label: 'Purchase Date', val: purchaseDate },
                ].map(d => (
                  <div key={d.label} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{d.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{d.val}</div>
                  </div>
                ))}
              </div>

              {!isCancelled && (
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#92400e' }}>⚠ Important: This ticket is non-transferable. Present QR code at the entrance.</div>
                </div>
              )}

              {isCancelled && (
                <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#991b1b' }}>This ticket has been cancelled and is no longer valid for entry.</div>
                </div>
              )}
            </div>

            {/* Ticket Footer */}
            <div style={{ background: '#f8fafc', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px' }}>
                Status: <span style={{ color: statusColor, fontWeight: 700 }}>{statusLabel}</span>
                {isCheckedIn && ticket.checked_in_at && (
                  <span style={{ color: '#94a3b8', marginLeft: '8px' }}>
                    · Checked in {new Date(ticket.checked_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleDownload} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>⬇ Download PDF</button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Sidebar */}
        <div>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Order Details</div>
            {[
              ['Ticket Type', tier?.name || 'Standard'],
              ['Quantity', String(orderItem?.quantity || 1) + ' ticket' + ((orderItem?.quantity || 1) > 1 ? 's' : '')],
              ['Price per ticket', pricePaid],
              ['Total Paid', totalPaid],
            ].map(([l, v], i) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: i === 3 ? '#0f172a' : '#64748b', fontWeight: i === 3 ? 800 : 400, marginBottom: '8px', paddingTop: i === 3 ? '8px' : 0, borderTop: i === 3 ? '1px solid #e2e8f0' : 'none' }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={handleDownload} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>⬇ Download PDF</button>
              {isActive && !isCheckedIn && (
                <button
                  onClick={handleCancel}
                  disabled={cancelMut.isPending}
                  style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1.5px solid #fecaca', background: '#fff', color: '#ef4444', fontSize: '14px', fontWeight: 600, cursor: cancelMut.isPending ? 'not-allowed' : 'pointer' }}
                >
                  {cancelMut.isPending ? 'Cancelling...' : 'Cancel Ticket'}
                </button>
              )}
              <Link to="/participant/browse" style={{ display: 'block', width: '100%', padding: '11px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#334155', fontSize: '14px', fontWeight: 600, textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>Browse More Events</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
