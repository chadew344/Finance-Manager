package com.financemanager.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.*;

@Getter
public enum ErrorCode {
    USER_NOT_FOUND("USER_NOT_FOUND", "User not found with id %s", NOT_FOUND),
    CHANGE_PASSWORD_MISMATCH("CHANGE_PASSWORD_MISMATCH", "Current password and new password are not same", BAD_REQUEST),
    INVALID_CURRENT_PASSWORD("INVALID_CURRENT_PASSWORD", "Current password is invalid", BAD_REQUEST),
    ACCOUNT_ALREADY_DEACTIVATED("ACCOUNT_ALREADY_DEACTIVATED", "Account is already in use", BAD_REQUEST),
    EMAIL_ALREADY_EXIST("EMAIL_ALREADY_EXIST", "Email already exist", BAD_REQUEST),
    PHONE_ALREADY_EXIST("PHONE_ALREADY_EXIST", "Phone already exist", BAD_REQUEST),
    PASSWORD_MISMATCH("PASSWORD_MISMATCH", "Passwords do not match", BAD_REQUEST),
    ERR_USER_DISABLE("ERR_USER_DISABLE", "User is disabled", UNAUTHORIZED),

    BAD_CREDENTIALS("BAD_CREDENTIALS", "Username or Password is incorrect", UNAUTHORIZED),
    USERNAME_NOT_FOUND("USERNAME_NOT_FOUND", "Username not found", NOT_FOUND),
    USER_ACCOUNT_NOT_FOUND("USER_ACCOUNT_NOT_FOUND", "User account not found", NOT_FOUND),

    INTERNAL_EXCEPTION("INTERNAL_EXCEPTION", "Internal server error", INTERNAL_SERVER_ERROR),

    FINANCIAL_ACCOUNT_CREATION_FAILED("Financial account creation failed", "Account creation failed", INTERNAL_SERVER_ERROR),
    FINANCIAL_ACCOUNT_NOT_FOUND("FINANCIAL_ACCOUNT_NOT_FOUND", "Account not found", NOT_FOUND),

    TRANSACTION_NOT_FOUND("TRANSACTION_NOT_FOUND", "Transaction not found", NOT_FOUND),

    CATEGORY_NOT_FOUND("CATEGORY_NOT_FOUND", "Category not found", NOT_FOUND),
    TAG_NOT_FOUND("TAG_NOT_FOUND", "Tag not found", NOT_FOUND),

    UNAUTHORIZED_ACCESS("UNAUTHORIZED_ACCESS", "Unauthorized access" , UNAUTHORIZED ),

    INVALID_PHONE_NUMBER("INVALID_PHONE_NUMBER", "Invalid phone number" , BAD_REQUEST ),

    SUBSCRIPTION_PLAN_NOT_FOUND("SUBSCRIPTION_PLAN_NOT_FOUND", "Subscription Plan not found" , NOT_FOUND ),;


    private final String code;
    private final String defaultMessage;
    private final HttpStatus status;

    ErrorCode(String code, String defaultMessage, HttpStatus status) {
        this.code = code;
        this.defaultMessage = defaultMessage;
        this.status = status;
    }
}
