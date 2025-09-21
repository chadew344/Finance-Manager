package com.financemanager.backend.dto.filter;

import com.financemanager.backend.enumeration.TransactionType;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class CategoryFilterDto {
    private Long id;
    private String name;
    private TransactionType transactionType;
}
