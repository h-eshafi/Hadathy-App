import { useState, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { updateProfile, getTickets, getWishlist } from '../../lib/api'
import { supabase } from '../../lib/supabase'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>((user as any)?.avatar_url || '')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nameParts = (user?.full_name || user?.name || '').split(' ')
  const [form, setForm] = useState({
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    phone: user?.phone || '',
  })

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
      setAvatarUrl(urlWithCacheBuster)
    } catch (err) {
      console.error('Avatar upload failed:', err)
    } finally {
      setAvatarUploading(false)
    }
  }

  const { data: tickets = [] } = useQuery({
    queryKey: ['participant-tickets', user?.id],
    queryFn: () => getTickets(user!.id),
    enabled: !!user?.id,
  })

  const { data: wishlist = [] } = useQuery({
    queryKey: ['participant-wishlist', user?.id],
    queryFn: () => getWishlist(user!.id),
    enabled: !!user?.id,
  })

  const updateMut = useMutation({
    mutationFn: () => updateProfile(user!.id, {
      full_name: `${form.firstName} ${form.lastName}`.trim(),
      phone: form.phone,
    }),
    onSuccess: async () => {
      await refreshUser();
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const attended = tickets.filter((t: any) => t.checked_in_at).length
  const totalTickets = tickets.length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>My Profile</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Manage your personal information</p>
        </div>
        {editing ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setEditing(false); const parts = (user?.full_name || '').split(' '); setForm({ firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '', phone: user?.phone || '' }) }} style={{ padding: '9px 18px', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => updateMut.mutate()} disabled={updateMut.isPending} style={{ padding: '9px 20px', borderRadius: '9px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>{updateMut.isPending ? 'Saving...' : '✓ Save Changes'}</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} style={{ padding: '9px 20px', borderRadius: '9px', border: 'none', background: saved ? '#10b981' : '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>{saved ? 'Saved ✓' : 'Edit Profile'}</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Personal Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {[['First Name', 'firstName'], ['Last Name', 'lastName']].map(([label, key]) => (
                <div key={key}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>{label}</label>
                  <input readOnly={!editing} value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1.5px solid ${editing ? '#3b82f6' : '#e2e8f0'}`, fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: editing ? '#fff' : '#f8fafc' }} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Email Address (read-only)</label>
              <input type="email" readOnly value={user?.email || ''} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#94a3b8', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Phone Number</label>
              <input type="tel" readOnly={!editing} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1.5px solid ${editing ? '#3b82f6' : '#e2e8f0'}`, fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: editing ? '#fff' : '#f8fafc' }} />
            </div>
          </div>
        </div>

        <div>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '16px', textAlign: 'center' }}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            <div
              onClick={() => fileInputRef.current?.click()}
              title="Click to change photo"
              style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700, color: '#fff', margin: '0 auto 12px', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (form.firstName || user?.email || 'U')[0].toUpperCase()
              )}
              {avatarUploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#fff' }}>...</div>
              )}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>Click to change photo</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{`${form.firstName} ${form.lastName}`.trim() || user?.email}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Participant</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>{user?.email}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Activity Stats</div>
            {[['🎟', 'Tickets Purchased', totalTickets], ['📅', 'Events Attended', attended], ['🤍', 'Saved Events', wishlist.length]].map(([icon, label, val]) => (
              <div key={label as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}><span>{icon}</span>{label}</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
