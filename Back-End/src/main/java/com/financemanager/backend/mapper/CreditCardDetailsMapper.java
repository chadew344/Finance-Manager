package com.financemanager.backend.mapper;

import com.financemanager.backend.dto.financialAccount.CreditCardDetailsDto;
import com.financemanager.backend.entity.CreditCardDetails;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CreditCardDetailsMapper {

    CreditCardDetailsDto toDto(CreditCardDetails creditCardDetails);

    @Mapping(target = "id", ignore = true)
    CreditCardDetails toEntity(CreditCardDetailsDto creditCardDetailsDto);

}
