export default function Footer() {
  return (
    <footer style={{ background: '#0a1628', padding: '64px 48px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', maxWidth: '1280px', margin: '0 auto 48px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🎟</div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '20px' }}>Hadathy<span style={{ color: '#93c5fd' }}>.com</span></div>
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.7', maxWidth: '280px' }}>The professional event management and ticketing platform built for organizers who want to focus on creating great events.</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {['𝕏', 'in', 'f', '▶'].map(s => (
              <div key={s} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', cursor: 'pointer' }}>{s}</div>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '18px' }}>Product</h4>
          {['Features', 'Pricing', 'Integrations', 'API Docs', 'Changelog'].map(l => (
            <a key={l} href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: '10px' }}>{l}</a>
          ))}
        </div>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '18px' }}>Company</h4>
          {['About Us', 'Blog', 'Careers', 'Press Kit', 'Partners'].map(l => (
            <a key={l} href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: '10px' }}>{l}</a>
          ))}
        </div>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '18px' }}>Support</h4>
          {['Help Center', 'Contact Us', 'Status Page', 'Community', 'Webinars'].map(l => (
            <a key={l} href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: '10px' }}>{l}</a>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.07)', maxWidth: '1280px', margin: '0 auto' }}>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>© 2026 Hadathy.com. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map(l => (
            <a key={l} href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}
