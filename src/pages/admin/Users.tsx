import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../../lib/api'

const roleBadge = (role: string) => ({
  display: 'inline-block' as const, padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
  background: role === 'organizer' ? '#ede9fe' : role === 'admin' ? '#fee2e2' : '#dbeafe',
  color: role === 'organizer' ? '#8b5cf6' : role === 'admin' ? '#ef4444' : '#2563eb',
})

const statusDot = (s: string) => ({
  width: '7px', height: '7px', borderRadius: '50%',
  background: s === 'active' ? '#10b981' : s === 'suspended' ? '#ef4444' : '#f59e0b',
  display: 'inline-block' as const, marginRight: '5px',
})

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const qc = useQueryClient()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', { role: roleFilter, status: statusFilter, search }],
    queryFn: () => api.getUsers({
      role: roleFilter || undefined,
      status: statusFilter || undefined,
      search: search || undefined,
    }),
  })

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users', {}],
    queryFn: () => api.getUsers({}),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      api.updateUserStatus(userId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })

  const totalActive = allUsers.filter((u: { status: string }) => u.status === 'active').length
  const totalSuspended = allUsers.filter((u: { status: string }) => u.status === 'suspended').length

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>User Management</h1>
        <button style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>+ Invite User</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: '👥', bg: '#dbeafe', val: allUsers.length.toLocaleString(), label: 'Total Users' },
          { icon: '✅', bg: '#d1fae5', val: totalActive.toLocaleString(), label: 'Active' },
          { icon: '⏳', bg: '#fef3c7', val: allUsers.filter((u: { status: string }) => u.status === 'banned').length.toString(), label: 'Banned' },
          { icon: '🚫', bg: '#fee2e2', val: totalSuspended.toLocaleString(), label: 'Suspended' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or ID..." style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#334155', background: '#fff' }}>
          <option value="">All Roles</option><option value="participant">Participant</option><option value="organizer">Organizer</option><option value="admin">Admin</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#334155', background: '#fff' }}>
          <option value="">All Status</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="banned">Banned</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>All Users</div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>{users.length} users</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['User', 'Role', 'Status', 'Joined', 'Last Active', 'Actions'].map(h => <th key={h} style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', padding: '10px 22px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.map((u: { id: string; full_name?: string; email: string; role: string; status: string; created_at: string; updated_at?: string }) => (
              <tr key={u.id}>
                <td style={{ padding: '14px 22px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #bfdbfe, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#1e40af', flexShrink: 0 }}>
                      {(u.full_name || u.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{u.full_name || '—'}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 22px', borderBottom: '1px solid #f1f5f9' }}><span style={roleBadge(u.role)}>{u.role}</span></td>
                <td style={{ padding: '14px 22px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: u.status === 'active' ? '#10b981' : u.status === 'suspended' ? '#ef4444' : '#f59e0b' }}>
                    <span style={statusDot(u.status)}></span>{u.status}
                  </span>
                </td>
                <td style={{ padding: '14px 22px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>
                  {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td style={{ padding: '14px 22px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>
                  {u.updated_at ? new Date(u.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </td>
                <td style={{ padding: '14px 22px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {u.status === 'suspended' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ userId: u.id, status: 'active' })}
                        style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #10b981', background: '#d1fae5', color: '#10b981' }}>Restore</button>
                    )}
                    {u.role !== 'admin' && u.status === 'active' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ userId: u.id, status: 'suspended' })}
                        style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #ef4444', background: '#fee2e2', color: '#ef4444' }}>Suspend</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Showing {users.length} users</div>
        </div>
      </div>
    </div>
  )
}
