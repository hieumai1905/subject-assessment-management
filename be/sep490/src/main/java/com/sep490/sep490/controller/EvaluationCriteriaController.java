package com.sep490.sep490.controller;

import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.evaluationCriteria.request.EvaluationCriteriaRequest;
import com.sep490.sep490.dto.evaluationCriteria.request.SearchEvaluationCriteriaRequest;
import com.sep490.sep490.dto.studentEvaluation.request.StudentEvalSearchRequest;
import com.sep490.sep490.service.EvaluationCriteriaService;
import com.sep490.sep490.service.StudentEvaluationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("evaluation-criteria")
@RequiredArgsConstructor
@Log4j2
@SecurityRequirement(name = "Authorization")
public class EvaluationCriteriaController {
    private final EvaluationCriteriaService evaluationCriteriaService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @PutMapping("/update-evaluation-criteria")
    public HttpResponse<?> updateEvaluationCriteria(@RequestBody EvaluationCriteriaRequest request) {
        return HttpResponse.ok(evaluationCriteriaService.updateEvaluationCriteria(request));
    }

    @GetMapping("/get-detail/{id}")
    public HttpResponse<?> getDetail(@PathVariable("id") Integer id) {
        return HttpResponse.ok(evaluationCriteriaService.get(id));
    }

    @PostMapping("/search")
    public HttpResponse<?> search(@RequestBody SearchEvaluationCriteriaRequest request) {
        return HttpResponse.ok(evaluationCriteriaService.search(request));
    }
}
