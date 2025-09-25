package com.financemanager.backend.dto.auth.request;

import com.financemanager.backend.enumeration.SubscriptionPlanType;
import com.financemanager.backend.enumeration.UserAccountType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class RegistrationRequest {
    @NotBlank(message = "First name is required.")
    private String firstName;

    @NotBlank(message = "Last name is required.")
    private String lastName;

    @NotBlank(message = "Email is required.")
    @Email(message = "Email should be valid.")
    private String email;

    private String phoneNumber;

    @NotBlank(message = "Password is required.")
    @Size(min = 8, message = "Password must be at least 8 characters long.")
    private String password;

    @NotNull(message = "User account type is required.")
    private UserAccountType userAccountType;

    @NotNull(message = "Subscription plan is required.")
    private SubscriptionPlanType subscriptionPlanType;
}
