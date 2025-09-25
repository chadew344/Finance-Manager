package com.financemanager.backend.dto.userAccount;

import com.financemanager.backend.enumeration.SharedUserRole;
import com.financemanager.backend.enumeration.UserStatus;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class SharedUserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private UserStatus userStatus;
    private SharedUserRole role;
}


