package com.genx.repository;

import com.genx.entity.Notification;
import com.genx.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface INotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    Long countByUserAndIsReadFalse(User user);

    List<Notification> findByBookingIdAndUserIdNot(Long bookingId, Long excludedUserId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.booking.id = :bookingId AND n.user.id <> :exceptUserId")
    void markAllAsReadByBookingExceptUser(@Param("bookingId") Long bookingId, @Param("exceptUserId") Long exceptUserId);


}
