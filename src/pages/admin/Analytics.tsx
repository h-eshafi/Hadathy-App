import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import * as api from '../../lib/api'

export default function AdminAnalytics() {
  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: api.getAdminStats })
  const { data: revenueData = [] } = useQuery({ queryKey: ['revenue-by-month'], queryFn: () => api.getRevenueByMonth(7) })
  const { data: topEvents = [] } = useQuery({ queryKey: ['top-events'], queryFn: () => api.getTopEvents(5) })
  const { data: topOrgs = [] } = useQuery({ queryKey: ['top-organizers'], queryFn: () => api.getTopOrganizers(5) })
  const { data: categories = [] } = useQuery({ queryKey: ['category-breakdown'], queryFn: api.getCategoryBreakdown })

  const totalRevenue = stats?.totalRevenue || 0
  const totalTickets = revenueData.reduce((s: number, d: { tickets?: number }) => s + (d.tickets || 0), 0)

  // Build conic gradient from categories
  const buildConic = () => {
    let deg = 0
    return (categories as { pct: number; color: string }[]).map(c => {
      const start = deg
      deg += (c.pct / 100) * 360
      return `${c.color} ${start}deg ${deg}deg`
    }).join(', ')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Platform Analytics</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ padding: '9px 18px', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Export Report</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: '💰', bg: '#dbeafe', val: `$${(totalRevenue / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, label: 'Total Revenue', change: 'All-time platform revenue' },
          { icon: '🎟', bg: '#d1fae5', val: totalTickets.toLocaleString(), label: 'Tickets Sold', change: 'From revenue data' },
          { icon: '👥', bg: '#ede9fe', val: (stats?.totalUsers || 0).toLocaleString(), label: 'Total Users', change: 'Registered users' },
          { icon: '📋', bg: '#fef3c7', val: (stats?.activeEvents || 0).toLocaleString(), label: 'Active Events', change: 'Currently live' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>{s.icon}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, marginBottom: '2px' }}>{s.val}</div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>{s.label}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px', color: '#10b981' }}>{s.change}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>Revenue & Tickets — Monthly</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueData} barSize={14} barGap={3}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tickets" fill="#0ea5e9" radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            {[{ color: '#3b82f6', label: 'Revenue ($)' }, { color: '#0ea5e9', label: 'Tickets Sold' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: l.color }}></div>{l.label}</div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '18px', alignSelf: 'flex-start' }}>Events by Category</div>
          {categories.length > 0 ? (
            <>
              <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', background: `conic-gradient(${buildConic()})`, marginBottom: '14px' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '70px', height: '70px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>{(categories as { count: number }[]).reduce((s, c) => s + c.count, 0)}</div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>events</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                {(categories as { name: string; pct: number; color: string }[]).map(c => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: c.color, flexShrink: 0 }}></div>
                    <span style={{ flex: 1, color: '#334155' }}>{c.name}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{c.pct}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No active events</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Top Events by Revenue</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['#', 'Event', 'Revenue', 'Tickets'].map(h => <th key={h} style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', padding: '8px 0', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>{h}</th>)}</tr></thead>
            <tbody>
              {(topEvents as { rank: number; name: string; revenue: number; tickets: number }[]).map(e => (
                <tr key={e.rank}>
                  <td style={{ padding: '11px 0', borderBottom: '1px solid #f1f5f9', fontWeight: 800, color: '#94a3b8', width: '24px' }}>{e.rank}</td>
                  <td style={{ padding: '11px 0', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{e.name}</td>
                  <td style={{ padding: '11px 0', borderBottom: '1px solid #f1f5f9', fontWeight: 800, color: '#10b981', fontSize: '13px' }}>${(e.revenue / 100).toLocaleString()}</td>
                  <td style={{ padding: '11px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>{e.tickets.toLocaleString()}</td>
                </tr>
              ))}
              {topEvents.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Top Organizers by Revenue</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['#', 'Organizer', 'Revenue', 'Events'].map(h => <th key={h} style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', padding: '8px 0', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>{h}</th>)}</tr></thead>
            <tbody>
              {(topOrgs as { rank: number; name: string; revenue: number; events: number }[]).map(o => (
                <tr key={o.rank}>
                  <td style={{ padding: '11px 0', borderBottom: '1px solid #f1f5f9', fontWeight: 800, color: '#94a3b8', width: '24px' }}>{o.rank}</td>
                  <td style={{ padding: '11px 0', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{o.name}</td>
                  <td style={{ padding: '11px 0', borderBottom: '1px solid #f1f5f9', fontWeight: 800, color: '#10b981', fontSize: '13px' }}>${(o.revenue / 100).toLocaleString()}</td>
                  <td style={{ padding: '11px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>{o.events}</td>
                </tr>
              ))}
              {topOrgs.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
