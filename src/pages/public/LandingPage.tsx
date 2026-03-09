import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { getEvents } from '../../lib/api'

const catGradients: Record<string, string> = {
  music: 'linear-gradient(135deg,#1e3a8a,#2563eb)',
  tech: 'linear-gradient(135deg,#0c4a6e,#0ea5e9)',
  art: 'linear-gradient(135deg,#312e81,#6366f1)',
  sports: 'linear-gradient(135deg,#064e3b,#10b981)',
  food: 'linear-gradient(135deg,#78350f,#f59e0b)',
  education: 'linear-gradient(135deg,#4c1d95,#8b5cf6)',
  entertainment: 'linear-gradient(135deg,#881337,#e11d48)',
  wellness: 'linear-gradient(135deg,#134e4a,#0d9488)',
  other: 'linear-gradient(135deg,#1e293b,#475569)',
}
const catEmojis: Record<string, string> = {
  music: '🎵', tech: '💻', art: '🎨', sports: '🏃', food: '🍽️',
  education: '📚', entertainment: '🎤', wellness: '🌿', other: '🎪',
}

export default function LandingPage() {
  const location = useLocation()
  const { data: featuredEvents = [] } = useQuery({
    queryKey: ['landing-featured-events'],
    queryFn: () => getEvents({ status: 'active', featured: true }),
    select: (data: any[]) => data.slice(0, 3),
  })

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      }
    }
  }, [location.hash])

  return (
    <div style={{ background: '#fff' }}>
      <Navbar />

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0a1628 0%, #0d1f3c 40%, #0c1e45 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center',
        padding: '120px 48px 80px'
      }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-200px', right: '-200px', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)' }}></div>
          <div style={{ position: 'absolute', bottom: '-300px', left: '-150px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)' }}></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', maxWidth: '1280px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(59,130,246,0.35)', borderRadius: '100px', padding: '6px 16px', marginBottom: '24px', color: '#93c5fd', fontSize: '13px', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0ea5e9', display: 'inline-block' }}></span>
              #1 Event Management Platform
            </div>
            <h1 style={{ fontSize: 'clamp(38px, 5vw, 62px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', color: '#fff', marginBottom: '24px' }}>
              Manage Events.<br />
              <span style={{ background: 'linear-gradient(135deg, #93c5fd, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sell Tickets.</span><br />
              Scale Fast.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '17px', lineHeight: 1.7, maxWidth: '480px', marginBottom: '40px' }}>
              The all-in-one platform for event organizers to create, promote, and sell tickets effortlessly. From intimate workshops to stadium concerts.
            </p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Link to="/auth/signup" style={{
                padding: '15px 32px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
                color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(37,99,235,0.45)', textDecoration: 'none'
              }}>Start for Free</Link>
              <button style={{
                padding: '15px 32px', borderRadius: '12px',
                border: '1.5px solid rgba(255,255,255,0.22)',
                color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                background: 'transparent', display: 'flex', alignItems: 'center', gap: '8px'
              }}>▶ Watch Demo</button>
            </div>
            <div style={{ display: 'flex', gap: '40px', marginTop: '52px' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>2.4M+</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Tickets Sold</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.12)' }}></div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>18K+</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Events Hosted</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.12)' }}></div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>99.9%</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Uptime SLA</div>
              </div>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-30px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', backdropFilter: 'blur(16px)', padding: '14px 18px', boxShadow: '0 16px 40px rgba(0,0,0,0.35)' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Revenue Today</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>$12,480</div>
              <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>↑ 24% vs yesterday</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', backdropFilter: 'blur(20px)', padding: '28px', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>Event Dashboard</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginTop: '2px' }}>Live overview · March 2026</div>
                </div>
                <div style={{ background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', padding: '6px 14px', color: '#93c5fd', fontSize: '12px', fontWeight: 600 }}>This Month</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                {[
                  { label: 'Tickets Sold', value: '4,821', change: '↑ 18%' },
                  { label: 'Revenue', value: '$94K', change: '↑ 31%' },
                  { label: 'Events', value: '12', change: '↑ 3' },
                ].map(m => (
                  <div key={m.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{m.label}</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '6px 0 4px' }}>{m.value}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#34d399' }}>{m.change}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '22px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>Ticket Sales — Last 7 days</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '70px' }}>
                  {[40, 55, 45, 70, 60, 90, 75].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '6px 6px 0 0', background: i === 5 ? 'linear-gradient(180deg, #0ea5e9, #2563eb)' : 'linear-gradient(180deg, #60a5fa, #2563eb)', opacity: i === 5 ? 1 : 0.7 }}></div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { icon: '🎵', name: 'Blue Note Jazz Festival', date: 'Mar 15 · Chicago, IL', tickets: '1,240', bg: 'linear-gradient(135deg,#1e3a8a,#2563eb)' },
                  { icon: '💻', name: 'TechSummit 2026', date: 'Apr 3 · San Francisco, CA', tickets: '2,890', bg: 'linear-gradient(135deg,#0c4a6e,#0ea5e9)' },
                ].map(e => (
                  <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: e.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{e.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{e.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '1px' }}>{e.date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#93c5fd', fontSize: '14px', fontWeight: 700 }}>{e.tickets}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>tickets sold</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '30px', left: '-40px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', backdropFilter: 'blur(16px)', padding: '14px 18px', boxShadow: '0 16px 40px rgba(0,0,0,0.35)' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Check-In Rate</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>97.4%</div>
              <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>↑ Excellent</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background: '#f8fafc', padding: '96px 48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', borderRadius: '100px', padding: '5px 16px', marginBottom: '16px' }}>Features</div>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-1.2px', lineHeight: 1.12, color: '#1e293b', marginBottom: '16px' }}>Everything you need to <span style={{ color: '#2563eb' }}>run great events</span></h2>
            <p style={{ fontSize: '17px', color: '#475569', maxWidth: '560px', lineHeight: 1.7, margin: '0 auto' }}>A complete toolkit for organizers — from setup to post-event analytics, all in one platform.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { icon: '🎟', color: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', title: 'Smart Ticketing', desc: 'Create multiple ticket tiers, early-bird pricing, group discounts, and VIP packages with zero complexity.' },
              { icon: '📊', color: 'linear-gradient(135deg,#cffafe,#a5f3fc)', title: 'Real-Time Analytics', desc: 'Live dashboards with ticket sales, revenue, attendee demographics, and conversion funnels.' },
              { icon: '📱', color: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)', title: 'Mobile Check-In', desc: 'QR code scanning app for fast attendee check-in. Works offline, syncs when back online.' },
              { icon: '💳', color: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', title: 'Seamless Payments', desc: 'Accept credit cards, Apple Pay, Google Pay, and crypto. Instant payouts in 30+ currencies.' },
              { icon: '📣', color: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', title: 'Event Marketing', desc: 'Built-in email campaigns, referral programs, social sharing tools, and SEO-optimized event pages.' },
              { icon: '🔒', color: 'linear-gradient(135deg,#ccfbf1,#99f6e4)', title: 'Fraud Protection', desc: 'AI-powered fraud detection, secure ticket transfers, and blockchain-verified admission.' },
            ].map(f => (
              <div key={f.title} style={{ background: '#fff', borderRadius: '20px', padding: '36px 32px', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', marginBottom: '24px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS */}
      <section style={{ background: '#fff', padding: '96px 48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px' }}>
            <div>
              <div style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', borderRadius: '100px', padding: '5px 16px', marginBottom: '16px' }}>Discover</div>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-1.2px', lineHeight: 1.12, color: '#1e293b' }}>Upcoming <span style={{ color: '#2563eb' }}>Featured Events</span></h2>
            </div>
            <Link to="/browse" style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>Browse All Events →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
            {featuredEvents.length === 0 ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff' }}>
                  <div style={{ height: '180px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🎪</div>
                  <div style={{ padding: '24px' }}>
                    <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '12px' }}></div>
                    <div style={{ height: '20px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '8px' }}></div>
                    <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px', width: '60%' }}></div>
                  </div>
                </div>
              ))
            ) : (
              featuredEvents.map((e: any) => {
                const cat = e.category || 'other'
                const emoji = catEmojis[cat] || '🎪'
                const bg = catGradients[cat] || catGradients.other
                const tiers = (e.ticket_tiers || []).filter((t: any) => t.is_active)
                const minPrice = tiers.length > 0 ? Math.min(...tiers.map((t: any) => t.price_cents)) : null
                const priceLabel = minPrice === null ? 'Free' : minPrice === 0 ? 'Free' : `$${(minPrice / 100).toFixed(0)}`
                const dateStr = e.start_at ? new Date(e.start_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'
                const catLabel: Record<string, string> = { music: 'Music', tech: 'Technology', art: 'Art & Culture', sports: 'Sports', food: 'Food & Drink', education: 'Education', entertainment: 'Entertainment', wellness: 'Wellness', other: 'Event' }
                return (
                  <div key={e.id} style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', background: '#fff' }}>
                    <div style={{ height: '180px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px', position: 'relative', overflow: 'hidden' }}>
                      {e.cover_image_url ? (
                        <img src={e.cover_image_url} alt={e.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        emoji
                      )}
                      <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px', padding: '4px 12px', color: '#fff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', zIndex: 1 }}>{catLabel[cat] || 'Event'}</div>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#2563eb', marginBottom: '8px' }}>{catLabel[cat] || 'Event'}</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#475569' }}>📅 {dateStr}</div>
                        {e.location_name && <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#475569' }}>📍 {e.location_name}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e50a0' }}>{priceLabel} <span style={{ fontSize: '13px', fontWeight: 400, color: '#94a3b8' }}>/ person</span></div>
                        <Link to={`/events/${e.id}`} style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>Book Now</Link>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: 'linear-gradient(160deg, #0a1628, #0d1f3c)', padding: '96px 48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(37,99,235,0.25)', color: '#93c5fd', fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', borderRadius: '100px', padding: '5px 16px', marginBottom: '16px' }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-1.2px', lineHeight: 1.12, color: '#fff', marginBottom: '16px' }}>Launch your event in <span style={{ color: '#93c5fd' }}>4 simple steps</span></h2>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.55)', maxWidth: '560px', lineHeight: 1.7, margin: '0 auto' }}>From idea to sold-out — we make the entire journey seamless for organizers and attendees alike.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
            {[
              { n: '1', title: 'Create Your Event', desc: 'Build a stunning event page with our drag-and-drop editor. Add photos, schedules, and speaker bios.' },
              { n: '2', title: 'Set Up Tickets', desc: 'Configure ticket types, pricing tiers, capacity limits, and promotional codes in minutes.' },
              { n: '3', title: 'Promote & Sell', desc: 'Share across social media, email lists, and our marketplace to reach thousands of potential attendees.' },
              { n: '4', title: 'Manage & Grow', desc: 'Check in attendees, track revenue in real time, and use insights to make every next event better.' },
            ].map(s => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 24px', background: 'linear-gradient(135deg, #1a3f78, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 900, color: '#fff', border: '3px solid rgba(59,130,246,0.4)', boxShadow: '0 0 32px rgba(37,99,235,0.4)' }}>{s.n}</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ background: '#f8fafc', padding: '96px 48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', borderRadius: '100px', padding: '5px 16px', marginBottom: '16px' }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-1.2px', lineHeight: 1.12, color: '#1e293b', marginBottom: '16px' }}>Simple, <span style={{ color: '#2563eb' }}>transparent pricing</span></h2>
            <p style={{ fontSize: '17px', color: '#475569', margin: '0 auto' }}>No hidden fees. No surprises. Scale as your events grow.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px', alignItems: 'start' }}>
            {[
              { plan: 'Starter', price: '$0', per: '/ mo', desc: 'Perfect for individuals hosting small events and testing the platform.', features: ['Up to 3 events/month', '100 attendees per event', 'Basic analytics', 'Email support', '5% platform fee'], featured: false, btnText: 'Get Started Free' },
              { plan: 'Professional', price: '$49', per: '/ mo', desc: 'For growing organizers who need advanced tools and higher capacity.', features: ['Unlimited events', '5,000 attendees per event', 'Advanced analytics', 'Priority support', '2% platform fee', 'Custom branding'], featured: true, btnText: 'Start Pro Trial' },
              { plan: 'Enterprise', price: 'Custom', per: '', desc: 'For large organizations running stadium-scale events with complex requirements.', features: ['Unlimited everything', 'Dedicated account manager', 'White-label solution', 'SLA guarantee', '0% platform fee'], featured: false, btnText: 'Contact Sales' },
            ].map(p => (
              <div key={p.plan} style={{ background: p.featured ? 'linear-gradient(160deg, #1a3f78, #1e50a0)' : '#fff', borderRadius: '24px', padding: '40px 36px', border: p.featured ? 'none' : '1px solid #e2e8f0', boxShadow: p.featured ? '0 24px 64px rgba(37,99,235,0.4)' : '0 2px 12px rgba(0,0,0,0.04)', transform: p.featured ? 'scale(1.04)' : 'scale(1)', position: 'relative' }}>
                {p.featured && <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: '#fff', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', borderRadius: '100px', padding: '6px 20px' }}>Most Popular</div>}
                <div style={{ fontSize: '14px', fontWeight: 700, color: p.featured ? 'rgba(255,255,255,0.7)' : '#2563eb', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>{p.plan}</div>
                <div style={{ fontSize: '48px', fontWeight: 900, color: p.featured ? '#fff' : '#1e293b', marginBottom: '4px', letterSpacing: '-2px' }}>{p.price} <span style={{ fontSize: '16px', fontWeight: 500, color: p.featured ? 'rgba(255,255,255,0.55)' : '#94a3b8' }}>{p.per}</span></div>
                <p style={{ fontSize: '14px', color: p.featured ? 'rgba(255,255,255,0.65)' : '#475569', marginBottom: '32px', lineHeight: 1.6 }}>{p.desc}</p>
                <ul style={{ listStyle: 'none', marginBottom: '36px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: p.featured ? 'rgba(255,255,255,0.85)' : '#334155' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: p.featured ? 'rgba(255,255,255,0.2)' : '#dbeafe', color: p.featured ? '#fff' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button style={{ width: '100%', padding: '14px', borderRadius: '12px', border: p.featured ? 'none' : '2px solid #bfdbfe', background: p.featured ? '#fff' : 'transparent', color: p.featured ? '#1d4ed8' : '#2563eb', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>{p.btnText}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background: '#fff', padding: '96px 48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', borderRadius: '100px', padding: '5px 16px', marginBottom: '16px' }}>Testimonials</div>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-1.2px', lineHeight: 1.12, color: '#1e293b' }}>Trusted by <span style={{ color: '#2563eb' }}>event leaders</span> worldwide</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { text: '"Hadathy.com transformed how we run our annual tech conference. We sold out 3,000 seats in under 48 hours. The analytics dashboard is phenomenal."', name: 'Sarah Chen', role: 'CEO, TechForward Inc.', avatar: 'S', bg: 'linear-gradient(135deg, #2563eb, #0ea5e9)' },
              { text: '"The check-in app is a game changer. No more long queues — our 5,000-person music festival ran like clockwork. The team was incredibly supportive."', name: 'Marcus Rivera', role: 'Founder, SoundWave Events', avatar: 'M', bg: 'linear-gradient(135deg, #6366f1, #2563eb)' },
              { text: '"We switched from three different tools to Hadathy.com and cut our event setup time by 70%. The payment processing and fraud protection give us total peace of mind."', name: 'Amara Okonkwo', role: 'Operations Lead, GlobalConf', avatar: 'A', bg: 'linear-gradient(135deg, #0ea5e9, #6366f1)' },
            ].map(t => (
              <div key={t.name} style={{ background: '#f8fafc', borderRadius: '20px', padding: '32px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '16px', color: '#fbbf24', marginBottom: '16px', letterSpacing: '2px' }}>★★★★★</div>
                <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.7, marginBottom: '24px', fontStyle: 'italic' }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: '#fff' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1e50a0, #112d55)', padding: '96px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: '#fff', marginBottom: '18px', letterSpacing: '-1.5px' }}>Ready to sell your first ticket?</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '40px', lineHeight: 1.65 }}>Join 18,000+ event organizers already using Hadathy.com to create unforgettable experiences.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Link to="/auth/signup" style={{ padding: '16px 36px', borderRadius: '12px', border: 'none', background: '#fff', color: '#1d4ed8', fontSize: '16px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>Start Free Today</Link>
            <button style={{ padding: '16px 36px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>Talk to Sales</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
