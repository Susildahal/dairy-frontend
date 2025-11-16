import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loading from '../dashbord/ui/Loading'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isLoading, user, isAdmin } = useAuth()

  // Show loading while checking authentication or fetching user data
  if (isLoading) {
    return <Loading />
  }

  // Check if we have flag but no user data (still loading)
  const flag = localStorage.getItem('flag')
  if (flag === 'true' && !user && !isLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If admin only route and user is not admin, redirect to user dashboard
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
