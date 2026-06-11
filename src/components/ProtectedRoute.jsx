import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isStaffOrAdmin } from '../constants/roles'

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(role)) {
    if (isStaffOrAdmin(role)) {
      return <Navigate to="/admin/dashboard" replace />
    }
    return <Navigate to="/reader/profile" replace />
  }

  return children
}
