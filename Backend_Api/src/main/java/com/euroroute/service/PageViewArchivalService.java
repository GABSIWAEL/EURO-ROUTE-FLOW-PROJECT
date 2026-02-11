package com.euroroute.service;

import com.euroroute.repository.PageViewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class PageViewArchivalService {

    private final PageViewRepository pageViewRepository;

    @Value("${app.pageview.retention-days:90}")
    private int retentionDays;

    /**
     * Archive old page views daily at 2 AM
     * Moves data older than retention period to archive
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void archiveOldPageViews() {
        try {
            LocalDateTime archiveThreshold = LocalDateTime.now().minus(retentionDays, ChronoUnit.DAYS);
            
            long deletedCount = pageViewRepository.deletePageViewsBefore(archiveThreshold);
            
            log.info("Archived {} old page views (older than {} days)", deletedCount, retentionDays);
            
            // Optional: Send metrics
            if (deletedCount > 0) {
                log.info("Freed disk space by archiving {} records", deletedCount);
            }
        } catch (Exception e) {
            log.error("Error archiving page views", e);
        }
    }

    /**
     * Get storage statistics
     */
    public PageViewStorageStats getStorageStats() {
        long totalRecords = pageViewRepository.count();
        LocalDateTime ninetyDaysAgo = LocalDateTime.now().minus(90, ChronoUnit.DAYS);
        long recentRecords = pageViewRepository.countViewsSince(ninetyDaysAgo);
        
        // Approximate: ~1MB per 10,000 records
        long totalSizeGB = (totalRecords / 10000);
        long recentSizeGB = (recentRecords / 10000);
        
        return PageViewStorageStats.builder()
                .totalRecords(totalRecords)
                .recentRecords(recentRecords)
                .approximateTotalSizeGB(totalSizeGB)
                .approximateRecentSizeGB(recentSizeGB)
                .retentionDays(retentionDays)
                .build();
    }

    /**
     * Inner class for storage stats
     */
    public static class PageViewStorageStats {
        public long totalRecords;
        public long recentRecords;
        public long approximateTotalSizeGB;
        public long approximateRecentSizeGB;
        public int retentionDays;

        public static PageViewStorageStats.Builder builder() {
            return new PageViewStorageStats.Builder();
        }

        public static class Builder {
            private long totalRecords;
            private long recentRecords;
            private long approximateTotalSizeGB;
            private long approximateRecentSizeGB;
            private int retentionDays;

            public PageViewStorageStats.Builder totalRecords(long totalRecords) {
                this.totalRecords = totalRecords;
                return this;
            }

            public PageViewStorageStats.Builder recentRecords(long recentRecords) {
                this.recentRecords = recentRecords;
                return this;
            }

            public PageViewStorageStats.Builder approximateTotalSizeGB(long size) {
                this.approximateTotalSizeGB = size;
                return this;
            }

            public PageViewStorageStats.Builder approximateRecentSizeGB(long size) {
                this.approximateRecentSizeGB = size;
                return this;
            }

            public PageViewStorageStats.Builder retentionDays(int days) {
                this.retentionDays = days;
                return this;
            }

            public PageViewStorageStats build() {
                PageViewStorageStats stats = new PageViewStorageStats();
                stats.totalRecords = this.totalRecords;
                stats.recentRecords = this.recentRecords;
                stats.approximateTotalSizeGB = this.approximateTotalSizeGB;
                stats.approximateRecentSizeGB = this.approximateRecentSizeGB;
                stats.retentionDays = this.retentionDays;
                return stats;
            }
        }
    }
}
