package com.financemanager.backend.dto.filter;

import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class FilterDto {
    private List<CategoryFilterDto> categories;
    private List<TagFilterDto> tags;
    private List<FinancialAccFilterDto> financialAccounts;
}
