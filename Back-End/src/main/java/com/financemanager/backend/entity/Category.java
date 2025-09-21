package com.financemanager.backend.entity;

import com.financemanager.backend.enumeration.TransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;


@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Builder

@Entity
public class Category extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @ManyToOne
    @JoinColumn(name = "user_account_id", nullable = false)
    private UserAccount userAccount;

    @OneToMany(mappedBy = "category")
    private Set<Transaction> transactions;
}