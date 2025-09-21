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
@Table(name = "loan_details")
public class LoanDetails {
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

    @Column(name = "original_loan_amount", precision = 15, scale = 2)
    private BigDecimal originalLoanAmount;

    @Column(name = "payment_due_date")
    private LocalDate paymentDueDate;

    @Column(name = "interest_rate", precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "loan_term_months")
    private Integer loanTermMonths;
}
