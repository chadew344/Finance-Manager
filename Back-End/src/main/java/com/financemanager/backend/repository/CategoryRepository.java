package com.financemanager.backend.repository;

import com.financemanager.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Set<Category> findByUserAccount_Id(Long userAccountId);

    Optional<Category> findByIdAndUserAccount_Id(Long id, Long userId);
}
