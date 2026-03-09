import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { icon: '🏠', label: 'Overview', path: '/participant' },
  { icon: '🔍', label: 'Browse Events', path: '/participant/browse' },
  { icon: '🎟', label: 'My Tickets', path: '/participant/tickets', badge: '3' },
  { icon: '🤍', label: 'Wishlist', path: '/participant/wishlist' },
]

const accountItems = [
  { icon: '🔔', label: 'Notifications', path: '/participant/notifications', badge: '5' },
  { icon: '👤', label: 'Profile', path: '/participant/profile' },
  { icon: '⚙️', label: 'Settings', path: '/participant/settings' },
]

export default function ParticipantSidebar() {
  const location = useLocation()
  const { user, signOut } = useAuth()

  return (
    <div style={{ width: '240px', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50 }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🎟</div>
        <div style={{ fontWeight: 800, fontSize: '17px', color: '#0f172a' }}>Hadathy<span style={{ color: '#2563eb' }}>.com</span></div>
      </div>
      <div style={{ padding: '16px 12px', flex: 1, overflow: 'hidden' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', padding: '0 8px', margin: '16px 0 6px' }}>Main</div>
        {navItems.map(item => (
          <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px',
              fontSize: '14px', fontWeight: location.pathname === item.path ? 700 : 500,
              color: location.pathname === item.path ? '#2563eb' : '#64748b',
              background: location.pathname === item.path ? '#eff6ff' : 'transparent',
              marginBottom: '2px', cursor: 'pointer'
            }}>
              <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
              {item.badge && <span style={{ marginLeft: 'auto', background: '#2563eb', color: '#fff', borderRadius: '100px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 }}>{item.badge}</span>}
            </div>
          </Link>
        ))}
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', padding: '0 8px', margin: '16px 0 6px' }}>Account</div>
        {accountItems.map(item => (
          <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px',
              fontSize: '14px', fontWeight: location.pathname === item.path ? 700 : 500,
              color: location.pathname === item.path ? '#2563eb' : '#64748b',
              background: location.pathname === item.path ? '#eff6ff' : 'transparent',
              marginBottom: '2px', cursor: 'pointer'
            }}>
              <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
              {item.badge && <span style={{ marginLeft: 'auto', background: '#2563eb', color: '#fff', borderRadius: '100px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 }}>{item.badge}</span>}
            </div>
          </Link>
        ))}
      </div>
      <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
            {(user?.full_name || user?.name || 'P')[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{user?.full_name || user?.name || 'Participant'}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Participant</div>
          </div>
        </div>
        <button onClick={signOut} style={{ marginTop: '10px', width: '100%', padding: '7px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>Sign Out</button>
      </div>
    </div>
  )
}
