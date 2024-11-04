package com.sep490.sep490.controller;

import com.sep490.sep490.dto.CouncilDTO;
import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.councilTeam.request.ImportCouncilTeamsRequest;
import com.sep490.sep490.dto.councilTeam.request.SearchCouncilTeamRequest;
import com.sep490.sep490.dto.councilTeam.request.UpdateCouncilTeamsRequest;
import com.sep490.sep490.dto.councils.request.SearchCouncilRequest;
import com.sep490.sep490.service.CouncilTeamService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("council-team")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "Authorization")
public class CouncilTeamController {

    private final CouncilTeamService councilTeamService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @PutMapping("/update")
    public HttpResponse<?> update(@RequestBody UpdateCouncilTeamsRequest request) {
        return HttpResponse.ok(councilTeamService.update(request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @PostMapping("/import")
    public HttpResponse<?> importCouncilTeams(@RequestBody ImportCouncilTeamsRequest request) {
        return HttpResponse.ok(councilTeamService.importCouncilTeams(request));
    }

    @PostMapping("/search")
    public HttpResponse<?> search(@RequestBody SearchCouncilTeamRequest request) {
        return HttpResponse.ok(councilTeamService.search(request));
    }

    @GetMapping("/search-class/{semesterId}/{subjectId}")
    public HttpResponse<?> searchClasses(@PathVariable Integer semesterId, @PathVariable Integer subjectId) {
        return HttpResponse.ok(councilTeamService.searchClasses(semesterId, subjectId));
    }

    @GetMapping("/search-teams")
    public HttpResponse<?> searchTeams(@RequestParam Integer semesterId, @RequestParam Integer subjectId,
                                       @RequestParam(required = false) Integer classId) {
        return HttpResponse.ok(councilTeamService.searchTeams(semesterId, subjectId, classId));
    }
}
