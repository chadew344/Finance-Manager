package com.financemanager.backend.dto.transaction;

import com.financemanager.backend.enumeration.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@ToString
@Builder
public class TransactionDto {
    @NotBlank
    private String description;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private LocalDateTime transactionDate;

    @NotNull
    private TransactionType transactionType;

    @NotNull
    private Long financialAccountId;

    @NotNull
    private Long categoryId;

    private Set<Long> tagIds;
}

