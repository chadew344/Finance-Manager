package com.financemanager.backend.dto.dashboard;

import com.financemanager.backend.enumeration.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@ToString
@Builder
public class LatestTransactionResponse {
    @NotBlank
    private String description;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private LocalDateTime transactionDate;

    @NotNull
    private TransactionType transactionType;

    @NotNull
    private String category;

}
