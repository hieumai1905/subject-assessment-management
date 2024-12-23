package com.sep490.sep490.service;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.MilestoneCriteriaDTO;
import com.sep490.sep490.dto.MilestoneDTO;
import com.sep490.sep490.dto.evaluationCriteria.request.MilestoneCriteriaRequest;
import com.sep490.sep490.dto.evaluationCriteria.response.MilestoneCriteriaResponse;
import com.sep490.sep490.dto.milestone.request.SearchMilestoneCriteriaRequest;
import com.sep490.sep490.dto.milestone.request.SearchMilestoneRequest;
import com.sep490.sep490.dto.milestone.request.UpdateMilestoneRequest;
import com.sep490.sep490.dto.milestone.response.MilestoneDetailsResponse;
import com.sep490.sep490.dto.milestone.response.MilestoneResponse;
import com.sep490.sep490.dto.milestone.response.SearchMilestoneCriteriaResponse;
import com.sep490.sep490.dto.milestone.response.SearchMilestoneResponse;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.mapper.MilestoneCriteriaMapper;
import com.sep490.sep490.mapper.MilestoneMapper;
import com.sep490.sep490.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Log4j2
public class MilestoneService implements BaseService<Milestone, Integer>{

    private final MilestoneRepository milestoneRepository;
    private final MilestoneCriteriaRepository milestoneCriteriaRepository;
    private final AssignmentRepository assignmentRepository;
    private final ClassRepository classRepository;
    private final MilestoneCriteriaMapper milestoneCriteriaMapper;
    private final MilestoneMapper milestoneMapper;
    private final EvaluationCriteriaRepository evaluationCriteriaRepository;
    @Override
    public Object create(Object objectRequest) {
//        log.info("Create milestone: ");
//        var request = (MilestoneRequest) objectRequest;
//        request.validateInput();
//        Assignment assignment = assignmentRepository.findById(request.getAssignmentId()).orElseThrow(
//                () -> new RecordNotFoundException("Assignment")
//        );
//        Classes classes = classRepository.findById(request.getClassesId()).orElseThrow(
//                () -> new RecordNotFoundException("Class")
//        );
//
//        Milestone foundMilestone = milestoneRepository.findByAssignmentAndClasses(assignment, classes);
//        if (foundMilestone != null){
//            throw new ApiInputException("This assignment " + assignment.getAssignmentTitle() + " already exists milestone!");
//        }
//
//        Milestone saveMilestone = milestoneMapper.convertMilestoneRequestToMilestone(
//                assignment, classes, request
//        );
//        milestoneRepository.save(saveMilestone);
//
//        // Handle Milestone Criteria
//        var assignmentCriterias = assignment.getEvaluationCriterias();
//
//        if (!assignmentCriterias.isEmpty()){
//            var milestoneCriterias = new ArrayList<MilestoneCriteria>();
//            for (EvaluationCriteria evaluationCriteria : assignmentCriterias) {
//                MilestoneCriteria milestoneCriteria = new MilestoneCriteria();
//                milestoneCriteria.setMilestone(saveMilestone);
//                milestoneCriteria.setCriteriaName(evaluationCriteria.getCriteriaName());
//                milestoneCriteria.setEvalWeight(evaluationCriteria.getEvalWeight());
//                milestoneCriteria.setParentCriteria(null);
//                milestoneCriterias.add(milestoneCriteria);
//            }
//            milestoneCriteriaRepository.saveAll(milestoneCriterias);
//        }
//
//        return ConvertUtils.convert(saveMilestone, MilestoneDTO.class);
        return null;
    }


    public MilestoneCriteriaResponse getMilestoneCriteriaDetails(Integer id){
        MilestoneCriteria parentMilestoneCriteria = milestoneCriteriaRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Milestone Criteria")
        );

        MilestoneCriteriaResponse response = new MilestoneCriteriaResponse();

//        if (parentMilestoneCriteria.getParentCriteria() == null){
//            List<MilestoneCriteria> childrenMilestoneCriteria =
//                    milestoneCriteriaRepository.findAllByParentCriteriaId(id);
//            response.setParentCriteria(ConvertUtils
//                    .convert(parentMilestoneCriteria, MilestoneCriteriaDTO.class));
//            response.setChildrenCriteria(ConvertUtils
//                    .convertList(childrenMilestoneCriteria, MilestoneCriteriaDTO.class));
//        }

        response.setParentCriteria(ConvertUtils
                .convert(parentMilestoneCriteria, MilestoneCriteriaDTO.class));

        return response;
    }

    public Object getMilestoneDetails(Integer id){
        Milestone foundMilestone = milestoneRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Milestone")
        );
//        List<MilestoneCriteria> parentMilestoneCriterias = milestoneCriteriaRepository.
//                findAllByMilestoneAndParentCriteriaId(foundMilestone, 0);
        List<MilestoneCriteria> parentMilestoneCriterias = new ArrayList<>();
        MilestoneDetailsResponse response = new MilestoneDetailsResponse();
        MilestoneDTO milestone = ConvertUtils.convert(foundMilestone, MilestoneDTO.class);
        milestone.setSubjectId(foundMilestone.getClasses().getSubject().getId());
        if(foundMilestone.getClasses().getTeacher() != null){
            milestone.setTeacherId(foundMilestone.getClasses().getTeacher().getId());
        }
        response.setMilestone(milestone);

        List<MilestoneCriteriaResponse> milestoneCriteriaResponses = new ArrayList<MilestoneCriteriaResponse>();

        for (MilestoneCriteria parentMilestoneCriteria : parentMilestoneCriterias) {
            MilestoneCriteriaResponse milestoneCriteriaResponse = getMilestoneCriteriaDetails(
                    parentMilestoneCriteria.getId()
            );
            milestoneCriteriaResponses.add(milestoneCriteriaResponse);
        }

        response.setMilestoneCriterias(milestoneCriteriaResponses);

        return response;
    }

//    @Transactional
//    public Object addMilestoneCriteriaForMilestones(CreateMilestoneCriteriaRequest request){
//
//        MilestoneCriteria parentMilestoneCriteria = milestoneCriteriaRepository.findById(request.getParentCriteriaId()).orElseThrow(
//                () -> new RecordNotFoundException("Milestone Criteria")
//        );
//
//        List<MilestoneCriteriaRequest> validateMilestoneCriterias = request.getMilestoneCriterias();
//        for (MilestoneCriteriaRequest validate : validateMilestoneCriterias) {
//            validate.validateInput();
//        }
//
//        List<Integer> childMilestoneCriterias = milestoneCriteriaRepository.
//                findAllByParentCriteriaId(parentMilestoneCriteria.getId()).
//                stream().map(MilestoneCriteria::getId).toList();
//
//        Set<String> milestoneCriteriaNames = new HashSet<>();
//        for (MilestoneCriteriaRequest req : request.getMilestoneCriterias()) {
//            if (!milestoneCriteriaNames.add(req.getCriteriaName().toLowerCase())) {
//                throw new IllegalArgumentException("Milestone Criteria names must be unique (case-insensitive)");
//            }
//        }
//
//        var milestoneCriteriaRequests = request.getMilestoneCriterias();
//        checkWeightOfMilestoneCriteria(milestoneCriteriaRequests);
//
//        // Check for create milestone criteria
//        List<MilestoneCriteria> createMilestoneCriterias = milestoneCriteriaRequests
//                .stream().filter(m -> m.getId() == null)
//                        .map(m -> milestoneCriteriaMapper.
//                                convertMilestoneCriteriaRequestToMilestoneCriteria(m, parentMilestoneCriteria)).toList();
//
//        // Check for update milestone criteria
//        List<MilestoneCriteriaRequest> updateMilestoneRequests = milestoneCriteriaRequests
//                .stream().filter(m -> m.getId() != null).toList();
//        List<Integer> updateMilestoneRequestIds = updateMilestoneRequests.stream().map(m -> m.getId()).toList();
//        ArrayList<MilestoneCriteria> updateMilestoneCriterias = new ArrayList<>();
//        for (MilestoneCriteriaRequest milestoneCriteriaRequest : updateMilestoneRequests){
//            if (milestoneCriteriaRepository.existsByIdAndIdInAndActiveTrue(
//                    milestoneCriteriaRequest.getId(), childMilestoneCriterias)){
//                MilestoneCriteria updateMilestoneCriteria = milestoneCriteriaRepository.findById(milestoneCriteriaRequest.getId()).orElseThrow(
//                        () -> new RecordNotFoundException("Milestone Criteria")
//                );
//                MilestoneCriteria update = milestoneCriteriaMapper.convertToUpdateMilestone(
//                        milestoneCriteriaRequest, updateMilestoneCriteria
//                );
//                updateMilestoneCriterias.add(update);
//            }
//        }
//        // Check list id update null
//        if (updateMilestoneRequestIds.isEmpty()){
//            List<MilestoneCriteria> deactivateMilestoneCriteriasIfNull = milestoneCriteriaRepository.
//                    findAllByParentCriteriaIdAndActiveTrue(
//                            parentMilestoneCriteria.getId()
//                    ).stream().map(milestoneCriteriaMapper::deactivateMilestoneCriteria).toList();
//            milestoneCriteriaRepository.saveAll(deactivateMilestoneCriteriasIfNull);
//        }
//        // Deactivate Milestone Criteria
//        List<MilestoneCriteria> deactivateMilestoneCriterias = milestoneCriteriaRepository.
//                findAllByIdInAndIdNotInAndParentCriteriaIdAndActiveTrue(
//                        childMilestoneCriterias, updateMilestoneRequestIds, parentMilestoneCriteria.getId()
//                ).stream().map(milestoneCriteriaMapper::deactivateMilestoneCriteria).toList();
//
//        milestoneCriteriaRepository.saveAll(createMilestoneCriterias);
//        milestoneCriteriaRepository.saveAll(updateMilestoneCriterias);
//        milestoneCriteriaRepository.saveAll(deactivateMilestoneCriterias);
//        return "Create successfully!";
//
//    }

//    @Transactional
//    public Object addMilestoneCriteriaForMilestones(Integer id, CreateMilestoneCriteriaRequest request){
//
//        Milestone foundMilestone = milestoneRepository.findById(id).orElseThrow(
//                () -> new RecordNotFoundException("Milestone")
//        );
//
//        MilestoneCriteria parentMilestoneCriteria = milestoneCriteriaRepository.findById(request.getParentMilestoneCriteriaId()).orElseThrow(
//                () -> new RecordNotFoundException("Milestone Criteria")
//        );
//
//        var milestoneCriteriaRequests = request.getMilestoneCriterias();
//        checkWeightOfMilestoneCriteria(milestoneCriteriaRequests);
//
//        List<MilestoneCriteria> oldMilestoneCriteriaList =
//                milestoneCriteriaRepository.findAllByParentCriteriaId(
//                        parentMilestoneCriteria.getId());
//        milestoneCriteriaRepository.deleteAll(oldMilestoneCriteriaList);
//
//        var milestoneCriteriasSave = new ArrayList<MilestoneCriteria>();
//        for (MilestoneCriteriaRequest milestoneCriteriaRequest : milestoneCriteriaRequests) {
//            MilestoneCriteria milestoneCriteriaSave = milestoneCriteriaMapper.
//                    convertMilestoneCriteriaRequestToMilestoneCriteria(
//                            milestoneCriteriaRequest,
//                            parentMilestoneCriteria
//                    );
//            milestoneCriteriasSave.add(milestoneCriteriaSave);
//        }
//
//        milestoneCriteriaRepository.saveAll(milestoneCriteriasSave);
//        return "Create successfully!";
//
//    }

    private void checkWeightOfMilestoneCriteria(List<MilestoneCriteriaRequest> requests){
        int sumOfEvalWeight = requests.stream().mapToInt(MilestoneCriteriaRequest::getEvalWeight).sum();
        if (sumOfEvalWeight != 100) {
            throw new ApiInputException("Total milestone criteria weight must be 100%");
        }
    }

    @Override
    public Object update(Integer id, Object objectRequest) {
        log.info("Update milestone: ");
        var request = (UpdateMilestoneRequest) objectRequest;
        request.validateInput();
        Milestone foundMilestone = milestoneRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Milestone"));
        Milestone existByTitle = milestoneRepository.findByTitle(request.getTitle(),
                id, foundMilestone.getClasses().getId());
        if(existByTitle != null){
            throw new NameAlreadyExistsException("Title");
        }
        var saveMilestone = milestoneMapper.convertUpdateMilestoneRequestToMilestone(request, foundMilestone);
        milestoneRepository.save(saveMilestone);
        return ConvertUtils.convert(saveMilestone, MilestoneDTO.class);
    }

    public Object changeMilestoneStatus(Integer id, Boolean active){
        ValidateUtils.checkNullOrEmpty(id, "Giai đoạn");
        Milestone foundMilestone = milestoneRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Giai đoạn"));
        for (Milestone milestone : foundMilestone.getClasses().getMilestones()){
            if(active && milestone.getActive()){
                throw new ConflictException("Vui lòng đóng " +  milestone.getTitle() + " trước khi mở " + foundMilestone.getTitle());
            }
        }
        if (!active && !isCompleteValidEvaluation(foundMilestone)) {
            throw new ConflictException("Vui lòng hoàn thành đánh giá trước khi đóng " + foundMilestone.getTitle());
        }

        foundMilestone.setActive(active);
        milestoneRepository.save(foundMilestone);
        return ConvertUtils.convert(foundMilestone, MilestoneDTO.class);
    }

    @Override
    public Object get(Integer id) {
        log.info("Get milestone by id: " + id);
        var milestone = milestoneRepository.findById(id).orElseThrow(() -> new RecordNotFoundException("Milestone"));
        return ConvertUtils.convert(milestone, MilestoneDTO.class);
    }

    @Override
    public void delete(Integer id) {
        Milestone foundMilestone = milestoneRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Milestone"));
    }

    public Object searchMilestoneCriteria(Object requestObject) {
        log.info("search milestone criteria: ");
        var request=(SearchMilestoneCriteriaRequest) requestObject;
        request.validateInput();
        Pageable pageable;
        if(request.getOrderBy().equals("DESC")){
            pageable = PageRequest.of(request.getPageIndex() - 1
                    , request.getPageSize(), Sort.by(request.getSortBy()).descending());
        }else {
            pageable = PageRequest.of(request.getPageIndex() - 1
                    , request.getPageSize(), Sort.by(request.getSortBy()).ascending());
        }
        Page<MilestoneCriteria> milestoneCriterias = milestoneCriteriaRepository.search(
                request.getMilestoneId(),
//                request.getParentCriteriaId(),
                request.getActive(),
                pageable
        );
        SearchMilestoneCriteriaResponse response = new SearchMilestoneCriteriaResponse();
        List<MilestoneCriteriaDTO> milestoneCriteriaDTOS = new ArrayList<>();
        for (MilestoneCriteria milestoneCriteria : milestoneCriterias.getContent()) {
            MilestoneCriteriaDTO dto = ConvertUtils.convert(milestoneCriteria, MilestoneCriteriaDTO.class);
            dto.setCanEdit(!((milestoneCriteria.getStudentEvaluations() != null && milestoneCriteria.getStudentEvaluations().size() > 0)
                    || (milestoneCriteria.getTeamEvaluations() != null && milestoneCriteria.getTeamEvaluations().size() > 0)));
            milestoneCriteriaDTOS.add(dto);
        }
        response.setMilestoneCriterias(milestoneCriteriaDTOS);
        response.setTotalElements(milestoneCriterias.getTotalElements());
        response.setPageIndex(request.getPageIndex());
        response.setPageSize(request.getPageSize());
        response.setOrderBy(request.getOrderBy());
        response.setSortBy(request.getSortBy());
        return response;
    }

    @Override
    public Object search(Object requestObject) {
        log.info("search milestone: ");
        var request=(SearchMilestoneRequest) requestObject;
        request.validateInput();
        Pageable pageable;
        if(request.getOrderBy().equals("DESC")){
            pageable = PageRequest.of(request.getPageIndex() - 1
                    , request.getPageSize(), Sort.by(request.getSortBy()).descending());
        }else {
            pageable = PageRequest.of(request.getPageIndex() - 1
                    , request.getPageSize(), Sort.by(request.getSortBy()).ascending());
        }
        Page<Milestone> milestones = milestoneRepository.search(
                request.getClassId(),
//                request.getAssignmentId(),
                request.getActive(),
                pageable
        );
        SearchMilestoneResponse response = new SearchMilestoneResponse();
        response.setMilestoneResponses(ConvertUtils.convertList(milestones.getContent(), MilestoneResponse.class));
        response.setTotalElements(milestones.getTotalElements());
        response.setPageIndex(request.getPageIndex());
        response.setPageSize(request.getPageSize());
        response.setOrderBy(request.getOrderBy());
        response.setSortBy(request.getSortBy());
        return response;
    }

    @Transactional
    public void cloneAssignmentToMilestone(Classes classes){
        if(classes.getSubject() == null)
            return;
        List<Assignment> assignments = assignmentRepository.findBySubjectAndActive(classes.getSubject().getId(), true);
        if(assignments == null || assignments.size() == 0)
            return;

        List<Milestone> milestones = new ArrayList<>();
        boolean isFirstMilestone = true;
        assignments = assignments.stream().sorted(Comparator.comparing(Assignment::getDisplayOrder)).toList();
        for (Assignment assignment :assignments) {
            Milestone milestone = new Milestone();
            milestone.setTitle(assignment.getAssignmentTitle());
            milestone.setNote(assignment.getNote());
            milestone.setDisplayOrder(assignment.getDisplayOrder());
            milestone.setEvalWeight(assignment.getEvalWeight());
            milestone.setExpectedLoc(assignment.getExpectedLoc());
            milestone.setEvaluationType(assignment.getEvaluationType());
            if(isFirstMilestone && assignment.getEvaluationType().equals(Constants.TypeAssignments.NORMAL)){
                milestone.setActive(true);
                isFirstMilestone = false;
            } else{
              milestone.setActive(false);
            }
//            milestone.setAssignment(assignment);
            milestone.setClasses(classes);
            cloneCriteria(assignment, milestone);
            milestones.add(milestone);
        }
        milestoneRepository.saveAll(milestones);
    }

    private void cloneCriteria(Assignment assignment, Milestone milestone) {
        List<EvaluationCriteria> evaluationCriteriaList = evaluationCriteriaRepository.findByAssignmentId(assignment.getId());
        if(evaluationCriteriaList == null || evaluationCriteriaList.size() == 0)
            return;
        List<MilestoneCriteria> milestoneCriteriaList = new ArrayList<>();
        for (EvaluationCriteria evaluationCriteria : evaluationCriteriaList) {
            if(evaluationCriteria.getActive()){
                MilestoneCriteria milestoneCriteria = new MilestoneCriteria();
                milestoneCriteria.setCriteriaName(evaluationCriteria.getCriteriaName());
                milestoneCriteria.setLocEvaluation(evaluationCriteria.getLocEvaluation());
                milestoneCriteria.setMilestone(milestone);
                milestoneCriteria.setEvalWeight(evaluationCriteria.getEvalWeight());
                milestoneCriteriaList.add(milestoneCriteria);
            }
        }
        milestone.setMilestoneCriteriaList(milestoneCriteriaList);
    }

    @Transactional
    public Object saveListMilestoneCriteriaForMilestones(Integer id, List<MilestoneCriteriaDTO> milestoneCriteriaRequests) {
        Milestone milestone = milestoneRepository.findById(id).orElseThrow(() -> new RecordNotFoundException("Milestone"));

        List<MilestoneCriteria> milestoneCriteriaList = milestone.getMilestoneCriteriaList();

        Set<Integer> requestIds = milestoneCriteriaRequests.stream()
                .map(MilestoneCriteriaDTO::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<Integer> criteriaToRemoveIds = milestoneCriteriaList.stream()
                .map(MilestoneCriteria::getId)
                .filter(criteriaId -> !requestIds.contains(criteriaId))
                .toList();


        milestoneCriteriaRepository.deleteAllByIds(criteriaToRemoveIds);

        int totalEvalWeight = 0;

        for (MilestoneCriteriaDTO milestoneCriteriaRequest : milestoneCriteriaRequests) {
            totalEvalWeight += milestoneCriteriaRequest.getEvalWeight();

            if(milestoneCriteriaRequest.getLocEvaluation()){
                continue;
            }
            milestoneCriteriaRequest.validateInput(true);
            MilestoneCriteria existingMilestoneCriteria = findExistingMilestoneCriteria(milestoneCriteriaList, milestoneCriteriaRequest.getId());
            if (existingMilestoneCriteria != null) {
                MilestoneCriteria existingByName = milestoneCriteriaRepository
                        .findByName(milestoneCriteriaRequest.getCriteriaName(), existingMilestoneCriteria.getId(), id);
                if(existingByName != null){
                    throw new NameAlreadyExistsException("Criteria Name");
                }
                existingMilestoneCriteria.setCriteriaName(milestoneCriteriaRequest.getCriteriaName());
                existingMilestoneCriteria.setEvalWeight(milestoneCriteriaRequest.getEvalWeight());
                existingMilestoneCriteria.setLocEvaluation(milestoneCriteriaRequest.getLocEvaluation());
                existingMilestoneCriteria.setNote(milestoneCriteriaRequest.getNote());
                milestoneCriteriaRepository.save(existingMilestoneCriteria);
            } else {
                MilestoneCriteria newMilestoneCriteria = getMilestoneCriteria(milestoneCriteriaRequest, milestone);
                milestoneCriteriaRepository.save(newMilestoneCriteria);
                milestoneCriteriaList.add(newMilestoneCriteria);
            }
        }

        if (totalEvalWeight != 100) {
            throw new ConflictException("Total eval weight for milestone criteria must be equal to 100.");
        }

        return "Update list milestone criteria successfully!";
    }

    private MilestoneCriteria getMilestoneCriteria(MilestoneCriteriaDTO milestoneCriteriaRequest, Milestone milestone) {
        MilestoneCriteria newMilestoneCriteria = new MilestoneCriteria();
        newMilestoneCriteria.setActive(true);
        newMilestoneCriteria.setCriteriaName(milestoneCriteriaRequest.getCriteriaName());
        newMilestoneCriteria.setEvalWeight(milestoneCriteriaRequest.getEvalWeight());
        newMilestoneCriteria.setLocEvaluation(milestoneCriteriaRequest.getLocEvaluation());
        newMilestoneCriteria.setNote(milestoneCriteriaRequest.getNote());
        newMilestoneCriteria.setMilestone(milestone);
//        newMilestoneCriteria.setParentCriteria(null);
        return newMilestoneCriteria;
    }

    private MilestoneCriteria findExistingMilestoneCriteria(List<MilestoneCriteria> milestoneCriteriaList, Integer id) {
        for (MilestoneCriteria milestoneCriteria : milestoneCriteriaList) {
            if (milestoneCriteria.getId().equals(id)) {
                return milestoneCriteria;
            }
        }
        return null;
    }

    public boolean isCompleteValidEvaluation(Milestone milestone) {
        List<StudentEvaluation> studentEvaluations = milestone.getStudentEvaluations().stream()
                .filter(item -> item.getCriteria() == null)
                .toList();
        List<User> students = milestone.getClasses().getClassesUsers()
                .stream()
                .map(ClassUser::getUser)
                .filter(user -> user.getRole().getId().equals(Constants.Role.STUDENT))
                .toList();

        if (studentEvaluations.size() != students.size()) {
            return false;
        }

        return studentEvaluations.stream().allMatch(studentEvaluation -> studentEvaluation.getEvalGrade() != null);
    }

//    public Object changeMilestoneStatus(Integer id, boolean active) {
//        ValidateUtils.checkNullOrEmpty(id, "Milestone id");
//        Milestone foundMilestone = milestoneRepository.findById(id)
//                .orElseThrow(() -> new RecordNotFoundException("Milestone"));
//
//        if (active && foundMilestone.getClasses().getMilestones().stream().anyMatch(milestone -> active && milestone.getActive())) {
//            throw new ConflictException("Please close other active milestone before opening " + foundMilestone.getTitle());
//        }
//
//        if (!active && !isCompleteValidEvaluation(foundMilestone)) {
//            throw new ConflictException("Please complete student evaluation for milestone " + foundMilestone.getTitle() + " before closing.");
//        }
//
//        foundMilestone.setActive(active);
//        milestoneRepository.save(foundMilestone);
//        return ConvertUtils.convert(foundMilestone, MilestoneDTO.class);
//    }

}
