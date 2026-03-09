import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as api from '../../lib/api'

const actionIconMap: Record<string, { icon: string; bg: string }> = {
  'purchase': { icon: '💰', bg: '#d1fae5' },
  'login': { icon: '🔐', bg: '#dbeafe' },
  'logout': { icon: '🔐', bg: '#dbeafe' },
  'event_created': { icon: '📋', bg: '#ede9fe' },
  'event_approved': { icon: '✅', bg: '#d1fae5' },
  'event_rejected': { icon: '❌', bg: '#fee2e2' },
  'suspend': { icon: '🛡️', bg: '#fee2e2' },
  'restore': { icon: '✅', bg: '#d1fae5' },
  'refund': { icon: '↩', bg: '#fef3c7' },
  'delete': { icon: '🗑️', bg: '#fee2e2' },
}

const actionBadgeMap: Record<string, { bg: string; color: string; label: string }> = {
  'purchase': { bg: '#d1fae5', color: '#065f46', label: 'Purchase' },
  'login': { bg: '#dbeafe', color: '#1d4ed8', label: 'Login' },
  'event_created': { bg: '#ede9fe', color: '#6d28d9', label: 'Event Created' },
  'event_approved': { bg: '#d1fae5', color: '#065f46', label: 'Approved' },
  'event_rejected': { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  'suspend': { bg: '#fee2e2', color: '#991b1b', label: 'Admin Action' },
  'refund': { bg: '#fef3c7', color: '#92400e', label: 'Cancellation' },
  'delete': { bg: '#fee2e2', color: '#991b1b', label: 'Deletion' },
}

function exportCSV(logs: Array<Record<string, unknown>>) {
  const headers = ['ID', 'Actor', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Date']
  const rows = logs.map((l) => [
    String(l.id),
    String(l.actor_id || ''),
    String(l.actor_role || ''),
    String(l.action || ''),
    String(l.entity_type || ''),
    String(l.entity_id || ''),
    new Date(String(l.created_at)).toLocaleString(),
  ])
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'activity_log.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminActivityLog() {
  const [search, setSearch] = useState('')
  const [actionType, setActionType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activity-logs', { search, actionType, dateFrom, dateTo }],
    queryFn: () => api.getActivityLogs({
      search: search || undefined,
      actionType: actionType || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit: 100,
    }),
  })

  // Group by date
  const grouped: Record<string, typeof logs> = {}
  for (const log of logs) {
    const dateKey = new Date(String(log.created_at)).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    if (!grouped[dateKey]) grouped[dateKey] = []
    grouped[dateKey].push(log)
  }

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Activity Log</h1>
        <button onClick={() => exportCSV(logs as Array<Record<string, unknown>>)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Export Log</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user, event, or action..." style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={actionType} onChange={e => setActionType(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#334155', background: '#fff' }}>
          <option value="">All Action Types</option><option value="purchase">Purchase</option><option value="login">Login</option><option value="event_created">Event Created</option><option value="event_approved">Approved</option><option value="event_rejected">Rejected</option>
        </select>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#334155' }} />
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#334155' }} />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>Platform Activity</div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>{logs.length} events logged</div>
        </div>

        {logs.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No activity logs found</div>
        )}

        {Object.entries(grouped).map(([dateLabel, items]) => (
          <div key={dateLabel}>
            <div style={{ padding: '12px 24px 6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>{dateLabel}</div>
            {items.map((item, i) => {
              const action = String(item.action || '')
              const iconInfo = actionIconMap[action] || { icon: '📋', bg: '#dbeafe' }
              const badgeInfo = actionBadgeMap[action] || { bg: '#dbeafe', color: '#1d4ed8', label: action }
              const meta = (item.metadata as Record<string, unknown>) || {}

              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 24px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: iconInfo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{iconInfo.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>
                      <span style={{ color: '#2563eb' }}>{String(item.actor_id || 'System')}</span>
                      {' — '}{action}
                      {item.entity_type && <span style={{ color: '#334155', fontWeight: 700 }}> [{String(item.entity_type)}]</span>}
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 700, marginLeft: '6px', background: badgeInfo.bg, color: badgeInfo.color }}>{badgeInfo.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                      {Object.entries(meta).slice(0, 3).map(([k, v]) => (
                        <div key={k} style={{ fontSize: '11px', color: '#94a3b8' }}>{k}: {String(v)}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {new Date(String(item.created_at)).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
