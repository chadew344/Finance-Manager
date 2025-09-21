package com.financemanager.backend.dto.filter;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class FinancialAccFilterDto {
    private Long id;
    private String name;
}
