package com.financemanager.backend.service.impl;

import com.financemanager.backend.dto.PhoneNumberDto;
import com.financemanager.backend.dto.auth.reponse.AuthenticationResponse;
import com.financemanager.backend.dto.auth.request.AuthenticationRequest;
import com.financemanager.backend.dto.auth.request.RegistrationRequest;
import com.financemanager.backend.entity.SharedAccountUser;
import com.financemanager.backend.entity.User;
import com.financemanager.backend.entity.UserAccount;
import com.financemanager.backend.enumeration.SharedUserRole;
import com.financemanager.backend.exception.BusinessException;
import com.financemanager.backend.exception.ErrorCode;
import com.financemanager.backend.repository.SharedAccountUserRepository;
import com.financemanager.backend.repository.UserAccountRepository;
import com.financemanager.backend.repository.UserRepository;
import com.financemanager.backend.security.JwtService;
import com.financemanager.backend.service.AuthService;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final UserAccountRepository userAccountRepository;
    private final SharedAccountUserRepository sharedAccountUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PhoneNumberUtil phoneNumberUtil;

    @Transactional
    @Override
    public AuthenticationResponse register(RegistrationRequest request) {
        log.info("Starting registration process for email: {}", request.getEmail());
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("Registration failed: email {} already exists", request.getEmail());
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXIST);
        }
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                // .role(Role.USER)
                .isActive(true)
                .build();

        userRepository.save(user);
        log.debug("User saved successfully with email: {}", user.getEmail());

        UserAccount userAccount = new UserAccount();
        userAccount.setName(request.getLastName() + request.getUserAccountType().toString());
        userAccount.setAccountType(request.getUserAccountType());
        userAccount.setStatus(true);

        userAccount =  userAccountRepository.save(userAccount);
        log.debug("UserAccount created with id: {} for email: {}", userAccount.getId(), user.getEmail());

        SharedAccountUser sharedAccountUser  = new SharedAccountUser();
        sharedAccountUser.setUserAccount(userAccount);
        sharedAccountUser.setUser(user);
        sharedAccountUser.setRole(SharedUserRole.OWNER);

        sharedAccountUserRepository.save(sharedAccountUser);
        log.debug("SharedAccountUser mapping created for user: {} with accountId: {}", user.getEmail(), userAccount.getId());

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());
        log.info("Registration successful for email: {}", request.getEmail());

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public void refreshToken(HttpServletRequest request, HttpServletResponse response) {

    }

    @Override
    public boolean isValidPhoneNumber(PhoneNumberDto dto) {
        try {
            Phonenumber.PhoneNumber parsedNumber = phoneNumberUtil.parse(dto.getPhoneNumber(), dto.getCountryCode().toUpperCase());
            return phoneNumberUtil.isValidNumber(parsedNumber);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.INVALID_PHONE_NUMBER);
        }
    }

    @Override
    public String formatPhoneNumberE164(PhoneNumberDto dto) {
        try {
            Phonenumber.PhoneNumber parsedNumber = phoneNumberUtil.parse(dto.getPhoneNumber(), dto.getCountryCode());
            return phoneNumberUtil.format(parsedNumber, PhoneNumberUtil.PhoneNumberFormat.E164);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.INVALID_PHONE_NUMBER);
        }
    }
}
