import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
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

export default function CreateEvent() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [error, setError] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: '', category: 'Music', date: '', time: '', endDate: '', endTime: '',
    location: '', description: '', capacity: '', price: '', ticketType: 'paid', format: 'in-person'
  })
  const set = (k: string, v: string) => setForm(f => {
    const next = { ...f, [k]: v }
    // Auto-adjust endDate if startDate moves past it
    if (k === 'date' && next.endDate && next.endDate < v) {
      next.endDate = v
    }
    return next
  })
  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', boxSizing: 'border-box' as const }

  const validate = (): string | null => {
    if (!form.title.trim()) return 'Event title is required.'
    if (!form.description.trim()) return 'Description is required.'
    if (!form.date) return 'Start date is required.'
    if (!form.time) return 'Start time is required.'
    if (!form.endDate) return 'End date is required.'
    if (!form.endTime) return 'End time is required.'
    if (!form.location.trim()) return 'Location is required.'
    if (!form.capacity || parseInt(form.capacity) < 1) return 'Capacity must be at least 1.'
    if (form.ticketType === 'paid' && (!form.price || parseFloat(form.price) <= 0)) return 'Ticket price must be greater than 0 for paid events.'

    const startAt = new Date(`${form.date}T${form.time}:00`)
    const endAt = new Date(`${form.endDate}T${form.endTime}:00`)
    if (isNaN(startAt.getTime())) return 'Invalid start date/time.'
    if (isNaN(endAt.getTime())) return 'Invalid end date/time.'
    if (endAt <= startAt) return 'End date/time must be after start date/time.'

    return null
  }

  const createMutation = useMutation({
    mutationFn: async (status: string) => {
      const validationError = validate()
      if (validationError) throw new Error(validationError)

      const startAt = `${form.date}T${form.time}:00`
      const endAt = `${form.endDate}T${form.endTime}:00`

      const event = await api.createEvent({
        organizer_id: user!.id,
        title: form.title.trim(),
        category: categoryMap[form.category] || form.category,
        description: form.description.trim(),
        location_name: form.location.trim(),
        start_at: startAt,
        end_at: endAt,
        status,
      })

      // Upload cover image if selected
      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const path = `${event.id}.${ext}`
        const { error: uploadError } = await supabase.storage.from('event-covers').upload(path, coverFile, { upsert: true })

        if (uploadError) {
          console.error('Storage upload error:', uploadError)
          throw new Error(`Failed to upload cover image: ${uploadError.message}`)
        }

        const { data: urlData } = supabase.storage.from('event-covers').getPublicUrl(path)
        if (!urlData.publicUrl) {
          throw new Error('Failed to generate public URL for cover image.')
        }

        try {
          await api.updateEvent(event.id, { cover_image_url: urlData.publicUrl })
        } catch (updateError: any) {
          console.error('Event update error:', updateError)
          throw new Error(`Failed to update event with cover image: ${updateError.message}`)
        }
      }

      // Create default ticket tier
      const nowString = new Date().toISOString()
      const tierBase = {
        event_id: event.id,
        name: 'General Admission',
        capacity: form.capacity ? parseInt(form.capacity) : null,
        sold_count: 0,
        is_active: true,
        sale_start_at: nowString,
        sale_end_at: endAt,
      }

      if (form.ticketType === 'paid' && form.price && parseFloat(form.price) > 0) {
        await api.createTicketTier({
          ...tierBase,
          tier_type: 'paid',
          price_cents: Math.round(parseFloat(form.price) * 100),
        })
      } else if (form.ticketType === 'free') {
        await api.createTicketTier({
          ...tierBase,
          tier_type: 'free',
          price_cents: 0,
        })
      } else if (form.ticketType === 'invite_only') {
        await api.createTicketTier({
          ...tierBase,
          tier_type: 'invite_only',
          price_cents: 0,
        })
      }

      return event
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
      qc.invalidateQueries({ queryKey: ['participant-browse-events'] })
      navigate('/organizer/events')
    },
    onError: (err: Error) => setError(err.message),
  })

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (status: string) => {
    setError('')
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    createMutation.mutate(status)
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Create New Event</h1>
        <p style={{ fontSize: '14px', color: '#64748b' }}>Fill in the details to publish your event</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#991b1b', fontWeight: 600 }}>{error}</div>
      )}

      <form onSubmit={e => e.preventDefault()} style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        <div>
          {/* BASIC INFO */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Basic Information</div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Event Title *</label>
              <input style={inputStyle} type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Blue Note Jazz Festival 2026" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}>
                  {['Music', 'Technology', 'Art & Culture', 'Sports', 'Food & Drink', 'Education', 'Entertainment', 'Wellness'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Format</label>
                <select value={form.format} onChange={e => set('format', e.target.value)} style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}>
                  <option value="in-person">In-Person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Description *</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5} placeholder="Describe your event in detail..." style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>

          {/* DATE & LOCATION */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Date & Location</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Start Date *</label>
                <input style={inputStyle} type="date" value={form.date} onChange={e => set('date', e.target.value)} min={new Date().toISOString().split('T')[0]} max="2099-12-31" />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Start Time *</label>
                <input style={inputStyle} type="time" value={form.time} onChange={e => set('time', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>End Date *</label>
                <input style={inputStyle} type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} min={form.date || new Date().toISOString().split('T')[0]} max="2099-12-31" />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>End Time *</label>
                <input style={inputStyle} type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Venue / Location *</label>
              <input style={inputStyle} type="text" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Symphony Hall, Chicago, IL" />
            </div>
          </div>

          {/* TICKETS */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Ticket Settings</div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              {[{ val: 'paid', label: 'Paid', desc: 'Set a ticket price' }, { val: 'free', label: 'Free', desc: 'No charge to attend' }, { val: 'invite_only', label: 'Invite Only', desc: 'By invitation only' }].map(opt => (
                <div key={opt.val} onClick={() => set('ticketType', opt.val)} style={{ flex: 1, border: `2px solid ${form.ticketType === opt.val ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', background: form.ticketType === opt.val ? '#eff6ff' : '#fff', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{opt.label}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{opt.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {form.ticketType === 'paid' && <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Ticket Price ($) *</label>
                <input style={inputStyle} type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" min="0" step="0.01" />
              </div>}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Capacity *</label>
                <input style={inputStyle} type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="e.g. 500" min="1" />
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
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
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>PNG, JPG up to 10MB</span>
                </>
              )}
            </div>
            {coverFile && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>{coverFile.name}</div>}
          </div>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Publish Settings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleSubmit('pending')}
                disabled={createMutation.isPending}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: createMutation.isPending ? '#94a3b8' : '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: createMutation.isPending ? 'not-allowed' : 'pointer' }}>
                {createMutation.isPending ? 'Publishing...' : 'Publish Event'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={createMutation.isPending}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Save as Draft
              </button>
              <button type="button" onClick={() => navigate('/organizer/events')} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
          <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1d4ed8', marginBottom: '8px' }}>Tips</div>
            <ul style={{ fontSize: '12px', color: '#64748b', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Add a high-quality cover image</li>
              <li>Write a detailed description</li>
              <li>Set an appropriate price for your audience</li>
              <li>Events with early-bird pricing sell 3x faster</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  )
}
