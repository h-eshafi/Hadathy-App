import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../../lib/api'
import { supabase } from '../../lib/supabase'

const categoryMap: Record<string, string> = {
  'Music': 'music',
  'Technology': 'tech',
  'Art & Culture': 'art',
  'Sports': 'sports',
  'Food & Drink': 'food',
  'Education': 'education',
  'Entertainment': 'entertainment',
  'Wellness': 'wellness',
}
const dbToDisplay: Record<string, string> = Object.fromEntries(Object.entries(categoryMap).map(([k, v]) => [v, k]))

export default function EditEvent() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [error, setError] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: '', category: 'Music', date: '', time: '', location: '', description: '', capacity: '', price: '',
  })
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', boxSizing: 'border-box' as const }

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.getEvent(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (event) {
      const startDate = event.start_at ? new Date(event.start_at) : null
      setForm({
        title: event.title || '',
        category: dbToDisplay[event.category || ''] || 'Music',
        date: startDate ? startDate.toISOString().split('T')[0] : '',
        time: startDate ? startDate.toTimeString().slice(0, 5) : '',
        location: event.location_name || '',
        description: event.description || '',
        capacity: '',
        price: '',
      })
      if (event.cover_image_url) {
        setCoverPreview(event.cover_image_url)
      }
    }
  }, [event])

  const updateMutation = useMutation({
    mutationFn: async () => {
      const startAt = form.date && form.time ? `${form.date}T${form.time}:00` : form.date ? `${form.date}T00:00:00` : undefined
      const updatedEvent = await api.updateEvent(id!, {
        title: form.title,
        category: categoryMap[form.category] || form.category,
        description: form.description,
        location_name: form.location,
        start_at: startAt,
      })

      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const path = `${id}.${ext}`
        const { error: uploadError } = await supabase.storage.from('event-covers').upload(path, coverFile, { upsert: true })
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

        const { data: urlData } = supabase.storage.from('event-covers').getPublicUrl(path)
        await api.updateEvent(id!, { cover_image_url: urlData.publicUrl })
      }

      return updatedEvent
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
      qc.invalidateQueries({ queryKey: ['event', id] })
      navigate('/organizer/events')
    },
    onError: (err: Error) => setError(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteEvent(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
      navigate('/organizer/events')
    },
    onError: (err: Error) => setError(err.message),
  })

  const submitForReviewMutation = useMutation({
    mutationFn: () => api.updateEvent(id!, { status: 'pending' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
      qc.invalidateQueries({ queryKey: ['event', id] })
      navigate('/organizer/events')
    },
    onError: (err: Error) => setError(err.message),
  })

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
            <Link to="/organizer/events" style={{ color: '#3b82f6', textDecoration: 'none' }}>My Events</Link> › Edit Event
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Edit Event</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate('/organizer/events')} style={{ padding: '9px 20px', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { setError(''); updateMutation.mutate() }} disabled={updateMutation.isPending} style={{ padding: '9px 20px', borderRadius: '9px', border: 'none', background: updateMutation.isPending ? '#94a3b8' : '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: updateMutation.isPending ? 'not-allowed' : 'pointer' }}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#991b1b', fontWeight: 600 }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Basic Information</div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Event Title</label>
              <input style={inputStyle} type="text" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
                {['Music', 'Technology', 'Art & Culture', 'Sports', 'Food & Drink', 'Education', 'Entertainment', 'Wellness'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Date & Location</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Date</label><input style={inputStyle} type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
              <div><label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Time</label><input style={inputStyle} type="time" value={form.time} onChange={e => set('time', e.target.value)} /></div>
            </div>
            <div><label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Location</label><input style={inputStyle} type="text" value={form.location} onChange={e => set('location', e.target.value)} /></div>
          </div>
        </div>

        <div style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Event Cover Image</div>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleCoverChange} style={{ display: 'none' }} />
            <div onClick={() => fileInputRef.current?.click()} style={{ height: '140px', background: coverPreview ? 'transparent' : 'linear-gradient(135deg, #eff6ff, #e0f2fe)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', border: '2px dashed #bfdbfe', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
              ) : (
                <>
                  <span style={{ fontSize: '32px' }}>📸</span>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Click to upload image</span>
                </>
              )}
            </div>
            {coverFile && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>{coverFile.name}</div>}
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Event Status</div>
            <div style={{ padding: '10px', background: event?.status === 'active' ? '#d1fae5' : '#fef3c7', borderRadius: '8px', fontSize: '13px', color: event?.status === 'active' ? '#065f46' : '#92400e', fontWeight: 600, textAlign: 'center', marginBottom: '12px', textTransform: 'capitalize' }}>
              {event?.status || 'Unknown'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {event?.status === 'draft' && (
                <button
                  onClick={() => submitForReviewMutation.mutate()}
                  disabled={submitForReviewMutation.isPending}
                  style={{ width: '100%', padding: '10px', borderRadius: '9px', border: 'none', background: submitForReviewMutation.isPending ? '#94a3b8' : '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: submitForReviewMutation.isPending ? 'not-allowed' : 'pointer' }}>
                  {submitForReviewMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                </button>
              )}
              <button
                onClick={() => { if (confirm('Delete this event?')) deleteMutation.mutate() }}
                disabled={deleteMutation.isPending}
                style={{ width: '100%', padding: '10px', borderRadius: '9px', border: '1.5px solid #fecaca', background: '#fee2e2', color: '#ef4444', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                Delete Event
              </button>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Event Info</div>
            {[
              ['Title', event?.title || '—'],
              ['Category', event?.category || '—'],
              ['Status', event?.status || '—'],
              ['Created', event?.created_at ? new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>{l}</span>
                <span style={{ fontWeight: 700, maxWidth: '160px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
