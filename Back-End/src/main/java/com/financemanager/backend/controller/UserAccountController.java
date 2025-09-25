package com.financemanager.backend.controller;

import com.financemanager.backend.dto.UserAccountDto;
import com.financemanager.backend.dto.auth.reponse.AuthenticationResponse;
import com.financemanager.backend.dto.invitation.EmailCheckRequest;
import com.financemanager.backend.dto.invitation.InvitationRequest;
import com.financemanager.backend.dto.userAccount.InitUserManageResponse;
import com.financemanager.backend.service.UserAccountService;
import com.financemanager.backend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/user-account")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class UserAccountController {
    private final UserAccountService userAccountService;

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

    @GetMapping("/user-manager/{userAccountId}")
    public ResponseEntity<APIResponse<InitUserManageResponse>> multiUserMange(@PathVariable Long userAccountId) {
        return  ResponseEntity.ok(new APIResponse<>(
                200,
                "OK",
                userAccountService.initUserManage(userAccountId)
        ));
    }


    @PostMapping("/invite-user")
    public ResponseEntity<APIResponse<String>> inviteUSer(@RequestBody InvitationRequest invitationRequest, @AuthenticationPrincipal UserDetails userDetails) {
        String senderEmail = userDetails.getUsername();
        return  ResponseEntity.ok(new APIResponse<>(
                200,
                "OK",
                userAccountService.inviteUser(invitationRequest, senderEmail)
        ));

    }

    @PostMapping("/check-email")
    public ResponseEntity<APIResponse<Boolean>> checkEmail(@RequestBody EmailCheckRequest request) {
        return  ResponseEntity.ok(new APIResponse<>(
                200,
                "OK",
                userAccountService.checkEmail(request.getEmail())
        ));

    }


}
