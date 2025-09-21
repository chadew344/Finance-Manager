package com.financemanager.backend.dto.budget;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BudgetDto {
    private Long id;
    private String name;
    private BigDecimal budgetedAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long categoryId;
}
