package com.financemanager.backend.service.impl;

import com.financemanager.backend.dto.userProfile.request.ChangePasswordRequest;
import com.financemanager.backend.dto.userProfile.request.ProfileUpdateRequest;
import com.financemanager.backend.repository.UserRepository;
import com.financemanager.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    @Override
    public void updateProfileInfo(ProfileUpdateRequest request, String userId) {

    }

    @Override
    public void changePassword(ChangePasswordRequest request, String userId) {

    }

    @Override
    public void deactivateAccount(String userId) {

    }

    @Override
    public void reactivateAccount(String userId) {

    }

    @Override
    public void deleteAccount(String userId) {

    }


}
