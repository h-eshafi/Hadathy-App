import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const platformItems = [
  { icon: '📊', label: 'Overview', path: '/admin' },
  { icon: '👥', label: 'Users', path: '/admin/users' },
  { icon: '🏢', label: 'Organizers', path: '/admin/organizers' },
  { icon: '✅', label: 'Event Validation', path: '/admin/events/validation', badge: '8' },
  { icon: '📋', label: 'All Events', path: '/admin/events' },
]

const analyticsItems = [
  { icon: '📈', label: 'Analytics', path: '/admin/analytics' },
  { icon: '📜', label: 'Activity Log', path: '/admin/activity' },
]

const systemItems = [
  { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
]

export default function AdminSidebar() {
  const location = useLocation()
  const { user, signOut } = useAuth()

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin' || location.pathname === '/admin/'
    if (path === '/admin/events') return location.pathname === '/admin/events'
    return location.pathname.startsWith(path)
  }

  const NavItem = ({ item }: { item: typeof platformItems[0] }) => (
    <Link to={item.path} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px',
        fontSize: '14px', fontWeight: isActive(item.path) ? 700 : 500,
        color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.55)',
        background: isActive(item.path) ? 'rgba(37,99,235,0.25)' : 'transparent',
        marginBottom: '2px', cursor: 'pointer', transition: 'all 0.2s'
      }}>
        <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
        {item.label}
        {item.badge && <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', borderRadius: '100px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 }}>{item.badge}</span>}
      </div>
    </Link>
  )

  return (
    <div style={{ width: '240px', background: '#0f172a', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50 }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🎟</div>
        <div style={{ fontWeight: 800, fontSize: '17px', color: '#fff' }}>Hadathy<span style={{ color: '#60a5fa' }}>.com</span></div>
      </div>
      <div style={{ margin: '12px 16px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>ADMIN PANEL</div>
      </div>
      <div className="no-scrollbar" style={{ padding: '8px 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.3)', padding: '0 8px', margin: '10px 0 4px' }}>Platform</div>
        {platformItems.map(item => <NavItem key={item.path} item={item} />)}
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.3)', padding: '0 8px', margin: '10px 0 4px' }}>Analytics</div>
        {analyticsItems.map(item => <NavItem key={item.path} item={item} />)}
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.3)', padding: '0 8px', margin: '10px 0 4px' }}>System</div>
        {systemItems.map(item => <NavItem key={item.path} item={item} />)}
      </div>
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
            {(user?.full_name || user?.name || 'A')[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{user?.full_name || user?.name || 'Admin User'}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Super Administrator</div>
          </div>
        </div>
        <button onClick={signOut} style={{ marginTop: '10px', width: '100%', padding: '7px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: 'pointer' }}>Sign Out</button>
      </div>
    </div>
  )
}
