package com.sep490.sep490.service;

import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.dto.SubjectDTO;
import com.sep490.sep490.dto.SubjectTeacherDTO;
import com.sep490.sep490.dto.subject.request.SearchSubjectRequest;
import com.sep490.sep490.dto.subject.request.SearchSubjectTeacherRequest;
import com.sep490.sep490.dto.subject.response.SearchSubjectResponse;
import com.sep490.sep490.dto.user.SubjectUserDTO;
import com.sep490.sep490.entity.Subject;
import com.sep490.sep490.entity.User;
import com.sep490.sep490.repository.SubjectRepository;
import com.sep490.sep490.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
@Log4j2
public class SubjectService implements BaseService<Subject, Integer>{

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final CommonService commonService;

    @Override
    public Object create(Object objectRequest) {
        log.info("Creating subject: ");
        var request = (SubjectDTO) objectRequest;
        request.validateInput();

        var foundSubjectsBySubjectCode = subjectRepository
                .findBySubjectCode(request.getSubjectCode().toLowerCase().trim());
        if (foundSubjectsBySubjectCode != null) {
            throw new NameAlreadyExistsException("Mã môn học");
        }

        var foundSubjectBySubjectName = subjectRepository
                .findBySubjectName(request.getSubjectName().toLowerCase().trim());
        if (foundSubjectBySubjectName != null) {
            throw new NameAlreadyExistsException("Tên môn học");
        }

        List<User> managers = new ArrayList<>();
        if(request.getManagers() != null)
            for (SubjectUserDTO user : request.getManagers()) {
                managers.add(validateManager(user.getId()));
            }

        var saveSubject = ConvertUtils.convert(request, Subject.class);
        saveSubject.setManagers(managers);
        subjectRepository.save(saveSubject);

        SubjectDTO subjectDTO = ConvertUtils.convert(saveSubject, SubjectDTO.class);
        setSubjectUsers(subjectDTO, managers);

        return subjectDTO;
    }

    private User validateManager(Integer managerId){
        User foundUser = null;
        if(managerId != null){
            foundUser = userRepository.findById(managerId).orElseThrow(
                    () -> new RecordNotFoundException("Quản lý"));

            if(!foundUser.getRole().getName().equals(Constants.Role.ROLE_MANAGER)){
                throw new ConflictException(foundUser.getFullname() + " không phải là quản lý");
            }
        }
        return foundUser;
    }

    private void setSubjectUsers(SubjectDTO subjectDTO, List<User> managers){
        subjectDTO.setManagers(new ArrayList<>());

        for (User user : managers) {
            SubjectUserDTO subjectUserDTO = new SubjectUserDTO();
            subjectUserDTO.setId(user.getId());
            subjectUserDTO.setUsername(user.getUsername());
            subjectUserDTO.setFullname(user.getFullname());

            subjectDTO.getManagers().add(subjectUserDTO);
        }

    }

    @Override
    public Object update(Integer id, Object objectRequest) {
        log.info("Update subject with id: " + id);
        var request = (SubjectDTO) objectRequest;
        request.validateInput();

        var foundSubject = subjectRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Môn học"));
        //Check subject code trung voi subject code khac trong Db
        Subject foundSubjectByCode = subjectRepository
                .findBySubjectCodeAndOtherId(request.getSubjectCode().toLowerCase().trim(), request.getId());
        if(foundSubjectByCode != null){
            throw new NameAlreadyExistsException("Mã môn học");
        }

        //Check subject name trung voi subject name khac trong Db
        Subject foundSubjectByName = subjectRepository
                .findBySubjectNameAndOtherId(request.getSubjectName().toLowerCase().trim(), request.getId());
        if(foundSubjectByName != null){
            throw new NameAlreadyExistsException("Tên môn học");
        }

        List<User> managers = new ArrayList<>();
        if(request.getManagers() != null)
            for (SubjectUserDTO user : request.getManagers()) {
                managers.add(validateManager(user.getId()));
            }

        foundSubject.setSubjectCode(request.getSubjectCode());
        foundSubject.setSubjectName(request.getSubjectName());
        foundSubject.setDescription(request.getDescription());
        foundSubject.setManagers(managers);
        foundSubject.setActive(request.getActive());
        foundSubject.setIsCouncil(request.getIsCouncil());
        subjectRepository.save(foundSubject);

        SubjectDTO subjectDTO = ConvertUtils.convert(foundSubject, SubjectDTO.class);
        setSubjectUsers(subjectDTO, managers);

        return subjectDTO;
    }

    @Override
    public Object get(Integer id) {
        log.info("get subject with id: " + id);
        var foundSubject = subjectRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Môn học"));

        SubjectDTO subjectDTO = new SubjectDTO();
        subjectDTO.setId(foundSubject.getId());
        subjectDTO.setSubjectCode(foundSubject.getSubjectCode());
        subjectDTO.setSubjectName(foundSubject.getSubjectName());
        subjectDTO.setActive(foundSubject.getActive());
        subjectDTO.setIsCouncil(foundSubject.getIsCouncil());
        subjectDTO.setDescription(foundSubject.getDescription());
        setSubjectUsers(subjectDTO, foundSubject.getManagers());

        return subjectDTO;
    }

    @Override
    public void delete(Integer id) {
        var foundSubject = subjectRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Môn học"));
        foundSubject.getManagers().clear();
        foundSubject.getTeachers().clear();
        foundSubject.getSubjectSettings().clear();
        foundSubject.getClasses().clear();
        foundSubject.getAssignments().clear();
        subjectRepository.delete(foundSubject);
    }
    
    @Override
    public Object search(Object objectRequest) {
        log.info("search subject: ");
        var request = (SearchSubjectRequest) objectRequest;
        request.validateInput();

        Pageable pageable;
        if (request.getOrderBy().equals("DESC"))
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).descending());
        else
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).ascending());

        Page<Subject> subjects = subjectRepository.search(
                request.getNameOrCode(),
                request.getManagerId(),
                request.getActive(),
                request.getIsCouncil(),
                pageable
        );

        List<SubjectDTO> subjectDTOS = new ArrayList<>();
        Long totalRecords = subjects.getTotalElements();
        for (Subject s : subjects.getContent()) {
            SubjectDTO subjectDTO = new SubjectDTO();
            subjectDTO.setId(s.getId());
            subjectDTO.setSubjectCode(s.getSubjectCode());
            subjectDTO.setSubjectName(s.getSubjectName());
            subjectDTO.setActive(s.getActive());
            subjectDTO.setDescription(s.getDescription());
            setSubjectUsers(subjectDTO, s.getManagers());
            if(canSearch(s)){
                subjectDTOS.add(subjectDTO);
            } else {
                totalRecords--;
            }
        }

        SearchSubjectResponse response = new SearchSubjectResponse();
        response.setSubjects(subjectDTOS);
        response.setTotalElements(totalRecords);
        response.setPageIndex(request.getPageIndex());
        response.setPageSize(request.getPageSize());
        response.setOrderBy(request.getOrderBy());
        response.setSortBy(request.getSortBy());

        return response;
    }

    private boolean canSearch(Subject s) {
        User currentUser = commonService.getCurrentUser();
        return switch (currentUser.getRole().getId()) {
            case 1 -> true;
            case 2 -> s.getManagers().stream().anyMatch(item -> item.getId().equals(currentUser.getId()));
            case 3 -> s.getTeachers().stream().anyMatch(item -> item.getId().equals(currentUser.getId()));
            case 4 -> s.getClasses().stream()
                    .flatMap(item -> item.getClassesUsers().stream())
                    .anyMatch(csu -> csu.getUser().getId().equals(currentUser.getId()));
            default -> false;
        };
    }


    public Object updateSubjectTeachers(Object objectRequest) {
        var request = (SubjectTeacherDTO) objectRequest;
        request.validateInput();
        var foundSubject = subjectRepository.findById(request.getSubjectId()).orElseThrow(
                () -> new RecordNotFoundException("Môn học"));

        List<User> teachers = new ArrayList<>();
        if(request.getTeacherIds() != null){
            for (Integer teacherId : request.getTeacherIds()){
                teachers.add(validateTeacher(teacherId));
            }
        }
        foundSubject.setTeachers(teachers);

        subjectRepository.save(foundSubject);
        return "Cập nhật thành công";
    }

    private User validateTeacher(Integer teacherId){
        User foundUser = null;
        if(teacherId != null){
            foundUser = userRepository.findById(teacherId).orElseThrow(
                    () -> new RecordNotFoundException("Giảng viên"));

            if(!foundUser.getRole().getName().equals(Constants.Role.ROLE_TEACHER)){
                throw new ConflictException(foundUser.getFullname() + " không phải là giảng viên");
            }
        }
        return foundUser;
    }


    public Object searchSubjectTeacher(Object objectRequest) {
        log.info("search teacher in subject: ");
        var request = (SearchSubjectTeacherRequest) objectRequest;
        request.validateInput();

        Pageable pageable;
        if (request.getOrderBy().equals("DESC"))
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).descending());
        else
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).ascending());

        Page<User> teachers = subjectRepository.searchSubjectTeacher(
                request.getKeyWord(),
                request.getSubjectId(),
                request.getType(),
                pageable
        );

        return ConvertUtils.convertList(teachers.getContent(), SubjectUserDTO.class);
    }

}
