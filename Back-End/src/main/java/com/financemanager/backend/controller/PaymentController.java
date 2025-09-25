package com.financemanager.backend.controller;

import com.financemanager.backend.dto.payment.PayhereInitResponse;
import com.financemanager.backend.dto.payment.PaymentDto;
import com.financemanager.backend.entity.UserSubscription;
import com.financemanager.backend.service.PaymentService;
import com.financemanager.backend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payment")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping("/upgrade-plan/{userAccountId}")
    public ResponseEntity<APIResponse<PaymentDto>> upgradePlan(@PathVariable Long userAccountId, @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Payment Successful and plan upgraded",
                        paymentService.upgradePlan(userAccountId, email)
                )
        );
    }

    @GetMapping("/payhere")
    public ResponseEntity<APIResponse<PayhereInitResponse>> payWithPayhere(@AuthenticationPrincipal UserDetails userDetails){
        String email = userDetails.getUsername();
       return ResponseEntity.status(HttpStatus.OK).body(
                new APIResponse<>(
                        HttpStatus.OK.value(),
                        "Initiate Payhere Gateway",
                        paymentService.initiatePayherePayment(email)
                )
        );

    }

    @PostMapping("/process-payment")
    public ResponseEntity<String> processGooglePayPayment(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");

        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body("Payment token is missing.");
        }

        System.out.println("Received Google Pay token: " + token);

        if (token.startsWith("{")) {
            System.out.println("Token format seems correct. Simulating successful payment...");
            return ResponseEntity.ok("Payment test successful. Token received and validated.");
        } else {
            return ResponseEntity.badRequest().body("Invalid token format.");
        }
    }

}


