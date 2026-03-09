import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(10,22,40,0.96)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 48px',
      height: '68px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
        }}>🎟</div>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>
          Hadathy<span style={{ color: '#93c5fd' }}>.com</span>
        </div>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link to="/browse" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Events</Link>
        <Link to="/#features" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Features</Link>
        <Link to="/#pricing" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Pricing</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <>
            <Link to={`/${user.role}`} style={{
              padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
              background: 'transparent', textDecoration: 'none'
            }}>Dashboard</Link>
            <button onClick={handleSignOut} style={{
              padding: '9px 22px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
              color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
            }}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/auth/login" style={{
              padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
              background: 'transparent', textDecoration: 'none'
            }}>Sign In</Link>
            <Link to="/auth/signup" style={{
              padding: '9px 22px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
              color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              textDecoration: 'none'
            }}>Get Started Free</Link>
          </>
        )}
      </div>
    </nav>
  )
}
