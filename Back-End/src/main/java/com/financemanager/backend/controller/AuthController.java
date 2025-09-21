package com.financemanager.backend.controller;

import com.financemanager.backend.dto.auth.reponse.AuthenticationResponse;
import com.financemanager.backend.dto.auth.request.AuthenticationRequest;
import com.financemanager.backend.dto.auth.request.RegistrationRequest;
import com.financemanager.backend.security.JwtService;
import com.financemanager.backend.service.AuthService;
import com.financemanager.backend.util.APIResponse;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
@CrossOrigin()
@Slf4j
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;

    @Value("${app.security.jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    @PostMapping("/authenticate")
    public ResponseEntity<APIResponse<AuthenticationResponse>> authenticate( @RequestBody AuthenticationRequest request, HttpServletResponse response) {
        AuthenticationResponse tokens = authService.authenticate(request);
        createCookie(tokens, response);
        return  ResponseEntity.ok(new APIResponse<>(
                200,
                "OK",
                AuthenticationResponse.builder()
                        .accessToken(tokens.getAccessToken())
                        .build()
        ));

    }

    @PostMapping("/register")
    public ResponseEntity<APIResponse<AuthenticationResponse>> register(@RequestBody RegistrationRequest request, HttpServletResponse response) {
        AuthenticationResponse tokens = authService.register(request);
        createCookie(tokens, response);
        return  ResponseEntity.ok(new APIResponse<>(
                200,
                "OK",
                AuthenticationResponse.builder()
                        .accessToken(tokens.getAccessToken())
                        .build()
        ));
    }

    private void createCookie(AuthenticationResponse tokens, HttpServletResponse response) {
        final ResponseCookie cookie = ResponseCookie.from("refreshToken", tokens.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/api/v1/auth/refresh")
                .maxAge(refreshTokenExpiration)
                .sameSite("None")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @PostMapping("/refresh")
    public  ResponseEntity<APIResponse<AuthenticationResponse>> refresh(HttpServletRequest request, HttpServletResponse response) {
        final Cookie[] cookies = request.getCookies();
        String refreshToken = null;
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            final String newAccessToken = jwtService.refreshAccessToken(refreshToken);
            // Implement token rotation here by generating a new refresh token
//            final String newRefreshToken = jwtService.generateRefreshToken(jwtService.extractUsername(refreshToken));

            // Create the new HttpOnly cookie for the new refresh token
            final ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                    .httpOnly(true)
                    .secure(false)
                    .path("/api/v1/auth/refresh")
                    .maxAge(refreshTokenExpiration)
                    .sameSite("None")
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return  ResponseEntity.ok(new APIResponse<>(
                    200,
                    "OK",
                    AuthenticationResponse.builder()
                            .accessToken(newAccessToken)
                            .build()
            ));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<APIResponse<Void>> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/api/v1/auth/refresh")
                .maxAge(0)
                .sameSite("None")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(new APIResponse<>(
                200,
                "Logged out successfully",
                null
        ));
    }

}
