package com.financemanager.backend.controller;

import com.financemanager.backend.dto.payment.PayhereInitResponse;
import com.financemanager.backend.service.PaymentService;
import com.financemanager.backend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payment")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @GetMapping("/payhere")
    public ResponseEntity<APIResponse<PayhereInitResponse>> payWithPayhere(){
       return ResponseEntity.status(HttpStatus.OK).body(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Initiate Payhere Gateway",
                        paymentService.initiatePayherePayment()
                )
        );

    }

    @PostMapping("/process-payment")
    public ResponseEntity<String> processGooglePayPayment(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");

        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body("Payment token is missing.");
        }

        // For testing, you only need to check the token structure and simulate a success.
        // In a real application, you would pass this token to your payment gateway's API.

        // Log the token to see what it looks like
        System.out.println("Received Google Pay token: " + token);

        // You can add a simple check to make sure the token isn't empty
        if (token.startsWith("{")) {
            System.out.println("Token format seems correct. Simulating successful payment...");
            return ResponseEntity.ok("Payment test successful. Token received and validated.");
        } else {
            return ResponseEntity.badRequest().body("Invalid token format.");
        }
    }

}


