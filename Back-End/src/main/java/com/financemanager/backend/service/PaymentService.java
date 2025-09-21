package com.financemanager.backend.service;

import com.financemanager.backend.dto.payment.PayhereInitResponse;

public interface PaymentService {
    void initiatePayment(Long userAccountId, Long planId, Long userId);
    PayhereInitResponse initiatePayherePayment();
}
