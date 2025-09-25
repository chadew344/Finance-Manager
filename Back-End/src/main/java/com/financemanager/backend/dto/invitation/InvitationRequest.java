package com.financemanager.backend.dto.invitation;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class InvitationRequest {
    private String inviteeEmail;
    private String role;
    private String message;
}
