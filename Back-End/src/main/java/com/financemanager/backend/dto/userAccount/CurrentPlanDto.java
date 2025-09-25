package com.financemanager.backend.dto.userAccount;


import com.financemanager.backend.enumeration.SubscriptionPlanType;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class CurrentPlanDto {
    private SubscriptionPlanType type;
    private Integer maxUsers;
    private Integer currentUsers;
}
