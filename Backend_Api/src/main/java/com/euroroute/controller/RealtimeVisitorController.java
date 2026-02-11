package com.euroroute.controller;

import com.euroroute.service.RealtimeVisitorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visitors")
@RequiredArgsConstructor
@Slf4j
public class RealtimeVisitorController {

    private final RealtimeVisitorService visitorService;

    /**
     * Track visitor entering a page
     */
    @PostMapping("/enter")
    public ResponseEntity<String> trackVisitorEnter(
            @RequestParam String pageName,
            @RequestParam String pageType,
            @RequestHeader(required = false, value = "User-Agent") String userAgent,
            @RequestHeader(required = false, value = "X-Forwarded-For") String ipAddress) {
        try {
            log.debug("Tracking visitor enter - Page: {}, Type: {}", pageName, pageType);
            String sessionId = visitorService.trackVisitor(pageName, pageType, userAgent, ipAddress);
            log.debug("Visitor tracked successfully with session ID: {}", sessionId);
            return ResponseEntity.ok(sessionId);
        } catch (Exception e) {
            log.error("Error tracking visitor enter: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error tracking visitor: " + e.getMessage());
        }
    }

    /**
     * Track visitor leaving a page
     */
    @PostMapping("/{sessionId}/leave")
    public ResponseEntity<String> trackVisitorLeave(@PathVariable String sessionId) {
        try {
            log.debug("Tracking visitor leave - Session ID: {}", sessionId);
            visitorService.trackVisitorLeft(sessionId);
            return ResponseEntity.ok("Session ended: " + sessionId);
        } catch (Exception e) {
            log.error("Error tracking visitor leave: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error leaving session: " + e.getMessage());
        }
    }

    /**
     * Send heartbeat to keep session alive (called periodically by client)
     */
    @PostMapping("/{sessionId}/heartbeat")
    public ResponseEntity<String> sendHeartbeat(@PathVariable String sessionId) {
        try {
            log.debug("Heartbeat received for session: {}", sessionId);
            visitorService.heartbeat(sessionId);
            return ResponseEntity.ok("Heartbeat recorded");
        } catch (Exception e) {
            log.error("Error processing heartbeat: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    /**
     * Get current real-time visitor stats
     */
    @GetMapping("/stats")
    public ResponseEntity<RealtimeVisitorService.RealtimeVisitorStats> getRealtimeStats() {
        try {
            log.debug("Fetching real-time visitor stats");
            RealtimeVisitorService.RealtimeVisitorStats stats = visitorService.getRealtimeStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching real-time visitor stats: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get active session count
     */
    @GetMapping("/count")
    public ResponseEntity<Integer> getVisitorCount() {
        try {
            int count = visitorService.getActiveSessionCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error getting visitor count: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Admin: Manual broadcast trigger
     */
    @PostMapping("/broadcast")
    public ResponseEntity<String> broadcastStats() {
        try {
            log.info("Manual broadcast triggered");
            visitorService.broadcastRealtimeStats();
            return ResponseEntity.ok("Stats broadcasted");
        } catch (Exception e) {
            log.error("Error broadcasting stats: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error broadcasting: " + e.getMessage());
        }
    }

    /**
     * Admin: Clear all sessions
     */
    @DeleteMapping("/clear")
    public ResponseEntity<String> clearSessions() {
        try {
            log.info("Clearing all visitor sessions");
            visitorService.clearAllSessions();
            return ResponseEntity.ok("All sessions cleared");
        } catch (Exception e) {
            log.error("Error clearing sessions: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error clearing sessions: " + e.getMessage());
        }
    }
}
