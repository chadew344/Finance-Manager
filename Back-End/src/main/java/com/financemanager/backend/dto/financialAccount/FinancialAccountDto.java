package com.financemanager.backend.dto.financialAccount;

import com.financemanager.backend.enumeration.FinancialAccountType;
import lombok.*;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class FinancialAccountDto {
    private Long id;
    private String accountName;
    private String currency;
    private BigDecimal balance;
    private FinancialAccountType accountType;
    private String subtype;
    private String accountNumber;
    private String institutionName;
    private String description;
    private Boolean isActive = true;

    private CreditCardDetailsDto creditCardDetails;
}
