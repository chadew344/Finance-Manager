package com.financemanager.backend.service.impl;

import com.financemanager.backend.dto.dashboard.DashboardResponse;
import com.financemanager.backend.dto.dashboard.FinancialAccountSummaryDto;
import com.financemanager.backend.dto.dashboard.LatestTransactionResponse;
import com.financemanager.backend.entity.*;
import com.financemanager.backend.enumeration.SharedUserRole;
import com.financemanager.backend.enumeration.SubscriptionPlanType;
import com.financemanager.backend.enumeration.SubscriptionStatus;
import com.financemanager.backend.exception.BusinessException;
import com.financemanager.backend.exception.ErrorCode;
import com.financemanager.backend.repository.*;
import com.financemanager.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {
    private final UserRepository userRepository;
    private final SharedAccountUserRepository  sharedAccountUserRepository;
    private final TransactionRepository transactionRepository;
    private final FinancialAccountRepository financialAccountRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;

    @Override
    public DashboardResponse getUserData(String currentUserEmail){
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Long userAccountID = getUserAccount(user.getId(), SharedUserRole.OWNER);

        SubscriptionPlanType planType = getActiveSubscriptionPlanType(userAccountID);

        return DashboardResponse.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .plan(planType)
                .userAccountId(userAccountID)
                .build();
    }

    private Long getUserAccount(Long userId, SharedUserRole role){
        UserAccount userAccount = sharedAccountUserRepository.findUserAccountByRoleAndUserId(role, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_ACCOUNT_NOT_FOUND, "User account not found"));

        return userAccount.getId();
    }

    public SubscriptionPlanType getActiveSubscriptionPlanType(Long userAccountId) {
        Optional<UserSubscription> activeSubscription = userSubscriptionRepository
                .findByUserAccountIdAndStatus(userAccountId, SubscriptionStatus.ACTIVE);
        return activeSubscription.map(userSubscription -> userSubscription.getSubscriptionPlan().getType())
                .orElseThrow(() -> new BusinessException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND, "Subscription Plan not found"));
    }

    @Override
    public List<LatestTransactionResponse> getLatestTransactions(Long userAccountId) {
        List<Transaction> latestTransaction = transactionRepository.findFirst8ByFinancialAccount_UserAccount_IdOrderByCreatedAtDesc(userAccountId);

        List<LatestTransactionResponse>  latestTransactionResponseList = new ArrayList<>();

        for (Transaction transaction : latestTransaction) {
            latestTransactionResponseList.add(
                    LatestTransactionResponse.builder()
                            .description(transaction.getDescription())
                            .amount(transaction.getAmount())
                            .transactionDate(transaction.getTransactionDate())
                            .transactionType(transaction.getTransactionType())
                            .category(transaction.getCategory().getName())
                            .build()
            );
        }

        return latestTransactionResponseList;
    }

    @Override
    public List<FinancialAccountSummaryDto> getFiveFinancialAccounts(Long userAccountId, int limit) {
        List<FinancialAccount> financialAccounts = financialAccountRepository.findByUserAccount_Id(userAccountId);

        List<FinancialAccountSummaryDto> financialAccountSummaryDtoList = new ArrayList<>();
        
        for(FinancialAccount financialAccount : financialAccounts){
            financialAccountSummaryDtoList.add(
                    FinancialAccountSummaryDto.builder()
                            .balance(financialAccount.getBalance())
                            .accountName(financialAccount.getAccountName())
                            .accountNumber(financialAccount.getAccountNumber())
                            .accountType(financialAccount.getAccountType())
                            .institutionName(financialAccount.getInstitutionName())
                            .build()
            );
        }

        return financialAccountSummaryDtoList;
    }
}
