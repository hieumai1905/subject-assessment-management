package com.sep490.sep490.controller;

import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.councilTeam.request.UpdateCouncilTeamStatus;
import com.sep490.sep490.dto.evaluation.request.EvaluateReqForGrandFinal;
import com.sep490.sep490.dto.evaluation.request.EvaluateStudentForGrandFinal;
import com.sep490.sep490.dto.evaluation.request.RequirementEvaluationRequest;
import com.sep490.sep490.dto.evaluation.request.SearchEvalForGrandFinal;
import com.sep490.sep490.dto.studentEvaluation.request.StudentEvalRequest;
import com.sep490.sep490.dto.studentEvaluation.request.StudentEvalSearchRequest;
import com.sep490.sep490.dto.work_evaluation.request.EvaluateRequirementRequest;
import com.sep490.sep490.service.StudentEvaluationService;
import com.sep490.sep490.service.WorkEvaluationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("evaluation")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "Authorization")
public class EvaluationController {

    private final StudentEvaluationService evaluationService;
    private final WorkEvaluationService workEvaluationService;

    @PostMapping("/search-student-evaluation")
    public HttpResponse<?> searchStudentEval(@RequestBody StudentEvalSearchRequest request) {
        return HttpResponse.ok(evaluationService.searchStudentEval(request));
    }

    @GetMapping("/search-student-evaluation-by-class/{classId}")
    public HttpResponse<?> searchByClass(@PathVariable Integer classId) {
        return HttpResponse.ok(evaluationService.searchByClass(classId));
    }

    @PreAuthorize("hasAnyAuthority('TEACHER')")
    @PostMapping("/evaluate-student")
    public HttpResponse<?> evaluateStudent(@RequestBody List<StudentEvalRequest> request) {
        return HttpResponse.ok(evaluationService.evaluateStudent(request));
    }

    @PostMapping("/search-requirement-evaluation")
    public HttpResponse<?> searchRequirementEvaluation(@RequestBody StudentEvalSearchRequest request) {
        return HttpResponse.ok(workEvaluationService.searchWorkEvaluation(request));
    }

    @PreAuthorize("hasAnyAuthority('TEACHER')")
    @PostMapping("/evaluate-requirement/{milestoneId}")
    public HttpResponse<?> evaluateRequirement(@PathVariable Integer milestoneId,
                                               @RequestBody List<EvaluateRequirementRequest> request) {
        return HttpResponse.ok(workEvaluationService.evaluateRequirement(milestoneId, request));
    }

    @PostMapping("/search-student-eval-for-grand-final")
    public HttpResponse<?> searchStudentEvalForGrandFinal(@RequestBody SearchEvalForGrandFinal request) {
        return HttpResponse.ok(evaluationService.searchStudentEvalForGrandFinal(request));
    }
    @PreAuthorize("hasAnyAuthority('TEACHER')")
    @PostMapping("/evaluate-student-eval-for-grand-final")
    public HttpResponse<?> evaluateStudentForGrandFinal(@RequestBody EvaluateStudentForGrandFinal request) {
        return HttpResponse.ok(evaluationService.evaluateStudentForGrandFinal(request));
    }
    @PostMapping("/search-requirement-eval-for-grand-final")
    public HttpResponse<?> searchReqEvalForGrandFinal(@RequestBody SearchEvalForGrandFinal request) {
        return HttpResponse.ok(workEvaluationService.searchReqEvalForGrandFinal(request));
    }

    @PreAuthorize("hasAnyAuthority('TEACHER')")
    @PostMapping("/evaluate-requirement-eval-for-grand-final")
    public HttpResponse<?> evaluateReqForGrandFinal(@RequestBody EvaluateReqForGrandFinal request) {
        return HttpResponse.ok(workEvaluationService.evaluateReqForGrandFinal(request));
    }

    @PostMapping("/search-total-eval-for-grand-final")
    public HttpResponse<?> searchTotalEvalForGrandFinal(@RequestBody SearchEvalForGrandFinal request) {
        return HttpResponse.ok(evaluationService.searchTotalEvalForGrandFinal(request));
    }

    @PutMapping("/update-status")
    public HttpResponse<?> updateStatus(@RequestBody UpdateCouncilTeamStatus request) {
        return HttpResponse.ok(evaluationService.updateStatus(request));
    }
}
