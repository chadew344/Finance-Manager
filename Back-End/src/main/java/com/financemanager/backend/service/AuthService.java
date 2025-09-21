package com.financemanager.backend.service;

import com.financemanager.backend.dto.PhoneNumberDto;
import com.financemanager.backend.dto.auth.reponse.AuthenticationResponse;
import com.financemanager.backend.dto.auth.request.AuthenticationRequest;
import com.financemanager.backend.dto.auth.request.RegistrationRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    AuthenticationResponse register(RegistrationRequest request);
    AuthenticationResponse authenticate(AuthenticationRequest request);
    void refreshToken(HttpServletRequest request, HttpServletResponse response);
    boolean isValidPhoneNumber(PhoneNumberDto dto);
    String formatPhoneNumberE164(PhoneNumberDto dto);
}
