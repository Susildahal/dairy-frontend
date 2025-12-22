import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from 'sonner'
import AppRouter from './dashbord/approuter/Approuter'
import store from './store/store'
import { Provider } from 'react-redux'

// Import mobile auth debugger for development
if (import.meta.env.DEV) {
  import('./utils/mobileAuthDebugger')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AppRouter />
    </Provider>
    <Toaster 
      position="top-right"
      expand={true}
      richColors
      closeButton
      duration={4000}
    />
  </StrictMode>,
)
