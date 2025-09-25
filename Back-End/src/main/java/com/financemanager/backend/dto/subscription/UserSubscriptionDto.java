package com.financemanager.backend.dto.subscription;

import com.financemanager.backend.entity.SubscriptionPlan;
import com.financemanager.backend.entity.UserAccount;
import com.financemanager.backend.enumeration.SubscriptionStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Builder
public class UserSubscriptionDto {
    private Long id;
    private UserAccount userAccount;
    private SubscriptionPlan subscriptionPlan;
    private LocalDateTime startTime;
    private LocalDateTime endDate;
    private SubscriptionStatus status;
}
