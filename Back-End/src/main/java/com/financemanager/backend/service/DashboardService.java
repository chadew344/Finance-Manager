package com.financemanager.backend.service;

import com.financemanager.backend.dto.dashboard.DashboardResponse;
import com.financemanager.backend.dto.dashboard.FinancialAccountSummaryDto;
import com.financemanager.backend.dto.dashboard.LatestTransactionResponse;

import java.util.List;

public interface DashboardService {
    DashboardResponse getUserData(String currentUserEmail);

    List<LatestTransactionResponse> getLatestTransactions(Long userAccountId);

    List<FinancialAccountSummaryDto> getFiveFinancialAccounts(Long userAccountId, int limit);
}
