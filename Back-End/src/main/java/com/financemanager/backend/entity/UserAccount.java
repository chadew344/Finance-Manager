package com.financemanager.backend.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.financemanager.backend.enumeration.UserAccountType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Entity
public class UserAccount extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private UserAccountType accountType;

    @Column(nullable = false)
    private boolean status;

    private String currency;

    @OneToMany(mappedBy = "userAccount")
    @JsonManagedReference
    private Set<SharedAccountUser> sharedUsers;

    @OneToMany(mappedBy = "userAccount")
    private Set<UserSubscription> subscriptions;

    @OneToMany(mappedBy = "userAccount")
    @JsonManagedReference
    private Set<FinancialAccount> financialAccounts;

    @OneToMany(mappedBy = "userAccount")
    private Set<Invitation> invitations;

    @OneToMany(mappedBy = "userAccount")
    private Set<Category> categories;

    @OneToMany(mappedBy = "userAccount")
    private Set<Tag> tags;

    @OneToMany(mappedBy = "userAccount")
    private Set<Budget> budgets;
}
