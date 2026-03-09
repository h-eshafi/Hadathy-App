import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import * as api from '../../lib/api'

const roleBadge = (role: string) => ({
  padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, display: 'inline-block' as const,
  background: role === 'organizer' ? '#ede9fe' : role === 'admin' ? '#fef3c7' : '#dbeafe',
  color: role === 'organizer' ? '#6d28d9' : role === 'admin' ? '#92400e' : '#1e40af',
})

export default function AdminOverview() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: api.getAdminStats,
  })

  const { data: growthData = [] } = useQuery({
    queryKey: ['revenue-by-month'],
    queryFn: () => api.getRevenueByMonth(6),
  })

  const { data: recentUsers = [] } = useQuery({
    queryKey: ['users', {}],
    queryFn: () => api.getUsers({}),
    select: data => data.slice(0, 4),
  })

  const { data: pendingEvents = [] } = useQuery({
    queryKey: ['events', { status: 'pending' }],
    queryFn: () => api.getEvents({ status: 'pending' }),
    select: data => data.slice(0, 3),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.approveEvent(id, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.rejectEvent(id, user!.id, 'Rejected by admin'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })

  if (statsLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>

  const pendingCount = stats?.pendingEvents || 0

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Platform Overview</h1>
        {pendingCount > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '100px', padding: '5px 14px', fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>{pendingCount} items need attention</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: '👥', bg: '#dbeafe', val: (stats?.totalUsers || 0).toLocaleString(), label: 'Total Users', change: 'All registered users', up: true },
          { icon: '🏢', bg: '#ede9fe', val: (stats?.totalOrganizers || 0).toLocaleString(), label: 'Organizers', change: 'Active organizers', up: true },
          { icon: '💰', bg: '#d1fae5', val: `$${((stats?.totalRevenue || 0) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, label: 'Platform Revenue', change: 'Total paid orders', up: true },
          { icon: '⚠️', bg: '#fee2e2', val: String(stats?.pendingEvents || 0), label: 'Events Pending Review', change: 'Action required', up: false },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>{s.icon}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, marginBottom: '2px' }}>{s.val}</div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>{s.label}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px', color: s.up ? '#10b981' : '#ef4444' }}>{s.change}</div>
          </div>
        ))}
      </div>

      {pendingCount > 0 && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px', marginBottom: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Items Requiring Attention</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px' }}>
              <span style={{ fontSize: '16px' }}>⏳</span>
              <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{pendingCount} events waiting for approval</span>
              <a href="/admin/events/validation" style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', cursor: 'pointer', textDecoration: 'none' }}>Review →</a>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>Platform Growth</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>Revenue ($)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>Tickets</div>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} barSize={16} barGap={4}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tickets" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>Event Validation Queue</div>
            <a href="/admin/events/validation" style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>View all ({pendingCount})</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingEvents.length === 0 && (
              <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No pending events</div>
            )}
            {pendingEvents.map((q: { id: string; title: string; profiles?: { full_name?: string } | null; start_at?: string }) => (
              <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🎟</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{q.title}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    By {q.profiles?.full_name || 'Unknown'}
                    {q.start_at ? ` · ${new Date(q.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => approveMutation.mutate(q.id)}
                    disabled={approveMutation.isPending}
                    style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', background: '#10b981', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>✓</button>
                  <button
                    onClick={() => rejectMutation.mutate(q.id)}
                    disabled={rejectMutation.isPending}
                    style={{ padding: '6px 14px', borderRadius: '7px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#ef4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>Recent User Signups</div>
          <a href="/admin/users" style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>View all users →</a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['User', 'Role', 'Joined', 'Status', 'Actions'].map(h => <th key={h} style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {recentUsers.map((u: { id: string; full_name?: string; email: string; role: string; created_at: string; status: string }) => (
              <tr key={u.id}>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #bfdbfe, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#1e40af', flexShrink: 0 }}>
                      {(u.full_name || u.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{u.full_name || u.email}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f1f5f9' }}><span style={roleBadge(u.role)}>{u.role}</span></td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>{new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: u.status === 'active' ? '#d1fae5' : '#fee2e2', color: u.status === 'active' ? '#065f46' : '#991b1b' }}>{u.status}</span>
                </td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '13px', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>View</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
