package com.financemanager.backend.dto.financialAccount;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class CreditCardDetailsDto {
    private BigDecimal creditLimit;
    private BigDecimal apr;
    private LocalDate paymentDueDate;
    private LocalDate expirationDate;
}
