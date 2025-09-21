package com.financemanager.backend.service;


import com.financemanager.backend.dto.NotificationDto;

public interface NotificationService {
    void createNotification(Long userId, String message);

    void sendNotification(String s, NotificationDto notification);
//    Notification getUnreadNotifications(Long userId);
//    Notification markNotificationAsRead(Long notificationId);
}
