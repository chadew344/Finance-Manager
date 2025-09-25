package com.financemanager.backend.dto.subscription;

import com.financemanager.backend.enumeration.SubscriptionPlanType;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Builder
public class SubscriptionPlanDto {
    private Long id;
    private String name;
    private BigDecimal price;
    private SubscriptionPlanType type;
    private Integer durationDays;
    private Integer maxUsers;
    private String description;
}
