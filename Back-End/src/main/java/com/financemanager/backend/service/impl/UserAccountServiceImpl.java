package com.financemanager.backend.service.impl;

import com.financemanager.backend.dto.UserAccountDto;
import com.financemanager.backend.repository.UserAccountRepository;
import com.financemanager.backend.service.UserAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserAccountServiceImpl implements UserAccountService {
    private final UserAccountRepository userAccountRepository;

    @Override
    public UserAccountDto create(UserAccountDto userAccountDto) {
        return null;
    }

    @Override
    public Optional<UserAccountDto> findById(Long id) {
        return Optional.empty();
    }

    @Override
    public void delete(Long id) {

    }

    @Override
    public UserAccountDto update(Long id, UserAccountDto userAccountDto) {
        return null;
    }
}
