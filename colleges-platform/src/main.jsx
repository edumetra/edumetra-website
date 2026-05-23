import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
    .catch((error) => {
      console.warn('Service worker unregister failed:', error)
    })

  if ('caches' in window) {
    caches.keys()
      .then((cacheNames) => Promise.all(cacheNames.map((name) => caches.delete(name))))
      .catch((error) => {
        console.warn('Service worker cache cleanup failed:', error)
      })
  }
}

window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('[Global Error Trap] onerror:', { msg, url, lineNo, columnNo, error });
    return false;
};

window.addEventListener('unhandledrejection', function(event) {
    console.error('[Global Error Trap] unhandledrejection:', event.reason);
});

createRoot(document.getElementById('root')).render(
    <App />
)
