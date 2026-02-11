package com.euroroute.service;

import com.euroroute.dto.PageViewDTO;
import com.euroroute.dto.VisitorStatsDTO;
import com.euroroute.entity.PageView;
import com.euroroute.repository.PageViewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Slf4j
public class PageViewService {

    private final PageViewRepository pageViewRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    // Batch tracking to reduce DB writes
    private final Map<String, PageView> pendingPageViews = new ConcurrentHashMap<>();
    private final AtomicInteger pendingCount = new AtomicInteger(0);
    private static final int BATCH_SIZE = 50;
    private static final long BATCH_TIMEOUT_MS = 10000; // 10 seconds
    private long lastBatchFlush = System.currentTimeMillis();
    
    // Cache for stats to reduce DB queries
    private VisitorStatsDTO cachedStats = null;
    private long lastStatsCacheTime = 0;
    private static final long CACHE_DURATION_MS = 25000; // 25 seconds

    /**
     * Track a page view with batching
     */
    public PageViewDTO trackPageView(String pageName, String pageUrl, String referrer, 
                                     PageView.PageType pageType, String userAgent, String ipAddress) {
        String sessionId = UUID.randomUUID().toString();
        
        PageView pageView = PageView.builder()
                .pageName(pageName)
                .pageUrl(pageUrl)
                .sessionId(sessionId)
                .pageType(pageType)
                .viewTime(LocalDateTime.now())
                .referrer(referrer != null ? referrer : "direct")
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .build();

        // Queue for batch processing instead of immediate save
        String batchKey = UUID.randomUUID().toString();
        pendingPageViews.put(batchKey, pageView);
        int currentBatch = pendingCount.incrementAndGet();
        
        // Flush if batch size reached or timeout
        if (currentBatch >= BATCH_SIZE || (System.currentTimeMillis() - lastBatchFlush) > BATCH_TIMEOUT_MS) {
            flushPendingBatch();
        }
        
        log.debug("Page view queued: {} - {} (batch: {}/{})", pageName, pageType, currentBatch, BATCH_SIZE);
        return PageViewDTO.fromEntity(pageView);
    }

    /**
     * Batch flush pending page views to database
     */
    private synchronized void flushPendingBatch() {
        if (pendingPageViews.isEmpty()) {
            return;
        }
        
        try {
            int size = pendingPageViews.size();
            Collection<PageView> toSave = pendingPageViews.values();
            pageViewRepository.saveAll(toSave);
            pendingPageViews.clear();
            pendingCount.set(0);
            lastBatchFlush = System.currentTimeMillis();
            
            log.info("Batch flushed: {} page views saved", size);
            
            // Invalidate cache after writing new data
            cachedStats = null;
            broadcastVisitorStats();
        } catch (Exception e) {
            log.error("Error flushing page view batch", e);
        }
    }

    /**
     * Update time spent on a page (also batched)
     */
    public void updateTimeSpent(String pageViewId, Integer timeSpentSeconds) {
        // Use async to avoid blocking the request
        new Thread(() -> {
            try {
                pageViewRepository.findById(pageViewId).ifPresent(pv -> {
                    pv.setTimeSpentSeconds(timeSpentSeconds);
                    pageViewRepository.save(pv);
                });
            } catch (Exception e) {
                log.error("Error updating time spent for page view: {}", pageViewId, e);
            }
        }).start();
    }

    /**
     * Get visitor statistics with caching
     */
    @Cacheable(value = "visitorStats", unless = "#lastHours == 0")
    public VisitorStatsDTO getVisitorStats(int lastHours) {
        // Check in-memory cache first
        long currentTime = System.currentTimeMillis();
        if (cachedStats != null && (currentTime - lastStatsCacheTime) < CACHE_DURATION_MS) {
            log.debug("Returning cached visitor stats");
            return cachedStats;
        }

        long startTime = System.currentTimeMillis();
        LocalDateTime since = LocalDateTime.now().minus(lastHours, ChronoUnit.HOURS);

        VisitorStatsDTO stats = VisitorStatsDTO.builder()
                .totalVisitors(pageViewRepository.countViewsSince(since))
                .uniqueSessions(pageViewRepository.countDistinctSessionsSince(since))
                .landingPageVisitors(pageViewRepository.countViewsByTypeSince(PageView.PageType.LANDING_PAGE, since))
                .landingPageSessions(pageViewRepository.countDistinctSessionsByTypeSince(PageView.PageType.LANDING_PAGE, since))
                .demandPageVisitors(pageViewRepository.countViewsByTypeSince(PageView.PageType.DEMAND_PAGE, since))
                .demandPageSessions(pageViewRepository.countDistinctSessionsByTypeSince(PageView.PageType.DEMAND_PAGE, since))
                .contactPageVisitors(pageViewRepository.countViewsByTypeSince(PageView.PageType.CONTACT_PAGE, since))
                .contactPageSessions(pageViewRepository.countDistinctSessionsByTypeSince(PageView.PageType.CONTACT_PAGE, since))
                .deliveryRequestVisitors(pageViewRepository.countViewsByTypeSince(PageView.PageType.DELIVERY_REQUEST, since))
                .deliveryRequestSessions(pageViewRepository.countDistinctSessionsByTypeSince(PageView.PageType.DELIVERY_REQUEST, since))
                .lastHourVisitors(pageViewRepository.countViewsSince(LocalDateTime.now().minus(1, ChronoUnit.HOURS)))
                .lastHourSessions(pageViewRepository.countDistinctSessionsSince(LocalDateTime.now().minus(1, ChronoUnit.HOURS)))
                .build();
        
        cachedStats = stats;
        lastStatsCacheTime = currentTime;
        
        long duration = System.currentTimeMillis() - startTime;
        log.debug("Visitor stats calculated in {}ms", duration);
        
        return stats;
    }

    /**
     * Broadcast visitor statistics to all connected admins
     */
    public void broadcastVisitorStats() {
        try {
            VisitorStatsDTO stats = getVisitorStats(24);
            messagingTemplate.convertAndSend("/topic/visitor-stats", stats);
            log.debug("Visitor stats broadcasted to admins");
        } catch (Exception e) {
            log.error("Error broadcasting visitor stats", e);
        }
    }

    /**
     * Scheduled task to flush batches every 10 seconds
     */
    @Scheduled(fixedRate = 10000)
    public void scheduledFlushBatch() {
        try {
            if (!pendingPageViews.isEmpty()) {
                flushPendingBatch();
            }
        } catch (Exception e) {
            log.error("Error in scheduled batch flush", e);
        }
    }

    /**
     * Scheduled task to broadcast stats every 60 seconds (reduced from 30s)
     */
    @Scheduled(fixedRate = 60000)
    public void scheduledBroadcastVisitorStats() {
        try {
            broadcastVisitorStats();
        } catch (Exception e) {
            log.error("Error broadcasting visitor stats", e);
        }
    }

    /**
     * Get total visitors in the last X hours
     */
    public long getTotalVisitorsLastHours(int hours) {
        LocalDateTime since = LocalDateTime.now().minus(hours, ChronoUnit.HOURS);
        return pageViewRepository.countViewsSince(since);
    }

    /**
     * Get unique sessions in the last X hours
     */
    public long getUniqueSessionsLastHours(int hours) {
        LocalDateTime since = LocalDateTime.now().minus(hours, ChronoUnit.HOURS);
        return pageViewRepository.countDistinctSessionsSince(since);
    }

    /**
     * Clear cache manually when needed
     */
    @CacheEvict(value = "visitorStats", allEntries = true)
    public void clearCache() {
        cachedStats = null;
        log.info("Visitor stats cache cleared");
    }
}
