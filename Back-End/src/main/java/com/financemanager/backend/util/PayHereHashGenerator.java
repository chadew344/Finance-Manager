package com.financemanager.backend.util;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class PayHereHashGenerator {

    public static String generateHash(String merchantId, String orderId, BigDecimal amount,
                                      String currency, String merchantSecret) {
        try {
            String innerHash = md5Hash(merchantSecret).toUpperCase();

            String formattedAmount = String.format("%.2f", amount);

            String concatenated = merchantId + orderId + formattedAmount + currency + innerHash;

            String finalHash = md5Hash(concatenated).toUpperCase();

            System.out.println("Debug Hash Generation:");
            System.out.println(merchantSecret);
            System.out.println("Merchant ID: " + merchantId);
            System.out.println("Order ID: " + orderId);
            System.out.println("Formatted Amount: " + formattedAmount);
            System.out.println("Currency: " + currency);
            System.out.println("Inner Hash (MD5 of secret): " + innerHash);
            System.out.println("Concatenated String: " + concatenated);
            System.out.println("Final Hash: " + finalHash);

            return finalHash;

        } catch (Exception e) {
            throw new RuntimeException("Error generating hash", e);
        }
    }

    private static String md5Hash(String input) throws NoSuchAlgorithmException {
//        MessageDigest md = MessageDigest.getInstance("MD5");
//        byte[] messageDigest = md.digest(input.getBytes(StandardCharsets.UTF_8));
//
//        StringBuilder hexString = new StringBuilder();
//        for (byte b : messageDigest) {
//            hexString.append(String.format("%02x", b));
//        }
//        return hexString.toString();

        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            md.update(input.getBytes("UTF-8"));
            byte[] digest = md.digest();

            BigInteger bigInt = new BigInteger(1, digest);
            StringBuilder md5Hash = new StringBuilder(bigInt.toString(16));

            while (md5Hash.length() < 32) {
                md5Hash.insert(0, "0");
            }
            return md5Hash.toString();

        } catch (NoSuchAlgorithmException e) {
            System.err.println("MD5 algorithm not found: " + e.getMessage());
            return null;
        } catch (java.io.UnsupportedEncodingException e) {
            System.err.println("UTF-8 encoding not supported: " + e.getMessage());
            return null;
        }
    }

}

//$hash = strtoupper(
//    md5(
//        $merchant_id .
//        $order_id .
//        number_format($amount, 2, '.', '') .
//        $currency .
//        strtoupper(md5($merchant_secret))
//    )
//);