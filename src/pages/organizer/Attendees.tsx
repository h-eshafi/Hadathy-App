import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { getEvents, getTicketsByEvent, checkInTicket, uncheckInTicket } from '../../lib/api'

const tierBadge = (name: string) => {
  const n = name.toLowerCase()
  const isVip = n.includes('vip')
  const isPremium = n.includes('premium')
  return {
    padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
    background: isVip ? '#ede9fe' : isPremium ? '#dbeafe' : '#f1f5f9',
    color: isVip ? '#6d28d9' : isPremium ? '#1d4ed8' : '#64748b',
  }
}

const gradients = ['#3b82f6,#0ea5e9', '#8b5cf6,#ec4899', '#10b981,#0ea5e9', '#f59e0b,#ef4444', '#2563eb,#7c3aed', '#0f766e,#0284c7']

export default function OrganizerAttendees() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [search, setSearch] = useState('')
  const [checkFilter, setCheckFilter] = useState<string>('')

  const { data: events = [] } = useQuery({
    queryKey: ['events', { organizerId: user?.id }],
    queryFn: () => getEvents({ organizerId: user!.id }),
    enabled: !!user?.id,
  })

  useEffect(() => {
    if ((events as any[]).length > 0 && !selectedEventId) setSelectedEventId((events as any[])[0].id)
  }, [events, selectedEventId])

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets-by-event', selectedEventId],
    queryFn: () => selectedEventId ? getTicketsByEvent(selectedEventId) : Promise.resolve([]),
    enabled: !!selectedEventId,
  })

  const checkInMut = useMutation({
    mutationFn: (id: string) => checkInTicket(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets-by-event', selectedEventId] }),
  })

  const uncheckMut = useMutation({
    mutationFn: (id: string) => uncheckInTicket(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets-by-event', selectedEventId] }),
  })

  const filtered = tickets.filter((t: any) => {
    const name = t.profiles?.full_name || ''
    const email = t.profiles?.email || ''
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase())
    const isCheckedIn = !!t.checked_in_at
    const matchCheck = !checkFilter || (checkFilter === 'in' && isCheckedIn) || (checkFilter === 'out' && !isCheckedIn)
    return matchSearch && matchCheck
  })

  const checkedInCount = tickets.filter((t: any) => !!t.checked_in_at).length
  const notCheckedIn = tickets.length - checkedInCount
  const refundedCount = tickets.filter((t: any) => t.status === 'cancelled').length

  const handleExport = () => {
    const rows = [['Name', 'Email', 'Tier', 'Status', 'Checked In', 'Purchase Date']]
    filtered.forEach((t: any) => {
      rows.push([t.profiles?.full_name || '', t.profiles?.email || '', t.ticket_tiers?.name || '', t.status, t.checked_in_at ? 'Yes' : 'No', new Date(t.created_at).toLocaleDateString()])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'attendees.csv'; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Attendees</h1>
        <button onClick={handleExport} style={{ padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Export List</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Event:</span>
        <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} style={{ padding: '9px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#334155', background: '#fff', minWidth: '240px' }}>
          {events.map((e: any) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: '🎟', bg: '#dbeafe', val: tickets.length.toString(), label: 'Total Tickets' },
          { icon: '✅', bg: '#d1fae5', val: checkedInCount.toString(), label: 'Checked In' },
          { icon: '⏳', bg: '#fef3c7', val: notCheckedIn.toString(), label: 'Not Checked In' },
          { icon: '↩', bg: '#fee2e2', val: refundedCount.toString(), label: 'Cancelled' },
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

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={checkFilter} onChange={e => setCheckFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#334155', background: '#fff' }}>
          <option value="">All Check-in</option><option value="in">Checked In</option><option value="out">Not Checked In</option>
        </select>
        <button onClick={handleExport} style={{ padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Export</button>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>Attendee List</div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>{filtered.length} attendees</div>
        </div>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>{selectedEventId ? 'No attendees found.' : 'Select an event to view attendees.'}</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Attendee', 'Ticket Type', 'Purchase Date', 'Check-in', 'Actions'].map(h => <th key={h} style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', padding: '10px 20px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((t: any, idx: number) => {
                const isChecked = !!t.checked_in_at
                const name = t.profiles?.full_name || 'Unknown'
                const email = t.profiles?.email || ''
                const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
                const gradient = gradients[idx % gradients.length]
                const tierName = t.ticket_tiers?.name || 'Standard'
                const dateStr = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                return (
                  <tr key={t.id}>
                    <td style={{ padding: '13px 20px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `linear-gradient(135deg, ${gradient})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 20px', borderBottom: '1px solid #f1f5f9' }}><span style={tierBadge(tierName)}>{tierName}</span></td>
                    <td style={{ padding: '13px 20px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>{dateStr}</td>
                    <td style={{ padding: '13px 20px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div onClick={() => isChecked ? uncheckMut.mutate(t.id) : checkInMut.mutate(t.id)} style={{ width: '38px', height: '22px', borderRadius: '100px', background: isChecked ? '#10b981' : '#d1d5db', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                          <div style={{ position: 'absolute', top: '2px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', right: isChecked ? '2px' : 'auto', left: isChecked ? 'auto' : '2px' }}></div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: isChecked ? '#10b981' : '#94a3b8' }}>{isChecked ? 'Checked In' : 'Not Checked In'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 20px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => isChecked ? uncheckMut.mutate(t.id) : checkInMut.mutate(t.id)} style={{ padding: '5px 11px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', background: isChecked ? '#fee2e2' : '#d1fae5', color: isChecked ? '#991b1b' : '#065f46' }}>{isChecked ? 'Undo' : 'Check In'}</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {filtered.length > 0 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Showing {filtered.length} of {tickets.length} attendees</div>
          </div>
        )}
      </div>
    </div>
  )
}
