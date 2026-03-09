import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { getEvents } from '../../lib/api'

const catMap: Record<string, string> = {
  'Music': 'music', 'Technology': 'tech', 'Art & Culture': 'art',
  'Sports': 'sports', 'Food & Drink': 'food', 'Education': 'education',
}

const catEmoji: Record<string, string> = {
  music: '🎵', tech: '💻', art: '🎨', sports: '🏃', food: '🍽️',
  comedy: '🎤', education: '📚', business: '💼', other: '🎪',
  wellness: '🌿', entertainment: '🎤',
}

const catGradient: Record<string, string> = {
  music: 'linear-gradient(135deg,#dbeafe,#bfdbfe)',
  tech: 'linear-gradient(135deg,#e0f2fe,#bae6fd)',
  art: 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
  sports: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
  food: 'linear-gradient(135deg,#fef3c7,#fde68a)',
  comedy: 'linear-gradient(135deg,#fee2e2,#fecaca)',
  entertainment: 'linear-gradient(135deg,#fee2e2,#fecaca)',
  education: 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
  wellness: 'linear-gradient(135deg,#f0fdf4,#bbf7d0)',
}

const catLabel: Record<string, string> = {
  music: 'Music', tech: 'Technology', art: 'Art & Culture', sports: 'Sports',
  food: 'Food & Drink', comedy: 'Comedy', education: 'Education',
  business: 'Business', other: 'Other', wellness: 'Wellness', entertainment: 'Entertainment',
}

export default function BrowseEvents() {
  const [search, setSearch] = useState('')
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set())
  const [dateFilter, setDateFilter] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 9

  const { data: allEvents = [], isLoading } = useQuery({
    queryKey: ['public-events'],
    queryFn: () => getEvents({ status: 'active', featured: true }),
  })

  const filtered = useMemo(() => {
    let ev = [...allEvents] as any[]

    if (search.trim()) {
      const q = search.toLowerCase()
      ev = ev.filter(e => e.title?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q))
    }

    if (selectedCats.size > 0) {
      ev = ev.filter(e => selectedCats.has(e.category))
    }

    if (dateFilter) {
      const now = new Date()
      ev = ev.filter(e => {
        const d = new Date(e.start_at)
        if (dateFilter === 'today') {
          return d.toDateString() === now.toDateString()
        } else if (dateFilter === 'weekend') {
          const daysUntilWeekend = (6 - now.getDay() + 7) % 7
          const weekendStart = new Date(now); weekendStart.setDate(now.getDate() + daysUntilWeekend)
          const weekendEnd = new Date(weekendStart); weekendEnd.setDate(weekendStart.getDate() + 1)
          return d >= weekendStart && d <= weekendEnd
        } else if (dateFilter === 'week') {
          const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7)
          return d >= now && d <= weekEnd
        } else if (dateFilter === 'month') {
          const monthEnd = new Date(now); monthEnd.setDate(now.getDate() + 30)
          return d >= now && d <= monthEnd
        }
        return true
      })
    }

    if (minPrice || maxPrice) {
      ev = ev.filter(e => {
        const tiers = e.ticket_tiers || []
        if (tiers.length === 0) return true
        const prices = tiers.map((t: any) => t.price_cents / 100)
        const min = Math.min(...prices)
        if (minPrice && min < Number(minPrice)) return false
        if (maxPrice && min > Number(maxPrice)) return false
        return true
      })
    }

    return ev
  }, [allEvents, search, selectedCats, dateFilter, minPrice, maxPrice])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleCat = (dbCat: string) => {
    setSelectedCats(prev => {
      const next = new Set(prev)
      if (next.has(dbCat)) next.delete(dbCat)
      else next.add(dbCat)
      return next
    })
    setPage(1)
  }

  const clearAll = () => {
    setSelectedCats(new Set())
    setDateFilter('')
    setMinPrice('')
    setMaxPrice('')
    setPage(1)
  }

  return (
    <div style={{ background: '#f8fafc', paddingTop: '64px' }}>
      <Navbar />

      {/* PAGE HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #eff6ff, #e0f2fe)', padding: '40px 48px', borderBottom: '1px solid #dbeafe' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>Home › <span style={{ color: '#2563eb' }}>Browse Events</span></div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: '6px' }}>Browse Events</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Discover thousands of events happening near you and around the world</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <div style={{ flex: 1, maxWidth: '480px', display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1.5px solid #bfdbfe', borderRadius: '12px', padding: '10px 18px' }}>
              <span style={{ fontSize: '16px', color: '#94a3b8' }}>🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search events, artists, venues..."
                style={{ border: 'none', outline: 'none', fontSize: '14px', flex: 1, fontFamily: 'Inter, sans-serif', color: '#0f172a' }}
              />
            </div>
            <div style={{ display: 'flex', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <button style={{ padding: '10px 14px', border: 'none', background: '#eff6ff', cursor: 'pointer', fontSize: '16px', color: '#2563eb' }}>⊞</button>
              <button style={{ padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: '#94a3b8' }}>☰</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px', maxWidth: '1280px', margin: '32px auto', padding: '0 48px' }}>
        {/* FILTERS SIDEBAR */}
        <div style={{ position: 'sticky', top: '90px', height: 'fit-content' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>🎛 Filters</div>
              <div onClick={clearAll} style={{ fontSize: '12px', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>Clear all</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: '12px' }}>Category</div>
              {Object.entries(catMap).map(([label, dbCat]) => (
                <label key={dbCat} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', cursor: 'pointer', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={selectedCats.has(dbCat)}
                    onChange={() => toggleCat(dbCat)}
                    style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: '12px' }}>Date</div>
              {[['today', 'Today'], ['weekend', 'This Weekend'], ['week', 'This Week'], ['month', 'This Month']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => { setDateFilter(dateFilter === val ? '' : val); setPage(1) }}
                  style={{ width: '100%', padding: '9px 14px', borderRadius: '8px', border: `1.5px solid ${dateFilter === val ? '#3b82f6' : '#e2e8f0'}`, fontSize: '13px', color: dateFilter === val ? '#1d4ed8' : '#475569', cursor: 'pointer', background: dateFilter === val ? '#eff6ff' : '#fff', marginBottom: '8px', textAlign: 'left', fontWeight: dateFilter === val ? 600 : 400 }}
                >{label}</button>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: '12px' }}>Price Range</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={minPrice}
                  onChange={e => { setMinPrice(e.target.value); setPage(1) }}
                  placeholder="$0"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#334155', outline: 'none' }}
                />
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>to</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => { setMaxPrice(e.target.value); setPage(1) }}
                  placeholder="$500"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#334155', outline: 'none' }}
                />
              </div>
            </div>

            <button
              onClick={clearAll}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginTop: '8px' }}
            >Apply Filters</button>
          </div>
        </div>

        {/* RESULTS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            {isLoading
              ? <div style={{ fontSize: '15px', color: '#64748b' }}>Loading events...</div>
              : <div style={{ fontSize: '15px', color: '#64748b' }}>Showing <strong style={{ color: '#0f172a' }}>{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong style={{ color: '#0f172a' }}>{filtered.length}</strong> events</div>
            }
          </div>

          {selectedCats.size > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {[...selectedCats].map(cat => (
                <div key={cat} onClick={() => toggleCat(cat)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '100px', padding: '4px 12px', fontSize: '12px', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer' }}>
                  {catLabel[cat] || cat} <span style={{ opacity: 0.6 }}>×</span>
                </div>
              ))}
            </div>
          )}

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ background: '#e2e8f0', borderRadius: '16px', height: '280px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : paged.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎪</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#64748b' }}>No events found</div>
              <div style={{ fontSize: '13px', marginTop: '6px' }}>Try adjusting your filters</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {paged.map((e: any) => {
                const cat = e.category || 'other'
                const emoji = catEmoji[cat] || '🎪'
                const bg = catGradient[cat] || 'linear-gradient(135deg,#f1f5f9,#e2e8f0)'
                const tiers = e.ticket_tiers || []
                const activePrices = tiers.filter((t: any) => t.is_active).map((t: any) => t.price_cents)
                const minPriceCents = activePrices.length > 0 ? Math.min(...activePrices) : null
                const priceLabel = minPriceCents === null ? 'View' : minPriceCents === 0 ? 'Free' : `$${(minPriceCents / 100).toFixed(0)}`
                const dateStr = e.start_at
                  ? new Date(e.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                  : '—'
                return (
                  <div key={e.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                    <div style={{ height: '160px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', position: 'relative', overflow: 'hidden' }}>
                      {e.cover_image_url ? (
                        <img src={e.cover_image_url} alt={e.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        emoji
                      )}
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.92)', borderRadius: '100px', padding: '3px 10px', fontSize: '10px', fontWeight: 700, color: '#1d4ed8', zIndex: 1 }}>{catLabel[cat] || cat}</div>
                      <div style={{ position: 'absolute', top: '10px', right: '10px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', zIndex: 1 }}>🤍</div>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#3b82f6', marginBottom: '5px' }}>{catLabel[cat] || cat}</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', lineHeight: 1.3 }}>{e.title}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '12px' }}>
                        <div>📅 {dateStr}</div>
                        <div>📍 {e.location_name || 'Online'}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>{priceLabel}</div>
                        <Link to={`/events/${e.id}`} style={{ padding: '7px 14px', borderRadius: '7px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>View</Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '40px', paddingBottom: '48px' }}>
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '14px', fontWeight: 600, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)} style={{ width: '38px', height: '38px', borderRadius: '8px', border: `1.5px solid ${page === n ? '#2563eb' : '#e2e8f0'}`, background: page === n ? '#2563eb' : '#fff', fontSize: '14px', fontWeight: 600, color: page === n ? '#fff' : '#64748b', cursor: 'pointer' }}>{n}</button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '14px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>›</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
