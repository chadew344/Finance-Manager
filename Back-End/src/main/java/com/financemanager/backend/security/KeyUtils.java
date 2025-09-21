package com.financemanager.backend.security;

import java.io.IOException;
import java.io.InputStream;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class KeyUtils {
    private KeyUtils() {}

    public static PrivateKey loadPrivateKey(String pemPath) throws Exception{
        final String key = readKeyFromResource(pemPath)
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");

        final  byte[] decodedKey = Base64.getDecoder().decode(key);
        final PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(decodedKey);
        return KeyFactory.getInstance("RSA").generatePrivate(keySpec);
    }

    public static PublicKey loadPublicKey(String pemPath) throws Exception{
        final String key = readKeyFromResource(pemPath)
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s+", "");

        final  byte[] decodedKey = Base64.getDecoder().decode(key);
        final X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decodedKey);
        return KeyFactory.getInstance("RSA").generatePublic(keySpec);
    }

    private static String readKeyFromResource(String pemPath) {
        try(final InputStream inputStream = KeyUtils.class.getClassLoader().getResourceAsStream(pemPath)) {
            if(inputStream == null) {
                throw new IllegalArgumentException("Resource not found: " + pemPath);
            }

            return new String(inputStream.readAllBytes());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
