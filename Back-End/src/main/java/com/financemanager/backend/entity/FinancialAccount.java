package com.financemanager.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.financemanager.backend.enumeration.FinancialAccountType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder

@Entity
@Table(name = "financial_account")
public class FinancialAccount extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_name", nullable = false)
    private String accountName;

    private String currency;

    @Column(precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type")
    private FinancialAccountType accountType;

    private String subtype;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "institution_name")
    private String institutionName;

    private String description;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToOne(mappedBy = "financialAccount", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private CreditCardDetails creditCardDetails;

    @OneToOne(mappedBy = "financialAccount", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private LoanDetails loanDetails;


    @ManyToOne
    @JoinColumn(name = "user_account_id", nullable = false)
    @JsonBackReference
    private UserAccount userAccount;

    @OneToMany(mappedBy = "financialAccount")
    private Set<Transaction> transactions;
}
