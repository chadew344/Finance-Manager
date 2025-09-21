package com.financemanager.backend.repository;

import com.financemanager.backend.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

}
