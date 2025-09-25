package com.financemanager.backend.service;

import com.financemanager.backend.dto.CategoryDto;
import com.financemanager.backend.entity.Category;
import com.financemanager.backend.entity.UserAccount;
import com.financemanager.backend.exception.BusinessException;
import com.financemanager.backend.exception.ErrorCode;
import com.financemanager.backend.mapper.CategoryMapper;
import com.financemanager.backend.repository.CategoryRepository;
import com.financemanager.backend.repository.UserAccountRepository;
import com.financemanager.backend.service.impl.CategoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CategoryServiceImplTest {
//    @Mock
//    private CategoryRepository categoryRepository;
//
//    @Mock
//    private CategoryMapper categoryMapper;
//
//    @Mock
//    private UserAccountRepository userAccountRepository;
//
//    @InjectMocks
//    private CategoryServiceImpl categoryServiceImpl;
//
//    private UserAccount mockUserAccount;
//    private CategoryDto mockCategoryDto;
//    private Category mockCategory;
//    private Long mockUserAccountId = 1L;
//    private Long mockCategoryId = 10L;
//
//    @BeforeEach
//    void setUp() {
//        mockUserAccount = new UserAccount(mockUserAccountId, "testuser", "password", null);
//
//        mockCategoryDto = new CategoryDto(null, "Food", "EXPENSE");
//
//        mockCategory = new Category(mockCategoryId, "Food", "EXPENSE", mockUserAccount);
//    }
//
//    @Test
//    void create_ShouldReturnCategoryDto_WhenSuccessful() {
//        when(userAccountRepository.findById(mockUserAccountId)).thenReturn(Optional.of(mockUserAccount));
//        when(categoryMapper.toEntity(mockCategoryDto)).thenReturn(mockCategory);
//        when(categoryRepository.save(any(Category.class))).thenReturn(mockCategory);
//        when(categoryMapper.toDto(mockCategory)).thenReturn(mockCategoryDto);
//
//        CategoryDto result = categoryServiceImpl.create(mockCategoryDto, mockUserAccountId);
//
//        assertNotNull(result);
//        assertEquals(mockCategoryDto.getName(), result.getName());
//        assertEquals(mockCategoryDto.getTransactionType(), result.getTransactionType());
//        verify(categoryRepository, times(1)).save(any(Category.class));
//        verify(categoryMapper, times(1)).toEntity(mockCategoryDto);
//    }
//
//    @Test
//    void create_ShouldThrowIllegalArgumentException_WhenTransactionTypeIsNull() {
//        CategoryDto invalidDto = new CategoryDto(null, "Food", null); // TransactionType is null
//
//        assertThrows(IllegalArgumentException.class, () ->
//                categoryServiceImpl.create(invalidDto, mockUserAccountId));
//        verify(userAccountRepository, never()).findById(anyLong()); // Should fail before checking user
//        verify(categoryRepository, never()).save(any(Category.class));
//    }
//
//    @Test
//    void create_ShouldThrowBusinessException_WhenUserAccountNotFound() {
//        when(userAccountRepository.findById(mockUserAccountId)).thenReturn(Optional.empty());
//
//        BusinessException exception = assertThrows(BusinessException.class, () ->
//                categoryServiceImpl.create(mockCategoryDto, mockUserAccountId));
//        assertEquals(ErrorCode.USER_ACCOUNT_NOT_FOUND, exception.getErrorCode());
//        verify(categoryRepository, never()).save(any(Category.class));
//    }
//
//
//    @Test
//    void update_ShouldReturnUpdatedCategoryDto_WhenSuccessful() {
//        Category existingCategory = new Category(mockCategoryId, "Old Name", "INCOME", mockUserAccount);
//        Category updatedCategory = new Category(mockCategoryId, "New Name", "EXPENSE", mockUserAccount);
//        CategoryDto updateDto = new CategoryDto(mockCategoryId, "New Name", "EXPENSE");
//
//        when(categoryRepository.findById(mockCategoryId)).thenReturn(Optional.of(existingCategory));
//        when(userAccountRepository.findById(mockUserAccountId)).thenReturn(Optional.of(mockUserAccount));
//        when(categoryMapper.toEntity(updateDto)).thenReturn(updatedCategory);
//        when(categoryRepository.save(any(Category.class))).thenReturn(updatedCategory);
//        when(categoryMapper.toDto(updatedCategory)).thenReturn(updateDto);
//
//        when(userAccountRepository.findById(mockCategoryId)).thenReturn(Optional.of(mockUserAccount));
//
//        CategoryDto result = categoryServiceImpl.update(mockCategoryId, updateDto, mockUserAccountId);
//t
//        assertNotNull(result);
//        assertEquals(updateDto.getName(), result.getName());
//        assertEquals(updateDto.getTransactionType(), result.getTransactionType());
//        verify(categoryRepository, times(1)).findById(mockCategoryId);
//        verify(categoryRepository, times(1)).save(any(Category.class));
//    }
//
//
//    @Test
//    void update_ShouldThrowBusinessException_WhenUserAccountNotFoundForCategoryUpdate() {
//
//        when(categoryRepository.findById(mockCategoryId)).thenReturn(Optional.of(mockCategory));
//        when(userAccountRepository.findById(mockCategoryId)).thenReturn(Optional.empty());
//
//        BusinessException exception = assertThrows(BusinessException.class, () ->
//                categoryServiceImpl.update(mockCategoryId, mockCategoryDto, mockUserAccountId));
//        assertEquals(ErrorCode.USER_ACCOUNT_NOT_FOUND, exception.getErrorCode());
//        verify(categoryRepository, never()).save(any(Category.class));
//    }
//
//    @Test
//    void update_ShouldThrowBusinessException_WhenCategoryNotFound() {
//
//        when(categoryRepository.findById(mockCategoryId)).thenReturn(Optional.empty());
//
//
//        BusinessException exception = assertThrows(BusinessException.class, () ->
//                categoryServiceImpl.update(mockCategoryId, mockCategoryDto, mockUserAccountId));
//        assertEquals(ErrorCode.CATEGORY_NOT_FOUND, exception.getErrorCode());
//        verify(categoryRepository, never()).save(any(Category.class));
//    }
//
//
//    @Test
//    void findById_ShouldReturnCategoryDtoOptional_WhenFound() {
//        when(categoryRepository.findById(mockCategoryId)).thenReturn(Optional.of(mockCategory));
//        when(categoryMapper.toDto(mockCategory)).thenReturn(mockCategoryDto);
//
//        Optional<CategoryDto> result = categoryServiceImpl.findById(mockCategoryId);
//
//        assertTrue(result.isPresent());
//        assertEquals(mockCategoryDto.getName(), result.get().getName());
//        verify(categoryRepository, times(1)).findById(mockCategoryId);
//    }
//
//    @Test
//    void findById_ShouldReturnEmptyOptional_WhenNotFound() {
//        when(categoryRepository.findById(mockCategoryId)).thenReturn(Optional.empty());
//
//        Optional<CategoryDto> result = categoryServiceImpl.findById(mockCategoryId);
//
//        assertFalse(result.isPresent());
//        verify(categoryRepository, times(1)).findById(mockCategoryId);
//        verify(categoryMapper, never()).toDto(any(Category.class));
//    }
//
//    @Test
//    void findAll_ShouldReturnListOfCategoryDtos_WhenCategoriesExist() {
//        Category category2 = new Category(2L, "Rent", "EXPENSE", mockUserAccount);
//        List<Category> categoryList = Arrays.asList(mockCategory, category2);
//        CategoryDto categoryDto2 = new CategoryDto(2L, "Rent", "EXPENSE");
//        List<CategoryDto> expectedList = Arrays.asList(mockCategoryDto, categoryDto2);
//
//        when(categoryRepository.findAll()).thenReturn(categoryList);
//        when(categoryMapper.toDto(mockCategory)).thenReturn(mockCategoryDto);
//        when(categoryMapper.toDto(category2)).thenReturn(categoryDto2);
//
//        List<CategoryDto> result = categoryServiceImpl.findAll();
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//        assertEquals(expectedList.get(0).getName(), result.get(0).getName());
//        verify(categoryRepository, times(1)).findAll();
//    }
//
//
//    @Test
//    void findCategoryUserAccountWise_ShouldReturnListOfCategoryDtos_WhenFound() {
//        Category category2 = new Category(2L, "Salary", "INCOME", mockUserAccount);
//        List<Category> categoryList = Arrays.asList(mockCategory, category2);
//        CategoryDto categoryDto2 = new CategoryDto(2L, "Salary", "INCOME");
//
//        when(userAccountRepository.findById(mockUserAccountId)).thenReturn(Optional.of(mockUserAccount));
//        when(categoryRepository.findByUserAccount_Id(mockUserAccountId)).thenReturn(categoryList);
//        when(categoryMapper.toDto(mockCategory)).thenReturn(mockCategoryDto);
//        when(categoryMapper.toDto(category2)).thenReturn(categoryDto2);
//
//        List<CategoryDto> result = categoryServiceImpl.findCategoryUserAccountWise(mockUserAccountId);
//
//        assertNotNull(result);
//        assertEquals(2, result.size());
//        assertEquals(mockCategoryDto.getName(), result.get(0).getName());
//        verify(categoryRepository, times(1)).findByUserAccount_Id(mockUserAccountId);
//        verify(userAccountRepository, times(1)).findById(mockUserAccountId);
//    }
//
//    @Test
//    void findCategoryUserAccountWise_ShouldThrowBusinessException_WhenUserAccountNotFound() {
//        when(userAccountRepository.findById(mockUserAccountId)).thenReturn(Optional.empty());
//
//        BusinessException exception = assertThrows(BusinessException.class, () ->
//                categoryServiceImpl.findCategoryUserAccountWise(mockUserAccountId));
//        assertEquals(ErrorCode.USER_ACCOUNT_NOT_FOUND, exception.getErrorCode());
//        verify(categoryRepository, never()).findByUserAccount_Id(anyLong());
//    }
//
//
//    @Test
//    void delete_ShouldCallDeleteById_WhenCategoryExists() {
//        when(categoryRepository.existsById(mockCategoryId)).thenReturn(true);
//        doNothing().when(categoryRepository).deleteById(mockCategoryId);
//
//        categoryServiceImpl.delete(mockCategoryId);
//
//        verify(categoryRepository, times(1)).existsById(mockCategoryId);
//        verify(categoryRepository, times(1)).deleteById(mockCategoryId);
//    }
//
//    @Test
//    void delete_ShouldThrowBusinessException_WhenCategoryDoesNotExist() {
//        when(categoryRepository.existsById(mockCategoryId)).thenReturn(false);
//
//        BusinessException exception = assertThrows(BusinessException.class, () ->
//                categoryServiceImpl.delete(mockCategoryId));
//        assertEquals(ErrorCode.CATEGORY_NOT_FOUND, exception.getErrorCode());
//        verify(categoryRepository, times(1)).existsById(mockCategoryId);
//        verify(categoryRepository, never()).deleteById(anyLong());
//    }
}
