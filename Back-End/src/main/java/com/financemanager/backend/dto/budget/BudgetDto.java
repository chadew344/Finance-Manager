package com.financemanager.backend.dto.budget;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class BudgetDto {
    private Long id;
    private String name;
    private BigDecimal budgetedAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long categoryId;
}
