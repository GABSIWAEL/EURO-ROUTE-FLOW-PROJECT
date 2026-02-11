import { useEffect, useState, useRef } from 'react';

/**
 * Real-time only visitor tracking
 * Tracks when user is currently on the page
 * One session per browser tab that updates as user navigates
 */
export const useRealtimeVisitor = (pageName: string, pageType: string) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const previousPageRef = useRef<string | null>(null);

  // Get API base URL from environment or default
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  // Leave a visitor session
  const leaveSession = async (id: string) => {
    try {
      const url = `${API_BASE_URL}/visitors/${id}/leave`;
      await fetch(url, {
        method: 'POST',
        keepalive: true,
      });
    } catch (error) {
      // Silent fail for leave session
    }
  };

  // Enter a visitor session
  const enterSession = async () => {
    try {
      const url = `${API_BASE_URL}/visitors/enter?pageName=${encodeURIComponent(pageName)}&pageType=${encodeURIComponent(pageType)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'User-Agent': navigator.userAgent,
        },
        keepalive: true,
      });

      if (response.ok) {
        const id = await response.text();
        setSessionId(id);
        previousPageRef.current = pageName;
      } else {
        // Silent fail for visitor enter
      }
    } catch (error) {
      // Silent fail for visitor enter
    }
  };

  // Track page changes and visitor sessions
  useEffect(() => {
    // If page changed (navigation within same tab), leave old session and enter new one
    if (sessionId && previousPageRef.current !== pageName) {
      leaveSession(sessionId);
      enterSession();
    } else if (!sessionId) {
      // First visit or session expired
      enterSession();
    }
  }, [pageName, pageType]); // Track page changes

  // Send heartbeat periodically to keep session alive
  useEffect(() => {
    if (!sessionId) return;

    // Send heartbeat every 30 seconds
    const heartbeatInterval = setInterval(async () => {
      try {
        await fetch(`${API_BASE_URL}/visitors/${sessionId}/heartbeat`, {
          method: 'POST',
          keepalive: true,
        });
      } catch (error) {
        // Silent fail for heartbeat
      }
    }, 30000); // 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [sessionId, API_BASE_URL]);

  // Leave on unmount (tab close or component unmount)
  useEffect(() => {
    return () => {
      if (sessionId) {
        leaveSession(sessionId);
      }
    };
  }, [sessionId]); // Cleanup on sessionId change

  return sessionId;
};
