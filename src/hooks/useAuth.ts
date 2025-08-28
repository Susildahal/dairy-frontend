import { useState, useEffect } from 'react'
import axiosInstance from '../utils/axiosInstance'

export interface AuthUser {
  _id: string
  name: string
  email: string
  role: string
  status: boolean
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const flag = localStorage.getItem('flag')
      
      if (flag !== 'true') {
        setIsAuthenticated(false)
        setUser(null)
        setIsLoading(false)
        return
      }

      // Get user data from me API
      const response = await axiosInstance.get('/users/me')
      const userData = response.data.data

      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async () => {
    try {
      localStorage.setItem('flag', 'true')
      
      // Get user data from me API after login
      const response = await axiosInstance.get('/users/me')
      const userData = response.data.data
      
      setUser(userData)
      setIsAuthenticated(true)
      
      return userData
    } catch (error) {
      console.error('Login failed:', error)
      throw new Error('Failed to get user data')
    }
  }

  const logout = () => {
    localStorage.removeItem('flag')
    setUser(null)
    setIsAuthenticated(false)
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin'
  }

  const isUser = (): boolean => {
    return user?.role === 'user'
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    isAdmin,
    isUser,
    checkAuthStatus
  }
}
