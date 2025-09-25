package com.financemanager.backend.entity;

import com.financemanager.backend.enumeration.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder

@Entity
public class Payment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(name = "transaction_id", unique = true, nullable = false)
    private String transactionId;

    @ManyToOne
    @JoinColumn(name = "user_subscription_id", nullable = false)
    private UserSubscription userSubscription;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}

