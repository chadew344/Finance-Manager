package com.financemanager.backend.service;

import com.financemanager.backend.dto.UserAccountDto;

import java.util.Optional;

public interface UserAccountService {
    UserAccountDto create(UserAccountDto userAccountDto);
    Optional<UserAccountDto> findById(Long id);
    void delete(Long id);
    UserAccountDto update(Long id, UserAccountDto userAccountDto);
}
