import { toast as sonnerToast } from 'sonner'

// Enhanced toast utility with predefined styles and options
export const toast = {
  success: (message: string, options?: { duration?: number; description?: string }) => {
    return sonnerToast.success(message, {
      duration: options?.duration || 4000,
      description: options?.description,
    })
  },

  error: (message: string, options?: { duration?: number; description?: string }) => {
    return sonnerToast.error(message, {
      duration: options?.duration || 5000,
      description: options?.description,
    })
  },

  warning: (message: string, options?: { duration?: number; description?: string }) => {
    return sonnerToast.warning(message, {
      duration: options?.duration || 4000,
      description: options?.description,
    })
  },

  info: (message: string, options?: { duration?: number; description?: string }) => {
    return sonnerToast.info(message, {
      duration: options?.duration || 4000,
      description: options?.description,
    })
  },

  loading: (message: string) => {
    return sonnerToast.loading(message)
  },

  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    })
  },

  dismiss: (id?: string | number) => {
    return sonnerToast.dismiss(id)
  },
}

// API-specific toast helpers
export const apiToast = {
  success: (message: string = 'Operation completed successfully') => {
    return toast.success(message, { duration: 3000 })
  },

  error: (error: any) => {
    const message = error?.response?.data?.message || error?.message || 'An error occurred'
    return toast.error(message, { duration: 5000 })
  },

  loading: (message: string = 'Processing...') => {
    return toast.loading(message)
  },

  login: {
    success: () => toast.success('Welcome back!', { description: 'You have been logged in successfully' }),
    error: (error?: string) => toast.error(error || 'Login failed', { description: 'Please check your credentials and try again' }),
    loading: () => toast.loading('Signing you in...'),
  },

  logout: {
    success: () => toast.success('Logged out successfully', { description: 'See you next time!' }),
    error: () => toast.error('Logout failed', { description: 'Please try again' }),
  },

  save: {
    success: () => toast.success('Saved successfully'),
    error: () => toast.error('Failed to save', { description: 'Please try again' }),
    loading: () => toast.loading('Saving...'),
  },

  delete: {
    success: () => toast.success('Deleted successfully'),
    error: () => toast.error('Failed to delete', { description: 'Please try again' }),
    loading: () => toast.loading('Deleting...'),
  },
}
