package com.financemanager.backend.dto.report;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Builder
public class SummaryReportDto {
    private BigDecimal totalIncome = BigDecimal.ZERO;
    private BigDecimal totalExpenses = BigDecimal.ZERO;
    private BigDecimal netBalance = BigDecimal.ZERO;
    private Map<String, BigDecimal> expensesByCategory;
    private Map<String, BigDecimal> incomeByCategory;
}
