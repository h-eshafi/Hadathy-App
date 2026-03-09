import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import * as api from '../../lib/api'

const statusBadge = (s: string) => ({
  display: 'inline-flex' as const, alignItems: 'center' as const, gap: '5px', padding: '4px 11px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
  background: s === 'active' ? '#d1fae5' : s === 'pending' ? '#fef3c7' : s === 'draft' ? '#f1f5f9' : s === 'rejected' ? '#fee2e2' : '#dbeafe',
  color: s === 'active' ? '#065f46' : s === 'pending' ? '#92400e' : s === 'draft' ? '#64748b' : s === 'rejected' ? '#991b1b' : '#1d4ed8',
})

export default function AdminEvents() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', { status: statusFilter, category: categoryFilter, search }],
    queryFn: () => api.getEvents({
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      search: search || undefined,
    }),
  })

  const { data: allEvents = [] } = useQuery({
    queryKey: ['events', {}],
    queryFn: () => api.getEvents({}),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.approveEvent(id, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.rejectEvent(id, user!.id, 'Rejected by admin'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) => api.featureEvent(id, featured),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>

  const totalActive = allEvents.filter((e: { status: string }) => e.status === 'active').length
  const totalPending = allEvents.filter((e: { status: string }) => e.status === 'pending').length
  const totalRejected = allEvents.filter((e: { status: string }) => e.status === 'rejected').length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Event Management</h1>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>All platform events</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: '📋', bg: '#dbeafe', val: allEvents.length.toLocaleString(), label: 'Total Events' },
          { icon: '✅', bg: '#d1fae5', val: totalActive.toLocaleString(), label: 'Active' },
          { icon: '⏳', bg: '#fef3c7', val: totalPending.toString(), label: 'Pending Approval' },
          { icon: '🚩', bg: '#fee2e2', val: totalRejected.toString(), label: 'Rejected' },
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

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events by title or organizer..." style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#334155', background: '#fff' }}>
          <option value="">All Categories</option><option>Music</option><option>Technology</option><option>Sports</option><option>Art & Culture</option><option>Food & Drink</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#334155', background: '#fff' }}>
          <option value="">All Status</option><option value="active">Active</option><option value="pending">Pending</option><option value="draft">Draft</option><option value="ended">Ended</option><option value="rejected">Rejected</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>All Events</div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>{events.length} events</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Event', 'Category', 'Date', 'Status', 'View', 'Actions'].map(h => <th key={h} style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', padding: '10px 22px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {events.map((e: { id: string; title: string; category?: string; start_at?: string; status: string; is_featured?: boolean; profiles?: { full_name?: string } | null; cover_image_url?: string }) => (
              <tr key={e.id}>
                <td style={{ padding: '13px 22px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: e.cover_image_url ? `url(${e.cover_image_url}) center/cover no-repeat` : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, overflow: 'hidden' }}>
                      {!e.cover_image_url && '🎟'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{e.title}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>by {e.profiles?.full_name || 'Unknown'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '13px 22px', borderBottom: '1px solid #f1f5f9' }}><span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: '#f1f5f9', color: '#64748b' }}>{e.category || '—'}</span></td>
                <td style={{ padding: '13px 22px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>
                  {e.start_at ? new Date(e.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </td>
                <td style={{ padding: '13px 22px', borderBottom: '1px solid #f1f5f9' }}><span style={statusBadge(e.status)}>{e.status}</span></td>
                <td style={{ padding: '13px 22px', borderBottom: '1px solid #f1f5f9' }}>
                  <Link to={`/admin/events/${e.id}`} style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #dbeafe', background: '#eff6ff', color: '#2563eb', fontSize: '11px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                    Details ↗
                  </Link>
                </td>
                <td style={{ padding: '13px 22px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {e.status === 'pending' && (
                      <button onClick={() => approveMutation.mutate(e.id)} style={{ padding: '5px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #10b981', background: '#d1fae5', color: '#10b981' }}>Approve</button>
                    )}
                    {e.status === 'pending' && (
                      <button onClick={() => rejectMutation.mutate(e.id)} style={{ padding: '5px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #ef4444', background: '#fee2e2', color: '#ef4444' }}>Reject</button>
                    )}
                    {e.status === 'active' && (
                      <button
                        onClick={() => featureMutation.mutate({ id: e.id, featured: !e.is_featured })}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '7px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: `1.5px solid ${e.is_featured !== false ? '#10b981' : '#e2e8f0'}`,
                          background: e.is_featured !== false ? '#d1fae5' : '#f8fafc',
                          color: e.is_featured !== false ? '#059669' : '#64748b',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {e.is_featured !== false ? '★ Featured' : '☆ Non-Featured'}
                      </button>
                    )}
                    {(e.status === 'rejected' || e.status === 'draft') && (
                      <button
                        onClick={() => { if (confirm('Delete this event?')) deleteMutation.mutate(e.id) }}
                        style={{ padding: '5px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #ef4444', background: '#fee2e2', color: '#ef4444' }}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Showing {events.length} events</div>
        </div>
      </div>
    </div>
  )
}
