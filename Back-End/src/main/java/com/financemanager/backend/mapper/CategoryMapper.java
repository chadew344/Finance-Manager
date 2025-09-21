package com.financemanager.backend.mapper;

import com.financemanager.backend.dto.CategoryDto;
import com.financemanager.backend.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryDto toDto(Category category);

    @Mapping(target = "id", ignore = true)
    Category toEntity(CategoryDto categoryDto);
}
