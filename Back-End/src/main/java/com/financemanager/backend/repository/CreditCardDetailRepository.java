package com.financemanager.backend.repository;

import com.financemanager.backend.entity.CreditCardDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CreditCardDetailRepository extends JpaRepository<CreditCardDetails, Long> {
}
