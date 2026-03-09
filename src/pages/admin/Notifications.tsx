import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { getNotifications, markNotificationRead, markAllRead } from '../../lib/api'

export default function AdminNotifications() {
    const { user } = useAuth()
    const qc = useQueryClient()

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['admin-notifications', user?.id],
        queryFn: () => getNotifications(user!.id),
        enabled: !!user?.id,
    })

    const readMut = useMutation({
        mutationFn: (id: string) => markNotificationRead(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notifications', user?.id] }),
    })

    const readAllMut = useMutation({
        mutationFn: () => markAllRead(user!.id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notifications', user?.id] }),
    })

    const unreadCount = notifications.filter((n: any) => !n.is_read).length

    if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Admin Notifications</h1>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>{unreadCount} unread system alerts</p>
                </div>
                <button onClick={() => readAllMut.mutate()} disabled={readAllMut.isPending || unreadCount === 0} style={{ padding: '9px 20px', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#0f172a', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Mark all as read</button>
            </div>

            {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
                    <div style={{ fontSize: '15px' }}>No notifications yet.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '800px' }}>
                    {notifications.map((n: any) => (
                        <div key={n.id} onClick={() => !n.is_read && readMut.mutate(n.id)} style={{ background: n.is_read ? '#fff' : '#f8fafc', borderRadius: '14px', padding: '18px', border: `1px solid ${n.is_read ? '#e2e8f0' : '#bfdbfe'}`, borderLeft: !n.is_read ? '4px solid #2563eb' : '1px solid #e2e8f0', display: 'flex', gap: '14px', cursor: 'pointer' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: n.type === 'milestone_reached' ? '#dcfce7' : '#dbeafe', color: n.type === 'milestone_reached' ? '#166534' : '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                                {n.type === 'milestone_reached' ? '📈' : '🔔'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: !n.is_read ? '#1d4ed8' : '#0f172a' }}>{n.title}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>{n.body}</div>
                            </div>
                            {!n.is_read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', marginTop: '4px', flexShrink: 0 }}></div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
