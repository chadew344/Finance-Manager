package com.financemanager.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.financemanager.backend.enumeration.SharedUserRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Entity
public class SharedAccountUser extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SharedUserRole role; // 'OWNER', 'MEMBER'

    @ManyToOne
    @JoinColumn(name = "user_account_id", nullable = false)
    @JsonBackReference
    private UserAccount userAccount;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

}

