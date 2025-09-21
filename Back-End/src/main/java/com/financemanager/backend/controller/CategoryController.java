package com.financemanager.backend.controller;

import com.financemanager.backend.dto.CategoryDto;
import com.financemanager.backend.service.CategoryService;
import com.financemanager.backend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @PostMapping("/{userAccountId}")
    public ResponseEntity<APIResponse<CategoryDto>> create(@RequestBody CategoryDto categoryDto , @PathVariable Long userAccountId) {
        CategoryDto createdCategory = categoryService.create(categoryDto, userAccountId);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new APIResponse<>(
                        HttpStatus.CREATED.value(),
                        "Category created successfully.",
                        createdCategory
                )
        );
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<APIResponse<CategoryDto>> update(@PathVariable Long id,
                                                           @RequestBody CategoryDto categoryDto,
                                                           @RequestParam Long userAccountId)  {
        System.out.println("UserAccountId: " + userAccountId+ "CategoryId dto: " + categoryDto.getName() + "CategoryId: " + id);
        CategoryDto createdCategory = categoryService.update(id ,categoryDto, userAccountId);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new APIResponse<>(
                        HttpStatus.CREATED.value(),
                        "Category created successfully.",
                        createdCategory
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<CategoryDto>> findById(@PathVariable Long id) {
        return categoryService.findById(id)
                .map(categoryDto -> ResponseEntity.ok(new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Category fetched successfully.",
                        categoryDto
                )))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new APIResponse<>(
                        HttpStatus.NOT_FOUND.value(),
                        "Category not found.",
                        null
                )));
    }

    @GetMapping("/{userAccountId}/categories")
    public ResponseEntity<APIResponse<List<CategoryDto>>> findAll(@PathVariable Long userAccountId) {
        List<CategoryDto> categories = categoryService.findCategoryUserAccountWise(userAccountId);
        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Categories fetched successfully.",
                        categories
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<String>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Category deleted successfully.",
                        null
                )
        );
    }

}
