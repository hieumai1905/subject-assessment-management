package com.sep490.sep490.controller;

import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.MilestoneDTO;
import com.sep490.sep490.dto.milestone.request.MilestoneRequest;
import com.sep490.sep490.dto.milestone.request.SearchMilestoneRequest;
import com.sep490.sep490.dto.milestone.request.UpdateMilestoneRequest;
import com.sep490.sep490.service.MilestoneService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("milestone")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "Authorization")
public class MilestoneController {
    private final MilestoneService milestoneService;
    @PostMapping("/search")
    public HttpResponse<?> search(@RequestBody SearchMilestoneRequest request) {
        return HttpResponse.ok(milestoneService.search(request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @PostMapping("/create")
    public HttpResponse<?> create(@RequestBody MilestoneRequest request) {
        return HttpResponse.ok(milestoneService.create(request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @PutMapping("/update/{id}")
    public HttpResponse<?> update(@PathVariable("id") Integer id, @RequestBody UpdateMilestoneRequest request) {
        return HttpResponse.ok(milestoneService.update(id, request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @PutMapping("/change-status")
    public HttpResponse<?> changeStatus(@RequestParam("id") Integer id, @RequestParam("active") Boolean active) {
        return HttpResponse.ok(milestoneService.changeMilestoneStatus(id, active));
    }

//    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
//    @DeleteMapping("/delete/{id}")
//    public HttpResponse<?> delete(@PathVariable("id") Integer id) {
//        milestoneService.delete(id);
//        return HttpResponse.ok("Delete milestone successfully!");
//    }

//    @GetMapping("/get-by-id/{id}")
//    public HttpResponse<?> getById(@PathVariable("id") Integer id) {
//        return HttpResponse.ok(milestoneService.get(id));
//    }

    @GetMapping("/get-by-id/{id}")
    public HttpResponse<?> getById(@PathVariable("id") Integer id) {
        return HttpResponse.ok(milestoneService.getMilestoneDetails(id));
    }
}
