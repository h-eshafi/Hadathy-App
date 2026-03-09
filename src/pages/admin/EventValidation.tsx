import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import * as api from '../../lib/api'

export default function AdminEventValidation() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [rejected, setRejected] = useState<Record<string, boolean>>({})
  const [rejectText, setRejectText] = useState<Record<string, string>>({})

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ['events', { status: 'pending' }],
    queryFn: () => api.getEvents({ status: 'pending' }),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.approveEvent(id, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.rejectEvent(id, user!.id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })

  const toggleReject = (id: string) => setRejected(r => ({ ...r, [id]: !r[id] }))

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Event Validation Queue <span style={{ fontSize: '14px', fontWeight: 600, color: '#f59e0b', marginLeft: '8px' }}>{queue.length} pending</span></h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {queue.length === 0 && (
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>All caught up!</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>No events pending review</div>
            </div>
          )}
          {queue.map((e: { id: string; title: string; category?: string; created_at: string; start_at?: string; location_name?: string; profiles?: { full_name?: string } | null; description?: string; cover_image_url?: string }) => (
            <div key={e.id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{
                height: '100px',
                background: e.cover_image_url ? `url(${e.cover_image_url}) center/cover no-repeat` : 'linear-gradient(135deg, #7c3aed, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                position: 'relative'
              }}>
                {!e.cover_image_url && '🎟'}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 80%)' }}></div>
                <span style={{ position: 'absolute', top: '10px', left: '12px', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', backdropFilter: 'blur(4px)', zIndex: 1 }}>{e.category || 'Event'}</span>
                <span style={{ position: 'absolute', top: '10px', right: '12px', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '10px', padding: '3px 10px', borderRadius: '100px', zIndex: 1 }}>
                  Submitted {new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{e.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                  by {e.profiles?.full_name || 'Unknown organizer'}
                </div>
                {e.description && (
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px', lineHeight: 1.5 }}>
                    {e.description.slice(0, 200)}{e.description.length > 200 ? '...' : ''}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  {e.start_at && <div style={{ fontSize: '12px', color: '#64748b' }}><strong style={{ color: '#334155' }}>Date:</strong> {new Date(e.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
                  {e.location_name && <div style={{ fontSize: '12px', color: '#64748b' }}><strong style={{ color: '#334155' }}>Venue:</strong> {e.location_name}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: rejected[e.id] ? '10px' : 0 }}>
                  <button
                    onClick={() => approveMutation.mutate(e.id)}
                    disabled={approveMutation.isPending}
                    style={{ flex: 1, padding: '9px', borderRadius: '9px', border: 'none', background: '#10b981', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>✓ Approve</button>
                  <button onClick={() => toggleReject(e.id)} style={{ flex: 1, padding: '9px', borderRadius: '9px', border: '1.5px solid #ef4444', background: '#fee2e2', color: '#ef4444', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>✕ Reject</button>
                </div>
                {rejected[e.id] && (
                  <div style={{ padding: '12px', background: '#fee2e2', borderRadius: '10px', border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', marginBottom: '6px' }}>Rejection Reason (sent to organizer)</div>
                    <textarea
                      value={rejectText[e.id] ?? ''}
                      onChange={ev => setRejectText(r => ({ ...r, [e.id]: ev.target.value }))}
                      placeholder="Explain why this event is being rejected..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #fca5a5', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'none', minHeight: '70px', background: '#fff', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        onClick={() => {
                          rejectMutation.mutate({ id: e.id, reason: rejectText[e.id] || 'Rejected by admin' })
                          toggleReject(e.id)
                        }}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Confirm Rejection</button>
                      <button onClick={() => toggleReject(e.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>Queue Summary</div>
            {[['Pending Review', String(queue.length), '#f59e0b']].map(([l, v, c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{l}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
