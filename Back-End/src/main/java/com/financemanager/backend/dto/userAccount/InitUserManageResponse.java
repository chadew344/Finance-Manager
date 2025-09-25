package com.financemanager.backend.dto.userAccount;

import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class InitUserManageResponse {
    private List<SharedUserDto> sharedUser;
    private CurrentPlanDto currentPlan;
}
