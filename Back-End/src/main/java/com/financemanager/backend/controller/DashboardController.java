package com.financemanager.backend.controller;

import com.financemanager.backend.dto.dashboard.DashboardResponse;
import com.financemanager.backend.dto.dashboard.FinancialAccountSummaryDto;
import com.financemanager.backend.dto.dashboard.LatestTransactionResponse;
import com.financemanager.backend.service.DashboardService;
import com.financemanager.backend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin()
@Slf4j
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<APIResponse<DashboardResponse>> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        log.info("Get Dashboard : {}", email);
        return ResponseEntity.ok(new APIResponse<>(
                200,
                "OK",
                dashboardService.getUserData(email)
        ));
    }

    @GetMapping("/latest-transactions/{userAccountId}")
    public ResponseEntity<APIResponse<List<LatestTransactionResponse>>> latestTransaction(@PathVariable Long userAccountId,  @RequestParam(required = false, defaultValue = "5") int limit) {
        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Latest transactions fetched successfully",
                        dashboardService.getLatestTransactions(userAccountId)
                )
        );
    }

    @GetMapping("/financial-accounts/{userAccountId}")
    public ResponseEntity<APIResponse<List<FinancialAccountSummaryDto>>> fiveFinancialAccounts(@PathVariable Long userAccountId, @RequestParam(required = false, defaultValue = "5") int limit) {
        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Financial accounts fetched successfully for dashboard",
                        dashboardService.getFiveFinancialAccounts(userAccountId, limit)
                )
        );
    }


}
