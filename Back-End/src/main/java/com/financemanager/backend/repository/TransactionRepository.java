package com.financemanager.backend.repository;

import com.financemanager.backend.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Set<Transaction> findByFinancialAccount_Id(Long financialAccountId);

    Set<Transaction> findByFinancialAccount_IdAndTransactionDateBetween(
            Long financialAccountId, LocalDateTime startDate, LocalDateTime endDate);

    Set<Transaction> findByTags_Name(String tagName);

    Page<Transaction> findByFinancialAccount_UserAccount_Id(Long userId, Pageable pageable);

    List<Transaction> findByFinancialAccount_UserAccount_Id(Long userId);

    List<Transaction> findFirst8ByFinancialAccount_UserAccount_IdOrderByCreatedAtDesc(Long userId);

}
