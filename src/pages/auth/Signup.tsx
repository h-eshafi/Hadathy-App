import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Signup() {
  const [role, setRole] = useState<'participant' | 'organizer' | 'admin'>('participant')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [terms, setTerms] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signUp, user, loading } = useAuth()
  const navigate = useNavigate()

  const pwdStrength = password.length > 8 ? 3 : password.length > 4 ? 2 : password.length > 0 ? 1 : 0

  // Navigate when user state is set after signUp
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
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!terms) {
      setError('Please accept the terms of service')
      return
    }
    setSubmitting(true)
    try {
      await signUp({ firstName, lastName, email, password, role, phone })
      // signUp now handles auto-sign-in internally; useEffect navigates when user is set
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
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
        <div style={{ fontSize: '14px', color: '#64748b' }}>Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link></div>
      </nav>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 64px)' }}>
        {/* LEFT */}
        <div style={{ background: 'linear-gradient(160deg, #0c4a6e, #1d4ed8, #2563eb)', padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '38px', fontWeight: 900, color: '#fff', letterSpacing: '-1.2px', lineHeight: 1.1, marginBottom: '14px' }}>Join Hadathy.com<br />today. It's free.</div>
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '36px' }}>Create your account and start discovering and attending events, or launch your first event as an organizer.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: '🎟', name: 'Participant', desc: 'Browse events, buy tickets, track attendance history', val: 'participant' },
                { icon: '📋', name: 'Organizer', desc: 'Create events, sell tickets, manage attendees & revenue', val: 'organizer' },
              ].map(c => (
                <div key={c.name} onClick={() => setRole(c.val as typeof role)} style={{ background: role === c.val ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)', border: `1.5px solid ${role === c.val ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '14px', padding: '18px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px' }}>{c.icon}</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{c.name}</div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginLeft: '48px' }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: '440px' }}>
            <div style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.7px', color: '#0f172a', marginBottom: '4px' }}>Create your account</div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Fill in your details to get started</div>

            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#991b1b', fontWeight: 600 }}>
                {error}
              </div>
            )}

            {/* Account type */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>I am a</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
                {[{ icon: '🎟', name: 'Participant', val: 'participant' }, { icon: '📋', name: 'Organizer', val: 'organizer' }].map(o => (
                  <div key={o.val} onClick={() => setRole(o.val as typeof role)} style={{ border: `1.5px solid ${role === o.val ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '10px', padding: '12px 8px', textAlign: 'center', cursor: 'pointer', background: role === o.val ? '#eff6ff' : '#fff' }}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{o.icon}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: role === o.val ? '#1d4ed8' : '#334155' }}>{o.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>First Name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" required style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>Last Name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" required style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>Phone Number (optional)</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a strong password" required style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} style={{ flex: 1, height: '3px', borderRadius: '100px', background: i < pwdStrength ? (pwdStrength === 1 ? '#ef4444' : pwdStrength === 2 ? '#f59e0b' : '#10b981') : '#e2e8f0' }}></div>
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Strength: {pwdStrength === 0 ? 'None' : pwdStrength === 1 ? 'Weak' : pwdStrength === 2 ? 'Fair' : 'Good'}</div>
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px', display: 'block' }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your password" required style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '18px', fontSize: '13px', color: '#64748b' }}>
                <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#2563eb', marginTop: '1px', flexShrink: 0 }} />
                <span>I agree to the <a href="#" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</a>.</span>
              </div>
              <button type="submit" disabled={submitting} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', marginBottom: '14px' }}>
                {submitting ? 'Creating account...' : 'Create Account →'}
              </button>
            </form>
            <div style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Sign in here</Link></div>
          </div>
        </div>
      </div>
    </div>
  )
}
