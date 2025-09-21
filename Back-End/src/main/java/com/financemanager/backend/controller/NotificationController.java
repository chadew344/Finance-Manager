package com.financemanager.backend.controller;

import com.financemanager.backend.dto.NotificationDto;
import com.financemanager.backend.enumeration.NotificationType;
import com.financemanager.backend.service.NotificationService;
import com.financemanager.backend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notification")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/new-transaction")
    public ResponseEntity<APIResponse<String>> sendNewTransactionNotification() {
        System.out.println("sendNewTransactionNotification");
        NotificationDto notification = new NotificationDto("New transaction of $1500 recorded!", NotificationType.SUCCESS.getLabel());
        notificationService.sendNotification("/topic/public-notifications", notification); 

        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Notification sent successfully!",
                        null
                )
        );
    }
}
