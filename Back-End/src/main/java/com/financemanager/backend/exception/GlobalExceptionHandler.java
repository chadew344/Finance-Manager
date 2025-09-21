package com.financemanager.backend.exception;

import com.financemanager.backend.util.APIResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<APIResponse<String>> handleBusinessException(BusinessException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        return ResponseEntity.status(errorCode.getStatus()).body(
                new APIResponse<>(
                        errorCode.getStatus().value(),
                        ex.getMessage(),
                        null
                )
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<APIResponse<String>> handleGeneralException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new APIResponse<>(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "An unexpected error occurred.",
                        null
                )
        );
    }
}
