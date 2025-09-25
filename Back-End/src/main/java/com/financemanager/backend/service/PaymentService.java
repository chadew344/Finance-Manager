package com.financemanager.backend.service;

import com.financemanager.backend.dto.payment.PayhereInitResponse;
import com.financemanager.backend.dto.payment.PaymentDto;
import com.financemanager.backend.entity.UserSubscription;

public interface PaymentService {
    void initiatePayment(Long userAccountId, Long planId, Long userId);
    PayhereInitResponse initiatePayherePayment(String email);

    PaymentDto upgradePlan(Long userAccountId, String email);
}
