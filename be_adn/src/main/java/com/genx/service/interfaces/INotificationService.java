package com.genx.service.interfaces;

import com.genx.entity.Booking;
import com.genx.entity.Notification;
import com.genx.entity.User;

import java.util.List;

public interface INotificationService {

    void sendNotification(User user, String title, String message);

    List<Notification> getUserNotifications(User user);

    Long countUnread(User user);

    void markAsRead(Long notificationId, User user);

    void markAllAsRead(User user);

    void sendNotificationToUser(User user, Notification notification);

    void sendNotification(User user, String title, String message, Booking booking);

    void markOtherNotificationsAsHandled(Booking booking, User handledBy);

    void sendBulkNotification(List<User> users, String title, String message, Booking booking);


}
