import { supabase } from './supabase'

// ─── PROFILES ────────────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getAdmins() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
  if (error) throw error
  return data || []
}

export async function getParticipants() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'participant')
  if (error) throw error
  return data || []
}

// ─── EVENTS ──────────────────────────────────────────────────────────────────

export async function getEvents(filters?: {
  status?: string
  category?: string
  organizerId?: string
  search?: string
  featured?: boolean
}) {
  // Try a simpler select first to see if events show up at all
  let query = supabase.from('events').select('*, ticket_tiers(*)')

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.organizerId) query = query.eq('organizer_id', filters.organizerId)
  if (filters?.featured !== undefined) query = query.eq('is_featured', filters.featured)
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  query = query.order('created_at', { ascending: false })
  const { data, error } = await query

  console.log('getEvents result:', { filters, count: data?.length, error })

  if (error) {
    console.error('Supabase getEvents error:', error)
    throw error
  }
  return data || []
}

export async function getEvent(id: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('id', id)
    .single()

  console.log('getEvent result:', { id, data: !!data, error })
  if (error) throw error
  return data
}

export async function createEvent(eventData: Record<string, unknown>) {
  console.log('createEvent input:', eventData)
  const { data, error } = await supabase
    .from('events')
    .insert({ ...eventData, is_featured: true })
    .select('*, profiles!events_organizer_id_fkey(full_name)')
    .single()

  if (error) {
    console.error('Supabase createEvent error:', error)
    throw error
  }

  console.log('createEvent success:', data)

  // Notify Admins
  const admins = await getAdmins()
  const organizerName = (data.profiles as unknown as { full_name: string })?.full_name || 'An organizer'
  for (const admin of admins) {
    await createNotification({
      user_id: admin.id,
      type: 'new_event_pending',
      title: 'New Event Submitted',
      body: `"${data.title}" was submitted by ${organizerName} and is waiting for validation.`,
      metadata: { event_id: data.id },
    })
  }

  return data
}

export async function updateEvent(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

export async function approveEvent(id: string, adminId: string) {
  const { data, error } = await supabase
    .from('events')
    .update({ status: 'active', is_featured: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  await supabase.from('event_approval_actions').insert({
    event_id: id,
    admin_id: adminId,
    decision: 'approved',
    reason: null,
  })

  // Notify organizer
  if (data?.organizer_id) {
    createNotification({
      user_id: data.organizer_id,
      type: 'event_approved',
      title: 'Event Approved',
      body: `Your event "${data.title}" has been approved and is now live!`,
      metadata: { event_id: id },
    }).catch(console.error)
  }

  // Notify all participants
  const participants = await getParticipants()
  for (const p of participants) {
    createNotification({
      user_id: p.id,
      type: 'new_event_available',
      title: 'New Event Available!',
      body: `Check out our latest event: "${data.title}"`,
      metadata: { event_id: id },
    }).catch(console.error)
  }

  return data
}

export async function rejectEvent(id: string, adminId: string, reason: string) {
  const { data, error } = await supabase
    .from('events')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  await supabase.from('event_approval_actions').insert({
    event_id: id,
    admin_id: adminId,
    decision: 'rejected',
    reason,
  })

  // Notify organizer
  if (data?.organizer_id) {
    await supabase.from('notifications').insert({
      user_id: data.organizer_id,
      type: 'event_rejected',
      title: 'Event Not Approved',
      body: `Your event "${data.title}" was not approved. Reason: ${reason}`,
      is_read: false,
      metadata: { event_id: id, reason },
    })
  }

  return data
}

// ─── TICKET TIERS ────────────────────────────────────────────────────────────

export async function getTicketTiers(eventId: string) {
  const { data, error } = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('event_id', eventId)
    .order('price_cents', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createTicketTier(tierData: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('ticket_tiers')
    .insert(tierData)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTicketTier(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('ticket_tiers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTicketTier(id: string) {
  const { error } = await supabase.from('ticket_tiers').delete().eq('id', id)
  if (error) throw error
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export async function getOrders(filters?: {
  userId?: string
  eventId?: string
  status?: string
}) {
  let query = supabase.from('orders').select(`
    *,
    order_items(*, ticket_tiers(name, tier_type, price_cents)),
    events(title, start_at, cover_image_url)
  `)

  if (filters?.userId) query = query.eq('buyer_id', filters.userId)
  if (filters?.eventId) query = query.eq('event_id', filters.eventId)
  if (filters?.status) query = query.eq('status', filters.status)

  query = query.order('created_at', { ascending: false })
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createOrder(orderData: {
  buyerId: string
  eventId: string
  tierId: string
  quantity: number
  buyerName?: string
}) {
  const tier = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('id', orderData.tierId)
    .single()
  if (tier.error) throw tier.error

  const tierData = tier.data
  const subtotal = tierData.price_cents * orderData.quantity

  // Create the order - Direct paid status for free/direct checkout
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      buyer_id: orderData.buyerId,
      event_id: orderData.eventId,
      status: 'paid',
      total_cents: subtotal,
      currency: 'USD',
      payment_provider: 'direct', // Changed from paypal to direct
      buyer_name: orderData.buyerName || null,
    })
    .select()
    .single()
  if (orderError) throw orderError

  // Create order item
  const { data: orderItem, error: itemError } = await supabase
    .from('order_items')
    .insert({
      order_id: order.id,
      tier_id: orderData.tierId,
      quantity: orderData.quantity,
      unit_price_cents: tierData.price_cents,
      subtotal_cents: subtotal,
    })
    .select()
    .single()
  if (itemError) throw itemError

  // Create tickets
  const tickets = Array.from({ length: orderData.quantity }, () => ({
    order_item_id: orderItem.id,
    event_id: orderData.eventId,
    buyer_id: orderData.buyerId,
    tier_id: orderData.tierId,
    status: 'active',
    qr_code: `QR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    barcode: `BC-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
  }))

  const { error: ticketError } = await supabase.from('tickets').insert(tickets)
  if (ticketError) throw ticketError

  // Update sold_count
  const newSoldCount = (tierData.sold_count || 0) + orderData.quantity
  await supabase
    .from('ticket_tiers')
    .update({ sold_count: newSoldCount })
    .eq('id', orderData.tierId)

  // Notify organizer of new sale
  const { data: eventData } = await supabase
    .from('events')
    .select('organizer_id, title')
    .eq('id', orderData.eventId)
    .single()

  if (eventData?.organizer_id) {
    createNotification({
      user_id: eventData.organizer_id,
      type: 'sale',
      title: 'New Ticket Sale',
      body: `${orderData.quantity} ticket${orderData.quantity > 1 ? 's' : ''} sold for "${eventData.title}"`,
      metadata: { order_id: order.id, event_id: orderData.eventId },
    }).catch(console.error)
  }

  // Notify buyer of successful booking
  createNotification({
    user_id: orderData.buyerId,
    type: 'ticket_booked',
    title: 'Booking Confirmed',
    body: `You have successfully booked ${orderData.quantity} ticket${orderData.quantity > 1 ? 's' : ''} for "${eventData?.title}".`,
    metadata: { order_id: order.id, event_id: orderData.eventId },
  }).catch(console.error)

  // Milestone logic for admins
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    // Get total tickets sold for this event today
    const { count: ticketsSoldToday } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', orderData.eventId)
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString())

    const currentCount = ticketsSoldToday || 0
    const previousCount = currentCount - orderData.quantity

    const milestones = [10, 50, 100]
    for (const milestone of milestones) {
      if (previousCount < milestone && currentCount >= milestone) {
        const admins = await getAdmins()
        for (const admin of admins) {
          createNotification({
            user_id: admin.id,
            type: 'milestone_reached',
            title: 'Event Milestone Reached!',
            body: `The event "${eventData?.title}" has sold ${milestone} tickets today!`,
            metadata: { event_id: orderData.eventId },
          }).catch(console.error)
        }
      }
    }
  } catch (err) {
    console.error('Error tracking daily milestone:', err)
  }

  return order
}

export async function getOrdersForOrganizer(organizerId: string) {
  const { data: events } = await supabase
    .from('events')
    .select('id')
    .eq('organizer_id', organizerId)

  if (!events || events.length === 0) return []

  const eventIds = events.map(e => e.id)

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*, ticket_tiers(name, tier_type, price_cents)),
      events(title, start_at),
      profiles(full_name, email)
    `)
    .in('event_id', eventIds)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getOrder(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*, ticket_tiers(name, price_cents)),
      events(title, start_at, location_name, category),
      profiles(full_name, email)
    `)
    .eq('id', orderId)
    .single()
  if (error) throw error
  return data
}

// ─── TICKETS ─────────────────────────────────────────────────────────────────

export async function getTickets(userId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      events(title, start_at, end_at, location_name, cover_image_url, category),
      ticket_tiers(name, tier_type, price_cents),
      order_items(quantity, unit_price_cents)
    `)
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getTicketsByEvent(eventId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      ticket_tiers(name, tier_type, price_cents),
      profiles(full_name, email)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function checkInTicket(ticketId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .update({ checked_in_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uncheckInTicket(ticketId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .update({ checked_in_at: null, updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getTicket(ticketId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      events(title, start_at, end_at, location_name, category),
      ticket_tiers(name, tier_type, price_cents),
      order_items(id, quantity, unit_price_cents, subtotal_cents, orders(id, total_cents, created_at))
    `)
    .eq('id', ticketId)
    .single()
  if (error) throw error
  return data
}

export async function cancelTicket(ticketId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export async function getAdminStats() {
  const [usersRes, organizersRes, revenueRes, pendingRes, activeEventsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'organizer'),
    supabase.from('orders').select('total_cents').eq('status', 'paid'),
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  const totalRevenue = (revenueRes.data || []).reduce((s, o) => s + (o.total_cents || 0), 0)

  return {
    totalUsers: usersRes.count || 0,
    totalOrganizers: organizersRes.count || 0,
    totalRevenue,
    pendingEvents: pendingRes.count || 0,
    activeEvents: activeEventsRes.count || 0,
  }
}

export async function getOrganizerStats(organizerId: string) {
  const { data: events } = await supabase
    .from('events')
    .select('id')
    .eq('organizer_id', organizerId)

  if (!events || events.length === 0) {
    return { totalEvents: 0, ticketsSold: 0, totalRevenue: 0, totalAttendees: 0 }
  }

  const eventIds = events.map(e => e.id)

  const [ordersRes, ticketsRes, checkedInRes] = await Promise.all([
    supabase.from('orders').select('total_cents').eq('status', 'paid').in('event_id', eventIds),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).in('event_id', eventIds).eq('status', 'active'),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).in('event_id', eventIds).not('checked_in_at', 'is', null),
  ])

  const totalRevenue = (ordersRes.data || []).reduce((s, o) => s + (o.total_cents || 0), 0)

  return {
    totalEvents: events.length,
    ticketsSold: ticketsRes.count || 0,
    totalRevenue,
    totalAttendees: checkedInRes.count || 0,
  }
}

export async function getRevenueByMonth(months = 6, organizerId?: string) {
  const now = new Date()
  const result = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = d.toISOString()
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString()

    let query = supabase
      .from('orders')
      .select('total_cents, event_id')
      .eq('status', 'paid')
      .gte('created_at', start)
      .lt('created_at', end)

    if (organizerId) {
      const { data: orgEvents } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', organizerId)
      const ids = (orgEvents || []).map(e => e.id)
      if (ids.length === 0) {
        result.push({ month: d.toLocaleDateString('en-US', { month: 'short' }), revenue: 0, tickets: 0 })
        continue
      }
      query = query.in('event_id', ids)
    }

    const { data } = await query
    const revenue = (data || []).reduce((s, o) => s + (o.total_cents || 0), 0)

    // get tickets for same period
    const { count: ticketCount } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', start)
      .lt('created_at', end)

    result.push({
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      revenue: Math.round(revenue / 100),
      tickets: ticketCount || 0,
    })
  }

  return result
}

export async function getTicketSalesByDay(eventId?: string, days = 14) {
  const result = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString()

    let query = supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', start)
      .lt('created_at', end)

    if (eventId) query = query.eq('event_id', eventId)

    const { count } = await query
    result.push({
      day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tickets: count || 0,
    })
  }

  return result
}

export async function getUserGrowthByMonth(months = 6) {
  const now = new Date()
  const result = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = d.toISOString()
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString()

    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', start)
      .lt('created_at', end)

    result.push({
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      users: count || 0,
    })
  }

  return result
}

export async function getTopEvents(limit = 5) {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('event_id, total_cents')
    .eq('status', 'paid')
  if (error) throw error

  const eventRevMap: Record<string, number> = {}
  for (const o of orders || []) {
    eventRevMap[o.event_id] = (eventRevMap[o.event_id] || 0) + o.total_cents
  }

  const { data: ticketCounts } = await supabase
    .from('tickets')
    .select('event_id')
    .eq('status', 'active')

  const ticketMap: Record<string, number> = {}
  for (const t of ticketCounts || []) {
    ticketMap[t.event_id] = (ticketMap[t.event_id] || 0) + 1
  }

  const eventIds = Object.entries(eventRevMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => id)

  if (eventIds.length === 0) return []

  const { data: events } = await supabase
    .from('events')
    .select('id, title')
    .in('id', eventIds)

  return (events || [])
    .map((e, i) => ({
      rank: i + 1,
      name: e.title,
      revenue: eventRevMap[e.id] || 0,
      tickets: ticketMap[e.id] || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .map((e, i) => ({ ...e, rank: i + 1 }))
}

export async function getTopOrganizers(limit = 5) {
  const { data: orders } = await supabase
    .from('orders')
    .select('event_id, total_cents')
    .eq('status', 'paid')

  const eventRevMap: Record<string, number> = {}
  for (const o of orders || []) {
    eventRevMap[o.event_id] = (eventRevMap[o.event_id] || 0) + o.total_cents
  }

  const { data: events } = await supabase
    .from('events')
    .select('id, organizer_id, profiles(full_name)')

  const orgRevMap: Record<string, { revenue: number; name: string; events: number }> = {}
  for (const e of events || []) {
    const orgId = e.organizer_id
    if (!orgRevMap[orgId]) {
      orgRevMap[orgId] = {
        revenue: 0,
        name: (e.profiles as unknown as { full_name: string } | null)?.full_name || 'Unknown',
        events: 0,
      }
    }
    orgRevMap[orgId].revenue += eventRevMap[e.id] || 0
    orgRevMap[orgId].events += 1
  }

  return Object.entries(orgRevMap)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, limit)
    .map(([, v], i) => ({ rank: i + 1, name: v.name, revenue: v.revenue, events: v.events }))
}

export async function getCategoryBreakdown() {
  const { data, error } = await supabase
    .from('events')
    .select('category')
    .eq('status', 'active')
  if (error) throw error

  const catMap: Record<string, number> = {}
  for (const e of data || []) {
    catMap[e.category] = (catMap[e.category] || 0) + 1
  }

  const total = Object.values(catMap).reduce((s, v) => s + v, 0)
  const colors = ['#2563eb', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

  return Object.entries(catMap)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count], i) => ({
      name,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
      color: colors[i % colors.length],
    }))
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function markNotificationRead(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function markAllRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
  if (error) throw error
}

export async function createNotification(notifData: {
  user_id: string
  type: string
  title: string
  body: string
  metadata?: Record<string, unknown>
}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({ ...notifData, is_read: false })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── ACTIVITY LOGS ───────────────────────────────────────────────────────────

export async function getActivityLogs(filters?: {
  actionType?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  limit?: number
}) {
  let query = supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(filters?.limit || 50)

  if (filters?.actionType) query = query.eq('action', filters.actionType)
  if (filters?.dateFrom) query = query.gte('created_at', filters.dateFrom)
  if (filters?.dateTo) query = query.lte('created_at', filters.dateTo + 'T23:59:59')
  if (filters?.search) {
    query = query.or(
      `action.ilike.%${filters.search}%,entity_type.ilike.%${filters.search}%,entity_id.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// ─── WISHLIST ────────────────────────────────────────────────────────────────

export async function getWishlist(userId: string) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*, events(*, ticket_tiers(price_cents, tier_type))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addToWishlist(userId: string, eventId: string) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .insert({ user_id: userId, event_id: eventId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeFromWishlist(userId: string, eventId: string) {
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId)
  if (error) throw error
}

// ─── USERS (ADMIN) ───────────────────────────────────────────────────────────

export async function getUsers(filters?: {
  role?: string
  status?: string
  search?: string
}) {
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })

  if (filters?.role) query = query.eq('role', filters.role)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function updateUserStatus(userId: string, status: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function featureEvent(id: string, featured: boolean) {
  const { data, error } = await supabase
    .from('events')
    .update({ is_featured: featured, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
