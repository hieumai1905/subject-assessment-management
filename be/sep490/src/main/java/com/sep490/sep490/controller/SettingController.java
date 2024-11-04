package com.sep490.sep490.controller;

import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.SettingDTO;
import com.sep490.sep490.dto.setting.request.SearchSettingRequest;
import com.sep490.sep490.service.SettingService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("setting")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "Authorization")
public class SettingController {
    private final SettingService settingService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @PostMapping("/create")
    public HttpResponse<?> create(@RequestBody SettingDTO request) {
        return HttpResponse.ok(settingService.create(request));
    }

    @PostMapping("/search")
    public HttpResponse<?> search(@RequestBody SearchSettingRequest request) {
        return HttpResponse.ok(settingService.search(request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @PutMapping("/update/{id}")
    public HttpResponse<?> update(@PathVariable("id") Integer id, @RequestBody SettingDTO request) {
        return HttpResponse.ok(settingService.update(id, request));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public HttpResponse<?> delete(@PathVariable("id") Integer id) {
        settingService.delete(id);
        return HttpResponse.ok("Delete setting successfully!");
    }

    // TODO: 6/5/2024 Get setting by ID (Assign ToanNK)
    @GetMapping("/get/{semester}")
    public HttpResponse<?> get(@PathVariable("semester") String semester) {
        return HttpResponse.ok(settingService.getSemester(semester));
    }


//
//    @PutMapping("/change-password/{id}")
//    public HttpResponse<?> changePass(@PathVariable("id") Integer id, @RequestBody ChangePassRequest request) {
//        return HttpResponse.ok(userService.changePassword(id, request));
//    }
//
//    @PreAuthorize("hasAuthority('ADMIN')")
//    @PutMapping("/reset-password/{id}")
//    public HttpResponse<?> resetPass(@PathVariable("id") Integer id) {
//        return HttpResponse.ok(userService.resetPassword(id));
//    }
//
//    @GetMapping("/get-detail/{id}")
//    public HttpResponse<?> getDetail(@PathVariable("id") Integer id) {
//        return HttpResponse.ok(userService.get(id));
//    }

}
