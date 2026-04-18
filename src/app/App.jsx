import { useState } from 'react'
import HomePage from '../pages/Home/HomePage'
import AddHallRequest from '../pages/Public/AddHallRequest'
import AuthPage from '../pages/Auth/AuthPage'
import DashboardLayout from '../pages/Dashboard/DashboardLayout'
import HallRequests from '../pages/Dashboard/HallRequests'
import EditHalls from '../pages/Dashboard/EditHalls'
import Users from '../pages/Dashboard/Users'
import ClientsOverview from '../pages/Dashboard/ClientsOverview'

function App() {
  const [view, setView] = useState('home')
  const [currentPage, setCurrentPage] = useState('hall-requests')
  const [user, setUser] = useState(null)

  const handleSignIn = (userData) => {
    setUser(userData)
    setView('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setView('auth')
    setCurrentPage('hall-requests')
  }

  const handleGoHome = () => {
    setUser(null)
    setView('home')
    setCurrentPage('hall-requests')
  }

  const navigate = (to) => {
    if (to === 'home') { setView('home'); return }
    if (to === 'add-hall') { setView('add-hall'); return }
    if (to === 'auth') { setView('auth'); return }
    setView('dashboard')
    setCurrentPage(to)
  }

  if (view === 'home') return <HomePage onNavigate={navigate} />
  if (view === 'add-hall') return <AddHallRequest onNavigate={navigate} />
  if (view === 'auth') return <AuthPage onSignIn={handleSignIn} onBack={() => setView('home')} />

  const renderPage = () => {
    switch (currentPage) {
      case 'edit-halls': return <EditHalls />
      case 'users': return <Users />
      case 'clients-overview': return <ClientsOverview />
      default: return <HallRequests />
    }
  }

  return (
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
      onGoHome={handleGoHome}
      user={user}
    >
      {renderPage()}
    </DashboardLayout>
  )
}

export default App
