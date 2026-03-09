import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Layouts
import ParticipantLayout from './components/layout/ParticipantLayout'
import OrganizerLayout from './components/layout/OrganizerLayout'
import AdminLayout from './components/layout/AdminLayout'

// Public pages
import LandingPage from './pages/public/LandingPage'
import BrowseEvents from './pages/public/BrowseEvents'
import EventDetail from './pages/public/EventDetail'
import TicketPurchase from './pages/public/TicketPurchase'
import Confirmation from './pages/public/Confirmation'

// Auth pages
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

// Participant pages
import ParticipantOverview from './pages/participant/Overview'
import ParticipantBrowse from './pages/participant/Browse'
import MyTickets from './pages/participant/MyTickets'
import TicketDetail from './pages/participant/TicketDetail'
import Wishlist from './pages/participant/Wishlist'
import ParticipantNotifications from './pages/participant/Notifications'
import Profile from './pages/participant/Profile'
import ParticipantSettings from './pages/participant/Settings'
import ParticipantEventDetail from './pages/participant/EventDetail'

// Organizer pages
import OrganizerOverview from './pages/organizer/Overview'
import MyEvents from './pages/organizer/MyEvents'
import CreateEvent from './pages/organizer/CreateEvent'
import EditEvent from './pages/organizer/EditEvent'
import TicketConfig from './pages/organizer/TicketConfig'
import Sales from './pages/organizer/Sales'
import Attendees from './pages/organizer/Attendees'
import OrganizerNotifications from './pages/organizer/Notifications'
import OrganizerSettings from './pages/organizer/Settings'

// Admin pages
import AdminOverview from './pages/admin/Overview'
import AdminUsers from './pages/admin/Users'
import AdminOrganizers from './pages/admin/Organizers'
import EventValidation from './pages/admin/EventValidation'
import AdminEvents from './pages/admin/Events'
import AdminEventDetail from './pages/admin/EventDetail'
import AdminAnalytics from './pages/admin/Analytics'
import ActivityLog from './pages/admin/ActivityLog'
import AdminSettings from './pages/admin/Settings'
import AdminNotifications from './pages/admin/Notifications'

// Protected Route component
function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode
  requiredRole?: 'participant' | 'organizer' | 'admin'
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#64748b' }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to their actual dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'organizer') return <Navigate to="/organizer" replace />
    return <Navigate to="/participant" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/browse" element={<BrowseEvents />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/:id/purchase" element={<TicketPurchase />} />
            <Route path="/confirmation" element={<Confirmation />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* Legacy auth paths */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />

            {/* Participant routes */}
            <Route
              path="/participant"
              element={
                <ProtectedRoute requiredRole="participant">
                  <ParticipantLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ParticipantOverview />} />
              <Route path="browse" element={<ParticipantBrowse />} />
              <Route path="tickets" element={<MyTickets />} />
              <Route path="tickets/:id" element={<TicketDetail />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="notifications" element={<ParticipantNotifications />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<ParticipantSettings />} />
              <Route path="events/:id" element={<ParticipantEventDetail />} />
            </Route>

            {/* Organizer routes */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute requiredRole="organizer">
                  <OrganizerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OrganizerOverview />} />
              <Route path="events" element={<MyEvents />} />
              <Route path="events/create" element={<CreateEvent />} />
              <Route path="events/:id/edit" element={<EditEvent />} />
              <Route path="tickets" element={<TicketConfig />} />
              <Route path="sales" element={<Sales />} />
              <Route path="attendees" element={<Attendees />} />
              <Route path="notifications" element={<OrganizerNotifications />} />
              <Route path="settings" element={<OrganizerSettings />} />
            </Route>

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="organizers" element={<AdminOrganizers />} />
              <Route path="events/validation" element={<EventValidation />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="events/:id" element={<AdminEventDetail />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="activity" element={<ActivityLog />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
