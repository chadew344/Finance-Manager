package com.financemanager.backend.dto.payment;

import lombok.*;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder
public class PayhereInitResponse {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private String city;
    private String amount;
    private String orderId;
    private String subscriptionPackage;
    private String currency = "LKR";
    private String hash;
}

//   phone: "0771234567",
//    address: "No.1, Galle Road",
//    city: "Colombo",
//    country: "Sri Lanka",