import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { getWishlist, removeFromWishlist } from '../../lib/api'

const categoryEmoji: Record<string, string> = {
  music: '🎵', tech: '💻', sports: '🏃', food: '🍽️', art: '🎨', comedy: '🎤', education: '📚', business: '💼', other: '🎪'
}

export default function Wishlist() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['participant-wishlist', user?.id],
    queryFn: () => getWishlist(user!.id),
    enabled: !!user?.id,
  })

  const removeMut = useMutation({
    mutationFn: (eventId: string) => removeFromWishlist(user!.id, eventId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['participant-wishlist', user?.id] }),
  })

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>My Wishlist</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>{wishlist.length} saved events</p>
        </div>
        <Link to="/participant/browse" style={{ padding: '9px 20px', borderRadius: '9px', border: '1.5px solid #bfdbfe', background: '#eff6ff', color: '#2563eb', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>Browse More</Link>
      </div>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤍</div>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No saved events</div>
          <Link to="/participant/browse" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Browse events to add to your wishlist</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
          {wishlist.map((item: any) => {
            const e = item.events || item
            const cat = e.category || 'other'
            const emoji = categoryEmoji[cat] || '🎪'
            const dateStr = e.start_at ? new Date(e.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
            const tiers = (e.ticket_tiers || []).filter((t: any) => t.is_active !== false)
            let minPrice = 'View'
            if (tiers.length > 0) {
              const minCents = Math.min(...tiers.map((t: any) => t.price_cents))
              minPrice = minCents === 0 ? 'Free' : `$${(minCents / 100).toFixed(0)}`
            }
            const eventId = e.id || item.event_id
            return (
              <div key={item.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{ height: '140px', background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', position: 'relative' }}>
                  {emoji}
                  <button onClick={() => removeMut.mutate(eventId)} disabled={removeMut.isPending} title="Remove from wishlist" style={{ position: 'absolute', top: '10px', right: '10px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>♥</button>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#3b82f6', marginBottom: '5px' }}>{cat}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>{e.title}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>📅 {dateStr}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>📍 {e.location_name || 'Online'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>{minPrice}</div>
                    <Link to={`/participant/events/${eventId}`} style={{ padding: '7px 14px', borderRadius: '7px', background: '#2563eb', color: '#fff', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>Get Tickets</Link>
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
