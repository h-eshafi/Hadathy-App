import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LogOut } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

const navItems = [
  { to: '/participant', icon: '📊', label: 'Overview', exact: true },
  { to: '/participant/browse', icon: '🔍', label: 'Browse Events' },
  { to: '/participant/tickets', icon: '🎟', label: 'My Tickets' },
  { to: '/participant/wishlist', icon: '❤️', label: 'Wishlist' },
  { to: '/participant/notifications', icon: '🔔', label: 'Notifications' },
  { to: '/participant/profile', icon: '👤', label: 'Profile' },
  { to: '/participant/settings', icon: '⚙️', label: 'Settings' },
]

export default function ParticipantLayout() {
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const isActive = (to: string, exact?: boolean) => exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  const { data: unreadNotificationsCount = 0 } = useQuery({
    queryKey: ['participant-unread-notifications', user?.id],
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

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      await signOut()
      navigate('/login')
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ width: '240px', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🎟</div>
          <Link to="/" style={{ fontWeight: 800, fontSize: '17px', textDecoration: 'none', color: '#0f172a' }}>Hadathy<span style={{ color: '#2563eb' }}>.com</span></Link>
        </div>
        <nav className="no-scrollbar" style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', padding: '0 8px', marginBottom: '6px' }}>Participant</div>
          {navItems.map(item => (
            <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', fontSize: '14px', fontWeight: isActive(item.to, item.exact) ? 700 : 500, color: isActive(item.to, item.exact) ? '#2563eb' : '#64748b', background: isActive(item.to, item.exact) ? '#eff6ff' : 'transparent', textDecoration: 'none', marginBottom: '2px' }}>
              <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0, overflow: 'hidden' }}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (user?.full_name || user?.name || 'P')[0]?.toUpperCase()
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || user?.name || 'Participant'}</div>
              <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600 }}>Participant</div>
            </div>
            <button onClick={handleSignOut} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px', padding: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LogOut size={18} /></button>
          </div>
        </div>
      </div>
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '18px', fontWeight: 800 }}>My Dashboard</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Link to="/participant/notifications" style={{ textDecoration: 'none' }}>
                <div style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', color: '#0f172a' }}>
                  🔔
                  {unreadNotificationsCount > 0 && (
                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 5px', borderRadius: '10px', minWidth: '18px', textAlign: 'center', border: '2px solid #f8fafc' }}>
                      {unreadNotificationsCount}
                    </span>
                  )}
                </div>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px 4px 4px', borderRadius: '100px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                {/* Placeholder for future user menu */}
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: '28px 32px', flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
