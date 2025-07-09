import { useEffect, useState } from 'react';

const ServiceWorkerClearFix = () => {
  const [showNotice, setShowNotice] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    // Check if we have the problematic service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        const hasOldSW = registrations.some(reg => 
          reg.active && reg.active.scriptURL.includes('workbox-00a24876.js')
        );
        
        if (hasOldSW) {
          setShowNotice(true);
        }
      });
    }
  }, []);

  const clearServiceWorker = async () => {
    setClearing(true);
    
    try {
      // Unregister all service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Force reload
      window.location.reload(true);
    } catch (error) {
      console.error('Error clearing service worker:', error);
      setClearing(false);
    }
  };

  if (!showNotice) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium">
            ⚠️ App Update Required - Service Worker Cache Issue Detected
          </p>
          <p className="text-xs opacity-90">
            Click "Clear Cache" to fix loading issues and enable the latest updates.
          </p>
        </div>
        <div className="ml-4">
          <button
            onClick={clearServiceWorker}
            disabled={clearing}
            className="bg-white text-red-600 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
          >
            {clearing ? 'Clearing...' : 'Clear Cache'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceWorkerClearFix;
