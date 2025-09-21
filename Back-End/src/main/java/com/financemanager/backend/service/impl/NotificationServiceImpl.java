package com.financemanager.backend.service.impl;

import com.financemanager.backend.dto.NotificationDto;
import com.financemanager.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void createNotification(Long userId, String message) {

    }

    @Override
    public void sendNotification(String topic, NotificationDto notification) {
        System.out.println("Sending notification: " + notification.getContent() + " to topic: " + topic);
        messagingTemplate.convertAndSend(topic, notification);
    }
}
