import { useState } from 'react'
import AuthPage from '../pages/Auth/AuthPage'
import DashboardLayout from '../pages/Dashboard/DashboardLayout'
import AcademyRequest from '../pages/Dashboard/AcademyRequest'
import Users from '../pages/Dashboard/Users'
import ClientsOverview from '../pages/Dashboard/ClientsOverview'

function App() {
  const [view, setView] = useState('auth')
  const [currentPage, setCurrentPage] = useState('academy-request')
  const [user, setUser] = useState(null)

  const handleSignIn = (userData) => {
    setUser(userData)
    setView('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setView('auth')
    setCurrentPage('academy-request')
  }

  if (view === 'auth') {
    return <AuthPage onSignIn={handleSignIn} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'users':
        return <Users />
      case 'clients-overview':
        return <ClientsOverview />
      default:
        return <AcademyRequest />
    }
  }

  return (
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
      user={user}
    >
      {renderPage()}
    </DashboardLayout>
  )
}

export default App
