package com.financemanager.backend.service.impl;

import com.financemanager.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;

    @Value("${MAIL_USERNAME}")
    private String mailUsername;

    @Override
    public String sendEmail() {
        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setFrom("chadew2112@gmail.com");
            message.setTo("chanuthdewhan273@gmail.com");
            message.setSubject("Fiance Flow");
            message.setText("Join today and manage your money with Finance Flow");

            mailSender.send(message);
            return "Email Sent Successfully" + mailUsername;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
