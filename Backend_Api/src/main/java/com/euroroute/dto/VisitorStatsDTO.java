package com.euroroute.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitorStatsDTO {
    private long totalVisitors;
    private long uniqueSessions;
    private long landingPageVisitors;
    private long landingPageSessions;
    private long demandPageVisitors;
    private long demandPageSessions;
    private long contactPageVisitors;
    private long contactPageSessions;
    private long deliveryRequestVisitors;
    private long deliveryRequestSessions;
    private long lastHourVisitors;
    private long lastHourSessions;
}
