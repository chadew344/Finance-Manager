package com.financemanager.backend.mapper;

import com.financemanager.backend.dto.transaction.TransactionDto;
import com.financemanager.backend.entity.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { TagMapper.class })
public interface TransactionMapper {

    @Mapping(source = "financialAccount.id", target = "financialAccountId")
    @Mapping(source = "category.id", target = "categoryId")
    TransactionDto toDto(Transaction transaction);

    @Mapping(source = "financialAccountId", target = "financialAccount.id")
    @Mapping(source = "categoryId", target = "category.id")
    @Mapping(target = "id", ignore = true)
    Transaction toEntity(TransactionDto transactionDto);

}
