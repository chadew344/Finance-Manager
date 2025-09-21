package com.financemanager.backend.repository;

import com.financemanager.backend.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Set<Budget> findByUserAccount_Id(Long userAccountId);

    List<Budget> findByUserAccount_IdAndCategory_Id(Long userAccountId, Long categoryId);

}
