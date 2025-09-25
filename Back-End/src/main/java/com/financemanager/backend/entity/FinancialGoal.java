package com.financemanager.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder

@Entity
public class FinancialGoal extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    private BigDecimal targetAmount;

    private BigDecimal currentAmount;

    private LocalDateTime deadline;

    @ManyToOne
    @JoinColumn(name = "user_account_id", nullable = false)
    private UserAccount userAccount;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
