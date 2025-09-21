package com.financemanager.backend.repository;

import com.financemanager.backend.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    Set<Tag> findByUserAccount_Id(Long userAccountId);
}
