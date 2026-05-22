import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'

// Deploy trigger: 2026-05-13T21:49:00
const CACHE_CLEANUP_VERSION = import.meta.env.VITE_CACHE_CLEANUP_VERSION || '2026-05-22-cache-fix-1'

async function runCacheCleanupOncePerVersion() {
  if (typeof window === 'undefined') return

  const cleanupKey = `cache_cleanup_done_${CACHE_CLEANUP_VERSION}`
  if (window.localStorage.getItem(cleanupKey) === '1') return

  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.unregister()))
    }

    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith('workbox-') || name.startsWith('sw-') || name.startsWith('vite-'))
          .map((cacheName) => caches.delete(cacheName)),
      )
    }
  } catch (error) {
    console.warn('[Cache Cleanup] Failed to clear legacy caches', error)
  } finally {
    window.localStorage.setItem(cleanupKey, '1')
  }
}

runCacheCleanupOncePerVersion()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
