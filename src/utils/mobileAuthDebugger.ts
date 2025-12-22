// Mobile debugging utility for authentication issues
// Add this to your frontend to debug mobile browser authentication

export const mobileAuthDebugger = {
  // Check all authentication-related storage
  checkAuthState: () => {
    console.log('=== Auth Debug Info ===');
    console.log('LocalStorage flag:', localStorage.getItem('flag'));
    console.log('Document cookies:', document.cookie);
    console.log('User Agent:', navigator.userAgent);
    console.log('Is Mobile:', /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    // Check cookie access
    const authCookie = document.cookie.split(';').find(c => c.trim().startsWith('auth_status='));
    console.log('Auth status cookie:', authCookie);
    
    // Check if cookies are enabled
    document.cookie = "test=1; path=/";
    const cookiesEnabled = document.cookie.includes("test=1");
    document.cookie = "test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"; // Clean up
    console.log('Cookies enabled:', cookiesEnabled);
    
    // Check localStorage availability
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      console.log('LocalStorage available:', true);
    } catch (e) {
      console.log('LocalStorage available:', false, e.message);
    }
    
    console.log('=====================');
  },

  // Test API connectivity
  testConnection: async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ping`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('API connection test:', response.ok ? 'SUCCESS' : 'FAILED');
      console.log('Response status:', response.status);
    } catch (error) {
      console.error('API connection test failed:', error);
    }
  },

  // Test authentication endpoint
  testAuth: async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('Auth test:', response.ok ? 'SUCCESS' : 'FAILED');
      console.log('Auth response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Auth error response:', errorText);
      }
    } catch (error) {
      console.error('Auth test failed:', error);
    }
  }
};

// Auto-run debug on load (remove in production)
if (import.meta.env.DEV) {
  window.mobileAuthDebugger = mobileAuthDebugger;
  console.log('Mobile auth debugger available at window.mobileAuthDebugger');
}

export default mobileAuthDebugger;