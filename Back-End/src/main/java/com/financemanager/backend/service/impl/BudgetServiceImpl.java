package com.financemanager.backend.service.impl;

import com.financemanager.backend.dto.budget.BudgetDto;
import com.financemanager.backend.dto.budget.BudgetOverviewDto;
import com.financemanager.backend.dto.budget.BudgetSummeryDto;
import com.financemanager.backend.service.BudgetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetServiceImpl implements BudgetService {
    @Override
    public BudgetDto createBudget(BudgetDto budgetDto, Long userId) {
        return null;
    }

    @Override
    public BudgetDto getBudgetById(Long budgetId, Long userId) {
        return null;
    }

    @Override
    public List<BudgetDto> getBudgetsByUser(Long userId) {
        return null;
    }

    @Override
    public BudgetOverviewDto getBudgetOverview(Long budgetId, Long userId) {
        return null;
    }

    @Override
    public BudgetSummeryDto getBudgetSummery(Long userAccountId) {
        return null;
    }
}
