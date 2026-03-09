import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const LS_USERS = 'admin_lastSeen_users'
const LS_VALIDATION = 'admin_lastSeen_validation'

async function fetchAdminBadges() {
  const lastSeenUsers = localStorage.getItem(LS_USERS) || new Date(0).toISOString()
  const lastSeenValidation = localStorage.getItem(LS_VALIDATION) || new Date(0).toISOString()

  const [pendingEvents, newUsers] = await Promise.all([
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .gt('created_at', lastSeenValidation),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gt('created_at', lastSeenUsers),
  ])

  return {
    pendingEvents: pendingEvents.count || 0,
    newUsers: newUsers.count || 0,
  }
}

export default function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const queryClient = useQueryClient()

  const { data: badges = { pendingEvents: 0, newUsers: 0 } } = useQuery({
    queryKey: ['admin-badges'],
    queryFn: fetchAdminBadges,
    refetchInterval: 60_000,
  })

  // When admin visits a tracked page, stamp the timestamp and invalidate badges
  useEffect(() => {
    if (pathname === '/admin/users' || pathname.startsWith('/admin/users/')) {
      localStorage.setItem(LS_USERS, new Date().toISOString())
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
    }
    if (pathname === '/admin/events/validation' || pathname.startsWith('/admin/events/validation/')) {
      localStorage.setItem(LS_VALIDATION, new Date().toISOString())
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] })
    }
  }, [pathname, queryClient])

  const { data: unreadNotificationsCount = 0 } = useQuery({
    queryKey: ['admin-unread-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
      return count || 0
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  })

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut()
      navigate('/login')
    }
  }

  const navGroups = [
    {
      section: 'Platform', items: [
        { to: '/admin', icon: '📊', label: 'Overview', exact: true },
        { to: '/admin/users', icon: '👥', label: 'Users', badge: badges.newUsers > 0 ? String(badges.newUsers) : undefined },
        { to: '/admin/organizers', icon: '🏢', label: 'Organizers' },
        { to: '/admin/events/validation', icon: '✅', label: 'Event Validation', badge: badges.pendingEvents > 0 ? String(badges.pendingEvents) : undefined },
      ]
    },
    {
      section: 'Content', items: [
        { to: '/admin/events', icon: '📋', label: 'All Events' },
        { to: '/admin/analytics', icon: '📈', label: 'Analytics' },
        { to: '/admin/activity', icon: '📝', label: 'Activity Log' },
      ]
    },
    {
      section: 'System', items: [
        { to: '/admin/settings', icon: '⚙️', label: 'Settings' },
      ]
    },
  ]

  const attentionCount = badges.pendingEvents
  const attentionLabel = attentionCount === 0
    ? null
    : attentionCount === 1
      ? '1 event needs attention'
      : `${attentionCount} events need attention`

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ width: '240px', background: '#0f172a', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🎟</div>
          <Link to="/" style={{ fontWeight: 800, fontSize: '17px', textDecoration: 'none', color: '#fff' }}>Hadathy<span style={{ color: '#60a5fa' }}>.com</span></Link>
        </div>
        <div style={{ margin: '12px 16px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>ADMIN PANEL</span>
        </div>
        <nav className="no-scrollbar" style={{ padding: '8px 12px', flex: 1, overflowY: 'auto' }}>
          {navGroups.map(group => (
            <div key={group.section}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.3)', padding: '0 8px', margin: '16px 0 6px' }}>{group.section}</div>
              {group.items.map((item) => (
                <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', fontSize: '14px', fontWeight: isActive(item.to, item.exact) ? 700 : 500, color: isActive(item.to, item.exact) ? '#fff' : 'rgba(255,255,255,0.55)', background: isActive(item.to, item.exact) ? 'rgba(37,99,235,0.25)' : 'transparent', textDecoration: 'none', marginBottom: '2px' }}>
                  <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '100px', padding: '1px 6px', fontSize: '10px', fontWeight: 700 }}>{item.badge}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
              {(user?.full_name || user?.name || 'A')[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || user?.name || 'Admin User'}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Super Administrator</div>
            </div>
            <button onClick={handleSignOut} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '16px', padding: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LogOut size={18} /></button>
          </div>
        </div>
      </div>
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '18px', fontWeight: 800 }}>Admin Panel</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {attentionLabel && (
              <Link to="/admin/events/validation" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '100px', padding: '5px 14px', fontSize: '12px', fontWeight: 700, color: '#ef4444', cursor: 'pointer' }}>
                  ⚠️ {attentionLabel}
                </div>
              </Link>
            )}
            <Link to="/admin/notifications" style={{ textDecoration: 'none' }}>
              <div style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', color: '#0f172a' }}>
                🔔
                {unreadNotificationsCount > 0 && (
                  <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 5px', borderRadius: '10px', minWidth: '18px', textAlign: 'center', border: '2px solid #fff' }}>
                    {unreadNotificationsCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
        <div style={{ padding: '28px 32px', flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
