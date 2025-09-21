package com.financemanager.backend.service.impl;

import com.financemanager.backend.dto.financialAccount.FinancialAccountDto;
import com.financemanager.backend.entity.FinancialAccount;
import com.financemanager.backend.entity.UserAccount;
import com.financemanager.backend.exception.BusinessException;
import com.financemanager.backend.exception.ErrorCode;
import com.financemanager.backend.mapper.FinancialAccountMapper;
import com.financemanager.backend.repository.FinancialAccountRepository;
import com.financemanager.backend.repository.UserAccountRepository;
import com.financemanager.backend.repository.UserRepository;
import com.financemanager.backend.service.FinancialAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinancialAccountServiceImpl implements FinancialAccountService {
    private final FinancialAccountRepository financialAccountRepository;
    private final UserAccountRepository userAccountRepository;
    private final FinancialAccountMapper financialAccountMapper;

    @Override
    public FinancialAccountDto create(FinancialAccountDto financialAccountDto, Long userAccountId) {
        log.info("UserAccountId: {}", userAccountId);

        UserAccount userAccount = userAccountRepository.findById(userAccountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_ACCOUNT_NOT_FOUND, "User account not found"));

        try {
            FinancialAccount financialAccount = financialAccountMapper.toEntity(financialAccountDto);
            financialAccount.setUserAccount(userAccount);

            log.debug("FinancialAccountDto: {}", financialAccountDto);
            log.debug("FinancialAccountType: {}", financialAccountDto.getAccountType());

            FinancialAccount savedAccount = financialAccountRepository.save(financialAccount);
            log.info("FinancialAccountId: {}", savedAccount.getId());

            return financialAccountMapper.toDto(savedAccount);

        } catch (Exception e) {
            log.error("Error creating financial account: ", e);
            throw new BusinessException(ErrorCode.FINANCIAL_ACCOUNT_CREATION_FAILED,
                    "Failed to create financial account: " + e.getMessage());
        }
    }

    @Override
    public Optional<FinancialAccountDto> findById(Long id) {
        return financialAccountRepository.findById(id).map(financialAccountMapper::toDto);
    }

    @Override
    public List<FinancialAccountDto> findByUserAccountId(Long userAccountId) {
        return financialAccountRepository.findByUserAccount_Id(userAccountId)
                .stream()
                .map(financialAccountMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        if (!financialAccountRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND, "Financial account not found");
        }
        financialAccountRepository.deleteById(id);
    }

    @Override
    public FinancialAccountDto update(Long id, FinancialAccountDto financialAccountDto) {
        return financialAccountRepository.findById(id)
                .map(existingAccount -> {
                    existingAccount.setAccountName(financialAccountDto.getAccountName());
                    existingAccount.setBalance(financialAccountDto.getBalance());
                    FinancialAccount updatedAccount = financialAccountRepository.save(existingAccount);
                    return financialAccountMapper.toDto(updatedAccount);
                }).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Financial account not found"));
    }

}
