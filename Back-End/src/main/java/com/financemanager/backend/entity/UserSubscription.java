package com.financemanager.backend.entity;

import com.financemanager.backend.enumeration.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
@Entity
public class UserSubscription extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_account_id", nullable = false)
    private UserAccount userAccount;

    @ManyToOne
    @JoinColumn(name = "subscription_plan_id", nullable = false)
    private SubscriptionPlan subscriptionPlan;

    private LocalDateTime startTime;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status;

}

