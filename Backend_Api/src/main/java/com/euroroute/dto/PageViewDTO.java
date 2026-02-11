package com.euroroute.dto;

import com.euroroute.entity.PageView;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.ZoneId;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageViewDTO {
    private String id;
    private String pageName;
    private String pageUrl;
    private String sessionId;
    private String pageType;
    private Long viewTime;
    private Integer timeSpentSeconds;
    private String referrer;

    public static PageViewDTO fromEntity(PageView entity) {
        return PageViewDTO.builder()
                .id(entity.getId())
                .pageName(entity.getPageName())
                .pageUrl(entity.getPageUrl())
                .sessionId(entity.getSessionId())
                .pageType(entity.getPageType().toString())
                .viewTime(entity.getViewTime().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli())
                .timeSpentSeconds(entity.getTimeSpentSeconds())
                .referrer(entity.getReferrer())
                .build();
    }
}
