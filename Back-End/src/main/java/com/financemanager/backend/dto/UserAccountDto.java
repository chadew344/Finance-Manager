package com.financemanager.backend.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class UserAccountDto {
    private Long id;
    private String name;
    private String accountType;
    private boolean status;
}
