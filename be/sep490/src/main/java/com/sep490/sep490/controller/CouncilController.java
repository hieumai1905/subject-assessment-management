package com.sep490.sep490.controller;

import com.sep490.sep490.dto.CouncilDTO;
import com.sep490.sep490.dto.CouncilTeamDTO;
import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.SessionDTO;
import com.sep490.sep490.dto.councils.request.SearchCouncilRequest;
import com.sep490.sep490.dto.sessions.request.SearchSessionRequest;
import com.sep490.sep490.service.CouncilService;
import com.sep490.sep490.service.SessionsService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("councils")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "Authorization")
public class CouncilController {
    private final CouncilService councilService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @PostMapping("/create")
    public HttpResponse<?> create(@RequestBody CouncilDTO request) {
        return HttpResponse.ok(councilService.create(request));
    }

    @PostMapping("/search")
    public HttpResponse<?> search(@RequestBody SearchCouncilRequest request) {
        return HttpResponse.ok(councilService.search(request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @PutMapping("/update/{id}")
    public HttpResponse<?> update(@PathVariable("id") Integer id, @RequestBody CouncilDTO request) {
        return HttpResponse.ok(councilService.update(id, request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @DeleteMapping("/delete/{id}")
    public HttpResponse<?> delete(@PathVariable("id") Integer id) {
        councilService.delete(id);
        return HttpResponse.ok("Xóa hội đồng thành công");
    }

}

