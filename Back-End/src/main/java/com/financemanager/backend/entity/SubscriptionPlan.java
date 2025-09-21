package com.financemanager.backend.entity;

import com.financemanager.backend.enumeration.SubscriptionPlanType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Entity
public class SubscriptionPlan extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SubscriptionPlanType type;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "max_users", nullable = false)
    private Integer maxUsers;

    private String description;
}
