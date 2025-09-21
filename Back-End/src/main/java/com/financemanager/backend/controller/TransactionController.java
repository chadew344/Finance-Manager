package com.financemanager.backend.controller;

import com.financemanager.backend.dto.filter.FilterDto;
import com.financemanager.backend.dto.transaction.TransactionDto;
import com.financemanager.backend.dto.transaction.TransactionLoadResponse;
import com.financemanager.backend.dto.transaction.TransactionTransferRequest;
import com.financemanager.backend.entity.Transaction;
import com.financemanager.backend.service.TransactionService;
import com.financemanager.backend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/transaction")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @PostMapping("/{userAccountId}")
    public ResponseEntity<APIResponse<TransactionDto>> create(@RequestBody TransactionDto transactionRequest, @PathVariable Long userAccountId) {
        System.out.println("Transaction Request account : " + userAccountId);
        System.out.println("Transaction Request         : " +transactionRequest.toString());
        TransactionDto createdTransaction = transactionService.create(transactionRequest, userAccountId);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new APIResponse<>(
                        HttpStatus.CREATED.value(),
                        "Transaction created successfully.",
                        createdTransaction
                )
        );
    }

    @PostMapping("/transfer/{userAccountId}")
    public ResponseEntity<APIResponse<TransactionDto>> createTransfer(@RequestBody TransactionTransferRequest transactionRequest, @PathVariable Long userAccountId) {
        TransactionDto createdTransaction = transactionService.createTransfer(transactionRequest, userAccountId);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new APIResponse<>(
                        HttpStatus.CREATED.value(),
                        "Transaction created successfully.",
                        createdTransaction
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<TransactionDto>> getAllTransactionUserAccount(@PathVariable Long id) {
        TransactionDto transactionDto = transactionService.findById(id);
        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Transaction fetched successfully.",
                        transactionDto
                )
        );
    }

    @GetMapping("/search/{id}")
    public ResponseEntity<APIResponse<TransactionDto>> findById(@PathVariable Long id) {
        TransactionDto transactionDto = transactionService.findById(id);
        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Transaction fetched successfully.",
                        transactionDto
                )
        );
    }

    @GetMapping("/account/{financialAccountId}")
    public ResponseEntity<APIResponse<List<TransactionDto>>> findByFinancialAccountId(@PathVariable Long financialAccountId) {
        List<TransactionDto> transactions = transactionService.findByFinancialAccountId(financialAccountId);
        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Transactions fetched successfully for account.",
                        transactions
                )
        );
    }

    @GetMapping("/account/{financialAccountId}/date-range")
    public ResponseEntity<APIResponse<List<TransactionDto>>> findByFinancialAccountIdAndDateBetween(
            @PathVariable Long financialAccountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        List<TransactionDto> transactions = transactionService.findByFinancialAccountIdAndDateBetween(
                financialAccountId, startDate, endDate
        );
        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Transactions fetched successfully for date range.",
                        transactions
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<String>> delete(@PathVariable Long id) {
        transactionService.delete(id);
        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Transaction deleted successfully.",
                        null
                )
        );
    }

    @GetMapping("/init-filter/{id}")
    public ResponseEntity<APIResponse<FilterDto>> initializeFilter(@PathVariable Long id) {
        FilterDto filterDtoList = transactionService.initializeFiltersAccountWise(id);

        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Filters data fetched successfully",
                        filterDtoList
                )
        );
    }

    @GetMapping("/get-all/{userAccountId}")
    public ResponseEntity<APIResponse<List<TransactionLoadResponse>>> loadAllTransactions(@PathVariable Long userAccountId) {
        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "loadAllTransactions fetched successfully",
                        transactionService.getTransactionsByUserAccount(userAccountId)
                )
        );
    }


//    @GetMapping
//    public ResponseEntity<APIResponse<List<TransactionDto>>> getFilteredTransactions(
//            @RequestParam(required = false) String searchTerm,
//            @RequestParam(required = false) String type,
//            @RequestParam(required = false) Long categoryId,
//            @RequestParam(required = false) Long accountId,
//            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
//            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
//    ) {
//
//        List<TransactionDto> transactions = transactionService.getFilteredTransactions(
//                searchTerm, type, categoryId, accountId, startDate, endDate
//        );
//
//        return ResponseEntity.ok(
//                new APIResponse<>(
//                        HttpStatus.OK.value(),
//                        "Transactions fetched successfully.",
//                        transactions
//                )
//        );
//    }
}
