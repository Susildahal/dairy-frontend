import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Loading from '@/dashbord/ui/Loading'

export default function Welcome() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } else if (!isLoading && !user) {
      // Not authenticated, redirect to login
      navigate('/login')
    }
  }, [user, isLoading, navigate])

  if (isLoading) {
    return <Loading />
  }

  return <Loading />
}
