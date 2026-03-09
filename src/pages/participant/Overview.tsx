import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { getTickets, getWishlist, getEvents, getNotifications } from '../../lib/api'

export default function ParticipantOverview() {
  const { user } = useAuth()

  const { data: tickets = [] } = useQuery({
    queryKey: ['participant-tickets', user?.id],
    queryFn: () => getTickets(user!.id),
    enabled: !!user?.id,
  })

  const { data: wishlist = [] } = useQuery({
    queryKey: ['participant-wishlist', user?.id],
    queryFn: () => getWishlist(user!.id),
    enabled: !!user?.id,
  })

  const { data: browsedEvents = [] } = useQuery({
    queryKey: ['recommended-events'],
    queryFn: () => getEvents({ status: 'active' }),
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ['participant-notifications', user?.id],
    queryFn: () => getNotifications(user!.id),
    enabled: !!user?.id,
  })

  const now = new Date()
  const upcomingTickets = tickets.filter((t: any) => {
    const eventDate = t.events?.start_at ? new Date(t.events.start_at) : null
    return eventDate && eventDate > now && t.status === 'active'
  })
  const attendedCount = tickets.filter((t: any) => t.checked_in_at).length
  const recentNotifs = notifications.slice(0, 5)

  const daysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return '1 day'
    return `${days} days`
  }

  const recommendedEvents = browsedEvents
    .filter((e: any) => !upcomingTickets.some((t: any) => t.event_id === e.id))
    .slice(0, 4)

  const categoryEmoji: Record<string, string> = {
    music: '🎵', tech: '💻', sports: '🏃', food: '🍽️', art: '🎨', comedy: '🎤', education: '📚', business: '💼', other: '🎪'
  }

  return (
    <div style={{ flex: 1 }}>
      {/* WELCOME */}
      <div style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', borderRadius: '20px', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
            Welcome back, {user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there'}! 👋
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>
            {upcomingTickets.length > 0
              ? `You have ${upcomingTickets.length} upcoming event${upcomingTickets.length > 1 ? 's' : ''}. Don't miss out!`
              : "Browse events and get your first ticket today!"}
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/participant/browse" style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: '#fff', color: '#1d4ed8', fontSize: '14px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>Browse Events →</Link>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: '🎟', bg: '#dbeafe', val: tickets.length.toString(), label: 'Tickets Purchased', change: 'All time' },
          { icon: '📅', bg: '#d1fae5', val: upcomingTickets.length.toString(), label: 'Upcoming Events', change: upcomingTickets.length > 0 ? `Next in ${daysUntil(upcomingTickets[0]?.events?.start_at)}` : 'None upcoming' },
          { icon: '🤍', bg: '#fef3c7', val: wishlist.length.toString(), label: 'Saved Events', change: `${wishlist.length} saved` },
          { icon: '🏆', bg: '#ede9fe', val: attendedCount.toString(), label: 'Events Attended', change: 'Checked in' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>{s.icon}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>{s.val}</div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>{s.label}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px', color: '#10b981' }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* TWO COL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        <div>
          {/* UPCOMING TICKETS */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Upcoming Tickets</div>
              <Link to="/participant/tickets" style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
            </div>
            {upcomingTickets.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0', fontSize: '14px' }}>No upcoming events. <Link to="/participant/browse" style={{ color: '#3b82f6' }}>Browse events →</Link></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcomingTickets.slice(0, 3).map((t: any) => {
                  const cat = t.events?.category || 'other'
                  const emoji = categoryEmoji[cat] || '🎪'
                  const dateStr = t.events?.start_at ? new Date(t.events.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
                  const days = t.events?.start_at ? daysUntil(t.events.start_at) : '—'
                  return (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{t.events?.title || 'Event'}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>📅 {dateStr} · {t.events?.location_name || 'Online'}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>🎟 {t.ticket_tiers?.name || 'Standard'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>{days}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>remaining</div>
                        <div style={{ marginTop: '4px', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: '#d1fae5', color: '#065f46' }}>Active</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* RECENT NOTIFICATIONS */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Recent Activity</div>
              <Link to="/participant/notifications" style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>View all</Link>
            </div>
            {recentNotifs.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0', fontSize: '14px' }}>No recent activity.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentNotifs.map((n: any, i: number) => (
                  <div key={n.id} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: i < recentNotifs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.is_read ? '#94a3b8' : '#3b82f6', marginTop: '6px', flexShrink: 0 }}></div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>{n.body || n.title}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Recommended for You</div>
              <Link to="/participant/browse" style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>See all</Link>
            </div>
            {recommendedEvents.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0', fontSize: '14px' }}>No events available.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recommendedEvents.map((e: any) => {
                  const cat = e.category || 'other'
                  const emoji = categoryEmoji[cat] || '🎪'
                  const tiers = (e.ticket_tiers || []).filter((t: any) => t.is_active !== false)
                  const minCents = tiers.length > 0 ? Math.min(...tiers.map((t: any) => t.price_cents)) : null
                  const minPrice = minCents === null ? 'View' : minCents === 0 ? 'Free' : `$${(minCents / 100).toFixed(0)}`
                  const dateStr = e.start_at ? new Date(e.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
                  return (
                    <Link key={e.id} to={`/participant/events/${e.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8fafc', borderRadius: '10px', padding: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '9px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{emoji}</div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{e.title}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>📅 {dateStr} · {e.location_name || 'Online'}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: 800, color: '#2563eb' }}>{minPrice}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px', marginTop: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/participant/browse" style={{ display: 'block', width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>🔍 Browse Events</Link>
              <Link to="/participant/tickets" style={{ display: 'block', width: '100%', padding: '11px', borderRadius: '10px', border: '1.5px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontSize: '14px', fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>🎟 View My Tickets</Link>
              <Link to="/participant/profile" style={{ display: 'block', width: '100%', padding: '11px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '14px', fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>👤 Edit Profile</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
