import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { getTickets } from '../../lib/api'

const categoryEmoji: Record<string, string> = {
  music: '🎵', tech: '💻', sports: '🏃', food: '🍽️', art: '🎨', comedy: '🎤', education: '📚', business: '💼', other: '🎪'
}

export default function MyTickets() {
  const { user } = useAuth()
  const [tab, setTab] = useState('all')

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['participant-tickets', user?.id],
    queryFn: () => getTickets(user!.id),
    enabled: !!user?.id,
  })

  const now = new Date()
  const filtered = tickets.filter((t: any) => {
    if (tab === 'all') return true
    if (tab === 'active') return t.status === 'active' && (!t.events?.start_at || new Date(t.events.start_at) > now)
    if (tab === 'used') return t.status === 'active' && t.events?.start_at && new Date(t.events.start_at) <= now
    if (tab === 'cancelled') return t.status === 'cancelled'
    return true
  })

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>My Tickets</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>{tickets.length} total tickets</p>
        </div>
        <Link to="/participant/browse" style={{ padding: '9px 20px', borderRadius: '9px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>+ Browse Events</Link>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f1f5f9', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {[['all', 'All'], ['active', 'Upcoming'], ['used', 'Past'], ['cancelled', 'Cancelled']].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: tab === val ? '#fff' : 'transparent', fontSize: '13px', fontWeight: 600, color: tab === val ? '#2563eb' : '#64748b', cursor: 'pointer', boxShadow: tab === val ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎟</div>
          <div style={{ fontSize: '15px', marginBottom: '8px' }}>No tickets found.</div>
          <Link to="/participant/browse" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Browse events →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((t: any) => {
            const cat = t.events?.category || 'other'
            const emoji = categoryEmoji[cat] || '🎪'
            const eventDate = t.events?.start_at ? new Date(t.events.start_at) : null
            const dateStr = eventDate ? eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'
            const isUpcoming = eventDate && eventDate > now
const isCancelled = t.status === 'cancelled'
            const statusBg = isCancelled ? '#fee2e2' : isUpcoming ? '#d1fae5' : '#f1f5f9'
            const statusColor = isCancelled ? '#991b1b' : isUpcoming ? '#065f46' : '#64748b'
            const statusLabel = isCancelled ? 'Cancelled' : isUpcoming ? 'Active' : 'Used'
            const price = t.ticket_tiers?.price_cents != null ? (t.ticket_tiers.price_cents === 0 ? 'Free' : `$${(t.ticket_tiers.price_cents / 100).toFixed(2)}`) : '—'
            const ticketNum = `#${t.id.slice(0, 8).toUpperCase()}`
            return (
              <div key={t.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex' }}>
                <div style={{ width: '100px', background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0 }}>{emoji}</div>
                <div style={{ flex: 1, padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{t.events?.title || 'Event'}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>📅 {dateStr}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>📍 {t.events?.location_name || 'Online'}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>🎟 {t.ticket_tiers?.name || 'Standard'} · {ticketNum}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb', marginBottom: '8px' }}>{price}</div>
                      <div style={{ padding: '3px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: statusBg, color: statusColor }}>{statusLabel}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <Link to={`/participant/tickets/${t.id}`} style={{ padding: '7px 16px', borderRadius: '8px', border: '1.5px solid #bfdbfe', background: '#eff6ff', color: '#2563eb', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>View Ticket</Link>
                    {t.checked_in_at && <span style={{ padding: '7px 16px', borderRadius: '8px', background: '#d1fae5', color: '#065f46', fontSize: '13px', fontWeight: 600 }}>✓ Checked In</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
