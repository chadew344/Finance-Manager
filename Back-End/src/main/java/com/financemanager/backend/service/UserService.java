package com.financemanager.backend.service;

import com.financemanager.backend.dto.userProfile.request.ChangePasswordRequest;
import com.financemanager.backend.dto.userProfile.request.ProfileUpdateRequest;

public interface UserService {
    void updateProfileInfo(ProfileUpdateRequest request, String userId);
    void changePassword(ChangePasswordRequest request, String userId);
    void deactivateAccount(String userId);
    void reactivateAccount(String userId);
    void deleteAccount(String userId);
}
