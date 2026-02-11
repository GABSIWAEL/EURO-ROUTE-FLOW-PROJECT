package com.euroroute.repository;

import com.euroroute.entity.PageView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PageViewRepository extends JpaRepository<PageView, String> {
    
    @Query("SELECT pv FROM PageView pv WHERE pv.viewTime >= :since ORDER BY pv.viewTime DESC")
    List<PageView> findPageViewsSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT pv FROM PageView pv WHERE pv.pageType = :pageType AND pv.viewTime >= :since ORDER BY pv.viewTime DESC")
    List<PageView> findPageViewsByTypeSince(@Param("pageType") PageView.PageType pageType, @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(DISTINCT pv.sessionId) FROM PageView pv WHERE pv.viewTime >= :since")
    long countDistinctSessionsSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(DISTINCT pv.sessionId) FROM PageView pv WHERE pv.pageType = :pageType AND pv.viewTime >= :since")
    long countDistinctSessionsByTypeSince(@Param("pageType") PageView.PageType pageType, @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(pv) FROM PageView pv WHERE pv.viewTime >= :since")
    long countViewsSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(pv) FROM PageView pv WHERE pv.pageType = :pageType AND pv.viewTime >= :since")
    long countViewsByTypeSince(@Param("pageType") PageView.PageType pageType, @Param("since") LocalDateTime since);
    
    /**
     * Delete page views older than specified date for archival/cleanup
     */
    @Modifying
    @Query("DELETE FROM PageView pv WHERE pv.viewTime < :before")
    long deletePageViewsBefore(@Param("before") LocalDateTime before);
}
