package com.sep490.sep490.controller;

import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.SessionDTO;
import com.sep490.sep490.dto.SettingDTO;
import com.sep490.sep490.dto.sessions.request.SearchSessionRequest;
import com.sep490.sep490.dto.setting.request.SearchSettingRequest;
import com.sep490.sep490.service.SessionsService;
import com.sep490.sep490.service.SettingService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("sessions")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "Authorization")
public class SessionController {
    private final SessionsService sessionsService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @PostMapping("/create")
    public HttpResponse<?> create(@RequestBody SessionDTO request) {
        return HttpResponse.ok(sessionsService.create(request));
    }

    @PostMapping("/search")
    public HttpResponse<?> search(@RequestBody SearchSessionRequest request) {
        return HttpResponse.ok(sessionsService.search(request));
    }

    @PostMapping("/search-for-grand-final")
    public HttpResponse<?> searchForGrandFinal(@RequestBody SearchSessionRequest request) {
        return HttpResponse.ok(sessionsService.searchForGrandFinal(request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @PutMapping("/update/{id}")
    public HttpResponse<?> update(@PathVariable("id") Integer id, @RequestBody SessionDTO request) {
        return HttpResponse.ok(sessionsService.update(id, request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @DeleteMapping("/delete/{id}")
    public HttpResponse<?> delete(@PathVariable("id") Integer id) {
        sessionsService.delete(id);
        return HttpResponse.ok("Xóa phiên đánh giá thành công");
    }

}
