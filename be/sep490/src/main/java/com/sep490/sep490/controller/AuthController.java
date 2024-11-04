package com.sep490.sep490.controller;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.user.request.*;
import com.sep490.sep490.entity.User;
import com.sep490.sep490.service.UserService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.net.URI;


@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @Value("${myvalue.active-account.login-url}")
    private String loginUrl;

    @PostMapping("/register")
    public HttpResponse<?> register(@RequestBody UserRegisterRequest request) throws MessagingException, UnsupportedEncodingException {
        return HttpResponse.ok(userService.register(request));
    }

    @PostMapping("/send-code-forgot-pass")
    public HttpResponse<?> sendCodeForgotPass(@RequestBody SendEmailCodeRequest request) throws MessagingException, UnsupportedEncodingException {
        return HttpResponse.ok(userService.sendCodeForgotPass(request));
    }

    @PostMapping("/check-input-code")
    public HttpResponse<?> checkInputCode(@RequestBody CheckPassForgotRequest request) {
        return HttpResponse.ok(userService.checkInputCodeForgotPass(request));
    }

    @GetMapping("/verified-account")
    public ResponseEntity<?> activeAccount(@RequestParam("email") String email) {
        User foundUser = userService.activeAccount(email);
//        URI redirectUri = URI.create(Constants.Link.LOGIN_AWS);
//        URI redirectUri = URI.create(Constants.Link.LOGIN_LOCAL);
        URI redirectUri = URI.create(loginUrl);
        return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();
    }

    @PostMapping("/new-pass-after-forgot")
    public HttpResponse<?> newPassAfterForgot(@RequestBody NewPassAfterForgot request) {
        return HttpResponse.ok(userService.newPassAfterForgot(request));
    }

    @PostMapping("/login")
    public HttpResponse<?> login(@RequestBody LoginRequest request) {
        return HttpResponse.ok(userService.loginByUsernamePass(request));
    }

    @PostMapping("/login-by-google")
    public HttpResponse<?> login(@RequestBody LoginGoogleRequest request) throws MessagingException, UnsupportedEncodingException {
        return HttpResponse.ok(userService.loginByGoogle(request));
    }
}
