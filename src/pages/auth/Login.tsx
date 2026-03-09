import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signIn, user, loading } = useAuth()
  const navigate = useNavigate()

  // Navigate when user state is set (by onAuthStateChange after signIn)
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') navigate('/admin', { replace: true })
      else if (user.role === 'organizer') navigate('/organizer', { replace: true })
      else navigate('/participant', { replace: true })
    }
  }, [user, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email, password)
      // Navigation handled by useEffect when onAuthStateChange sets user
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#f8fafc', color: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 48px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎟</div>
          <div style={{ fontWeight: 800, fontSize: '19px', color: '#0f172a' }}>Hadathy<span style={{ color: '#2563eb' }}>.com</span></div>
        </Link>
        <div style={{ fontSize: '14px', color: '#64748b' }}>Don't have an account? <Link to="/signup" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link></div>
      </nav>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 64px)' }}>
        {/* LEFT */}
        <div style={{ background: 'linear-gradient(160deg, #1d4ed8, #2563eb, #0ea5e9)', padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '100px', padding: '5px 16px', marginBottom: '28px', color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 600 }}>Welcome back</div>
            <div style={{ fontSize: '40px', fontWeight: 900, color: '#fff', letterSpacing: '-1.2px', lineHeight: 1.1, marginBottom: '16px' }}>Your events,<br />all in one place.</div>
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '380px' }}>Sign in to discover events, manage your tickets, and connect with thousands of experiences happening near you.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: '🎟', text: 'Access all your tickets instantly' },
                { icon: '🔔', text: 'Get real-time event updates & alerts' },
                { icon: '📊', text: 'Organizers: view sales analytics' },
                { icon: '🛡️', text: 'Secure, encrypted account protection' },
              ].map(f => (
                <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{f.icon}</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{f.text}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '32px', marginTop: '40px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              {[{ val: '2.4M+', lbl: 'Tickets Issued' }, { val: '18K+', lbl: 'Events Hosted' }, { val: '180+', lbl: 'Organizers' }].map(s => (
                <div key={s.lbl}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{s.val}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.7px', color: '#0f172a', marginBottom: '6px' }}>Sign in to Hadathy.com</div>
            <div style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '32px' }}>Enter your credentials to continue</div>

            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#991b1b', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Email Address</div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8' }}>✉</span>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  <span>Password</span>
                  <a href="#" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8' }}>🔒</span>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input type="checkbox" id="rem" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                <label htmlFor="rem" style={{ fontSize: '14px', color: '#64748b' }}>Remember me for 30 days</label>
              </div>
              <button type="submit" disabled={submitting} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', marginBottom: '16px' }}>
                {submitting ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>
            <div style={{ textAlign: 'center', fontSize: '14px', color: '#64748b' }}>New to Hadathy.com? <Link to="/signup" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Create a free account</Link></div>

            <div style={{ marginTop: '24px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Demo Accounts</div>
              {[
                { email: 'admin@hadathy.ma', role: 'Admin', password: 'hADATHY2026$' },
                { email: 'sarah@bluenote.com', role: 'Organizer', password: 'Demo1234!' },
                { email: 'james.donovan@email.com', role: 'Participant', password: 'Demo1234!' },
              ].map(d => (
                <div key={d.email} onClick={() => { setEmail(d.email); setPassword(d.password) }} style={{ fontSize: '12px', color: '#2563eb', cursor: 'pointer', marginBottom: '4px' }}>
                  {d.role}: {d.email}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
