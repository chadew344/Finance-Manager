package com.financemanager.backend.dto.transaction;

import com.financemanager.backend.dto.TagDto;
import com.financemanager.backend.enumeration.TransactionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class TransactionLoadResponse {
    private Long id;
    private String description;
    private BigDecimal amount;
    private TransactionType transactionType;
    private LocalDateTime transactionDate;
    private Long financialAccountId;
    private String financialAccountName;
    private Long categoryId;
    private String categoryName;
    private List<TagDto> tags;
    private Long sourceAccountId;
    private String sourceAccountName;
    private Long destinationAccountId;
    private String destinationAccountName;
    private String externalAccountName;
    private String externalAccountNumber;
    private boolean isInternal;
    private String transferNotes;
}
