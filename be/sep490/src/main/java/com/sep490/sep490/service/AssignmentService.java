package com.sep490.sep490.service;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.dto.AssignmentDTO;
import com.sep490.sep490.dto.EvaluationCriteriaDTO;
import com.sep490.sep490.dto.assignment.request.AssignmentRequest;
import com.sep490.sep490.dto.assignment.request.CreateAssignmentRequest;
import com.sep490.sep490.dto.assignment.request.SearchAssignmentRequest;
import com.sep490.sep490.dto.assignment.respone.SearchAssignmentRespone;
import com.sep490.sep490.entity.Assignment;
import com.sep490.sep490.entity.EvaluationCriteria;
import com.sep490.sep490.entity.Subject;
import com.sep490.sep490.mapper.AssignmentMapper;
import com.sep490.sep490.repository.AssignmentRepository;
import com.sep490.sep490.repository.EvaluationCriteriaRepository;
import com.sep490.sep490.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Log4j2
public class AssignmentService implements BaseService<Assignment, Integer> {
    private final AssignmentRepository assignmentRepository;
    private final SubjectRepository subjectRepository;

    public Object updateList(CreateAssignmentRequest request) {
        log.info("Create list assignment");
        request.validateInput();
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RecordNotFoundException("Subject"));
        var findAssignment = assignmentRepository.findBySubject(subject);

        checkDuplicateName(request.getAssignmentList());

        if(findAssignment.isEmpty()){
            return addListAssignment(request, subject);
        }else{
            // Chuyển danh sách hiện có và danh sách request thành map để so sánh
            // Luu list có key: id và value: assignment
            Map<Integer, Assignment> currentAssignmentMap = findAssignment.stream()
                    .collect(Collectors.toMap(Assignment::getId, assignment -> assignment));

            Map<Integer, AssignmentRequest> requestAssignmentMap = request.getAssignmentList().stream()
                    .filter(assignmentRequest -> assignmentRequest.getId() != null)
                    .collect(Collectors.toMap(AssignmentRequest::getId, assignmentRequest -> assignmentRequest));

            // Danh sách để lưu các assignment cần thêm, cập nhật và xóa
            List<Assignment> assignmentsToAdd = new ArrayList<>();
            List<Assignment> assignmentsToUpdate = new ArrayList<>();
            List<Assignment> assignmentsToDeactivate  = new ArrayList<>();

            //requestAssignmentMap lay ra list request
            getAssignmentList(requestAssignmentMap, currentAssignmentMap, subject, assignmentsToUpdate);

            // Handle new assignments with id == null
            List<AssignmentRequest> newAssignments = request.getAssignmentList().stream()
                    .filter(assignmentRequest -> assignmentRequest.getId() == null)
                    .toList();

            for (AssignmentRequest newAssignmentRequest : newAssignments) {
                Assignment assignment = ConvertUtils.convert(newAssignmentRequest, Assignment.class);
                assignment.setSubject(subject);
                assignmentsToAdd.add(assignment);
            }

            // Duyệt list hiện có trong DB để xác định assignment cần deActive:
            for (var entry : currentAssignmentMap.entrySet()) {
                Integer id = entry.getKey();
                if (!requestAssignmentMap.containsKey(id)) {
                    Assignment assignmentDB = currentAssignmentMap.get(id);
                    assignmentDB.setActive(false);
                    assignmentDB.setSubject(null);
                    assignmentsToDeactivate.add(assignmentDB);
                }
            }

            int totalEvalWeight = 0;
            for (Assignment assignmentToAdd : assignmentsToAdd) {
                if(assignmentToAdd.getActive())
                    totalEvalWeight += assignmentToAdd.getEvalWeight();
            }
            for (Assignment assignmentToUpdate : assignmentsToUpdate) {
                if(assignmentToUpdate.getActive())
                    totalEvalWeight += assignmentToUpdate.getEvalWeight();
            }
            if (totalEvalWeight != 100) {
                throw new ConflictException("Tổng tỷ trọng các bài kiểm tra đang hoạt động phải bằng 100%");
            }

            // Thực hiện các thao tác thêm, cập nhật và xóa trong cơ sở dữ liệu
            if (!assignmentsToAdd.isEmpty()) {
                assignmentRepository.saveAll(assignmentsToAdd);
            }
            if (!assignmentsToUpdate.isEmpty()) {
                assignmentRepository.saveAll(assignmentsToUpdate);
            }
            if (!assignmentsToDeactivate .isEmpty()) {
                assignmentRepository.saveAll(assignmentsToDeactivate);
            }
        }
        return "Cập nhật thành công!!";
    }

    public void getAssignmentList(Map<Integer, AssignmentRequest> requestAssignmentMap, Map<Integer, Assignment> currentAssignmentMap,
                     Subject subject, List<Assignment> assignmentsToUpdate){
        for (var entry : requestAssignmentMap.entrySet()){
            Integer id = entry.getKey();
            AssignmentRequest assignmentRequest = entry.getValue();
            //currentAssignmentMap lay ra list ở DB
            if(currentAssignmentMap.containsKey(id)){
                Assignment existingAssignment = currentAssignmentMap.get(id);
                Assignment convertedNewAssignment = ConvertUtils.convert(assignmentRequest, Assignment.class);
                convertedNewAssignment.setSubject(subject);
                if(!existingAssignment.equals(convertedNewAssignment)){
                    /*Assignment assignment = ConvertUtils.convert(assignmentRequest, existingAssignment.getClass());*/
                    assignmentsToUpdate.add(convertedNewAssignment);
                }
            }
        }
    }

    private void checkDuplicateName(List<AssignmentRequest> requests){
        Set<String> assignmentNames = new HashSet<>();
        for (AssignmentRequest assignmentReq : requests) {
            if (!assignmentNames.add(assignmentReq.getTitle().toLowerCase())) {
                throw new ConflictException("Tên bài kiểm tra phải là duy nhất");
            }
        }
    }

    private Object addListAssignment(CreateAssignmentRequest request, Subject subject) {
        checkAssignmentTitleAndEvalWeight(request.getAssignmentList());

        //check existing eval assignment in DB > 100
        //ton tai list assignment có eval_weight = 100 thi se khong cho add nua
        checkExistingAssignmentsEvalWeight(subject, request.getAssignmentList());

        List<Assignment> assignments = new ArrayList<>();
        for (AssignmentRequest assignmentRequest : request.getAssignmentList()) {
            Assignment assignment = ConvertUtils.convert(assignmentRequest, Assignment.class);
            assignment.setSubject(subject);
            assignments.add(assignment);
        }
        assignmentRepository.saveAll(assignments);
        return "Add list assignments success!!!";
    }

    private void checkExistingAssignmentsEvalWeight(Subject subject, List<AssignmentRequest> newAssignments) {
        List<Assignment> existingAssignments = assignmentRepository.findBySubject(subject);

        //tinh tong EvalWeight của Assignment trong existingAssignments
        int totalEvalWeight = existingAssignments.stream()
                .mapToInt(Assignment::getEvalWeight)
                .sum();

        for (AssignmentRequest newAssignment : newAssignments) {
            totalEvalWeight += newAssignment.getEvalWeight();
        }

        if (totalEvalWeight > 100) {
            throw new ApiInputException("Total evalWeight of existing and new assignments exceeds 100");
        }
    }

    private void checkAssignmentTitleAndEvalWeight(List<AssignmentRequest> assignmentRequests) {
        Set<String> uniqueTitles = new HashSet<>();
        int totalEvalWeight = 0;
        for (AssignmentRequest request : assignmentRequests) {
            String title = request.getTitle();
            if (uniqueTitles.contains(title)) {
                throw new ConflictException("Duplicate assignment title: " + title);
            }
            uniqueTitles.add(title);
            totalEvalWeight += request.getEvalWeight();
        }
        if (totalEvalWeight != 100) {
            throw new ApiInputException("Total evalWeight must be 100");
        }
    }

    @Override
    public Object create(Object request) {
        return null;
    }

    @Override
    public Object update(Integer integer, Object request) {
        return null;
    }

    @Override
    public Object get(Integer integer) {
        var foundAssignment = assignmentRepository.findById(integer).orElseThrow(
                () -> new RecordNotFoundException("Assignment")
        );
        return ConvertUtils.convert(foundAssignment, AssignmentDTO.class);
    }

    @Override
    public void delete(Integer integer) {

    }

    @Override
    public Object search(Object objectRequest) {
        log.info("search Assignment: ");
        var request = (SearchAssignmentRequest) objectRequest;
        request.validateInput();
        Pageable pageable;
        if (request.getOrderBy().equals("DESC")) {
            pageable = PageRequest.of(request.getPageIndex() - 1
                    , request.getPageSize(), Sort.by(request.getSortBy()).descending());
        } else {
            pageable = PageRequest.of(request.getPageIndex() - 1
                    , request.getPageSize(), Sort.by(request.getSortBy()).ascending());
        }
        Page<Assignment> assignments = assignmentRepository.search(
                request.getTitle() == null ? "" : request.getTitle(),
                request.getSubjectId(),
                request.getMinExpectedLoc(),
                request.getMaxExpectedLoc(),
                request.getActive(),
                pageable
        );
        SearchAssignmentRespone response = new SearchAssignmentRespone();
        response.setAssignmentDTOS(
                ConvertUtils.convertList(assignments.getContent()
                        , AssignmentDTO.class
                )
        );
        response.setTotalElements(assignments.getTotalElements());
        response.setPageIndex(request.getPageIndex());
        response.setPageSize(request.getPageSize());
        response.setOrderBy(request.getOrderBy());
        response.setSortBy(request.getSortBy());
        return response;
    }

    public AssignmentDTO getById(Integer id) {
        Assignment assignment = assignmentRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Assignment")
        );

        return ConvertUtils.convert(assignment, AssignmentDTO.class);
    }

    public AssignmentDTO getAssignmentById(Integer id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RecordNotFoundException("Assignment"));

        AssignmentDTO assignmentDTO = ConvertUtils.convert(assignment, AssignmentDTO.class);
        List<EvaluationCriteriaDTO> evaluationCriteriaDTOs = new ArrayList<>();

        for (EvaluationCriteria criteria : assignment.getEvaluationCriterias()) {
            EvaluationCriteriaDTO criteriaDTO = ConvertUtils.convert(criteria, EvaluationCriteriaDTO.class);
            evaluationCriteriaDTOs.add(criteriaDTO);
        }

        assignmentDTO.setEvaluationCriterias(evaluationCriteriaDTOs);

        return assignmentDTO;
    }
}
