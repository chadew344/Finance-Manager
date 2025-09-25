package com.financemanager.backend.repository;

import com.financemanager.backend.entity.UserSubscription;
import com.financemanager.backend.enumeration.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {
    Optional<UserSubscription> findByUserAccountIdAndStatus(Long userAccountId, SubscriptionStatus status);
}
