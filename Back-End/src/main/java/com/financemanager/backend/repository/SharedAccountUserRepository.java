package com.financemanager.backend.repository;

import com.financemanager.backend.entity.SharedAccountUser;
import com.financemanager.backend.entity.UserAccount;
import com.financemanager.backend.enumeration.SharedUserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SharedAccountUserRepository extends JpaRepository<SharedAccountUser,Long> {
    @Query("SELECT s.userAccount FROM SharedAccountUser s WHERE s.role = :role AND s.user.id = :userId")
    Optional<UserAccount> findUserAccountByRoleAndUserId(@Param("role") SharedUserRole role,
                                                         @Param("userId") Long userId);

    List<SharedAccountUser> findByUserAccount_Id(Long userAccountId);

}
