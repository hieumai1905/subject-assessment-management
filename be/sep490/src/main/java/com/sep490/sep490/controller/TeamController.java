package com.sep490.sep490.controller;

import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.TeamDTO;
import com.sep490.sep490.dto.classes.request.SearchClassForGrandFinal;
import com.sep490.sep490.dto.team.ImportTeamListRequest;
import com.sep490.sep490.dto.team.request.SearchTeamRequest;
import com.sep490.sep490.service.TeamService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("teams")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "Authorization")
public class TeamController {

    private final TeamService teamService;

    @PostMapping("/search")
    public HttpResponse<?> search(@RequestBody SearchTeamRequest request) {
        return HttpResponse.ok(teamService.search(request));
    }
    @PostMapping("/search-for-grand-final")
    public HttpResponse<?> searchForGrandFinal(@RequestBody SearchClassForGrandFinal request) {
        return HttpResponse.ok(teamService.searchForGrandFinal(request));
    }
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @PostMapping("/import-teams")
    public HttpResponse<?> importTeams(@RequestBody ImportTeamListRequest request) {
        return HttpResponse.ok(teamService.importTeams(request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER', 'STUDENT')")
    @PutMapping("/update-team-leader")
    public HttpResponse<?> updateTeamLeader(@RequestParam Integer teamId, @RequestParam Integer leaderId) {
        teamService.updateTeamLeader(teamId, leaderId);
        return HttpResponse.ok("Update team leader successfully!");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @PutMapping("/close-update/{milestoneId}")
    public HttpResponse<?> closeUpdate(@PathVariable Integer milestoneId) {
        teamService.closeUpdate(milestoneId);
        return HttpResponse.ok("Close update successfully!");
    }

    @GetMapping("/get-teams-progression-by-milestone/{milestoneId}")
    public HttpResponse<?> getTeamsProgressionByMilestone(@PathVariable("milestoneId") Integer milestoneId) {
        return HttpResponse.ok(teamService.getTeamsProgressionByMilestone(milestoneId));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @GetMapping("/clone-from")
    public HttpResponse<?> cloneTeams(@RequestParam Integer milestoneId, @RequestParam Integer cloneMilestoneId) {
        return HttpResponse.ok(teamService.cloneTeamsInOtherMilestone(milestoneId, cloneMilestoneId));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @PostMapping
    public HttpResponse<?> create(@RequestBody TeamDTO request) {
        return HttpResponse.ok(teamService.create(request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @PutMapping("{id}")
    public HttpResponse<?> update(@PathVariable("id") Integer id, @RequestBody TeamDTO request) {
        return HttpResponse.ok(teamService.update(id, request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @DeleteMapping("{id}")
    public HttpResponse<?> delete(@PathVariable("id") Integer id) {
        teamService.delete(id);
        return HttpResponse.ok("Delete team successfully!");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @PutMapping("/reset-teams/{milestoneId}")
    public HttpResponse<?> resetTeams(@PathVariable Integer milestoneId) {
        return HttpResponse.ok(teamService.resetTeams(milestoneId));
    }
}
