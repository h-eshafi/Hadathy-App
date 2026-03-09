import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import * as api from '../../lib/api'

const statusStyle = (s: string) => ({
  background: s === 'active' ? '#d1fae5' : s === 'draft' ? '#f1f5f9' : s === 'ended' ? '#f1f5f9' : s === 'pending' ? '#fef3c7' : s === 'rejected' ? '#fee2e2' : '#f1f5f9',
  color: s === 'active' ? '#065f46' : s === 'draft' ? '#64748b' : s === 'ended' ? '#64748b' : s === 'pending' ? '#92400e' : s === 'rejected' ? '#991b1b' : '#64748b',
})

const statusLabel = (s: string) => {
  if (s === 'active') return 'Active'
  if (s === 'pending') return 'Pending Review'
  if (s === 'draft') return 'Draft'
  if (s === 'rejected') return 'Rejected'
  if (s === 'ended') return 'Ended'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function OrganizerMyEvents() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: events = [], isLoading, error: queryError } = useQuery({
    queryKey: ['events', { organizerId: user?.id }],
    queryFn: () => api.getEvents({ organizerId: user!.id }),
    enabled: !!user?.id,
  })

  console.log('OrganizerMyEvents debug:', { userId: user?.id, eventsCount: events.length, isLoading, queryError })

  const filtered = events.filter((e: { title: string; status: string }) => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || e.status === statusFilter
    return matchSearch && matchStatus
  })

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>My Events</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Manage all your events</p>
        </div>
        <Link to="/organizer/events/create" style={{ padding: '9px 20px', borderRadius: '9px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>+ Create Event</Link>
      </div>
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', background: '#fff' }}>
            <option value="">All Status</option><option value="active">Active</option><option value="pending">Pending</option><option value="draft">Draft</option><option value="rejected">Rejected</option><option value="ended">Ended</option>
          </select>
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <div style={{ fontSize: '14px' }}>No events found. <Link to="/organizer/events/create" style={{ color: '#2563eb', textDecoration: 'none' }}>Create your first event</Link></div>
          </div>
        )}
        {filtered.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Event', 'Date & Location', 'Status', 'Actions'].map(h => <th key={h} style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((e: { id: string; title: string; location_name?: string; start_at?: string; status: string; cover_image_url?: string }) => (
                <tr key={e.id}>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                        {e.cover_image_url ? (
                          <img src={e.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          '🎪'
                        )}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{e.title}</div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>
                    <div>{e.start_at ? new Date(e.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>{e.location_name || 'Online'}</div>
                  </td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ ...statusStyle(e.status), padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700 }}>{statusLabel(e.status)}</span>
                  </td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link to={`/organizer/events/${e.id}/edit`} style={{ padding: '5px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>Edit</Link>
                      <Link to={`/events/${e.id}`} style={{ padding: '5px 12px', borderRadius: '7px', border: 'none', background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>View</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
