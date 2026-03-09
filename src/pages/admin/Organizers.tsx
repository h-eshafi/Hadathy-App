import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../../lib/api'

const verifiedBadge = (status: string) => ({
  display: 'inline-flex' as const, alignItems: 'center' as const, gap: '5px', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
  background: status === 'active' ? '#d1fae5' : status === 'suspended' ? '#fee2e2' : '#fef3c7',
  color: status === 'active' ? '#065f46' : status === 'suspended' ? '#991b1b' : '#92400e',
})

export default function AdminOrganizers() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const qc = useQueryClient()

  const { data: organizers = [], isLoading } = useQuery({
    queryKey: ['users', { role: 'organizer', status: statusFilter, search }],
    queryFn: () => api.getUsers({
      role: 'organizer',
      status: statusFilter || undefined,
      search: search || undefined,
    }),
  })

  const { data: allOrgs = [] } = useQuery({
    queryKey: ['users', { role: 'organizer' }],
    queryFn: () => api.getUsers({ role: 'organizer' }),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      api.updateUserStatus(userId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>

  const verified = allOrgs.filter((o: { status: string }) => o.status === 'active').length
  const suspended = allOrgs.filter((o: { status: string }) => o.status === 'suspended').length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Organizer Management</h1>
        <button style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>+ Invite Organizer</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: '🏢', bg: '#ede9fe', val: allOrgs.length.toString(), label: 'Total Organizers' },
          { icon: '✅', bg: '#d1fae5', val: verified.toString(), label: 'Active' },
          { icon: '⏳', bg: '#fef3c7', val: '0', label: 'Pending Approval' },
          { icon: '🚫', bg: '#fee2e2', val: suspended.toString(), label: 'Suspended' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>{s.val}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '1px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search organizers by name or email..." style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#334155', background: '#fff' }}>
          <option value="">All Status</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="banned">Banned</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>All Organizers</div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>{organizers.length} organizers</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Organizer', 'Status', 'Joined', 'Last Updated', 'Actions'].map(h => <th key={h} style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', padding: '10px 22px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {organizers.map((o: { id: string; full_name?: string; email: string; status: string; created_at: string; updated_at?: string }) => (
              <tr key={o.id} style={{ cursor: 'pointer' }}>
                <td style={{ padding: '14px 22px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {(o.full_name || o.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{o.full_name || '—'}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{o.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 22px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={verifiedBadge(o.status)}>{o.status === 'active' ? '✓ Active' : o.status === 'suspended' ? '✗ Suspended' : o.status}</span>
                </td>
                <td style={{ padding: '14px 22px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>
                  {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td style={{ padding: '14px 22px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>
                  {o.updated_at ? new Date(o.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </td>
                <td style={{ padding: '14px 22px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {o.status === 'suspended' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ userId: o.id, status: 'active' })}
                        style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #10b981', background: '#d1fae5', color: '#10b981' }}>Restore</button>
                    )}
                    {o.status === 'active' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ userId: o.id, status: 'suspended' })}
                        style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #ef4444', background: '#fee2e2', color: '#ef4444' }}>Suspend</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Showing {organizers.length} organizers</div>
        </div>
      </div>
    </div>
  )
}
