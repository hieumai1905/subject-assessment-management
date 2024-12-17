package com.sep490.sep490.controller;

import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.UserDTO;
import com.sep490.sep490.dto.user.request.ChangePassRequest;
import com.sep490.sep490.dto.user.request.CreateUserRequest;
import com.sep490.sep490.dto.user.request.SearchUserRequest;
import com.sep490.sep490.dto.user.request.UpdateUserByAdminRequest;
import com.sep490.sep490.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.UnsupportedEncodingException;

@RestController
@RequestMapping("user")
@RequiredArgsConstructor
@Log4j2
@SecurityRequirement(name = "Authorization")
public class UserController {
    private final UserService userService;

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/create")
    public HttpResponse<?> createByAdmin(@RequestBody CreateUserRequest request) throws MessagingException, UnsupportedEncodingException {
        return HttpResponse.ok(userService.createByAdmin(request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/reset-password-by-admin")
    public HttpResponse<?> resetPasswordByAdmin(@RequestParam String email) throws MessagingException, UnsupportedEncodingException {
        userService.resetPasswordByAdmin(email);
        return HttpResponse.ok();
    }

    @PutMapping("/update/{id}")
    public HttpResponse<?> update(@PathVariable("id") Integer id, @ModelAttribute UserDTO request,
                                  @RequestPart(value = "file", required = false) MultipartFile file) {
        return HttpResponse.ok(userService.updateUser(id, request, file));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/update-by-admin/{id}")
    public HttpResponse<?> updateByAdmin(@PathVariable("id") Integer id,
                                  @RequestBody UpdateUserByAdminRequest request) {
        return HttpResponse.ok(userService.updateForAdmin(id, request));
    }

    @PutMapping("/change-password/{id}")
    public HttpResponse<?> changePass(@PathVariable("id") Integer id, @RequestBody ChangePassRequest request) {
        return HttpResponse.ok(userService.changePassword(id, request));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/reset-password/{id}")
    public HttpResponse<?> resetPass(@PathVariable("id") Integer id) throws MessagingException, UnsupportedEncodingException {
        return HttpResponse.ok(userService.resetPassword(id));
    }

    @GetMapping("/get-detail/{id}")
    public HttpResponse<?> getDetail(@PathVariable("id") Integer id) {
        return HttpResponse.ok(userService.get(id));
    }

//    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/get-all")
    public HttpResponse<?> getAll() {
        return HttpResponse.ok(userService.getAll());
    }

//    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/search")
    public HttpResponse<?> search(@RequestBody SearchUserRequest request) {
        return HttpResponse.ok(userService.search(request));
    }

    @GetMapping("/get/{id}")
    public HttpResponse<?> get(@PathVariable("id") Integer id) {
        return HttpResponse.ok(userService.getUserByRoleId(id));
    }

    @PutMapping("/change-avatar/{id}")
    public HttpResponse<?> get(@PathVariable("id") Integer id, MultipartFile file) {
        return HttpResponse.ok(userService.changeAvatar(id, file));
    }
}
