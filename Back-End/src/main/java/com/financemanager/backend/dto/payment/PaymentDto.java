package com.financemanager.backend.dto.payment;

import com.financemanager.backend.entity.User;
import com.financemanager.backend.entity.UserSubscription;
import com.financemanager.backend.enumeration.PaymentStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;

public class PaymentDto {
    private Long id;
    private BigDecimal amount;
    private PaymentStatus status;
    private String transactionId;
    private UserSubscription userSubscription;
    private User user;
}
