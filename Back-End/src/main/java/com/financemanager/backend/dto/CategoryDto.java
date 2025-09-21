package com.financemanager.backend.dto;

import com.financemanager.backend.enumeration.TransactionType;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class CategoryDto {
    private Long id;
    private String name;
    private TransactionType transactionType;
}
