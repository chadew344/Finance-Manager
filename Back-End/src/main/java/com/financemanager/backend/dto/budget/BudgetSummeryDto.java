package com.financemanager.backend.dto.budget;

import lombok.*;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class BudgetSummeryDto {
    private BigDecimal totalBudget;
    private BigDecimal totalSpent;
    private BigDecimal remainingBudget;
    private String budgetHealth;
}
