package com.euroroute.controller;

import com.euroroute.dto.PageViewDTO;
import com.euroroute.dto.VisitorStatsDTO;
import com.euroroute.entity.PageView;
import com.euroroute.service.PageViewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/page-views")
@RequiredArgsConstructor
@Slf4j
public class PageViewController {

    private final PageViewService pageViewService;

    // Simple rate limiting per session
    private static final int RATE_LIMIT_PER_MINUTE = 60;
    private static final ConcurrentHashMap<String, RateLimitTracker> rateLimitTracker = new ConcurrentHashMap<>();

    /**
     * Track a page view with rate limiting
     */
    @PostMapping("/track")
    public ResponseEntity<PageViewDTO> trackPageView(
            @RequestParam String pageName,
            @RequestParam String pageUrl,
            @RequestParam(required = false) String referrer,
            @RequestParam String pageType,
            @RequestHeader(required = false, value = "User-Agent") String userAgent,
            @RequestHeader(required = false, value = "X-Forwarded-For") String ipAddress) {
        try {
            // Rate limiting
            String clientId = ipAddress != null ? ipAddress : "unknown";
            if (!isRateLimited(clientId)) {
                PageView.PageType type = PageView.PageType.valueOf(pageType);
                PageViewDTO result = pageViewService.trackPageView(
                        pageName, pageUrl, referrer, type, userAgent, ipAddress);
                return ResponseEntity.ok(result);
            } else {
                log.warn("Rate limit exceeded for client: {}", clientId);
                return ResponseEntity.status(429).build();
            }
        } catch (IllegalArgumentException e) {
            log.error("Invalid page type: {}", pageType);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update time spent on a page
     */
    @PutMapping("/{pageViewId}/time-spent")
    public ResponseEntity<Void> updateTimeSpent(
            @PathVariable String pageViewId,
            @RequestParam Integer timeSpentSeconds) {
        pageViewService.updateTimeSpent(pageViewId, timeSpentSeconds);
        return ResponseEntity.ok().build();
    }

    /**
     * Get visitor statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<VisitorStatsDTO> getVisitorStats(
            @RequestParam(defaultValue = "24") int lastHours) {
        VisitorStatsDTO stats = pageViewService.getVisitorStats(lastHours);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get total visitors in last X hours
     */
    @GetMapping("/total-visitors")
    public ResponseEntity<Long> getTotalVisitors(
            @RequestParam(defaultValue = "24") int lastHours) {
        long totalVisitors = pageViewService.getTotalVisitorsLastHours(lastHours);
        return ResponseEntity.ok(totalVisitors);
    }

    /**
     * Get unique sessions in last X hours
     */
    @GetMapping("/unique-sessions")
    public ResponseEntity<Long> getUniqueSessions(
            @RequestParam(defaultValue = "24") int lastHours) {
        long uniqueSessions = pageViewService.getUniqueSessionsLastHours(lastHours);
        return ResponseEntity.ok(uniqueSessions);
    }

    /**
     * Manually trigger visitor stats broadcast
     */
    @PostMapping("/broadcast")
    public ResponseEntity<String> broadcastStats() {
        pageViewService.broadcastVisitorStats();
        return ResponseEntity.ok("Visitor stats broadcasted");
    }

    /**
     * Check rate limiting
     */
    private boolean isRateLimited(String clientId) {
        long currentTime = System.currentTimeMillis();
        RateLimitTracker tracker = rateLimitTracker.computeIfAbsent(clientId, k -> new RateLimitTracker());

        // Reset counter every minute
        if (currentTime - tracker.windowStart > 60000) {
            tracker.reset();
        }

        tracker.incrementAndGet();
        return tracker.getCount() > RATE_LIMIT_PER_MINUTE;
    }

    /**
     * Inner class for rate limiting tracking
     */
    private static class RateLimitTracker {
        private final AtomicInteger count = new AtomicInteger(0);
        private long windowStart = System.currentTimeMillis();

        int getCount() {
            return count.get();
        }

        void incrementAndGet() {
            count.incrementAndGet();
        }

        void reset() {
            count.set(0);
            windowStart = System.currentTimeMillis();
        }
    }
}
