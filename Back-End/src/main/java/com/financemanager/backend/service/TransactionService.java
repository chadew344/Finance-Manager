package com.financemanager.backend.service;

import com.financemanager.backend.dto.filter.FilterDto;
import com.financemanager.backend.dto.transaction.TransactionDto;
import com.financemanager.backend.dto.transaction.TransactionLoadResponse;
import com.financemanager.backend.dto.transaction.TransactionTransferRequest;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionService {
    TransactionDto create(TransactionDto transactionRequest, Long userAccountId);

    TransactionDto findById(Long id);

    List<TransactionDto> findByFinancialAccountId(Long financialAccountId);

    List<TransactionDto> findByFinancialAccountIdAndDateBetween(
            Long financialAccountId, LocalDateTime startDate, LocalDateTime endDate);

    void delete(Long id);

    FilterDto initializeFiltersAccountWise(Long id);

    TransactionDto createTransfer(TransactionTransferRequest transactionRequest, Long userAccountId);

    List<TransactionLoadResponse> getTransactionsByUserAccount(Long userId);

}
