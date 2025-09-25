package com.financemanager.backend.repository;

import com.financemanager.backend.entity.SubscriptionPlan;
import com.financemanager.backend.enumeration.SubscriptionPlanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    Optional<SubscriptionPlan> findByType(SubscriptionPlanType type);
}
