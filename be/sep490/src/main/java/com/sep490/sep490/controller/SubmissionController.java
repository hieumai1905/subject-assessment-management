package com.sep490.sep490.controller;

import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.SettingDTO;
import com.sep490.sep490.dto.requirement.request.SubmitRequirementRequest;
import com.sep490.sep490.dto.setting.request.SearchSettingRequest;
import com.sep490.sep490.dto.submission.request.SearchSubmissionRequest;
import com.sep490.sep490.service.SettingService;
import com.sep490.sep490.service.SubmissionService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("submission")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "Authorization")
public class SubmissionController {
    private final SubmissionService submissionService;

    @PostMapping("/search")
    public HttpResponse<?> search(@RequestBody SearchSubmissionRequest request) {
        return HttpResponse.ok(submissionService.search(request));
    }
    @GetMapping("getDetail/{id}")
    public HttpResponse<?> get(@PathVariable("id") Integer id) {
        return HttpResponse.ok(submissionService.get(id));
    }
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    @PostMapping("/submit-work")
    public HttpResponse<?> submitWork(@ModelAttribute SubmitRequirementRequest request,
                                      @RequestPart(value = "file", required = false) MultipartFile file) {
        return HttpResponse.ok(submissionService.submitWork(request, file));
    }
}
