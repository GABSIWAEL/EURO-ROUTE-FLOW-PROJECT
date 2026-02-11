package com.euroroute.repository;

import com.euroroute.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(String userId);

    long countByUserIdAndReadFalse(String userId);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.expiresAt > :now AND n.dismissedAt IS NULL ORDER BY n.createdAt DESC")
    List<Notification> findActiveNotifications(@Param("userId") String userId, @Param("now") Date now);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.id = :id")
    void markAsRead(@Param("id") String id);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId")
    void markAllAsRead(@Param("userId") String userId);

    @Modifying
    @Query("UPDATE Notification n SET n.dismissedAt = :now WHERE n.id = :id")
    void dismissNotification(@Param("id") String id, @Param("now") Date now);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.expiresAt < :now")
    void deleteExpiredNotifications(@Param("now") Date now);
}
