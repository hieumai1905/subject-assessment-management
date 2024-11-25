package com.sep490.sep490.controller;

import com.sep490.sep490.dto.ClassesDTO;
import com.sep490.sep490.dto.HttpResponse;
import com.sep490.sep490.dto.classes.request.*;
import com.sep490.sep490.service.ClassService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;

@RestController
@RequestMapping("class")
@RequiredArgsConstructor
@Log4j2
@PreAuthorize("isAuthenticated()")
@SecurityRequirement(name = "Authorization")
public class ClassesController {
    private final ClassService classesService;
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @PostMapping("/create")
    public HttpResponse<?> create(@RequestBody ClassesDTO request) throws MessagingException, UnsupportedEncodingException {
        return HttpResponse.ok(classesService.create(request));
    }
    @PostMapping("/search")
    public HttpResponse<?> search(@RequestBody SearchClassRequest request) {
        return HttpResponse.ok(classesService.search(request));
    }

    @PostMapping("/search-for-grand-final")
    public HttpResponse<?> searchBySemesterId(@RequestBody SearchClassForGrandFinal request) {
        return HttpResponse.ok(classesService.searchBySemesterId(request));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @PutMapping("/update/{id}")
    public HttpResponse<?> update(@PathVariable("id") Integer id, @RequestBody ClassesDTO request) {
        return HttpResponse.ok(classesService.update(id, request));
    }
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    @DeleteMapping("/delete/{id}")
    public HttpResponse<?> delete(@PathVariable("id") Integer id) {
        classesService.delete(id);
        return HttpResponse.ok("Delete classes successfully!");
    }
    @GetMapping("/get-by-id/{id}")
    public HttpResponse<?> getById(@PathVariable("id") Integer id) {
        return HttpResponse.ok(classesService.get(id));
    }
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @PostMapping("/import-student-list")
    public HttpResponse<?> importList(@RequestBody ClassListStudentRequest request) throws MessagingException, UnsupportedEncodingException {
        return HttpResponse.ok(classesService.addListStudent(request));
    }
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @PostMapping("/import-student")
    public HttpResponse<?> importStudent(@RequestBody ClassStudentRequest request) throws MessagingException, UnsupportedEncodingException {
        return HttpResponse.ok(classesService.addStudentToClass(request));
    }
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'TEACHER')")
    @DeleteMapping("/delete-student")
    public HttpResponse<?> deleteStudent(@RequestBody DeleteClassStudentDTO request) throws MessagingException, UnsupportedEncodingException {
        return HttpResponse.ok(classesService.deleteStudent(request));
    }

    @PostMapping("/search-students")
    public HttpResponse<?> searchStudents(@RequestBody SearchClassStudentRequest request) {
        return HttpResponse.ok(classesService.searchStudents(request));
    }

    @PostMapping("/search-students-has-no-class")
    public HttpResponse<?> searchStudentsHasNoClass(@RequestBody SearchClassStudentRequest request) {
        return HttpResponse.ok(classesService.searchStudentsHasNoClass(request));
    }
}
