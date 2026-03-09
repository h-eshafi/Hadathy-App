import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import * as api from '../../lib/api'

const catEmoji: Record<string, string> = {
    music: '🎵', tech: '💻', art: '🎨', sports: '🏃', food: '🍽️',
    comedy: '🎤', education: '📚', business: '💼', other: '🎪', wellness: '🌿', entertainment: '🎤',
}

export default function AdminEventDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const qc = useQueryClient()
    const [isRejecting, setIsRejecting] = useState(false)
    const [rejectReason, setRejectReason] = useState('')

    const { data: event, isLoading } = useQuery({
        queryKey: ['event', id],
        queryFn: () => api.getEvent(id!),
        enabled: !!id,
    })

    const approveMutation = useMutation({
        mutationFn: () => api.approveEvent(id!, user!.id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['events'] })
            qc.invalidateQueries({ queryKey: ['event', id] })
        },
    })

    const rejectMutation = useMutation({
        mutationFn: () => api.rejectEvent(id!, user!.id, rejectReason || 'Rejected by admin'),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['events'] })
            qc.invalidateQueries({ queryKey: ['event', id] })
            setIsRejecting(false)
        },
    })

    const featureMutation = useMutation({
        mutationFn: (featured: boolean) => api.featureEvent(id!, featured),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['event', id] }),
    })

    const deleteMutation = useMutation({
        mutationFn: () => api.deleteEvent(id!),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['events'] })
            navigate('/admin/events')
        },
    })

    if (isLoading) return <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>Loading event details...</div>
    if (!event) return <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>Event not found</div>

    const cat = event.category || 'other'
    const emoji = catEmoji[cat] || '🎪'
    const organizer = (event.profiles as any)?.full_name || 'Unknown Organizer'
    const status = event.status || 'draft'

    return (
        <div>
            <div style={{ marginBottom: '16px', fontSize: '13px', color: '#94a3b8' }}>
                <Link to="/admin/events" style={{ color: '#3b82f6', textDecoration: 'none' }}>Events</Link> › {event.title}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px' }}>
                {/* LEFT COLUMN */}
                <div>
                    {/* Hero */}
                    <div style={{
                        height: '240px',
                        background: event.cover_image_url ? `url(${event.cover_image_url}) center/cover no-repeat` : 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '80px',
                        position: 'relative',
                        marginBottom: '24px',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0'
                    }}>
                        {!event.cover_image_url && <span style={{ opacity: 0.4 }}>{emoji}</span>}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 70%)' }}></div>
                        <div style={{ position: 'absolute', bottom: '20px', left: '24px', zIndex: 1 }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '100px', padding: '5px 16px', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'inline-block', textTransform: 'capitalize' }}>{cat}</div>
                        </div>
                    </div>

                    <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', color: '#0f172a', marginBottom: '16px' }}>{event.title}</h1>

                    <div style={{ display: 'flex', gap: '24px', marginBottom: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>📅</span>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 700 }}>{event.start_at ? new Date(event.start_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No date set'}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>{event.start_at ? new Date(event.start_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>📍</span>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 700 }}>{event.location_name || 'Online / TBD'}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>Venue Location</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Event Description</div>
                        <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{event.description || 'No description provided.'}</p>
                    </div>

                    <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Organizer Information</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 800 }}>
                                {organizer[0].toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 700 }}>{organizer}</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>Organizer ID: {event.organizer_id}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN — Admin Actions */}
                <div style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Admin Controls</div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>Current Status</div>
                            <div style={{
                                padding: '10px',
                                borderRadius: '10px',
                                textAlign: 'center',
                                fontWeight: 700,
                                fontSize: '14px',
                                textTransform: 'capitalize',
                                background: status === 'active' ? '#d1fae5' : status === 'pending' ? '#fef3c7' : status === 'rejected' ? '#fee2e2' : '#f1f5f9',
                                color: status === 'active' ? '#065f46' : status === 'pending' ? '#92400e' : status === 'rejected' ? '#991b1b' : '#64748b'
                            }}>
                                {status}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => approveMutation.mutate()}
                                        disabled={approveMutation.isPending}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
                                    >
                                        {approveMutation.isPending ? 'Approving...' : '✓ Approve Event'}
                                    </button>
                                    {!isRejecting ? (
                                        <button
                                            onClick={() => setIsRejecting(true)}
                                            style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '2px solid #ef4444', background: '#fff', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
                                        >
                                            ✕ Reject Event
                                        </button>
                                    ) : (
                                        <div style={{ padding: '16px', background: '#fff5f5', borderRadius: '12px', border: '1px solid #fed7d7' }}>
                                            <textarea
                                                value={rejectReason}
                                                onChange={e => setRejectReason(e.target.value)}
                                                placeholder="Reason for rejection..."
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #feb2b2', fontSize: '13px', marginBottom: '8px', minHeight: '80px', outline: 'none', boxSizing: 'border-box' }}
                                            />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Confirm</button>
                                                <button onClick={() => setIsRejecting(false)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {status === 'active' && (
                                <button
                                    onClick={() => featureMutation.mutate(!event.is_featured)}
                                    disabled={featureMutation.isPending}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: event.is_featured ? '#fee2e2' : '#fef3c7', color: event.is_featured ? '#ef4444' : '#92400e', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
                                >
                                    {event.is_featured ? '★ Remove Featured' : '☆ Feature on Homepage'}
                                </button>
                            )}

                            <button
                                onClick={() => { if (confirm('Permanently delete this event?')) deleteMutation.mutate() }}
                                disabled={deleteMutation.isPending}
                                style={{ width: '100%', padding: '11px', borderRadius: '12px', border: 'none', background: '#f8fafc', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '13px', marginTop: '10px' }}
                            >
                                Delete Event
                            </button>
                        </div>

                        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px', fontWeight: 600 }}>Ticket Stats</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {((event.ticket_tiers || []) as any[]).map((t: any) => (
                                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <span style={{ color: '#64748b' }}>{t.name}</span>
                                        <span style={{ fontWeight: 700 }}>{t.sold_count || 0} / {t.capacity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
