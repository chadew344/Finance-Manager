package com.financemanager.backend.service;

import com.financemanager.backend.dto.financialAccount.FinancialAccountDto;
import com.financemanager.backend.entity.FinancialAccount;
import com.financemanager.backend.enumeration.FinancialAccountType;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

public interface FinancialAccountService {
    FinancialAccountDto create(FinancialAccountDto financialAccountDto, Long userAccountId);

    Optional<FinancialAccountDto> findById(Long id);

    List<FinancialAccountDto> findByUserAccountId(Long userAccountId);

    void delete(Long id);

    FinancialAccountDto update(Long id, FinancialAccountDto financialAccountDto);
}
