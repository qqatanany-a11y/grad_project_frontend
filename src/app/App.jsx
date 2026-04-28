import { useState } from 'react'
import HomePage from '../pages/Home/HomePage'
import CompanyRegistration from '../pages/Public/CompanyRegistration'
import AuthPage from '../pages/Auth/AuthPage'
import DashboardLayout from '../pages/Dashboard/DashboardLayout'
import CompanyRequests from '../pages/Dashboard/CompanyRequests'
import VenueRequests from '../pages/Dashboard/VenueRequests'
import Venues from '../pages/Dashboard/Venues'
import Companies from '../pages/Dashboard/Companies'
import Bookings from '../pages/Dashboard/Bookings'
import Users from '../pages/Dashboard/Users'
import EditRequests from '../pages/Dashboard/EditRequests'
import {
  clearAuthSession,
  persistAuthSession,
  readAuthSession,
} from '../lib/authSession'

function getAllowedPagesForRole(role) {
  if (role === 'Admin') {
    return ['owner-requests', 'venue-requests', 'venues', 'companies', 'users', 'edit-requests']
  }

  if (role === 'Owner') {
    return ['venues', 'bookings', 'edit-requests']
  }

  if (role === 'User') {
    return ['bookings']
  }

  return ['venues']
}

function getDefaultPageForRole(role) {
  if (role === 'Admin') {
    return 'owner-requests'
  }

  if (role === 'Owner') {
    return 'venues'
  }

  if (role === 'User') {
    return 'bookings'
  }

  return 'venues'
}

function resolvePageForRole(role, page) {
  return getAllowedPagesForRole(role).includes(page)
    ? page
    : getDefaultPageForRole(role)
}

function App() {
  const initialSession = readAuthSession()
  const [session, setSession] = useState(initialSession)
  const [view, setView] = useState(initialSession ? 'dashboard' : 'home')
  const [currentPage, setCurrentPage] = useState(
    getDefaultPageForRole(initialSession?.role),
  )
  const [bookingDraft, setBookingDraft] = useState(null)

  const handleSignIn = (authUser) => {
    persistAuthSession(authUser)
    setSession(authUser)

    if (bookingDraft && authUser?.role === 'User') {
      setCurrentPage('bookings')
      setView('dashboard')
      return
    }

    setCurrentPage(getDefaultPageForRole(authUser?.role))
    setView('dashboard')
  }

  const handleLogout = () => {
    clearAuthSession()
    setSession(null)
    setCurrentPage(getDefaultPageForRole())
    setView('auth')
  }

  const handleGoHome = () => {
    setView('home')
  }

  const navigate = (to) => {
    if (to === 'home') {
      setView('home')
      return
    }

    if (to === 'add-hall' || to === 'owner-request') {
      setView('owner-request')
      return
    }

    if (to === 'auth') {
      setView('auth')
      return
    }

    if (!session) {
      setView('auth')
      return
    }

    setView('dashboard')
    setCurrentPage(resolvePageForRole(session?.role, to))
  }

  const startVenueBooking = (draft) => {
    if (!draft?.venueId) {
      return
    }

    setBookingDraft({
      ...draft,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    })

    if (session?.role === 'User') {
      setView('dashboard')
      setCurrentPage('bookings')
      return
    }

    setView('auth')
  }

  if (view === 'home') {
    return (
      <HomePage
        onNavigate={navigate}
        onStartBooking={startVenueBooking}
        session={session}
      />
    )
  }

  if (view === 'owner-request') {
    return <CompanyRegistration onNavigate={navigate} />
  }

  if (view === 'auth' || !session) {
    return (
      <AuthPage
        onSignIn={handleSignIn}
        onBack={() => setView(session ? 'dashboard' : 'home')}
      />
    )
  }

  const resolvedPage = resolvePageForRole(session?.role, currentPage)

  const handleDashboardNavigate = (nextPage) => {
    setCurrentPage(resolvePageForRole(session?.role, nextPage))
  }

  const renderPage = () => {
    switch (resolvedPage) {
      case 'companies':
        return <Companies session={session} />
      case 'bookings':
        return (
          <Bookings
            session={session}
            initialBookingDraft={bookingDraft}
            onBookingDraftApplied={() => setBookingDraft(null)}
          />
        )
      case 'venue-requests':
        return <VenueRequests session={session} />
      case 'users':
        return <Users session={session} />
      case 'edit-requests':
        return <EditRequests session={session} />
      case 'venues':
        return <Venues session={session} />
      case 'owner-requests':
      default:
        return <CompanyRequests session={session} />
    }
  }

  return (
    <DashboardLayout
      currentPage={resolvedPage}
      onNavigate={handleDashboardNavigate}
      onLogout={handleLogout}
      onGoHome={handleGoHome}
      user={session}
    >
      {renderPage()}
    </DashboardLayout>
  )
}

export default App
