package com.financemanager.backend.mapper;
import com.financemanager.backend.dto.UserAccountDto;
import com.financemanager.backend.entity.UserAccount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserAccountMapper {

//    UserAccountMapper INSTANCE = Mappers.getMapper(UserAccountMapper.class);

    UserAccountDto toDto(UserAccount userAccount);

    @Mapping(target = "id", ignore = true)
    UserAccount toEntity(UserAccountDto userAccountDto);
}