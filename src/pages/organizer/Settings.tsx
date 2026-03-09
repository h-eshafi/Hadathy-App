import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { getProfile, updateProfile } from '../../lib/api'

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', boxSizing: 'border-box' as const }

export default function OrganizerSettings() {
  const { user, refreshUser } = useAuth()
  const [notifs, setNotifs] = useState({ newSale: true, dailySummary: true, eventApproval: true, lowInventory: true, payout: true, attendeeMsg: false })
  const [activeSection, setActiveSection] = useState('Public Profile')
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saved, setSaved] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sectionsRef = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const { data: profile } = useQuery({
    queryKey: ['profile-settings', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (profile?.preferences) {
      const p = profile.preferences as any
      setNotifs({
        newSale: p.newSale ?? true,
        dailySummary: p.dailySummary ?? true,
        eventApproval: p.eventApproval ?? true,
        lowInventory: p.lowInventory ?? true,
        payout: p.payout ?? true,
        attendeeMsg: p.attendeeMsg ?? false,
      })
    }
  }, [profile])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return
    setAvatarUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`
      await updateProfile(user.id, { avatar_url: urlWithCacheBuster })
      await refreshUser()
    } catch (err) {
      console.error('Avatar upload failed:', err)
    } finally {
      setAvatarUploading(false)
    }
  }

  const scrollToSection = (section: string) => {
    setActiveSection(section)
    sectionsRef.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const prefsMut = useMutation({
    mutationFn: (prefs: Record<string, boolean>) => updateProfile(user!.id, { preferences: prefs }),
  })

  const toggleNotif = (key: keyof typeof notifs) => {
    const updated = { ...notifs, [key]: !notifs[key] }
    setNotifs(updated)
    prefsMut.mutate(updated)
  }

  const updateMut = useMutation({
    mutationFn: () => updateProfile(user!.id, { full_name: fullName, phone }),
    onSuccess: async () => {
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <div onClick={onChange} style={{ position: 'relative', width: '42px', height: '24px', flexShrink: 0, cursor: 'pointer' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '100px', background: checked ? '#3b82f6' : '#e2e8f0', transition: 'all 0.25s' }}></div>
      <div style={{ position: 'absolute', top: '3px', left: checked ? '21px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.25s' }}></div>
    </div>
  )

  const sections = ['Public Profile', 'Notifications', 'Security']

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Organizer Settings</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => { setFullName(user?.full_name || ''); setPhone(user?.phone || '') }} style={{ padding: '11px 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => updateMut.mutate()} disabled={updateMut.isPending} style={{ padding: '11px 24px', borderRadius: '10px', border: 'none', background: saved ? '#10b981' : '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>{updateMut.isPending ? 'Saving...' : saved ? 'Saved ✓' : 'Save Changes'}</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>
        <div style={{ position: 'sticky', top: '80px', height: 'fit-content' }}>
          {sections.map(s => (
            <div key={s} onClick={() => scrollToSection(s)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: activeSection === s ? 700 : 500, color: activeSection === s ? '#2563eb' : '#64748b', background: activeSection === s ? '#eff6ff' : 'transparent', cursor: 'pointer', marginBottom: '2px' }}>{s}</div>
          ))}
        </div>

        <div>
          {/* PUBLIC PROFILE */}
          <div ref={el => { sectionsRef.current['Public Profile'] = el }} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>Public Profile</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>How your organization appears to attendees</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '32px', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (user?.full_name || user?.name || 'O')[0]?.toUpperCase()
                )}
                {avatarUploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>...</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{user?.full_name || user?.email || 'Organizer'}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{user?.email}</div>
                <div onClick={() => fileInputRef.current?.click()} style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600, marginTop: '4px', cursor: 'pointer' }}>Change photo</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Full Name</label>
                <input style={inputStyle} type="text" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Phone</label>
                <input style={inputStyle} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Email (read-only)</label>
              <input style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }} type="email" value={user?.email || ''} readOnly />
            </div>
          </div>

          {/* NOTIFICATION PREFERENCES */}
          <div ref={el => { sectionsRef.current['Notifications'] = el }} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>Notification Preferences</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Stay informed about your events and sales</div>
            </div>
            {[
              { key: 'newSale', label: 'New Ticket Sale', desc: 'Notify on every ticket purchase for your events' },
              { key: 'dailySummary', label: 'Daily Sales Summary', desc: 'End-of-day email with ticket sales and revenue' },
              { key: 'eventApproval', label: 'Event Approval Status', desc: 'Notified when admin approves or rejects your event' },
              { key: 'lowInventory', label: 'Low Ticket Inventory', desc: 'Alert when remaining tickets drop below 10%' },
              { key: 'payout', label: 'Payout Processed', desc: 'Confirmation when payout is sent to your bank' },
              { key: 'attendeeMsg', label: 'Attendee Messages', desc: 'Receive attendee questions and support requests' },
            ].map(({ key, label, desc }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{desc}</div>
                </div>
                <Toggle checked={notifs[key as keyof typeof notifs]} onChange={() => toggleNotif(key as keyof typeof notifs)} />
              </div>
            ))}
          </div>

          {/* SECURITY */}
          <div ref={el => { sectionsRef.current['Security'] = el }} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>Security</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Manage your account security</div>
            </div>
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '16px', fontSize: '13px', color: '#92400e' }}>
              To change your password, use the "Forgot password?" link on the login page. Password changes are handled securely via email verification.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
