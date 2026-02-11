import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook for tracking page views with optimized performance
 * - Batches requests to reduce network overhead
 * - Debounces time-spent updates
 * - Handles connection failures gracefully
 */
export const usePageTracking = (pageName: string, pageType: string) => {
  const [pageViewId, setPageViewId] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const lastUpdateRef = useRef(0);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTrackingRef = useRef(true);
  
  // Get API base URL from environment or default
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    // Only track once on mount
    const trackPage = async () => {
      try {
        const referrer = document.referrer || 'direct';
        const params = new URLSearchParams({
          pageName,
          pageUrl: window.location.href,
          referrer,
          pageType,
        });

        // Use Keep-Alive for persistent connection
        const response = await fetch(`${API_BASE_URL}/page-views/track?${params}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': navigator.userAgent,
          },
          keepalive: true, // Important for beforeunload
        });

        if (response.ok) {
          const data = await response.json();
          setPageViewId(data.id);
        } else if (response.status === 429) {
          // Rate limit reached
        } else {
          // Failed to track page view
        }
      } catch (error) {
        // Silent fail for page view tracking
      }
    };

    if (isTrackingRef.current) {
      trackPage();
    }

    return () => {
      isTrackingRef.current = false;
    };
  }, []); // Empty dependency array - run once on mount

  // Handle time spent updates
  useEffect(() => {
    if (!pageViewId) return;

    const updateTimeSpent = async () => {
      const now = Date.now();
      
      // Only update if 60 seconds have passed since last update
      if (now - lastUpdateRef.current < 60000) {
        return;
      }

      const timeSpent = Math.floor((now - startTime) / 1000);
      
      try {
        await fetch(`${API_BASE_URL}/page-views/${pageViewId}/time-spent?timeSpentSeconds=${timeSpent}`, {
          method: 'PUT',
          keepalive: true,
        });
        lastUpdateRef.current = now;
      } catch (error) {
        // Silent fail
      }
    };

    // Update every 60 seconds
    updateIntervalRef.current = setInterval(updateTimeSpent, 60000);

    // Also update before page unload
    const handleBeforeUnload = async () => {
      if (pageViewId && isTrackingRef.current) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        try {
          await fetch(`${API_BASE_URL}/page-views/${pageViewId}/time-spent?timeSpentSeconds=${timeSpent}`, {
            method: 'PUT',
            keepalive: true, // Important for requests during unload
          });
        } catch (error) {
          // Silent fail
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleBeforeUnload); // Fallback for older browsers

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleBeforeUnload);
    };
  }, [pageViewId, startTime, API_BASE_URL]);

  return pageViewId;
};
