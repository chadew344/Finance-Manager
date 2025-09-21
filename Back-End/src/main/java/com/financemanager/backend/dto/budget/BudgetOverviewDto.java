package com.financemanager.backend.dto.budget;

import java.math.BigDecimal;

public class BudgetOverviewDto {
    private Long budgetId;
    private String budgetName;
    private BigDecimal budgetedAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private double progressPercentage;
}
