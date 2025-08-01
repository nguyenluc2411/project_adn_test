package com.genx.service.impl;

import com.genx.dto.response.NotificationResponse;
import com.genx.entity.Booking;
import com.genx.entity.Notification;
import com.genx.entity.User;
import com.genx.enums.ENotificationType;
import com.genx.mapper.NotificationMapper;
import com.genx.repository.INotificationRepository;
import com.genx.service.interfaces.INotificationService;
import jakarta.transaction.Transactional;
import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImpl implements INotificationService {

    @Autowired
    private INotificationRepository notificationRepository;

    @Autowired
    private  SimpMessagingTemplate messagingTemplate;

    @Autowired
    private  NotificationMapper notificationMapper;

    @Override
    public void sendNotification(User user, String title, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(ENotificationType.SUCCESS)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        sendNotificationToUser(user, saved);
    }

    @Override
    public void sendNotification(User user, String title, String message, Booking booking) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .booking(booking)
                .type(ENotificationType.INFO)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        sendNotificationToUser(user, saved);
    }

    @Override
    @Transactional
    public void markOtherNotificationsAsHandled(Booking booking, User handledBy) {
        List<Notification> notis = notificationRepository
                .findByBookingIdAndUserIdNot(booking.getId(), handledBy.getId());

        for (Notification n : notis) {
            String role = n.getUser().getRole().name();
            if (!role.equals("CUSTOMER")) {
                n.setRead(true);
            }
        }

        notificationRepository.saveAll(notis);
    }


    @Override
    public void sendBulkNotification(List<User> users, String title, String message, Booking booking) {
        for (User user : users) {
            sendNotification(user, title, message, booking);
        }
    }


    @Override
    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Override
    public Long countUnread(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Override
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Bạn không có quyền truy cập thông báo này.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .filter(n -> !n.isRead())
                .toList();

        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }


    @Override
    public void sendNotificationToUser(User user, Notification notification) {
        NotificationResponse response = notificationMapper.toResponse(notification);

        messagingTemplate.convertAndSendToUser(
                user.getUsername(),
                "/queue/notifications",
                response
        );
    }

}
