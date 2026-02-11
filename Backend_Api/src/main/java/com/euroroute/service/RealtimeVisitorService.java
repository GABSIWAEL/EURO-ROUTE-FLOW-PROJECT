package com.euroroute.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Real-time visitor tracking - IN-MEMORY ONLY
 * No database storage, just shows who's currently on the site
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RealtimeVisitorService {

    private final SimpMessagingTemplate messagingTemplate;

    // Track active visitors: sessionId -> page info
    private final ConcurrentHashMap<String, VisitorSession> activeSessions = new ConcurrentHashMap<>();

    // Counter for pages
    private final ConcurrentHashMap<String, AtomicInteger> pageViewCounts = new ConcurrentHashMap<>();

    /**
     * Track a visitor entering a page
     */
    public String trackVisitor(String pageName, String pageType, String userAgent, String ipAddress) {
        String sessionId = java.util.UUID.randomUUID().toString();

        VisitorSession session = VisitorSession.builder()
                .sessionId(sessionId)
                .pageName(pageName)
                .pageType(pageType)
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .enteredAt(LocalDateTime.now())
                .lastHeartbeat(LocalDateTime.now())
                .build();

        activeSessions.put(sessionId, session);

        // Update page counter
        pageViewCounts.computeIfAbsent(pageName, k -> new AtomicInteger(0)).incrementAndGet();

        log.info("Visitor joined: {} - Session: {}", pageName, sessionId);

        // Broadcast updated stats
        broadcastRealtimeStats();

        return sessionId;
    }

    /**
     * Track visitor leaving / navigating away
     */
    public void trackVisitorLeft(String sessionId) {
        VisitorSession session = activeSessions.remove(sessionId);
        if (session != null) {
            // Decrement page counter
            AtomicInteger counter = pageViewCounts.get(session.getPageName());
            if (counter != null) {
                counter.decrementAndGet();
            }
            log.info("Visitor left: {} - Session: {}", session.getPageName(), sessionId);

            // Broadcast updated stats
            broadcastRealtimeStats();
        }
    }

    /**
     * Get real-time statistics
     */
    public RealtimeVisitorStats getRealtimeStats() {
        int totalVisitors = activeSessions.size();

        return RealtimeVisitorStats.builder()
                .totalVisitorsNow(totalVisitors)
                .landingPageVisitors(pageViewCounts.getOrDefault("Landing Page", new AtomicInteger(0)).get())
                .deliveryRequestVisitors(
                        pageViewCounts.getOrDefault("Delivery Request Page", new AtomicInteger(0)).get())
                .contactPageVisitors(pageViewCounts.getOrDefault("Contact Page", new AtomicInteger(0)).get())
                .demandPageVisitors(pageViewCounts.getOrDefault("Demand Page", new AtomicInteger(0)).get())
                .timestamp(LocalDateTime.now())
                .activeSessions(totalVisitors)
                .build();
    }

    /**
     * Broadcast real-time stats to all connected admins
     */
    public void broadcastRealtimeStats() {
        try {
            RealtimeVisitorStats stats = getRealtimeStats();
            messagingTemplate.convertAndSend("/topic/realtime-visitors", stats);
            log.debug("Real-time visitor stats broadcasted: {} visitors", stats.getTotalVisitorsNow());
        } catch (Exception e) {
            log.error("Error broadcasting real-time visitor stats", e);
        }
    }

    /**
     * Scheduled broadcast every 5 seconds even if no changes
     */
    @Scheduled(fixedRate = 5000)
    public void scheduledBroadcast() {
        try {
            broadcastRealtimeStats();
        } catch (Exception e) {
            log.error("Error in scheduled broadcast", e);
        }
    }

    /**
     * Send heartbeat to keep session alive
     */
    public void heartbeat(String sessionId) {
        VisitorSession session = activeSessions.get(sessionId);
        if (session != null) {
            session.setLastHeartbeat(LocalDateTime.now());
            log.debug("Heartbeat received for session: {}", sessionId);
        }
    }

    /**
     * Clean up idle sessions (older than 30 minutes)
     * Also clean up sessions with expired heartbeats (no heartbeat for 2 minutes)
     */
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void cleanupIdleSessions() {
        try {
            LocalDateTime thirtyMinutesAgo = LocalDateTime.now().minusMinutes(30);
            LocalDateTime twoMinutesAgo = LocalDateTime.now().minusMinutes(2);
            int removed = 0;

            for (VisitorSession session : activeSessions.values()) {
                // Remove if entered more than 30 minutes ago
                if (session.getEnteredAt().isBefore(thirtyMinutesAgo)) {
                    activeSessions.remove(session.getSessionId());

                    // Decrement page counter
                    AtomicInteger counter = pageViewCounts.get(session.getPageName());
                    if (counter != null) {
                        counter.decrementAndGet();
                    }
                    log.info("Removed idle session (30min): {}", session.getSessionId());
                    removed++;
                    continue;
                }

                // Remove if no heartbeat for 2 minutes (likely disconnected)
                if (session.getLastHeartbeat().isBefore(twoMinutesAgo)) {
                    activeSessions.remove(session.getSessionId());

                    // Decrement page counter
                    AtomicInteger counter = pageViewCounts.get(session.getPageName());
                    if (counter != null) {
                        counter.decrementAndGet();
                    }
                    log.info("Removed session with expired heartbeat: {}", session.getSessionId());
                    removed++;
                }
            }

            if (removed > 0) {
                log.info("Cleaned up {} sessions", removed);
                broadcastRealtimeStats();
            }
        } catch (Exception e) {
            log.error("Error cleaning up idle sessions", e);
        }
    }

    /**
     * Get all active sessions (for debugging)
     */
    public int getActiveSessionCount() {
        return activeSessions.size();
    }

    /**
     * Clear all sessions (for admin reset)
     */
    public void clearAllSessions() {
        activeSessions.clear();
        pageViewCounts.clear();
        log.info("All sessions cleared");
        broadcastRealtimeStats();
    }

    /**
     * Inner class for visitor session
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class VisitorSession {
        private String sessionId;
        private String pageName;
        private String pageType;
        private String userAgent;
        private String ipAddress;
        private LocalDateTime enteredAt;
        private LocalDateTime lastHeartbeat;

        public boolean isHeartbeatExpired(int heartbeatIntervalSeconds) {
            return LocalDateTime.now().isAfter(lastHeartbeat.plusSeconds(heartbeatIntervalSeconds * 2));
        }
    }

    /**
     * Inner class for real-time stats
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class RealtimeVisitorStats {
        private int totalVisitorsNow;
        private int landingPageVisitors;
        private int deliveryRequestVisitors;
        private int contactPageVisitors;
        private int demandPageVisitors;
        private int activeSessions;
        private LocalDateTime timestamp;
    }
}
