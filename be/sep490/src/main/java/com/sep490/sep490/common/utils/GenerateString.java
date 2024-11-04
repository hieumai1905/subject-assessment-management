package com.sep490.sep490.common.utils;

import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class GenerateString {

    public static String randomCode(int length) {
        Random random = new Random();
        StringBuilder randomNumber = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int digit = random.nextInt(10);
            randomNumber.append(digit);
        }

        return randomNumber.toString();
    }

    public static String randomPassword() {
        String digits = generateRandomString(3, "0123456789");
        String lowercaseLetters = generateRandomString(2, "abcdefghijklmnopqrstuvwxyz");
        String uppercaseLetters = generateRandomString(2, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        String password = digits + lowercaseLetters + uppercaseLetters;
        password = shuffleString(password);
        return password;
    }

    private static String generateRandomString(int length, String characters) {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int randomIndex = random.nextInt(characters.length());
            sb.append(characters.charAt(randomIndex));
        }
        return sb.toString();
    }

    private static String shuffleString(String input) {
        char[] characters = input.toCharArray();
        Random random = new Random();
        for (int i = 0; i < characters.length; i++) {
            int randomIndex = random.nextInt(characters.length);
            char temp = characters[i];
            characters[i] = characters[randomIndex];
            characters[randomIndex] = temp;
        }
        return new String(characters);
    }
}
