import { Navigate, useLocation } from 'react-router-dom'
import { isAdminSession } from '../lib/authSession'

function RequireAdmin({ session, children }) {
  const location = useLocation()

  if (!session?.token) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  if (!isAdminSession(session)) {
    return <Navigate to="/auth" replace />
  }

  return children
}

export default RequireAdmin
