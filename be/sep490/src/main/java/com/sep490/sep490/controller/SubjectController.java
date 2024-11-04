package com.sep490.sep490.controller;

import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.SettingDTO;
import com.sep490.sep490.dto.SubjectDTO;
import com.sep490.sep490.dto.SubjectTeacherDTO;
import com.sep490.sep490.dto.subject.request.SearchSubjectRequest;
import com.sep490.sep490.dto.subject.request.SearchSubjectTeacherRequest;
import com.sep490.sep490.service.SubjectService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("subjects")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "Authorization")
public class SubjectController {
    private final SubjectService subjectService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/create")
    public HttpResponse<?> create(@RequestBody SubjectDTO request) {
        return HttpResponse.ok(subjectService.create(request));
    }

    @PostMapping("/search")
    public HttpResponse<?> search(@RequestBody SearchSubjectRequest request) {
        return HttpResponse.ok(subjectService.search(request));
    }

    @GetMapping("/get-by-id/{id}")
    public HttpResponse<?> getById(@PathVariable Integer id) {
        return HttpResponse.ok(subjectService.get(id));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/update/{id}")
    public HttpResponse<?> update(@PathVariable("id") Integer id, @RequestBody SubjectDTO request) {
        return HttpResponse.ok(subjectService.update(id, request));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public HttpResponse<?> delete(@PathVariable("id") Integer id) {
        subjectService.delete(id);
        return HttpResponse.ok("Delete subject successfully!");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @PutMapping("/update-subject-teacher")
    public HttpResponse<?> updateSubjectTeacher(@RequestBody SubjectTeacherDTO request){
        return HttpResponse.ok(subjectService.updateSubjectTeachers(request));
    }

    @PostMapping("/search-subject-teachers")
    public HttpResponse<?> searchSubjectTeacher(@RequestBody SearchSubjectTeacherRequest request){
        return HttpResponse.ok(subjectService.searchSubjectTeacher(request));
    }
}
