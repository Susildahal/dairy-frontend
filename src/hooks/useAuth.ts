import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store/store'
import { getmee, clearMeeData } from '../store/slices/meeSlicer'
import axiosInstance from '../utils/axiosInstance'

export interface AuthUser {
  _id: string
  name: string
  email: string
  role: string
  status: boolean
}

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { data: user, loading: isLoading } = useSelector((state: RootState) => state.mee)
  
  // Calculate authentication status with mobile browser fallbacks
  const isAuthenticated = (() => {
    const flag = localStorage.getItem('flag')
    const authCookie = document.cookie.includes('auth_status=true')
    return (flag === 'true' || authCookie) && !!user
  })()

  useEffect(() => {
    // Check auth status on mount
    const initializeAuth = async () => {
      const flag = localStorage.getItem('flag')
      
      if (flag === 'true' && !user) {
        try {
          await dispatch(getmee())
        } catch (error) {
          console.error('Failed to restore user session:', error)
          // Clear invalid session
          localStorage.removeItem('flag')
          dispatch(clearMeeData())
        }
      }
    }
    
    initializeAuth()
  }, [dispatch, user])

  const checkAuthStatus = async () => {
    try {
      const flag = localStorage.getItem('flag')
      
      if (flag !== 'true') {
        dispatch(clearMeeData())
        return
      }

      // Only fetch if we don't have user data
      if (!user) {
        dispatch(getmee())
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      logout()
    }
  }

  const login = async () => {
    try {
      localStorage.setItem('flag', 'true')
      
      // Fetch user data through Redux
      const resultAction = await dispatch(getmee())
      
      if (getmee.fulfilled.match(resultAction)) {
        return resultAction.payload
      } else {
        throw new Error('Failed to get user data')
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw new Error('Failed to get user data')
    }
  }

  const logout = async () => {
    try {
      // Call backend logout endpoint to clear server-side cookies
      await axiosInstance.post('/users/user/logout')
    } catch (error) {
      console.error('Logout API call failed:', error)
      // Continue with client-side cleanup even if API fails
    } finally {
      // Always clear client-side state
      localStorage.removeItem('flag')
      dispatch(clearMeeData())
    }
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin'
  }

  const isSuperAdmin = (): boolean => {
    return user?.role === 'superadmin'
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
    isSuperAdmin,
    isUser,
    checkAuthStatus
  }
}
