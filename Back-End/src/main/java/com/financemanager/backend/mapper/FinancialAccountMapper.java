package com.financemanager.backend.mapper;

import com.financemanager.backend.dto.financialAccount.FinancialAccountDto;
import com.financemanager.backend.entity.FinancialAccount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = {CreditCardDetailsMapper.class})
public interface FinancialAccountMapper {

    FinancialAccountDto toDto(FinancialAccount financialAccount);

    @Mapping(target = "id", ignore = true)
    FinancialAccount toEntity(FinancialAccountDto financialAccountDto);

}