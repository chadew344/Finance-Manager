package com.financemanager.backend.dto.invitation;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class EmailCheckRequest {
    private String email;
}
