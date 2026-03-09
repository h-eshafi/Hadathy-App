import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { getNotifications, markNotificationRead, markAllRead } from '../../lib/api'


export default function OrganizerNotifications() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['organizer-notifications', user?.id],
    queryFn: () => getNotifications(user!.id),
    enabled: !!user?.id,
  })

  const readMut = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizer-notifications', user?.id] }),
  })

  const readAllMut = useMutation({
    mutationFn: () => markAllRead(user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizer-notifications', user?.id] }),
  })

  const unread = notifications.filter((n: any) => !n.is_read)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)

  const group = (n: any) => {
    const d = new Date(n.created_at)
    if (d >= today) return 'Today'
    if (d >= yesterday) return 'Yesterday'
    return 'Earlier'
  }

  const groups: Record<string, any[]> = { Today: [], Yesterday: [], Earlier: [] }
  notifications.forEach((n: any) => groups[group(n)].push(n))

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Notifications</h1>
        <button onClick={() => readAllMut.mutate()} disabled={readAllMut.isPending || unread.length === 0} style={{ padding: '9px 18px', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Mark all as read</button>
      </div>

      <div style={{ marginBottom: '16px', fontSize: '13px', color: '#64748b' }}>{unread.length} unread · {notifications.length} total</div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
          <div style={{ fontSize: '15px' }}>No notifications yet.</div>
        </div>
      ) : (
        <div style={{ maxWidth: '760px' }}>
          {(['Today', 'Yesterday', 'Earlier'] as const).map(grpName => {
            const items = groups[grpName]
            if (!items || items.length === 0) return null
            return (
              <div key={grpName} style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', marginBottom: '10px' }}>{grpName}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {items.map((n: any) => (
                    <div key={n.id} onClick={() => !n.is_read && readMut.mutate(n.id)} style={{ background: !n.is_read ? '#f0f7ff' : '#fff', borderRadius: '12px', border: `1px solid ${!n.is_read ? '#dbeafe' : '#e2e8f0'}`, padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start', position: 'relative', borderLeft: !n.is_read ? '4px solid #2563eb' : '1px solid #e2e8f0', cursor: 'pointer' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🔔</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '3px', color: !n.is_read ? '#1d4ed8' : '#0f172a' }}>{n.title}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>{n.body}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', fontWeight: 500 }}>{new Date(n.created_at).toLocaleString()}</div>
                      </div>
                      {!n.is_read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: '4px' }}></div>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
