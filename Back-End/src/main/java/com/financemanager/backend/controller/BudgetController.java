package com.financemanager.backend.controller;

import com.financemanager.backend.dto.budget.BudgetDto;
import com.financemanager.backend.dto.budget.BudgetOverviewDto;
import com.financemanager.backend.dto.budget.BudgetSummeryDto;
import com.financemanager.backend.service.BudgetService;
import com.financemanager.backend.util.APIResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/budget")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class BudgetController {
    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetDto> createBudget(@RequestBody @Valid BudgetDto budgetDto) {
        BudgetDto createdBudget = budgetService.createBudget(budgetDto, 1L);
        return new ResponseEntity<>(createdBudget, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BudgetDto>> getAllBudgets() {
        List<BudgetDto> budgets = budgetService.getBudgetsByUser(1L);
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetDto> getBudgetById(@PathVariable Long id) {
        BudgetDto budget = budgetService.getBudgetById(id, 1L);
        return ResponseEntity.ok(budget);
    }

    @GetMapping("/{id}/overview")
    public ResponseEntity<BudgetOverviewDto> getBudgetOverview(@PathVariable Long id) {
        BudgetOverviewDto overview = budgetService.getBudgetOverview(id, 1L);
        return ResponseEntity.ok(overview);
    }

    @GetMapping("/summery/{userAccountId}")
    public ResponseEntity<APIResponse<BudgetSummeryDto>> getBudgetSummery(@PathVariable Long userAccountId) {
        BudgetSummeryDto summery = budgetService.getBudgetSummery(userAccountId);
        return ResponseEntity.ok(new APIResponse<>(
                200,
                "OK",
                summery
        ));
    }
}
