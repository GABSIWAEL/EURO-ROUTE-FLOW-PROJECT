package com.euroroute.controller;

import com.euroroute.service.PageViewArchivalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/page-views/admin")
@RequiredArgsConstructor
public class PageViewArchivalController {

    private final PageViewArchivalService archivalService;

    /**
     * Get storage statistics
     */
    @GetMapping("/storage-stats")
    public ResponseEntity<PageViewArchivalService.PageViewStorageStats> getStorageStats() {
        return ResponseEntity.ok(archivalService.getStorageStats());
    }

    /**
     * Manually trigger archival (admin only)
     */
    @PostMapping("/archive-now")
    public ResponseEntity<String> archiveNow() {
        archivalService.archiveOldPageViews();
        return ResponseEntity.ok("Archival process triggered");
    }
}
