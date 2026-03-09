import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { getEvents, getTicketTiers, createTicketTier, updateTicketTier, deleteTicketTier } from '../../lib/api'

const inputStyle = { padding: '8px 12px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#0f172a', outline: 'none', width: '100%', boxSizing: 'border-box' as const }

const typePillStyle = (type: string, current: string) => ({
  padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
  background: type === current ? (type === 'paid' ? '#eff6ff' : type === 'free' ? '#d1fae5' : '#ede9fe') : '#f1f5f9',
  color: type === current ? (type === 'paid' ? '#2563eb' : type === 'free' ? '#065f46' : '#6d28d9') : '#94a3b8',
  border: `1.5px solid ${type === current ? (type === 'paid' ? '#bfdbfe' : type === 'free' ? '#86efac' : '#c4b5fd') : '#e2e8f0'}`,
})

const tierColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1']

export default function TicketConfig() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [showAdd, setShowAdd] = useState(false)
  const [newTier, setNewTier] = useState({ name: '', price: '', capacity: '', type: 'paid', sale_start_at: '', sale_end_at: '' })
  const [editStates, setEditStates] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  const { data: events = [] } = useQuery({
    queryKey: ['events', { organizerId: user?.id }],
    queryFn: () => getEvents({ organizerId: user!.id }),
    enabled: !!user?.id,
  })

  useEffect(() => {
    if ((events as any[]).length > 0 && !selectedEventId) setSelectedEventId((events as any[])[0].id)
  }, [events])

  const { data: tiers = [], isLoading: tiersLoading } = useQuery({
    queryKey: ['ticket-tiers', selectedEventId],
    queryFn: () => getTicketTiers(selectedEventId),
    enabled: !!selectedEventId,
  })

  const createMut = useMutation({
    mutationFn: (data: any) => createTicketTier(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ticket-tiers', selectedEventId] }); setShowAdd(false); setNewTier({ name: '', price: '', capacity: '', type: 'paid', sale_start_at: '', sale_end_at: '' }) },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateTicketTier(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ticket-tiers', selectedEventId] }); setSavingId(null) },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTicketTier(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ticket-tiers', selectedEventId] }),
  })

  const getEdit = (tier: any) => editStates[tier.id] || {
    name: tier.name || '',
    price: ((tier.price_cents ?? 0) / 100).toString(),
    capacity: (tier.capacity ?? '').toString(),
    type: tier.tier_type,
    sale_start_at: tier.sale_start_at?.split('T')[0] || '',
    sale_end_at: tier.sale_end_at?.split('T')[0] || '',
    is_active: tier.is_active,
  }

  const setEdit = (tierId: string, field: string, value: any) => {
    setEditStates(prev => {
      const fullTier = (tiers as any[]).find((t: any) => t.id === tierId) || {}
      const current = prev[tierId] || getEdit(fullTier)
      return { ...prev, [tierId]: { ...current, [field]: value } }
    })
  }

  const handleSaveTier = async (tier: any) => {
    const e = getEdit(tier)
    setSavingId(tier.id)
    await updateMut.mutateAsync({
      id: tier.id,
      updates: {
        name: e.name,
        price_cents: Math.round(parseFloat(e.price || '0') * 100),
        capacity: parseInt(e.capacity || '0'),
        tier_type: e.type,
        sale_start_at: e.sale_start_at || null,
        sale_end_at: e.sale_end_at || null,
        is_active: e.is_active,
      }
    })
  }

  const handleAddTier = () => {
    if (!selectedEventId || !newTier.name) return
    setSaving(true)
    createMut.mutate({
      event_id: selectedEventId,
      name: newTier.name,
      price_cents: Math.round(parseFloat(newTier.price || '0') * 100),
      capacity: parseInt(newTier.capacity || '0'),
      tier_type: newTier.type,
      sale_start_at: newTier.sale_start_at || null,
      sale_end_at: newTier.sale_end_at || null,
      is_active: true,
    }, { onSettled: () => setSaving(false) })
  }

  const selectedEvent = events.find((e: any) => e.id === selectedEventId)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Ticket Configuration</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Event:</span>
        <select value={selectedEventId} onChange={e => { setSelectedEventId(e.target.value); setEditStates({}) }} style={{ padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#0f172a', background: '#fff', minWidth: '260px' }}>
          {events.length === 0 && <option value="">No events found</option>}
          {events.map((e: any) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      </div>

      {showAdd && (
        <div style={{ background: '#eff6ff', border: '1.5px dashed #93c5fd', borderRadius: '14px', padding: '20px 24px', marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1d4ed8', marginBottom: '14px' }}>+ Add New Ticket Tier</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div><div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: '4px' }}>Tier Name</div><input style={inputStyle} type="text" placeholder="e.g. VIP Access" value={newTier.name} onChange={e => setNewTier(n => ({ ...n, name: e.target.value }))} /></div>
            <div><div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: '4px' }}>Price ($)</div><input style={inputStyle} type="number" placeholder="0.00" value={newTier.price} onChange={e => setNewTier(n => ({ ...n, price: e.target.value }))} /></div>
            <div><div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: '4px' }}>Capacity</div><input style={inputStyle} type="number" placeholder="100" value={newTier.capacity} onChange={e => setNewTier(n => ({ ...n, capacity: e.target.value }))} /></div>
            <div><div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: '4px' }}>Type</div>
              <select style={{ ...inputStyle, background: '#fff' }} value={newTier.type} onChange={e => setNewTier(n => ({ ...n, type: e.target.value }))}>
                <option value="paid">Paid</option><option value="free">Free</option><option value="invite">Invite Only</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div><div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: '4px' }}>Sale Start Date</div><input style={inputStyle} type="date" value={newTier.sale_start_at} onChange={e => setNewTier(n => ({ ...n, sale_start_at: e.target.value }))} /></div>
            <div><div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: '4px' }}>Sale End Date</div><input style={inputStyle} type="date" value={newTier.sale_end_at} onChange={e => setNewTier(n => ({ ...n, sale_end_at: e.target.value }))} /></div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleAddTier} disabled={saving || !newTier.name} style={{ padding: '9px 20px', borderRadius: '9px', border: 'none', background: saving ? '#94a3b8' : '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Adding...' : 'Add Tier'}</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: '9px 16px', borderRadius: '9px', border: '1.5px solid #bfdbfe', background: '#fff', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>Ticket Tiers{selectedEvent ? ` — ${selectedEvent.title}` : ''}</div>
          <button onClick={() => setShowAdd(true)} disabled={!selectedEventId} style={{ padding: '9px 18px', borderRadius: '9px', border: 'none', background: selectedEventId ? '#2563eb' : '#94a3b8', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: selectedEventId ? 'pointer' : 'not-allowed' }}>+ Add Tier</button>
        </div>

        {tiersLoading && <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading tiers...</div>}
        {!tiersLoading && tiers.length === 0 && selectedEventId && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No ticket tiers yet. Add your first tier above.</div>
        )}
        {!tiersLoading && !selectedEventId && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Select an event to manage its ticket tiers.</div>
        )}

        {tiers.map((tier: any, idx: number) => {
          const e = getEdit(tier)
          const isInvite = e.type === 'invite'
          const soldPct = tier.capacity > 0 ? Math.round((tier.sold_count / tier.capacity) * 100) : 0
          const color = tierColors[idx % tierColors.length]
          return (
            <div key={tier.id} style={{ borderBottom: '1px solid #f1f5f9', padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: '#d1d5db', fontSize: '20px', cursor: 'grab', paddingTop: '2px' }}>⠿</div>
              <div style={{ width: '6px', borderRadius: '100px', alignSelf: 'stretch', flexShrink: 0, background: color }}></div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '14px', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: '4px' }}>Tier Name</div>
                  <input style={inputStyle} type="text" value={e.name} onChange={ev => setEdit(tier.id, 'name', ev.target.value)} />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    {['paid', 'free', 'invite'].map(t => (
                      <span key={t} onClick={() => setEdit(tier.id, 'type', t)} style={typePillStyle(t, e.type)}>{t === 'paid' ? 'Paid' : t === 'free' ? 'Free' : 'Invite Only'}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: '4px' }}>Price ($)</div>
                  <input style={{ ...inputStyle, fontWeight: 700, background: isInvite ? '#f8fafc' : '#fff', color: isInvite ? '#94a3b8' : '#0f172a' }} type="number" value={e.price} onChange={ev => setEdit(tier.id, 'price', ev.target.value)} disabled={isInvite} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: '4px' }}>Capacity</div>
                  <input style={inputStyle} type="number" value={e.capacity} onChange={ev => setEdit(tier.id, 'capacity', ev.target.value)} />
                  <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '100px', marginTop: '4px' }}><div style={{ height: '100%', width: `${soldPct}%`, background: 'linear-gradient(90deg, #3b82f6, #0ea5e9)', borderRadius: '100px' }}></div></div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{tier.sold_count} / {tier.capacity} {isInvite ? 'issued' : 'sold'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: '4px' }}>Sale Start</div>
                  <input style={{ ...inputStyle, background: isInvite ? '#f8fafc' : '#fff', color: isInvite ? '#94a3b8' : '#0f172a' }} type="date" value={e.sale_start_at} onChange={ev => setEdit(tier.id, 'sale_start_at', ev.target.value)} disabled={isInvite} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: '4px' }}>Sale End</div>
                  <input style={{ ...inputStyle, background: isInvite ? '#f8fafc' : '#fff', color: isInvite ? '#94a3b8' : '#0f172a' }} type="date" value={e.sale_end_at} onChange={ev => setEdit(tier.id, 'sale_end_at', ev.target.value)} disabled={isInvite} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                    <div onClick={() => setEdit(tier.id, 'is_active', !e.is_active)} style={{ width: '36px', height: '20px', borderRadius: '100px', background: e.is_active ? '#10b981' : '#d1d5db', position: 'relative', cursor: 'pointer' }}>
                      <div style={{ position: 'absolute', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', right: e.is_active ? '2px' : 'auto', left: e.is_active ? 'auto' : '2px', transition: 'all 0.2s' }}></div>
                    </div>
                    {e.is_active ? 'On Sale' : 'Off'}
                  </div>
                  <button onClick={() => handleSaveTier(tier)} disabled={savingId === tier.id} style={{ padding: '6px 12px', borderRadius: '7px', border: 'none', background: savingId === tier.id ? '#94a3b8' : '#2563eb', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: savingId === tier.id ? 'not-allowed' : 'pointer' }}>{savingId === tier.id ? 'Saving...' : 'Save'}</button>
                  <button onClick={() => { if (confirm('Delete this tier?')) deleteMut.mutate(tier.id) }} style={{ padding: '6px 12px', borderRadius: '7px', border: '1.5px solid #ef4444', background: '#fff', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
