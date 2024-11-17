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

    @Override
    public Object create(Object objectRequest) {
        log.info("Creating subject: ");
        var request = (SubjectDTO) objectRequest;
        request.validateInput();

        var foundSubjectsBySubjectCode = subjectRepository
                .findBySubjectCode(request.getSubjectCode().toLowerCase().trim());
        if (foundSubjectsBySubjectCode != null) {
            throw new NameAlreadyExistsException("Subject Code");
        }

        var foundSubjectBySubjectName = subjectRepository
                .findBySubjectName(request.getSubjectName().toLowerCase().trim());
        if (foundSubjectBySubjectName != null) {
            throw new NameAlreadyExistsException("Subject Name");
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
                    () -> new RecordNotFoundException("User"));

            if(!foundUser.getRole().getName().equals(Constants.Role.ROLE_MANAGER)){
                throw new ConflictException("User must be manager");
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
                () -> new RecordNotFoundException("Subject"));
        //Check subject code trung voi subject code khac trong Db
        Subject foundSubjectByCode = subjectRepository
                .findBySubjectCodeAndOtherId(request.getSubjectCode().toLowerCase().trim(), request.getId());
        if(foundSubjectByCode != null){
            throw new NameAlreadyExistsException("Subject Code");
        }

        //Check subject name trung voi subject name khac trong Db
        Subject foundSubjectByName = subjectRepository
                .findBySubjectNameAndOtherId(request.getSubjectName().toLowerCase().trim(), request.getId());
        if(foundSubjectByName != null){
            throw new NameAlreadyExistsException("Subject Name");
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
                () -> new RecordNotFoundException("Subject"));

        SubjectDTO subjectDTO = new SubjectDTO();
        subjectDTO.setId(foundSubject.getId());
        subjectDTO.setSubjectCode(foundSubject.getSubjectCode());
        subjectDTO.setSubjectName(foundSubject.getSubjectName());
        subjectDTO.setActive(foundSubject.getActive());
        subjectDTO.setDescription(foundSubject.getDescription());
        setSubjectUsers(subjectDTO, foundSubject.getManagers());

        return subjectDTO;
    }

    @Override
    public void delete(Integer id) {
        var foundSubject = subjectRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Subject"));
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
                pageable
        );

        List<SubjectDTO> subjectDTOS = new ArrayList<>();
        for (Subject s : subjects.getContent()) {
            SubjectDTO subjectDTO = new SubjectDTO();
            subjectDTO.setId(s.getId());
            subjectDTO.setSubjectCode(s.getSubjectCode());
            subjectDTO.setSubjectName(s.getSubjectName());
            subjectDTO.setActive(s.getActive());
            subjectDTO.setDescription(s.getDescription());
            setSubjectUsers(subjectDTO, s.getManagers());

            subjectDTOS.add(subjectDTO);
        }

        SearchSubjectResponse response = new SearchSubjectResponse();
        response.setSubjects(subjectDTOS);
        response.setTotalElements(subjects.getTotalElements());
        response.setPageIndex(request.getPageIndex());
        response.setPageSize(request.getPageSize());
        response.setOrderBy(request.getOrderBy());
        response.setSortBy(request.getSortBy());

        return response;
    }

    public Object updateSubjectTeachers(Object objectRequest) {
        var request = (SubjectTeacherDTO) objectRequest;
        request.validateInput();
        var foundSubject = subjectRepository.findById(request.getSubjectId()).orElseThrow(
                () -> new RecordNotFoundException("Subject"));

        List<User> teachers = new ArrayList<>();
        if(request.getTeacherIds() != null){
            for (Integer teacherId : request.getTeacherIds()){
                teachers.add(validateTeacher(teacherId));
            }
        }
        foundSubject.setTeachers(teachers);

        subjectRepository.save(foundSubject);
        return "Update teacher successful!!!";
    }

    private User validateTeacher(Integer teacherId){
        User foundUser = null;
        if(teacherId != null){
            foundUser = userRepository.findById(teacherId).orElseThrow(
                    () -> new RecordNotFoundException("User"));

            if(!foundUser.getRole().getName().equals(Constants.Role.ROLE_TEACHER)){
                throw new ConflictException("User must be teacher");
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
