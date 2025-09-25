package com.financemanager.backend.mapper;

import com.financemanager.backend.dto.subscription.UserSubscriptionDto;
import com.financemanager.backend.entity.UserSubscription;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserSubscriptionMapper {
    UserSubscriptionDto toDto(UserSubscription userSubscription);

    @Mapping(target = "id", ignore = true)
    UserSubscription toEntity(UserSubscriptionDto userSubscriptionDto);
}
