package com.financemanager.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
    private static final String TOKEN_TYPE = "token_type";
    private final PrivateKey privateKey;
    private final PublicKey publicKey;

    @Value("${app.security.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${app.security.jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    public JwtService() throws Exception {
        this.privateKey = KeyUtils.loadPrivateKey("keys/local-only/private_key.pem");
        this.publicKey = KeyUtils.loadPublicKey("keys/local-only/public_key.pem");
    }

    public String generateAccessToken(String username) {
        final Map<String, Object> claims = Map.of(TOKEN_TYPE, "ACCESS_TOKEN");
        return buildToken(username, claims, accessTokenExpiration);
    }

    public String generateRefreshToken(String username) {
        final Map<String, Object> claims = Map.of(TOKEN_TYPE, "REFRESH_TOKEN");
        return buildToken(username, claims, refreshTokenExpiration);
    }

    public String buildToken(String username, Map<String, Object> claims, long tokenExpiration) {
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + tokenExpiration))
                .signWith(this.privateKey)
                .compact();
    }

    public boolean isTokenValid(String token, String expectedUsername) {
        final String username = extractUsername(token);
        return username.equals(expectedUsername) && !isTokenExpired(token);
    }

    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    private Claims extractClaims(String token) {
        try{
            return Jwts.parser()
                    .verifyWith(this.publicKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        }catch (JwtException e){
            throw new JwtException("Invalid token", e);
        }
    }

    public String refreshAccessToken(String refreshToken) {
        Claims claims = extractClaims(refreshToken);
        if(!"REFRESH_TOKEN".equals(claims.get(TOKEN_TYPE))) {
            throw new JwtException("Invalid refresh token");
        }
        if(isTokenExpired(refreshToken)) {
            throw new JwtException("Refresh Token is expired");
        }

        final String username = claims.getSubject();
        return generateAccessToken(username);
    }

}
