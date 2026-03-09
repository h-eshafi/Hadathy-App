export interface User {
  id: string
  email: string
  name: string
  role: 'participant' | 'organizer' | 'admin'
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  price: number
  capacity: number
  sold: number
  image: string
  organizerId: string
  status: 'active' | 'draft' | 'ended'
}

export interface Ticket {
  id: string
  eventId: string
  userId: string
  type: string
  price: number
  status: 'active' | 'used' | 'cancelled'
  qrCode: string
  seat?: string
}

export interface Order {
  id: string
  userId: string
  eventId: string
  tickets: Ticket[]
  total: number
  status: 'completed' | 'pending' | 'cancelled'
  createdAt: string
}
