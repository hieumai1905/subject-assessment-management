package com.sep490.sep490.controller;

import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.MilestoneCriteriaDTO;
import com.sep490.sep490.dto.MilestoneDTO;
import com.sep490.sep490.dto.evaluationCriteria.request.CreateMilestoneCriteriaRequest;
import com.sep490.sep490.dto.milestone.request.SearchMilestoneCriteriaRequest;
import com.sep490.sep490.dto.milestone.request.SearchMilestoneRequest;
import com.sep490.sep490.service.MilestoneService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("milestone-criteria")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "Authorization")
public class MilestoneCriteriaController {
    private final MilestoneService milestoneService;
    @PostMapping("/search")
    public HttpResponse<?> search(@RequestBody SearchMilestoneCriteriaRequest request) {
        return HttpResponse.ok(milestoneService.searchMilestoneCriteria(request));
    }

//    @PostMapping("/create-for-milestone/{id}")
//    public HttpResponse<?> create(@RequestBody CreateMilestoneCriteriaRequest request) {
//        return HttpResponse.ok(milestoneService.addMilestoneCriteriaForMilestones(request));
//    }

    @PutMapping ("/update-list-milestone-criteria/{id}")
    HttpResponse<?> update(@PathVariable("id") Integer id, @RequestBody List<MilestoneCriteriaDTO> request){
        return HttpResponse.ok(milestoneService.saveListMilestoneCriteriaForMilestones(id, request));
    }

//    @PutMapping("/update-for-milestone/{id}")
//    public HttpResponse<?> update(@PathVariable("id") Integer id,@RequestBody CreateMilestoneCriteriaRequest request) {
//        return HttpResponse.ok(milestoneService.updateMilestoneCriteriaForMilestones(id, request));
//    }

//    @PutMapping("/update/{id}")
//    public HttpResponse<?> update(@PathVariable("id") Integer id, @RequestBody MilestoneDTO request) {
//        return HttpResponse.ok(milestoneService.update(id, request));
//    }
//
//    @DeleteMapping("/delete/{id}")
//    public HttpResponse<?> delete(@PathVariable("id") Integer id) {
//        milestoneService.delete(id);
//        return HttpResponse.ok("Delete milestone successfully!");
//    }
//
    @GetMapping("/get-by-id/{id}")
    public HttpResponse<?> getById(@PathVariable("id") Integer id) {
        return HttpResponse.ok(milestoneService.getMilestoneCriteriaDetails(id));
    }
}
