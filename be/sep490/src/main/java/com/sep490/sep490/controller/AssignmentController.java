package com.sep490.sep490.controller;

import com.sep490.sep490.dto.AssignmentDTO;
import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.assignment.request.AssignmentRequest;
import com.sep490.sep490.dto.assignment.request.CreateAssignmentRequest;
import com.sep490.sep490.dto.assignment.request.SearchAssignmentRequest;
import com.sep490.sep490.service.AssignmentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("assignment")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "Authorization")
public class AssignmentController {
    private final AssignmentService assignmentService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @PutMapping("/update-list")
    public HttpResponse<?> update(@RequestBody CreateAssignmentRequest request) {
        return HttpResponse.ok(assignmentService.updateList(request));
    }

    @PostMapping("/search")
    public HttpResponse<?> search(@RequestBody SearchAssignmentRequest request) {
        return HttpResponse.ok(assignmentService.search(request));
    }

    @GetMapping("/get-by-id/{id}")
    public HttpResponse<?> getById(@PathVariable("id") Integer id) {
        return HttpResponse.ok(assignmentService.getAssignmentById(id));
    }
}
