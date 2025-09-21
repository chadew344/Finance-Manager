package com.financemanager.backend.service.impl;

import com.financemanager.backend.dto.CategoryDto;
import com.financemanager.backend.entity.Category;
import com.financemanager.backend.entity.UserAccount;
import com.financemanager.backend.exception.BusinessException;
import com.financemanager.backend.exception.ErrorCode;
import com.financemanager.backend.mapper.CategoryMapper;
import com.financemanager.backend.repository.CategoryRepository;
import com.financemanager.backend.repository.UserAccountRepository;
import com.financemanager.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final UserAccountRepository userAccountRepository;

    @Override
    public CategoryDto create(CategoryDto categoryDto, Long userAccountId) {
        UserAccount userAccount = getCurrentUserAccount(userAccountId);

        log.debug("Incoming CategoryDto transactionType: {}", categoryDto.getTransactionType());

        if (categoryDto.getTransactionType() == null) {
            throw new IllegalArgumentException("Transaction type cannot be null");
        }

        Category category = categoryMapper.toEntity(categoryDto);
        category.setUserAccount(userAccount);

        log.debug("CategoryDto: {}", category.getTransactionType());

        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toDto(savedCategory);
    }

    @Override
    public CategoryDto update(Long id, CategoryDto categoryDto, Long userAccountId) {
        System.out.println("Incoming CategoryDto transactionType: " + categoryDto.getTransactionType());
        System.out.println("Category Id: " + id);
        System.out.println("CategoryDto: " + categoryDto.getName());
        System.out.println("UserAcc: " +userAccountId);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND, "Category not found"));

        if (categoryDto.getTransactionType() == null) {
            throw new IllegalArgumentException("Transaction type cannot be null");
        }

        Category updateCategory = categoryMapper.toEntity(categoryDto);
        updateCategory.setUserAccount(getCurrentUserAccount(id));

        Category savedCategory = categoryRepository.save(updateCategory);
        return categoryMapper.toDto(savedCategory);
    }

    @Override
    public Optional<CategoryDto> findById(Long id) {
        return categoryRepository.findById(id)
                .map(categoryMapper::toDto);
    }

    @Override
    public List<CategoryDto> findAll() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryDto> findCategoryUserAccountWise(Long userAccountId) {
        getCurrentUserAccount(userAccountId);
        return categoryRepository.findByUserAccount_Id(userAccountId).stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.CATEGORY_NOT_FOUND, "Category not found.");
        }
        categoryRepository.deleteById(id);
    }


    private UserAccount getCurrentUserAccount(Long userAccountId) {
        return userAccountRepository.findById(userAccountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_ACCOUNT_NOT_FOUND, "User account not found"));
    }

}
