package com.financemanager.backend.service.impl;

import com.financemanager.backend.dto.payment.PayhereInitResponse;
import com.financemanager.backend.service.PaymentService;
import com.financemanager.backend.util.PayHereHashGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    @Value("${payhere.merchant-id}")
    private String merchantId;
    @Value("${payhere.merchant-secret}")
    private String merchantSecret;

    @Override
    public void initiatePayment(Long userAccountId, Long planId, Long userId) {

    }

    @Override
    public PayhereInitResponse initiatePayherePayment(){
        String firstName = "John";
        String lastName = "Payne";
        String email = "john@gmal.com";
        String phoneNumber = "0760417785";
        String address = "No.1, Galle Road";
        String city = "Colombo";
        BigDecimal amount= BigDecimal.valueOf(1580);
        String formattedAmount = String.format("%.2f", BigDecimal.valueOf(1580));
        String subscriptionPackage = "My backend value for items";
        String orderId = "ItemNo12345";
        String currency = "LKR";

        String hash = PayHereHashGenerator.generateHash(merchantId, orderId, amount, currency, merchantSecret);
        System.out.println("Generated Hash: " + hash);

        return PayhereInitResponse.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .phoneNumber(phoneNumber)
                .address(address)
                .city(city)
                .amount(formattedAmount)
                .orderId(orderId)
                .subscriptionPackage(subscriptionPackage)
                .currency(currency)
                .hash(hash)
                .build();
    }

}
