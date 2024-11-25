package com.sep490.sep490.controller;

import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.team_member.request.UpdateTeamMemberRequest;
import com.sep490.sep490.service.FirebaseStorageService;
import com.sep490.sep490.service.TeamMemberService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("team-members")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "Authorization")
public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @PutMapping
    public HttpResponse<?> update(@RequestBody UpdateTeamMemberRequest request) {
        teamMemberService.updateTeamMember(request);
        return HttpResponse.ok("Cập nhật thành viên trong nhóm thành công!");
    }

    @GetMapping("/find-by-team-id/{teamId}")
    public HttpResponse<?> getMembers(@PathVariable Integer teamId) {
        return HttpResponse.ok(teamMemberService.getMembers(teamId));
    }
}
