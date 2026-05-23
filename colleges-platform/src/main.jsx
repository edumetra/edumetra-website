import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.unregister()))
    } catch (error) {
      console.warn('Service worker unregister failed:', error)
    }

    try {
      if (!('caches' in window)) return
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter((name) => /workbox|sw|vite|pwa|service-worker/i.test(name))
          .map((name) => caches.delete(name))
      )
    } catch (error) {
      console.warn('Service worker cache cleanup failed:', error)
    }
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
