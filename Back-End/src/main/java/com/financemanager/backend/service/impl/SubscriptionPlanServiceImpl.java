package com.financemanager.backend.service.impl;

import com.financemanager.backend.dto.subscription.SubscriptionPlanDto;
import com.financemanager.backend.entity.SubscriptionPlan;
import com.financemanager.backend.mapper.SubscriptionPlanMapper;
import com.financemanager.backend.repository.SubscriptionPlanRepository;
import com.financemanager.backend.service.SubscriptionPlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionPlanMapper subscriptionPlanMapper;

    @Override
    public SubscriptionPlanDto createSubscriptionPlan(SubscriptionPlanDto subscriptionPlanDto) {
        SubscriptionPlan subscriptionPlan = subscriptionPlanMapper.toEntity(subscriptionPlanDto);
        SubscriptionPlan newSubscriptionPlan = subscriptionPlanRepository.save(subscriptionPlan);
        return subscriptionPlanMapper.toDto(newSubscriptionPlan);
    }
}
