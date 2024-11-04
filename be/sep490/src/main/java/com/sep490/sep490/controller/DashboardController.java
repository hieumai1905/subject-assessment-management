package com.sep490.sep490.controller;

import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.service.DashboardService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("dashboard")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "Authorization")
public class DashboardController {
    private final DashboardService dashboardService;
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @GetMapping("/admin")
    public HttpResponse<?> getAdmin() {
        return HttpResponse.ok(dashboardService.getDashboardAdmin());
    }
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @GetMapping("/manager")
    public HttpResponse<?> getManager() {
        return HttpResponse.ok(dashboardService.getDashboardManager());
    }

    @GetMapping
    public HttpResponse<?> getDashboardData(@RequestParam Integer semesterId, @RequestParam Integer subjectId) {
        return HttpResponse.ok(dashboardService.getDashboardData(semesterId, subjectId));
    }
}
