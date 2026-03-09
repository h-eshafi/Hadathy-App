import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getEvents } from '../../lib/api'

const categories = ['All Categories', 'Music', 'Technology', 'Art & Culture', 'Sports', 'Food & Drink', 'Education', 'Entertainment', 'Wellness']

const categoryEmoji: Record<string, string> = {
  'Music': '🎵', 'Technology': '💻', 'Sports': '🏃', 'Food & Drink': '🍽️',
  'Art & Culture': '🎨', 'Entertainment': '🎤', 'Education': '📚', 'Wellness': '🌿',
  music: '🎵', tech: '💻', sports: '🏃', food: '🍽️',
  art: '🎨', entertainment: '🎤', education: '📚', wellness: '🌿',
}

const categoryGradient: Record<string, string> = {
  music: 'linear-gradient(135deg,#dbeafe,#bfdbfe)',
  tech: 'linear-gradient(135deg,#e0f2fe,#bae6fd)',
  art: 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
  sports: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
  food: 'linear-gradient(135deg,#fef3c7,#fde68a)',
  entertainment: 'linear-gradient(135deg,#fee2e2,#fecaca)',
  education: 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
  wellness: 'linear-gradient(135deg,#f0fdf4,#bbf7d0)',
}

// DB stores lowercase category values
const catMap: Record<string, string> = {
  'Music': 'music', 'Technology': 'tech', 'Art & Culture': 'art',
  'Sports': 'sports', 'Food & Drink': 'food', 'Education': 'education',
  'Entertainment': 'entertainment', 'Wellness': 'wellness',
}

export default function ParticipantBrowse() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['participant-browse-events', { search, category }],
    queryFn: () => getEvents({
      status: 'active',
      featured: true,
      search: search || undefined,
      category: catMap[category] || category || undefined,
    }),
  })

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Browse Events</h1>
        <p style={{ fontSize: '14px', color: '#64748b' }}>Discover events tailored for you</p>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1.5px solid #bfdbfe', borderRadius: '12px', padding: '10px 18px' }}>
          <span style={{ fontSize: '16px', color: '#94a3b8' }}>🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." style={{ border: 'none', outline: 'none', fontSize: '14px', flex: 1, fontFamily: 'Inter, sans-serif' }} />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value === 'All Categories' ? '' : e.target.value)} style={{ padding: '10px 18px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#334155', background: '#fff' }}>
          {categories.map(c => <option key={c} value={c === 'All Categories' ? '' : c}>{c}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading events...</div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎪</div>
          <div style={{ fontSize: '15px' }}>No events found.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
          {events.map((e: any) => {
            const cat = e.category || 'other'
            const emoji = categoryEmoji[cat] || '🎪'
            const bg = categoryGradient[cat] || 'linear-gradient(135deg,#f1f5f9,#e2e8f0)'
            // Compute min price from ticket_tiers
            const tiers = (e.ticket_tiers || []).filter((t: any) => t.is_active)
            let price = 'View'
            if (tiers.length > 0) {
              const minCents = Math.min(...tiers.map((t: any) => t.price_cents))
              price = minCents === 0 ? 'Free' : `$${(minCents / 100).toFixed(0)}`
            }
            const dateStr = e.start_at ? new Date(e.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'
            return (
              <div key={e.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{ height: '160px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', position: 'relative', overflow: 'hidden' }}>
                  {e.cover_image_url ? (
                    <img src={e.cover_image_url} alt={e.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    emoji
                  )}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.92)', borderRadius: '100px', padding: '3px 10px', fontSize: '10px', fontWeight: 700, color: '#1d4ed8', zIndex: 1 }}>{cat}</div>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#3b82f6', marginBottom: '5px' }}>{cat}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
                    <div>📅 {dateStr}</div>
                    <div>📍 {e.location_name || 'Online'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>{price}</div>
                    <Link to={`/participant/events/${e.id}`} style={{ padding: '7px 14px', borderRadius: '7px', background: '#2563eb', color: '#fff', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>View</Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
