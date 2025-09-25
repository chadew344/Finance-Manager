package com.financemanager.backend.service;

import com.financemanager.backend.dto.UserAccountDto;
import com.financemanager.backend.dto.invitation.InvitationRequest;
import com.financemanager.backend.dto.userAccount.InitUserManageResponse;

import java.util.Optional;

public interface UserAccountService {
    Optional<UserAccountDto> findById(Long id);
    void delete(Long id);
    UserAccountDto update(Long id, UserAccountDto userAccountDto);
    InitUserManageResponse initUserManage(Long userAccountId);

    Boolean checkEmail(String inviteeEmail);

    String inviteUser(InvitationRequest invitationRequest, String senderEmail);
}
