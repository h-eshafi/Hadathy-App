import { useState, useRef } from 'react'

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', boxSizing: 'border-box' as const }

export default function AdminSettings() {
  const [flags, setFlags] = useState({ ticketTransfer: true, groupBookings: true, aiRec: true, socialLogin: true, crypto: false, streaming: false, nft: false, networking: true })
  const [maintenance, setMaintenance] = useState(false)
  const [allowPurchase, setAllowPurchase] = useState(false)
  const [maintEmail, setMaintEmail] = useState(true)
  const [selfReg, setSelfReg] = useState(true)
  const [publicListings, setPublicListings] = useState(true)
  const [activeSection, setActiveSection] = useState('Platform Config')
  const sectionsRef = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const scrollToSection = (section: string) => {
    setActiveSection(section)
    sectionsRef.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <div onClick={onChange} style={{ position: 'relative', width: '42px', height: '24px', flexShrink: 0, cursor: 'pointer' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '100px', background: checked ? '#3b82f6' : '#e2e8f0', transition: 'all 0.25s' }}></div>
      <div style={{ position: 'absolute', top: '3px', left: checked ? '21px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.25s' }}></div>
    </div>
  )

  const flagTag = (type: string) => ({
    display: 'inline-block' as const, padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 700, marginLeft: '8px',
    background: type === 'beta' ? '#ede9fe' : type === 'new' ? '#d1fae5' : '#fef3c7',
    color: type === 'beta' ? '#8b5cf6' : type === 'new' ? '#065f46' : '#92400e',
  })

  const emailTemplates = [
    { name: 'Ticket Confirmation', desc: 'Sent when a ticket purchase is confirmed' },
    { name: 'Event Reminder', desc: '24h and 1h before event' },
    { name: 'Welcome Email', desc: 'Sent on new user registration' },
    { name: 'Event Approval', desc: 'Sent to organizers on approval/rejection' },
  ]

  const sections = ['Platform Config', 'Email Settings', 'Feature Flags', 'Maintenance', 'Billing & Fees', 'Security']

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Platform Settings</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ padding: '11px 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button style={{ padding: '11px 24px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Save Changes</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>
        <div style={{ position: 'sticky', top: '80px', height: 'fit-content' }}>
          {sections.map(s => (
            <div key={s} onClick={() => scrollToSection(s)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: activeSection === s ? 700 : 500, color: activeSection === s ? '#2563eb' : '#64748b', background: activeSection === s ? '#eff6ff' : 'transparent', cursor: 'pointer', marginBottom: '2px' }}>{s}</div>
          ))}
        </div>

        <div>
          {/* PLATFORM CONFIG */}
          <div ref={el => { sectionsRef.current['Platform Config'] = el }} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>Platform Configuration</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Core platform settings and branding</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Platform Name</label><input style={inputStyle} type="text" defaultValue="EventPro" /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Support Email</label><input style={inputStyle} type="email" defaultValue="support@eventpro.com" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Default Language</label><select style={{ ...inputStyle, background: '#fff' }}><option>English (US)</option><option>Arabic (عربي)</option><option>French (Français)</option></select></div>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Default Currency</label><select style={{ ...inputStyle, background: '#fff' }}><option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option></select></div>
            </div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Platform Description</label><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', lineHeight: '1.6' }} defaultValue="The professional event discovery and ticketing platform for modern audiences and organizers worldwide." /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Max Events Per Organizer</label><input style={inputStyle} type="number" defaultValue="50" /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Event Approval Mode</label><select style={{ ...inputStyle, background: '#fff' }}><option>Manual Review</option><option>Auto-approve (Verified)</option><option>Auto-approve All</option></select></div>
            </div>
            {[
              { key: 'selfReg', val: selfReg, set: setSelfReg, label: 'Allow Organizer Self-Registration', desc: 'New organizers can sign up without admin invitation' },
              { key: 'pub', val: publicListings, set: setPublicListings, label: 'Public Event Listings', desc: 'Events visible to non-logged-in visitors' },
            ].map(t => (
              <div key={t.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div><div style={{ fontSize: '14px', fontWeight: 600 }}>{t.label}</div><div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{t.desc}</div></div>
                <Toggle checked={t.val} onChange={() => t.set(!t.val)} />
              </div>
            ))}
          </div>

          {/* EMAIL SETTINGS */}
          <div ref={el => { sectionsRef.current['Email Settings'] = el }} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>Email Settings</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Configure outgoing email and notification templates</div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '14px' }}>SMTP Configuration</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>SMTP Host</label><input style={inputStyle} type="text" defaultValue="smtp.sendgrid.net" /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>SMTP Port</label><input style={inputStyle} type="number" defaultValue="587" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>SMTP Username</label><input style={inputStyle} type="text" defaultValue="apikey" /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>SMTP Password</label><input style={inputStyle} type="password" defaultValue="••••••••••••••••" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>From Name</label><input style={inputStyle} type="text" defaultValue="EventPro" /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>From Email</label><input style={inputStyle} type="email" defaultValue="noreply@eventpro.com" /></div>
            </div>
            <button style={{ padding: '9px 18px', borderRadius: '9px', border: '1.5px solid #bfdbfe', background: '#eff6ff', color: '#2563eb', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginBottom: '24px' }}>Send Test Email</button>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>Email Templates</div>
            {emailTemplates.map(t => (
              <div key={t.name} style={{ border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{t.desc}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button style={{ padding: '6px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155' }}>Preview</button>
                  <button style={{ padding: '6px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', background: '#2563eb', color: '#fff' }}>Edit</button>
                </div>
              </div>
            ))}
          </div>

          {/* FEATURE FLAGS */}
          <div ref={el => { sectionsRef.current['Feature Flags'] = el }} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>Feature Flags</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Enable or disable platform features without deploying code</div>
            </div>
            {[
              { key: 'ticketTransfer', label: 'Ticket Transfers', tag: 'new', tagLabel: 'New', desc: 'Allow participants to transfer tickets to other users' },
              { key: 'groupBookings', label: 'Group Bookings', tag: '', tagLabel: '', desc: 'Allow purchasing up to 20 tickets in one order' },
              { key: 'aiRec', label: 'AI Event Recommendations', tag: 'beta', tagLabel: 'Beta', desc: 'Use ML model to personalize event discovery' },
              { key: 'socialLogin', label: 'Social Login (Google/Facebook)', tag: '', tagLabel: '', desc: 'Allow sign-in via OAuth providers' },
              { key: 'crypto', label: 'Crypto Payments', tag: 'exp', tagLabel: 'Experimental', desc: 'Accept Bitcoin and Ethereum for ticket purchases' },
              { key: 'streaming', label: 'Virtual Event Streaming', tag: 'beta', tagLabel: 'Beta', desc: 'Built-in live streaming for online events' },
              { key: 'nft', label: 'NFT Ticket Minting', tag: 'exp', tagLabel: 'Experimental', desc: 'Issue tickets as blockchain NFTs' },
              { key: 'networking', label: 'Attendee Networking', tag: '', tagLabel: '', desc: 'Let attendees connect with each other before events' },
            ].map(f => (
              <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{f.label}{f.tag && <span style={flagTag(f.tag)}>{f.tagLabel}</span>}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{f.desc}</div>
                </div>
                <Toggle checked={flags[f.key as keyof typeof flags]} onChange={() => setFlags(fl => ({ ...fl, [f.key]: !fl[f.key as keyof typeof fl] }))} />
              </div>
            ))}
          </div>

          {/* MAINTENANCE MODE */}
          <div ref={el => { sectionsRef.current['Maintenance'] = el }} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>Maintenance Mode</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Take the platform offline for scheduled maintenance</div>
            </div>
            <div style={{ background: '#fef3c7', border: '1.5px solid #fde68a', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400e' }}>Maintenance mode is currently OFF</div>
                <div style={{ fontSize: '12px', color: '#78350f', marginTop: '2px' }}>Enabling maintenance mode will show a maintenance page to all users (admin access still works)</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div><div style={{ fontSize: '15px', fontWeight: 600 }}>Enable Maintenance Mode</div><div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Shows maintenance page to all non-admin visitors</div></div>
              <Toggle checked={maintenance} onChange={() => setMaintenance(!maintenance)} />
            </div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Maintenance Message</label><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '70px', lineHeight: '1.6' }} defaultValue="We're currently performing scheduled maintenance to improve your experience. We'll be back online shortly." /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Scheduled Start</label><input style={inputStyle} type="datetime-local" /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Estimated Duration</label><select style={{ ...inputStyle, background: '#fff' }}><option>30 minutes</option><option>1 hour</option><option>2 hours</option><option>4 hours</option></select></div>
            </div>
            {[
              { val: allowPurchase, set: setAllowPurchase, label: 'Allow Ticket Purchases During Maintenance', desc: 'Keep checkout functional while admin UI is in maintenance' },
              { val: maintEmail, set: setMaintEmail, label: 'Send Maintenance Notification Email', desc: 'Email all active users before maintenance begins' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderTop: '1px solid #f1f5f9' }}>
                <div><div style={{ fontSize: '14px', fontWeight: 600 }}>{t.label}</div><div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{t.desc}</div></div>
                <Toggle checked={t.val} onChange={() => t.set(!t.val)} />
              </div>
            ))}
            <button style={{ marginTop: '16px', padding: '12px 24px', borderRadius: '10px', border: '1.5px solid #ef4444', background: '#fee2e2', color: '#ef4444', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Activate Maintenance Mode Now</button>
          </div>

          {/* BILLING & FEES */}
          <div ref={el => { sectionsRef.current['Billing & Fees'] = el }} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>Billing & Fees</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Manage platform service fees and payout schedules</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Platform Service Fee (%)</label><input style={inputStyle} type="number" defaultValue="5" /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Processing Fee (Fixed)</label><input style={inputStyle} type="number" defaultValue="0.30" /></div>
            </div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Payout Frequency</label><select style={{ ...inputStyle, background: '#fff' }}><option>On-demand</option><option>Weekly (Mondays)</option><option>Monthly (1st)</option></select></div>
          </div>

          {/* SECURITY */}
          <div ref={el => { sectionsRef.current['Security'] = el }} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>Security Settings</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>System-wide security and access controls</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div><div style={{ fontSize: '14px', fontWeight: 600 }}>Two-Factor Authentication (2FA)</div><div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Enforce 2FA for all admin and organizer accounts</div></div>
              <Toggle checked={true} onChange={() => { }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
              <div><div style={{ fontSize: '14px', fontWeight: 600 }}>IP Rate Limiting</div><div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Prevent brute-force attacks on login endpoints</div></div>
              <Toggle checked={true} onChange={() => { }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
