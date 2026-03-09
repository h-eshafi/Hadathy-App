import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import { getOrganizerStats, getRevenueByMonth, getEvents, getOrdersForOrganizer } from '../../lib/api'

const statusStyle = (s: string) => ({
  background: s === 'active' ? '#d1fae5' : s === 'draft' ? '#f1f5f9' : s === 'ended' ? '#f1f5f9' : s === 'pending' ? '#fef3c7' : '#fee2e2',
  color: s === 'active' ? '#065f46' : s === 'draft' ? '#64748b' : s === 'ended' ? '#64748b' : s === 'pending' ? '#92400e' : '#991b1b',
})

const statusLabel = (s: string) => {
  if (s === 'active') return 'Active'
  if (s === 'draft') return 'Draft'
  if (s === 'pending') return 'Pending Review'
  if (s === 'rejected') return 'Rejected'
  if (s === 'ended') return 'Ended'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function OrganizerOverview() {
  const { user } = useAuth()

  const { data: stats } = useQuery({
    queryKey: ['organizer-stats', user?.id],
    queryFn: () => getOrganizerStats(user!.id),
    enabled: !!user?.id,
  })

  const { data: revenueData = [] } = useQuery({
    queryKey: ['organizer-revenue', user?.id],
    queryFn: () => getRevenueByMonth(8, user!.id),
    enabled: !!user?.id,
  })

  const { data: events = [] } = useQuery({
    queryKey: ['organizer-events', user?.id],
    queryFn: () => getEvents({ organizerId: user!.id }),
    enabled: !!user?.id,
  })

  const { data: recentOrders = [] } = useQuery({
    queryKey: ['organizer-orders', user?.id],
    queryFn: () => getOrdersForOrganizer(user!.id),
    enabled: !!user?.id,
  })

  const topEvents = events.slice(0, 4)
  const recentSales = recentOrders.slice(0, 5)

  const fmt = (cents: number) => `$${(cents / 100).toLocaleString()}`
  const fmtK = (cents: number) => cents >= 100000 ? `$${Math.round(cents / 100000)}K` : fmt(cents)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: '📋', bg: '#dbeafe', val: stats?.totalEvents ?? '—', label: 'Total Events', change: `${events.filter(e => e.status === 'active').length} active` },
          { icon: '🎟', bg: '#d1fae5', val: stats?.ticketsSold?.toLocaleString() ?? '—', label: 'Tickets Sold', change: 'All time' },
          { icon: '💰', bg: '#fef3c7', val: stats ? fmtK(stats.totalRevenue) : '—', label: 'Total Revenue', change: 'Paid orders' },
          { icon: '👥', bg: '#ede9fe', val: stats?.totalAttendees?.toLocaleString() ?? '—', label: 'Total Attendees', change: 'Checked in' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>{s.icon}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, marginBottom: '2px' }}>{s.val}</div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>{s.label}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px', color: '#10b981' }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* CHART */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>Revenue Overview</div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueData.map(d => ({ ...d, revenue: d.revenue / 100 }))}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis hide />
            <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        {/* EVENTS TABLE */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>My Events</div>
            <Link to="/organizer/events" style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          {topEvents.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0', fontSize: '14px' }}>No events yet. <Link to="/organizer/events/create" style={{ color: '#3b82f6' }}>Create one →</Link></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Event', 'Date', 'Status', 'Sales'].map(h => <th key={h} style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {topEvents.map(e => {
                  const tiers = (e as any).ticket_tiers || []
                  const sold = tiers.reduce((s: number, t: any) => s + (t.sold_count || 0), 0)
                  const cap = tiers.reduce((s: number, t: any) => s + (t.capacity || 0), 0) || 1
                  const dateStr = e.start_at ? new Date(e.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
                  return (
                    <tr key={e.id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                            {(e as any).cover_image_url ? (
                              <img src={(e as any).cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              '🎪'
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '13px' }}>{e.title}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{e.location_name || 'Online'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>{dateStr}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ ...statusStyle(e.status), padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700 }}>{statusLabel(e.status)}</span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700 }}>{sold} / {cap}</div>
                        <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '100px', marginTop: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, Math.round(sold / cap * 100))}%`, background: 'linear-gradient(90deg, #3b82f6, #0ea5e9)', borderRadius: '100px' }}></div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* RECENT SALES */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>Recent Sales</div>
            <Link to="/organizer/sales" style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>View all</Link>
          </div>
          {recentSales.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0', fontSize: '14px' }}>No sales yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentSales.map((s: any, i: number) => {
                const displayName = s.buyer_name || s.profiles?.full_name || 'Unknown'
                const initials = displayName[0].toUpperCase()
                const name = displayName
                const eventName = s.events?.title || 'Event'
                const amount = `+$${(s.total_cents / 100).toFixed(2)}`
                const time = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < recentSales.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #bfdbfe, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: '#1e40af', flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{eventName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>{amount}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{time}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
