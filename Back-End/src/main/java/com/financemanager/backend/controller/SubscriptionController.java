package com.financemanager.backend.controller;

import com.financemanager.backend.dto.subscription.SubscriptionPlanDto;
import com.financemanager.backend.service.SubscriptionPlanService;
import com.financemanager.backend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/subscription")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class SubscriptionController {
    private final SubscriptionPlanService subscriptionPlanService;

    @PostMapping("/create")
    public ResponseEntity<APIResponse<SubscriptionPlanDto>> create(@RequestBody SubscriptionPlanDto planDto) {
        SubscriptionPlanDto subscriptionPlan = subscriptionPlanService.createSubscriptionPlan(planDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new APIResponse<>(
                        HttpStatus.CREATED.value(),
                        "Subscription Plan Created",
                        subscriptionPlan
                )
        );
    }
}