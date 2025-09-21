package com.financemanager.backend.dto.transaction;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class TransactionTransferRequest {
    private TransactionDto transaction;

    private Long internalAccountId;

    private String beneficiaryName;
    private String beneficiaryAccountNumber;
    private String description;

}
