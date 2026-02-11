package com.euroroute.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "page_views")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageView {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String pageName;

    @Column(nullable = false)
    private String pageUrl;

    @Column(nullable = true)
    private String sessionId;

    @Column(nullable = true)
    private String userAgent;

    @Column(nullable = true)
    private String ipAddress;

    @Column(nullable = false)
    private LocalDateTime viewTime;

    @Column(nullable = true)
    private Integer timeSpentSeconds;

    @Column(nullable = false)
    private String referrer;

    public enum PageType {
        LANDING_PAGE,
        DELIVERY_REQUEST,
        DEMAND_PAGE,
        CONTACT_PAGE,
        OTHER
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PageType pageType;
}
