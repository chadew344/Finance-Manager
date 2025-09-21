package com.financemanager.backend.dto.dashboard;

import com.financemanager.backend.enumeration.FinancialAccountType;
import lombok.*;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class FinancialAccountSummaryDto {
    private BigDecimal balance;
    private String accountName;
    private String accountNumber;
    private FinancialAccountType accountType;
    private String institutionName;
}
