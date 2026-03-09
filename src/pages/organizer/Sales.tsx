import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import { getEvents, getOrdersForOrganizer, getTicketSalesByDay } from '../../lib/api'

const tierBadge = (name: string) => {
  const n = name.toLowerCase()
  const isVip = n.includes('vip')
  const isPremium = n.includes('premium')
  return {
    padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
    background: isVip ? '#ede9fe' : isPremium ? '#dbeafe' : '#f1f5f9',
    color: isVip ? '#6d28d9' : isPremium ? '#1d4ed8' : '#64748b',
  }
}

export default function OrganizerSales() {
  const { user } = useAuth()
  const [selectedEventId, setSelectedEventId] = useState<string>('')

  const { data: events = [] } = useQuery({
    queryKey: ['events', { organizerId: user?.id }],
    queryFn: () => getEvents({ organizerId: user!.id }),
    enabled: !!user?.id,
  })

  const { data: orders = [] } = useQuery({
    queryKey: ['organizer-orders', user?.id],
    queryFn: () => getOrdersForOrganizer(user!.id),
    enabled: !!user?.id,
  })

  const { data: salesByDay = [] } = useQuery({
    queryKey: ['ticket-sales-by-day', selectedEventId],
    queryFn: () => getTicketSalesByDay(selectedEventId || undefined, 14),
  })

  const filteredOrders = selectedEventId ? orders.filter((o: any) => o.event_id === selectedEventId) : orders
  const totalRevenue = filteredOrders.reduce((s: number, o: any) => s + (o.total_cents || 0), 0)
  const totalTickets = filteredOrders.reduce((s: number, o: any) => s + (o.order_items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 1), 0)
  const refunds = filteredOrders.filter((o: any) => o.status === 'refunded' || o.status === 'cancelled').length

  const handleExportCSV = () => {
    const rows = [['Order ID', 'Buyer', 'Event', 'Amount', 'Status', 'Date']]
    filteredOrders.forEach((o: any) => {
      rows.push([o.id, o.profiles?.full_name || '', o.events?.title || '', `$${(o.total_cents / 100).toFixed(2)}`, o.status, new Date(o.created_at).toLocaleDateString()])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'sales.csv'; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Sales Overview</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} style={{ padding: '9px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#334155', background: '#fff' }}>
            <option value="">All Events</option>
            {events.map((e: any) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <button onClick={handleExportCSV} style={{ padding: '9px 18px', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Export CSV</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: '💰', bg: '#d1fae5', val: `$${(totalRevenue / 100).toLocaleString()}`, label: 'Total Revenue', change: 'Paid orders' },
          { icon: '🎟', bg: '#dbeafe', val: totalTickets.toLocaleString(), label: 'Tickets Sold', change: 'Active tickets' },
          { icon: '📊', bg: '#fef3c7', val: `${filteredOrders.length}`, label: 'Total Orders', change: 'All statuses' },
          { icon: '↩', bg: '#fee2e2', val: `${refunds}`, label: 'Refunds / Cancelled', change: `${filteredOrders.length ? Math.round(refunds / filteredOrders.length * 100) : 0}% rate`, changeColor: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>{s.icon}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, marginBottom: '2px' }}>{s.val}</div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>{s.label}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px', color: (s as any).changeColor ?? '#10b981' }}>{s.change}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>Daily Ticket Sales (last 14 days)</div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={salesByDay}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis hide />
            <Tooltip formatter={(v) => [Number(v), 'Tickets']} />
            <Bar dataKey="tickets" fill="#3b82f6" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>Order History</div>
          <button onClick={handleExportCSV} style={{ padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Export</button>
        </div>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No orders yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Buyer', 'Event', 'Tier', 'Amount', 'Status', 'Date'].map(h => <th key={h} style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', padding: '8px 14px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filteredOrders.slice(0, 50).map((o: any) => {
                const tierName = o.order_items?.[0]?.ticket_tiers?.name || 'Standard'
                const statusBg = o.status === 'paid' ? '#d1fae5' : o.status === 'refunded' ? '#fee2e2' : '#fef3c7'
                const statusColor = o.status === 'paid' ? '#065f46' : o.status === 'refunded' ? '#991b1b' : '#92400e'
                return (
                  <tr key={o.id}>
                    <td style={{ padding: '13px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{o.buyer_name || o.profiles?.full_name || 'Unknown'}</td>
                    <td style={{ padding: '13px 14px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>{o.events?.title || '—'}</td>
                    <td style={{ padding: '13px 14px', borderBottom: '1px solid #f1f5f9' }}><span style={tierBadge(tierName)}>{tierName}</span></td>
                    <td style={{ padding: '13px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 800, color: '#10b981', fontSize: '13px' }}>${(o.total_cents / 100).toFixed(2)}</td>
                    <td style={{ padding: '13px 14px', borderBottom: '1px solid #f1f5f9' }}><span style={{ background: statusBg, color: statusColor, padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700 }}>{o.status}</span></td>
                    <td style={{ padding: '13px 14px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>{new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
