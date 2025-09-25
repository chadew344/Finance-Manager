package com.financemanager.backend.dto.dashboard;

import com.financemanager.backend.enumeration.SubscriptionPlanType;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class DashboardResponse {
    private String firstName;
    private String lastName;
    private String email;
    private SubscriptionPlanType plan;
    private Long userAccountId;
}
