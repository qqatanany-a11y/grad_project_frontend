import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RequireAdmin from './RequireAdmin'
import {
  clearAuthSession,
  isAdminSession,
  persistAuthSession,
  readAuthSession,
} from '../lib/authSession'
import AuthPage from '../pages/Auth/AuthPage'
import AdminDashboardLayout from '../pages/AdminDashboard/AdminDashboardLayout'
import AdminOverviewPage from '../pages/AdminDashboard/AdminOverviewPage'
import AdminUsersPage from '../pages/AdminDashboard/AdminUsersPage'
import AdminCompaniesPage from '../pages/AdminDashboard/AdminCompaniesPage'
import AdminRegisterAdminPage from '../pages/AdminDashboard/AdminRegisterAdminPage'

function App() {
  const [session, setSession] = useState(() => readAuthSession())

  const handleAuthenticated = (authResponse) => {
    persistAuthSession(authResponse)
    setSession(authResponse)
  }

  const handleLogout = () => {
    clearAuthSession()
    setSession(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={isAdminSession(session) ? '/admin' : '/auth'}
              replace
            />
          }
        />
        <Route
          path="/auth"
          element={
            isAdminSession(session) ? (
              <Navigate to="/admin" replace />
            ) : (
              <AuthPage onAuthenticated={handleAuthenticated} />
            )
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin session={session}>
              <AdminDashboardLayout
                session={session}
                onLogout={handleLogout}
              />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminOverviewPage session={session} />} />
          <Route path="users" element={<AdminUsersPage session={session} />} />
          <Route
            path="companies"
            element={<AdminCompaniesPage session={session} />}
          />
          <Route
            path="register-admin"
            element={<AdminRegisterAdminPage session={session} />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
