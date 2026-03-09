import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { getProfile, updateProfile } from '../../lib/api'

export default function ParticipantSettings() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState({
    email: true, push: true, sms: false, marketing: true,
  })
  const [privacy, setPrivacy] = useState({
    profilePublic: true, showAttendance: false,
  })
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState(false)

  // Load preferences from DB
  const { data: profile } = useQuery({
    queryKey: ['profile-settings', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (profile?.preferences) {
      const p = profile.preferences as any
      setNotifications({
        email: p.email ?? true,
        push: p.push ?? true,
        sms: p.sms ?? false,
        marketing: p.marketing ?? true,
      })
      setPrivacy({
        profilePublic: p.profilePublic ?? true,
        showAttendance: p.showAttendance ?? false,
      })
    }
  }, [profile])

  // Save preferences mutation
  const prefsMut = useMutation({
    mutationFn: (prefs: Record<string, boolean>) =>
      updateProfile(user!.id, { preferences: prefs }),
  })

  const savePrefs = (key: string, val: boolean, group: 'notifications' | 'privacy') => {
    const updatedNotifs = group === 'notifications' ? { ...notifications, [key]: val } : notifications
    const updatedPrivacy = group === 'privacy' ? { ...privacy, [key]: val } : privacy
    if (group === 'notifications') setNotifications(n => ({ ...n, [key]: val }))
    else setPrivacy(p => ({ ...p, [key]: val }))
    prefsMut.mutate({ ...updatedNotifs, ...updatedPrivacy })
  }

  const handleUpdatePassword = async () => {
    setPwdError('')
    setPwdSuccess(false)
    if (!newPwd || !confirmPwd) {
      setPwdError('Please fill in all password fields')
      return
    }
    if (newPwd !== confirmPwd) {
      setPwdError('New passwords do not match')
      return
    }
    if (newPwd.length < 8) {
      setPwdError('Password must be at least 8 characters')
      return
    }
    setPwdLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd })
      if (error) throw error
      setPwdSuccess(true)
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
      setTimeout(() => setPwdSuccess(false), 3000)
    } catch (err: any) {
      setPwdError(err.message || 'Failed to update password')
    } finally {
      setPwdLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
    fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' as const,
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>Settings</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Notification Preferences</div>
            {[
              ['email', 'Email Notifications', 'Receive booking confirmations and updates'],
              ['push', 'Push Notifications', 'Browser notifications for important alerts'],
              ['sms', 'SMS Alerts', 'Text messages for event reminders'],
              ['marketing', 'Marketing Emails', 'New events and promotions matching your interests'],
            ].map(([key, label, desc]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{desc}</div>
                </div>
                <div
                  onClick={() => savePrefs(key, !notifications[key as keyof typeof notifications], 'notifications')}
                  style={{ width: '44px', height: '24px', borderRadius: '100px', background: notifications[key as keyof typeof notifications] ? '#2563eb' : '#e2e8f0', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  <div style={{ position: 'absolute', top: '2px', left: notifications[key as keyof typeof notifications] ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Privacy Settings</div>
            {[
              ['profilePublic', 'Public Profile', 'Let others see your event attendance'],
              ['showAttendance', 'Show Attendance', 'Display events you have attended'],
            ].map(([key, label, desc]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{desc}</div>
                </div>
                <div
                  onClick={() => savePrefs(key, !privacy[key as keyof typeof privacy], 'privacy')}
                  style={{ width: '44px', height: '24px', borderRadius: '100px', background: privacy[key as keyof typeof privacy] ? '#2563eb' : '#e2e8f0', position: 'relative', cursor: 'pointer' }}
                >
                  <div style={{ position: 'absolute', top: '2px', left: privacy[key as keyof typeof privacy] ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Change Password</div>

            {pwdSuccess && (
              <div style={{ background: '#d1fae5', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#065f46', fontWeight: 600 }}>
                ✓ Password updated successfully
              </div>
            )}
            {pwdError && (
              <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#991b1b', fontWeight: 600 }}>
                {pwdError}
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Current Password</label>
              <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>New Password</label>
              <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Min. 8 characters" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Confirm New Password</label>
              <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="••••••••" style={inputStyle} />
            </div>
            <button
              onClick={handleUpdatePassword}
              disabled={pwdLoading}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: pwdLoading ? '#94a3b8' : '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: pwdLoading ? 'not-allowed' : 'pointer' }}
            >
              {pwdLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#ef4444' }}>Danger Zone</div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Once you delete your account, there is no going back. All your data will be permanently removed.</p>
            <button style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #fecaca', background: '#fff', color: '#ef4444', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  )
}
