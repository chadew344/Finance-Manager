package com.financemanager.backend.controller;

import com.financemanager.backend.dto.financialAccount.FinancialAccountDto;
import com.financemanager.backend.service.FinancialAccountService;
import com.financemanager.backend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/financial-account")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class FinancialAccountController {
    private final FinancialAccountService financialAccountService;

    @GetMapping("/all")
    public ResponseEntity<String> getAll() {
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @PostMapping("/{userAccountId}")
    public ResponseEntity<APIResponse<FinancialAccountDto>> create(
            @RequestBody FinancialAccountDto financialAccountDto,
            @PathVariable Long userAccountId
    ) {
        FinancialAccountDto createdAccount = financialAccountService.create(financialAccountDto, userAccountId);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new APIResponse<>(
                        HttpStatus.CREATED.value(),
                        "Financial account created successfully.",
                        createdAccount
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<FinancialAccountDto>> findById(@PathVariable Long id) {
        Optional<FinancialAccountDto> accountOptional = financialAccountService.findById(id);

        return accountOptional.map(financialAccountDto ->
                ResponseEntity.ok(new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Financial account fetched successfully.",
                        financialAccountDto
                ))
        ).orElse(
                ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        new APIResponse<>(
                                HttpStatus.NOT_FOUND.value(),
                                "Financial account not found.",
                                null
                        )
                )
        );
    }

    @GetMapping("/user/{userAccountId}")
    public ResponseEntity<APIResponse<List<FinancialAccountDto>>> findByUserAccountId(@PathVariable Long userAccountId) {
        List<FinancialAccountDto> accounts = financialAccountService.findByUserAccountId(userAccountId);
        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Financial accounts fetched successfully.",
                        accounts
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<APIResponse<FinancialAccountDto>> update(
            @PathVariable Long id,
            @RequestBody FinancialAccountDto financialAccountDto
    ) {
        try {
            FinancialAccountDto updatedAccount = financialAccountService.update(id, financialAccountDto);
            return ResponseEntity.ok(
                    new APIResponse<>(
                            HttpStatus.OK.value(),
                            "Financial account updated successfully.",
                            updatedAccount
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new APIResponse<>(
                            HttpStatus.BAD_REQUEST.value(),
                            "Failed to update financial account.",
                            null
                    )
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<String>> delete(@PathVariable Long id) {
        try {
            financialAccountService.delete(id);
            return ResponseEntity.ok(
                    new APIResponse<>(
                            HttpStatus.OK.value(),
                            "Financial account deleted successfully.",
                            null
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new APIResponse<>(
                            HttpStatus.BAD_REQUEST.value(),
                            "Failed to delete financial account.",
                            null
                    )
            );
        }
    }
}
