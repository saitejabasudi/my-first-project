"use client";

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker after page load
      window.addEventListener('load', registerServiceWorker);
      
      // Also try to register immediately if the page is already loaded
      if (document.readyState === 'complete') {
        registerServiceWorker();
      }
    }

    return () => {
      window.removeEventListener('load', registerServiceWorker);
    };
  }, []);

  return null;
}

async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // Check every hour

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available, notify user if needed
            console.log('[PWA] New version available');
          }
        });
      }
    });

    console.log('[PWA] Service Worker registered successfully');
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
  }
}
