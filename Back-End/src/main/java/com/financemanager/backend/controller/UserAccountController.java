package com.financemanager.backend.controller;

import com.financemanager.backend.dto.UserAccountDto;
import com.financemanager.backend.service.UserAccountService;
import com.financemanager.backend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/user-account")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class UserAccountController {

    private final UserAccountService userAccountService;

    @PostMapping
    public ResponseEntity<APIResponse<UserAccountDto>> create(@RequestBody UserAccountDto userAccountDto) {
        UserAccountDto createdAccount = userAccountService.create(userAccountDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new APIResponse<>(
                        HttpStatus.CREATED.value(),
                        "User account created successfully.",
                        createdAccount
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<UserAccountDto>> findById(@PathVariable Long id) {
        Optional<UserAccountDto> userAccountOptional = userAccountService.findById(id);

        return userAccountOptional.map(userAccountDto ->
                ResponseEntity.ok(new APIResponse<>(
                        HttpStatus.OK.value(),
                        "User account fetched successfully.",
                        userAccountDto
                ))
        ).orElse(
                ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        new APIResponse<>(
                                HttpStatus.NOT_FOUND.value(),
                                "User account not found.",
                                null
                        )
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<APIResponse<UserAccountDto>> update(@PathVariable Long id, @RequestBody UserAccountDto userAccountDto) {
        try {
            UserAccountDto updatedAccount = userAccountService.update(id, userAccountDto);
            return ResponseEntity.ok(
                    new APIResponse<>(
                            HttpStatus.OK.value(),
                            "User account updated successfully.",
                            updatedAccount
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new APIResponse<>(
                            HttpStatus.BAD_REQUEST.value(),
                            "Failed to update user account.",
                            null
                    )
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<String>> delete(@PathVariable Long id) {
        userAccountService.delete(id);
        return ResponseEntity.ok(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "User account deleted successfully.",
                        null
                )
        );
    }
}
