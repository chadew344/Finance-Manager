package com.financemanager.backend.service.impl;

import com.financemanager.backend.dto.payment.PayhereInitResponse;
import com.financemanager.backend.dto.payment.PaymentDto;
import com.financemanager.backend.entity.*;
import com.financemanager.backend.enumeration.PaymentStatus;
import com.financemanager.backend.enumeration.SubscriptionPlanType;
import com.financemanager.backend.enumeration.SubscriptionStatus;
import com.financemanager.backend.exception.BusinessException;
import com.financemanager.backend.exception.ErrorCode;
import com.financemanager.backend.mapper.PaymentMapper;
import com.financemanager.backend.repository.*;
import com.financemanager.backend.service.PaymentService;
import com.financemanager.backend.util.PayHereHashGenerator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    private final UserRepository userRepository;
    private final UserAccountRepository userAccountRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    @Value("${payhere.merchant-id}")
    private String merchantId;
    @Value("${payhere.merchant-secret}")
    private String merchantSecret;

    @Override
    public void initiatePayment(Long userAccountId, Long planId, Long userId) {

    }

    @Override
    public PayhereInitResponse initiatePayherePayment(String email){
        User currentUser = currentUser(email);
        SubscriptionPlan plan = getSubscriptionPlan();

        String address = "No.1, Galle Road";
        String city = "Colombo";
        BigDecimal amount= plan.getPrice();
        String formattedAmount = String.format("%.2f", amount);
        String orderId = "ItemNo12345";
        String currency = "LKR";

        String hash = PayHereHashGenerator.generateHash(merchantId, orderId, amount, currency, merchantSecret);
        System.out.println("Generated Hash: " + hash);

        return PayhereInitResponse.builder()
                .firstName(currentUser.getFirstName())
                .lastName(currentUser.getLastName())
                .email(currentUser.getEmail())
                .phoneNumber(currentUser.getPhone())
                .address(address)
                .city(city)
                .amount(formattedAmount)
                .orderId(orderId)
                .subscriptionPackage(plan.getName())
                .currency(currency)
                .hash(hash)
                .build();
    }

    @Transactional
    @Override
    public PaymentDto upgradePlan(Long userAccountId, String email) {
        UserAccount userAccount = userAccountRepository.findById(userAccountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_ACCOUNT_NOT_FOUND, "User account not found"));

        cancelCurrentPlan(userAccountId);

        User currentUser = currentUser(email);

        SubscriptionPlan upgradePlan = subscriptionPlanRepository.findByType(SubscriptionPlanType.PERSONAL_PRO)
                .orElseThrow(() -> new BusinessException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));

        UserSubscription subscription = UserSubscription.builder()
                .userAccount(userAccount)
                .subscriptionPlan(upgradePlan)
                .startTime(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusMonths(1))
                .status(SubscriptionStatus.ACTIVE)
                .build();

        UserSubscription newUserSubscription = userSubscriptionRepository.save(subscription);

        Payment payment = Payment.builder()
                .amount(upgradePlan.getPrice())
                .status(PaymentStatus.SUCCESS)
                .transactionId(UUID.randomUUID().toString())
                .userSubscription(newUserSubscription)
                .user(currentUser)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        return paymentMapper.toDto(savedPayment);
    }


    private void cancelCurrentPlan(Long userAccountId){
        UserSubscription activeSubscription = userSubscriptionRepository
                .findByUserAccountIdAndStatus(userAccountId, SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND, "Failed to find current active plan."));

        activeSubscription.setStatus(SubscriptionStatus.CANCELED);
    }

    private User currentUser(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private SubscriptionPlan getSubscriptionPlan(){
        return subscriptionPlanRepository
                .findByType(SubscriptionPlanType.PERSONAL_PRO).orElseThrow(() -> new BusinessException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));

    }

}
