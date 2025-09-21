package com.financemanager.backend.dto.dashboard;

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
    private Long userAccountId;
}
