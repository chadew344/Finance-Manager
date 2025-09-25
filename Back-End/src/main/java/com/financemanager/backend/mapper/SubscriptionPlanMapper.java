package com.financemanager.backend.mapper;

import com.financemanager.backend.dto.subscription.SubscriptionPlanDto;
import com.financemanager.backend.entity.SubscriptionPlan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SubscriptionPlanMapper {
    SubscriptionPlanDto toDto(SubscriptionPlan subscriptionPlan);

    @Mapping(target = "id", ignore = true)
    SubscriptionPlan toEntity(SubscriptionPlanDto subscriptionPlanDto);
}
