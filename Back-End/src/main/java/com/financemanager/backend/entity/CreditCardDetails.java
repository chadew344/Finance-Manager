package com.financemanager.backend.entity;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "credit_card_details")
public class CreditCardDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    private FinancialAccount financialAccount;

//    @OneToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "financial_account_id", referencedColumnName = "id", nullable = false)
//    @JsonBackReference
//    private FinancialAccount financialAccount;

    @Column(name = "credit_limit", precision = 15, scale = 2)
    private BigDecimal creditLimit;

    @Column(name = "payment_due_date")
    private LocalDate paymentDueDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "apr", precision = 5, scale = 2)
    private BigDecimal apr;
}
