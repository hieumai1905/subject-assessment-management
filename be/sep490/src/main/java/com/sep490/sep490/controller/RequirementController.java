package com.sep490.sep490.controller;

import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.RequirementDTO;
import com.sep490.sep490.dto.SearchReqEvalRequestDTO;
import com.sep490.sep490.dto.UpdateTrackingDTO;
import com.sep490.sep490.dto.requirement.request.*;
import com.sep490.sep490.service.RequirementService;
import com.sep490.sep490.service.WorkEvaluationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("requirements")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "Authorization")
public class RequirementController {

    private final RequirementService requirementService;
    private final WorkEvaluationService workEvaluationService;

    @PostMapping("/search")
    public HttpResponse<?> search(@RequestBody SearchRequirementRequest request) {
        return HttpResponse.ok(requirementService.searchRequirements(request));
    }

    @PostMapping("/search-for-submission")
    public HttpResponse<?> searchForSubmission(@RequestBody SearchRequirementRequest request) {
        return HttpResponse.ok(requirementService.searchForSubmission(request));
    }

//    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER', 'STUDENT')")
    @PostMapping
    public HttpResponse<?> create(@RequestBody RequirementDTO request) {
        return HttpResponse.ok(requirementService.create(request, null, null, true));
    }
//    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER', 'STUDENT')")
    @PostMapping("/add-list")
    public HttpResponse<?> addList(@RequestBody AddRequirementList request) {
        return HttpResponse.ok(requirementService.addRequirements(request));
    }
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    @PostMapping("/submit-work")
    public HttpResponse<?> submitWork(@ModelAttribute SubmitRequirementRequest request,
                                      @RequestPart(value = "file", required = false) MultipartFile file) {
        return HttpResponse.ok(requirementService.submitWork(request, file));
    }

//    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER', 'STUDENT')")
    @PutMapping
    public HttpResponse<?> update(@RequestBody UpdateRequirementRequest request) {
        return HttpResponse.ok(requirementService.update(request));
    }

//    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @DeleteMapping
    public HttpResponse<?> deleteAllByIds(@RequestBody List<Integer> ids) {
        requirementService.deleteByIds(ids);
        return HttpResponse.ok("Delete requirements successfully!");
    }

    @PostMapping("/get-by-class")
    public HttpResponse<?>getByClass(@RequestBody SearchReqByClass request){
        return HttpResponse.ok(requirementService.getByClass(request));
    }
//    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER', 'STUDENT')")
    @PutMapping("/move-requirements")
    public HttpResponse<?>moveRequirements(@RequestBody MoveRequirementRequest request){
        return HttpResponse.ok(requirementService.moveRequirements(request));
    }
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @PostMapping("/import-requirements-to-class")
    public HttpResponse<?>importRequirementsToClass(@RequestBody AddRequirementList request){
        return HttpResponse.ok(requirementService.importRequirementsToClass(request));
    }

    @GetMapping("/get-by-submission/{id}")
    public HttpResponse<?>getAllBySubmissionId(@PathVariable("id") Integer id){
        return HttpResponse.ok(requirementService.getAllBySubmissionId(id));
    }
    @GetMapping("/{id}")
    public HttpResponse<?> get(@PathVariable("id") Integer id) {
        return HttpResponse.ok(requirementService.get(id));
    }

    @PutMapping("/update-tracking/{reqId}")
    public HttpResponse<?> updateTracking(@PathVariable("reqId") Integer reqId, @RequestBody UpdateTrackingDTO request) {
        return HttpResponse.ok(requirementService.updateTracking(reqId, request));
    }
}
