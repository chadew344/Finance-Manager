package com.financemanager.backend.service.impl;

import com.financemanager.backend.dto.UserAccountDto;
import com.financemanager.backend.dto.invitation.InvitationRequest;
import com.financemanager.backend.dto.userAccount.CurrentPlanDto;
import com.financemanager.backend.dto.userAccount.InitUserManageResponse;
import com.financemanager.backend.dto.userAccount.SharedUserDto;
import com.financemanager.backend.entity.SharedAccountUser;
import com.financemanager.backend.entity.User;
import com.financemanager.backend.entity.UserSubscription;
import com.financemanager.backend.enumeration.SharedUserRole;
import com.financemanager.backend.enumeration.SubscriptionPlanType;
import com.financemanager.backend.enumeration.SubscriptionStatus;
import com.financemanager.backend.enumeration.UserStatus;
import com.financemanager.backend.exception.BusinessException;
import com.financemanager.backend.exception.ErrorCode;
import com.financemanager.backend.repository.SharedAccountUserRepository;
import com.financemanager.backend.repository.UserAccountRepository;
import com.financemanager.backend.repository.UserRepository;
import com.financemanager.backend.repository.UserSubscriptionRepository;
import com.financemanager.backend.service.UserAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserAccountServiceImpl implements UserAccountService {
    private final UserRepository userRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final SharedAccountUserRepository sharedAccountUserRepository;
    private final SimpMessagingTemplate messagingTemplate;

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

    @Override
    public InitUserManageResponse initUserManage(Long userAccountId) {
        List<SharedAccountUser> sharedAccountUserList = sharedAccountUserRepository.findByUserAccount_Id(userAccountId);
        List<SharedUserDto> sharedUsers  = getSharedUserDto(sharedAccountUserList);
        CurrentPlanDto currentPlan = getCurrentPlanDto(userAccountId, sharedUsers.size());
        return InitUserManageResponse.builder()
                .sharedUser(sharedUsers)
                .currentPlan(currentPlan)
                .build();
    }

    @Override
    public Boolean checkEmail(String inviteeEmail) {
        System.out.println("INVITE_EMAIL: " + inviteeEmail);
        User user = userRepository.findByEmail(inviteeEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "No account found with this email address."));

        System.out.println(user.getEmail());

        return true;
    }

    @Override
    public String inviteUser(InvitationRequest invitationRequest, String senderEmail) {
        System.out.println("Invitee " + invitationRequest.getInviteeEmail());
        messagingTemplate.convertAndSend("topic", "Sending Email " + invitationRequest.getInviteeEmail());
        return "Sent";
    }

    private  List<SharedUserDto> getSharedUserDto(List<SharedAccountUser> sharedAccountUserList) {
        List<SharedUserDto>  sharedUserDtoList = new ArrayList<>();

        for (SharedAccountUser sharedAccountUser : sharedAccountUserList) {
            if(sharedAccountUser.getStatus() == UserStatus.REMOVED){
                continue;
            }
            sharedUserDtoList.add(SharedUserDto.builder()
                    .id(sharedAccountUser.getId())
                    .firstName(sharedAccountUser.getUser().getFirstName())
                    .lastName(sharedAccountUser.getUser().getLastName())
                    .email(sharedAccountUser.getUser().getEmail())
                    .userStatus(sharedAccountUser.getStatus())
                    .role(sharedAccountUser.getRole())
                    .build());
        }

        return sharedUserDtoList;
    }

    private CurrentPlanDto getCurrentPlanDto(Long userAccountId, int currentUsers) {
        UserSubscription activeSubscription = userSubscriptionRepository
                .findByUserAccountIdAndStatus(userAccountId, SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));

        return CurrentPlanDto.builder()
                .type(activeSubscription.getSubscriptionPlan().getType())
                .maxUsers(activeSubscription.getSubscriptionPlan().getMaxUsers())
                .currentUsers(currentUsers)
                .build();

    }


    public SubscriptionPlanType getActiveSubscriptionPlanType(Long userAccountId) {
        Optional<UserSubscription> activeSubscription = userSubscriptionRepository
                .findByUserAccountIdAndStatus(userAccountId, SubscriptionStatus.ACTIVE);
        return activeSubscription.map(userSubscription -> userSubscription.getSubscriptionPlan().getType())
                .orElseThrow(() -> new BusinessException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND, "Subscription Plan not found"));
    }
}

