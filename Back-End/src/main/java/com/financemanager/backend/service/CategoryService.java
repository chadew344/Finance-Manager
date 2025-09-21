package com.financemanager.backend.service;

import com.financemanager.backend.dto.CategoryDto;

import java.util.List;
import java.util.Optional;

public interface CategoryService {
    CategoryDto create(CategoryDto categoryDto, Long userAccountId);

    Optional<CategoryDto> findById(Long id);

    List<CategoryDto> findAll();

    List<CategoryDto> findCategoryUserAccountWise(Long userAccountId);

    void delete(Long id);

    CategoryDto update(Long id, CategoryDto categoryDto, Long userAccountId);
}
