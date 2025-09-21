package com.financemanager.backend.service;

import com.financemanager.backend.dto.budget.BudgetDto;
import com.financemanager.backend.dto.budget.BudgetOverviewDto;

import java.util.List;

public interface BudgetService {
    BudgetDto createBudget(BudgetDto budgetDto, Long userId);
    BudgetDto getBudgetById(Long budgetId, Long userId);
    List<BudgetDto> getBudgetsByUser(Long userId);
    BudgetOverviewDto getBudgetOverview(Long budgetId, Long userId);
}
