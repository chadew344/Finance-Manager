package com.financemanager.backend.repository;

import com.financemanager.backend.dto.dashboard.FinancialAccountSummaryDto;
import com.financemanager.backend.entity.FinancialAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialAccountRepository extends JpaRepository<FinancialAccount, Long> {
    List<FinancialAccount> findByUserAccount_Id(Long userAccountId);
//    List<FinancialAccount> findByUser(User user);
    Optional<FinancialAccount> findByIdAndUserAccount_Id(Long id, Long userId);

    List<FinancialAccountSummaryDto> findFirst5ByUserAccount_Id(Long userId);
}
