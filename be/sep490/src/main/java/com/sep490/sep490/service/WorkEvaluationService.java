package com.sep490.sep490.service;

import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.dto.*;
import com.sep490.sep490.dto.evaluation.request.EvaluateReqForGrandFinal;
import com.sep490.sep490.dto.evaluation.request.SearchEvalForGrandFinal;
import com.sep490.sep490.dto.evaluation.response.GradeEvaluator;
import com.sep490.sep490.dto.studentEvaluation.request.StudentEvalSearchRequest;
import com.sep490.sep490.dto.work_evaluation.WorkEvaluationDTO;
import com.sep490.sep490.dto.work_evaluation.request.EvaluateRequirementRequest;
import com.sep490.sep490.dto.work_evaluation.response.SearchWorkEvalResponse;
import com.sep490.sep490.dto.work_evaluation.response.WorkEvaluationResponse;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@RequiredArgsConstructor
@Service
@Log4j2
public class WorkEvaluationService {
    private final CustomWorkEvaluationRepository customWorkEvaluationRepository;
    private final ClassesRepository classesRepository;
    private final WorkEvaluationRepository workEvaluationRepository;
    private final RequirementRepository requirementRepository;
    private final SettingRepository settingRepository;
    private final MilestoneRepository milestoneRepository;
    private final CommonService commonService;
    private final StudentEvaluationRepository studentEvaluationRepository;
    private final TeamRepository teamRepository;
    private final CouncilTeamRepository councilTeamRepository;
    private final SessionRepository sessionRepository;
    private final CouncilRepository councilRepository;

//    public Object searchWorkEvaluation(StudentEvalSearchRequest request){
//        request.validateInput();
//        SearchWorkEvalResponse response = new SearchWorkEvalResponse();
//        Classes classes = classesRepository.findById(request.getClassId()).orElseThrow(() -> new RecordNotFoundException("Class"));
//        List<SettingDTO> complexities = new ArrayList<>();
//        List<SettingDTO> qualities = new ArrayList<>();
//        if(classes.getSubject().getSubjectSettings() != null){
//            for (Setting setting : classes.getSubject().getSubjectSettings()) {
//                SettingDTO settingDTO = ConvertUtils.convert(setting, SettingDTO.class);
//                if(setting.getSettingType().equals("Complexity")){
//                    complexities.add(settingDTO);
//                }else if(setting.getSettingType().equals("Quality")){
//                    qualities.add(settingDTO);
//                }
//            }
//        }
//        response.setComplexities(complexities);
//        response.setQualities(qualities);
//
//        List<Object[]> rawResults = customWorkEvaluationRepository.searchWorkEvaluation(
//                request.getClassId(),
//                request.getMilestoneId(),
//                request.getTeamId());
//        List<WorkEvaluationResponse> workEvaluationResponses = new ArrayList<>();
//        for (Object[] result : rawResults) {
//            WorkEvaluationResponse workEvaluation = new WorkEvaluationResponse();
//            setBaseRequirement(result, workEvaluation);
//            workEvaluationResponses.add(workEvaluation);
//        }
//        response.setWorkEvaluationResponses(workEvaluationResponses);
//        return response;
//    }

    public Object searchWorkEvaluation(StudentEvalSearchRequest request){
        request.validateInput();
        SearchWorkEvalResponse response = new SearchWorkEvalResponse();
        Classes classes = classesRepository.findById(request.getClassId()).orElseThrow(() -> new RecordNotFoundException("Lớp học"));
        Milestone milestone = milestoneRepository.findById(request.getMilestoneId())
                .orElseThrow(() -> new RecordNotFoundException("Giai đoạn"));
        boolean isFinalEval = milestone.getEvaluationType().equals(Constants.TypeAssignments.FINAL);

        List<SettingDTO> complexities = new ArrayList<>();
        List<SettingDTO> qualities = new ArrayList<>();

        if (classes.getSubject().getSubjectSettings() != null) {
            for (Setting setting : classes.getSubject().getSubjectSettings()) {
                SettingDTO settingDTO = ConvertUtils.convert(setting, SettingDTO.class);
                switch (setting.getSettingType()) {
                    case "Complexity" -> complexities.add(settingDTO);
                    case "Quality" -> qualities.add(settingDTO);
                }
            }
        }

        response.setComplexities(complexities);
        response.setQualities(qualities);

        List<Requirement> requirements = classes.getMilestones().stream()
            .flatMap(item -> item.getRequirements().stream())
            .filter(req -> {
                if(req.getTeam() != null && (request.getTeamId() == null
                        || request.getTeamId().equals(req.getTeam().getId()))){
                    String status = req.getStatus();
                    boolean isCurrentMilestone = req.getMilestone().getId().equals(request.getMilestoneId());
                    boolean isEvaluated = status.equals("EVALUATED");
                    boolean isSubmitted = status.equals("SUBMITTED") || status.equals("SUBMIT LATE");

                    if (isFinalEval) {
                        return isCurrentMilestone ? (isEvaluated || isSubmitted) : isEvaluated;
                    } else {
                        return isCurrentMilestone && (isEvaluated || isSubmitted);
                    }
                }
                return false;
            })
            .toList();

        List<WorkEvaluationResponse> workEvaluationResponses = new ArrayList<>();
        if(requirements.size() > 0){
            for (Requirement requirement : requirements) {
                WorkEvaluationResponse workEvalResponse = new WorkEvaluationResponse();
                setWorkEvalFromRequirement(requirement, workEvalResponse, null, null, milestone);
                workEvaluationResponses.add(workEvalResponse);
            }
        }
        response.setWorkEvaluationResponses(workEvaluationResponses);
        return response;
    }

    private void setWorkEvalFromRequirement(Requirement requirement, WorkEvaluationResponse workEvalResponse,
                                            Integer evaluatorId, Integer councilTeamId, Milestone milestone) {
        workEvalResponse.setId(requirement.getId());
        workEvalResponse.setReqTitle(requirement.getReqTitle());
        workEvalResponse.setStudentId(requirement.getStudent().getId());
        workEvalResponse.setStudentFullname(requirement.getStudent().getFullname());
        workEvalResponse.setSubmission(requirement.getSubmission());
        workEvalResponse.setSubmitType(requirement.getSubmitType());
        workEvalResponse.setStatus(requirement.getStatus());
        workEvalResponse.setTeamId(requirement.getTeam().getId());
        workEvalResponse.setTeamTeamName(requirement.getTeam().getTeamName());
        workEvalResponse.setMilestoneId(requirement.getMilestone().getId());
        workEvalResponse.setMilestoneTitle(requirement.getMilestone().getTitle());
        if(requirement.getUpdateTrackings() != null && requirement.getUpdateTrackings().size() > 0){
            List<UpdateTrackingDTO> updateTrackingDTOs = ConvertUtils.convertList(requirement.getUpdateTrackings(), UpdateTrackingDTO.class);
            workEvalResponse.setUpdateTrackings(updateTrackingDTOs);
        }
        List<WorkEvaluation> workEvaluations = requirement.getWorkEvaluations().stream()
                .filter(item -> !milestone.getEvaluationType().equals(Constants.TypeAssignments.NORMAL)
                        || item.getMilestone().getId().equals(milestone.getId()))
                .toList();
        if(workEvaluations.size() > 0){
            if (evaluatorId != null) {
                WorkEvaluation grandFinalEval = null;
                WorkEvaluation maxDisplayOrderEval = null;
                for (WorkEvaluation item : workEvaluations) {
                    if (item.getEvaluator() != null
                            && item.getEvaluator().getId().equals(evaluatorId)
                            && item.getCouncilTeamId() != null
                            && item.getCouncilTeamId().equals(councilTeamId)) {
                        grandFinalEval = item;
                    }
                    if (item.getEvaluator() == null) {
                        if (maxDisplayOrderEval == null
                                || item.getMilestone().getDisplayOrder() > maxDisplayOrderEval.getMilestone().getDisplayOrder()) {
                            maxDisplayOrderEval = item;
                        }
                    }
                }
                if (grandFinalEval != null) {
                    workEvalResponse.setUpdateRequirementEval(
                            ConvertUtils.convert(grandFinalEval, WorkEvaluationDTO.class)
                    );
                }
                if (maxDisplayOrderEval != null) {
                    workEvalResponse.setRequirementEval(
                            ConvertUtils.convert(maxDisplayOrderEval, WorkEvaluationDTO.class)
                    );
                }
            } else {
                WorkEvaluation finalEval = null;
                WorkEvaluation maxDisplayOrderEval = null;
                for (WorkEvaluation item : workEvaluations) {
                    if (item.getEvaluator() == null
                            && item.getMilestone().getId().equals(milestone.getId())) {

                        if(milestone.getEvaluationType().equals(Constants.TypeAssignments.NORMAL)){
                            workEvalResponse.setRequirementEval(
                                    ConvertUtils.convert(item, WorkEvaluationDTO.class)
                            );
                            return;
                        }
                        finalEval = item;
                    }
                    if (item.getEvaluator() == null
                            && !item.getMilestone().getId().equals(milestone.getId())) {
                        if (maxDisplayOrderEval == null
                                || item.getMilestone().getDisplayOrder() > maxDisplayOrderEval.getMilestone().getDisplayOrder()) {
                            maxDisplayOrderEval = item;
                        }
                    }
                }
                if (finalEval != null) {
                    workEvalResponse.setUpdateRequirementEval(
                            ConvertUtils.convert(finalEval, WorkEvaluationDTO.class)
                    );
                }
                if (maxDisplayOrderEval != null) {
                    workEvalResponse.setRequirementEval(
                            ConvertUtils.convert(maxDisplayOrderEval, WorkEvaluationDTO.class)
                    );
                }
            }
        }
    }

    private void setBaseRequirement(Object[] result, WorkEvaluationResponse workEvaluation) {
        workEvaluation.setId((Integer) result[0]);
        workEvaluation.setReqTitle((String) result[1]);
        workEvaluation.setSubmission((String) result[2]);
        workEvaluation.setSubmitType((String) result[3]);
        workEvaluation.setStatus((String) result[4]);
        workEvaluation.setRequirementEval(ConvertUtils.jsonToObject((String) result[5], WorkEvaluationDTO.class));
        if(workEvaluation.getRequirementEval() != null && workEvaluation.getRequirementEval().getComment() != null
            && workEvaluation.getRequirementEval().getComment().equals("null"))
            workEvaluation.getRequirementEval().setComment(null);
        UpdateTrackingDTO[] updateTrackingDTOS = ConvertUtils.jsonToObjectList((String) result[6], "\\|",
                UpdateTrackingDTO.class);
        if(updateTrackingDTOS != null)
            workEvaluation.setUpdateTrackings(Arrays.stream(updateTrackingDTOS).toList());
        workEvaluation.setUpdateRequirementEval(ConvertUtils.jsonToObject((String) result[7], WorkEvaluationDTO.class));
        if(workEvaluation.getUpdateRequirementEval() != null && workEvaluation.getUpdateRequirementEval().getComment() != null
                && workEvaluation.getUpdateRequirementEval().getComment().equals("null"))
            workEvaluation.getUpdateRequirementEval().setComment(null);
        workEvaluation.setTeamId((Integer) result[8]);
        workEvaluation.setTeamTeamName((String) result[9]);
        workEvaluation.setStudentId((Integer) result[10]);
        workEvaluation.setStudentFullname((String) result[11]);
    }

    @Transactional
    public Object evaluateRequirement(Integer milestoneId, List<EvaluateRequirementRequest> request) {
        if(request == null || request.size() == 0)
            return "Không có dữ liệu để đánh giá";
        List<WorkEvaluation> workEvaluations = new ArrayList<>();
        List<Requirement> requirements = new ArrayList<>();
        Milestone milestone = checkExistMilestone(milestoneId);
        MilestoneCriteria criteria = milestone.getMilestoneCriteriaList().stream()
                .filter(MilestoneCriteria::getLocEvaluation)
                .findFirst().orElse(null);
        HashMap<Integer, User> emailSet = new HashMap<>();
        for (EvaluateRequirementRequest evalReq : request) {
            evalReq.validateInput();
            Requirement requirement = checkExistRequirement(evalReq.getReqId());
            Setting complexity = checkExistSetting(evalReq.getComplexityId(), "complexity");
            Setting quality = checkExistSetting(evalReq.getQualityId(), "quality");
            User student = checkExistStudent(requirement);
            workEvaluations.add(setWorkEvaluation(evalReq, requirement, complexity, quality, student,
                    null, null, milestone));
            requirement.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(3));
            requirements.add(requirement);
            emailSet.putIfAbsent(student.getId(), student);
        }
        workEvaluationRepository.saveAll(workEvaluations);
        requirementRepository.saveAll(requirements);

        //new update
        if(criteria != null){
            List<StudentEvaluation> studentEvaluations = new ArrayList<>();
            for (Integer userId : emailSet.keySet()) {
                Float loc = workEvaluationRepository.getTotalByUserIdAndMileId(
                        userId, milestone.getId()
                );
                if (loc == null) {
                    loc = 0f;
                }
                float grade = Math.min(loc / milestone.getExpectedLoc() * 10, 10f);
                grade = Math.round(grade * 100) / 100.0f;
                saveStudentEvaluation(loc, grade, milestone, criteria, emailSet.get(userId), studentEvaluations,
                        null, null);
            }
            studentEvaluationRepository.saveAll(studentEvaluations);
        }
        //-------
//        if(criteria != null){
//            HashMap<String, Float> studentLocMap = new HashMap<>();
//            List<Integer> mileIds = milestone.getClasses().getMilestones().stream()
//                    .filter(item -> !item.getTypeEvaluator().equals(Constants.TypeAssignments.GRAND_FINAL)
//                        && (milestone.getTypeEvaluator().equals(Constants.TypeAssignments.FINAL)
//                            || item.getId().equals(milestone.getId()))
//                    )
//                    .map(Milestone::getId)
//                    .toList();
//            List<Object[]> totalLocs;
//            if(milestone.getTypeEvaluator().equals(Constants.TypeAssignments.NORMAL)){
//                totalLocs = customWorkEvaluationRepository
//                        .findByEmailsAndMileId(emailSet.keySet().stream().toList(), milestone.getId());
//            } else {
//                totalLocs = customWorkEvaluationRepository
//                        .findByEmailsAndMileIds(emailSet.keySet().stream().toList(), mileIds);
//            }
//            for (Object[] result : totalLocs) {
//                studentLocMap.putIfAbsent((String)result[0], (Float) result[1]);
//            }
//            List<StudentEvaluation> studentEvaluations = new ArrayList<>();
//            for (String email : emailSet.keySet()) {
//                Float loc = studentLocMap.get(email);
//                if (loc == null) {
//                    loc = 0f;
//                }
//                float grade = Math.min(loc / milestone.getExpectedLoc() * 10, 10f);
//                grade = Math.round(grade * 100) / 100.0f;
//                saveStudentEvaluation(loc, grade, milestone, criteria, emailSet.get(email), studentEvaluations, null, null);
//            }
//            studentEvaluationRepository.saveAll(studentEvaluations);
//        }
        return "Đánh giá thành công";
    }

    private Milestone checkExistMilestone(Integer milestoneId) {
        return milestoneRepository.findById(milestoneId).orElseThrow(() -> new RecordNotFoundException("Giai đoạn"));
    }

    private void saveStudentEvaluation(Float loc, Float grade, Milestone milestone, MilestoneCriteria criteria,
                                       User user, List<StudentEvaluation> studentEvaluations, Integer evaluatorId, Integer councilTeamId) {
        Optional<StudentEvaluation> criteriaEvaluation;
        if(evaluatorId == null){
            criteriaEvaluation = studentEvaluationRepository.findStudentEvaluation(
                    milestone.getId(),
                    criteria.getId(),
                    user.getId()
            );
        } else{
            criteriaEvaluation = studentEvaluationRepository.findStudentEvaluationInGrandFinal(
                    milestone.getId(),
                    criteria.getId(),
                    user.getId(), evaluatorId, councilTeamId
            );
            //calculate again avg eval
            addAvgEvaluation(grade, milestone, criteria, user, evaluatorId, councilTeamId, criteriaEvaluation, studentEvaluations);
        }
        if(criteriaEvaluation.isPresent()){
            criteriaEvaluation.get().setEvalGrade(grade);
            studentEvaluations.add(criteriaEvaluation.get());
        }else{
            StudentEvaluation newStudentEvaluation = new StudentEvaluation();
            newStudentEvaluation.setMilestone(milestone);
            newStudentEvaluation.setCriteria(criteria);
            newStudentEvaluation.setUser(user);
            newStudentEvaluation.setEvalGrade(grade);
            if(evaluatorId != null){
                newStudentEvaluation.setEvaluator(new User());
                newStudentEvaluation.getEvaluator().setId(evaluatorId);
                newStudentEvaluation.setCouncilTeamId(councilTeamId);
            }
            studentEvaluations.add(newStudentEvaluation);
        }

        Optional<StudentEvaluation> mileEvaluation;
        if(evaluatorId == null){
            mileEvaluation = studentEvaluationRepository.findStudentEvaluation(
                    milestone.getId(),
                    null,
                    user.getId()
            );
        }else{
            mileEvaluation = studentEvaluationRepository.findStudentEvaluationInGrandFinal(
                    milestone.getId(),
                    null,
                    user.getId(), evaluatorId, councilTeamId
            );
        }
        BigDecimal gradeValue = BigDecimal.valueOf(grade)
                .multiply(BigDecimal.valueOf(criteria.getEvalWeight()))
                .divide(BigDecimal.valueOf(100));
        BigDecimal roundedGrade = gradeValue.setScale(2, RoundingMode.HALF_UP);
        if(mileEvaluation.isPresent()){
            mileEvaluation.get().setTotalLOC(loc);
            Float totalGrade = milestone.getStudentEvaluations().stream()
                    .filter(item -> item.getCriteria() != null
                            && !item.getCriteria().getLocEvaluation()
                            && item.getUser().getId().equals(user.getId())
                            && ((evaluatorId == null && item.getEvaluator() == null)
                            || (item.getEvaluator() != null
                            && item.getEvaluator().getId().equals(evaluatorId)
                            && item.getCouncilTeamId() != null
                            && item.getCouncilTeamId().equals(councilTeamId))))
                    .map(item -> {
                        BigDecimal evalGrade = BigDecimal.valueOf(item.getEvalGrade());
                        BigDecimal weight = BigDecimal.valueOf(item.getCriteria().getEvalWeight())
                                .divide(BigDecimal.valueOf(100));
                        return evalGrade.multiply(weight).floatValue();
                    })
                    .reduce(0f, Float::sum);
            BigDecimal mileGrade = BigDecimal.valueOf(totalGrade + gradeValue.floatValue());
            mileEvaluation.get().setEvalGrade(mileGrade.setScale(2, RoundingMode.HALF_UP).floatValue());
            studentEvaluations.add(mileEvaluation.get());
            if(councilTeamId != null)
                addAvgEvaluation(grade, milestone, null, user, evaluatorId, councilTeamId, mileEvaluation, studentEvaluations);
        }else{
            StudentEvaluation newStudentEvaluation = new StudentEvaluation();
            newStudentEvaluation.setMilestone(milestone);
            newStudentEvaluation.setCriteria(null);
            newStudentEvaluation.setUser(user);
            newStudentEvaluation.setTotalLOC(loc);
            newStudentEvaluation.setEvalGrade(roundedGrade.floatValue());
            if(evaluatorId != null){
                newStudentEvaluation.setEvaluator(new User());
                newStudentEvaluation.getEvaluator().setId(evaluatorId);
                newStudentEvaluation.setCouncilTeamId(councilTeamId);
            }
            if(councilTeamId != null)
                addAvgEvaluation(grade, milestone, null, user, evaluatorId, councilTeamId, criteriaEvaluation, studentEvaluations);
            studentEvaluations.add(newStudentEvaluation);
        }
    }

    private void addAvgEvaluation(Float grade, Milestone milestone, MilestoneCriteria criteria, User user,
                                  Integer evaluatorId, Integer councilTeamId, Optional<StudentEvaluation> studentEvaluation,
                                  List<StudentEvaluation> studentEvaluations) {
        Integer numberOfMembers = councilRepository.findCouncilMemberCountByCouncilTeamId(councilTeamId);
        Integer criteriaId = null;
        if(criteria != null){
            criteriaId = criteria.getId();
        }
        List<StudentEvaluation> councilEvals = studentEvaluationRepository.findEvalByCouncilTeam(
                user.getId(),
                councilTeamId,
                evaluatorId,
                criteriaId
        );
        StudentEvaluation avgEvaluation = null;
        float totalGrade = 0f, totalLOC = 0f;
        if(grade != null)
            totalGrade += grade;
        if(studentEvaluation.isPresent()){
            totalLOC += studentEvaluation.get().getTotalLOC() == null ? 0f : studentEvaluation.get().getTotalLOC();
        }
        int numberAlreadyEvaluated = 0;
        for (StudentEvaluation councilEval : councilEvals) {
            if(councilEval.getEvaluator() == null){
                avgEvaluation = councilEval;
            } else {
                totalGrade += (councilEval.getEvalGrade() == null) ? 0f : councilEval.getEvalGrade();
                if(criteria == null)
                    totalLOC += councilEval.getTotalLOC();
                numberAlreadyEvaluated++;
            }
        }
        if(avgEvaluation == null){
            avgEvaluation = new StudentEvaluation();
            avgEvaluation.setMilestone(milestone);
            avgEvaluation.setCriteria(criteria);
            avgEvaluation.setUser(user);
            avgEvaluation.setCouncilTeamId(councilTeamId);
        }
        Float evalGradeRounded = new BigDecimal(totalGrade / numberOfMembers)
                .setScale(2, RoundingMode.HALF_UP)
                .floatValue();
        avgEvaluation.setEvalGrade(evalGradeRounded);
        Float totalLOCRounded = new BigDecimal(totalLOC / numberOfMembers)
                .setScale(0, RoundingMode.HALF_UP)
                .floatValue();
        if(criteria == null)
            avgEvaluation.setTotalLOC(totalLOCRounded);
        studentEvaluations.add(avgEvaluation);

        /// TO DO: if want to save for mile eval
//        Float totalLOCRounded = new BigDecimal(totalLOC / numberOfMembers)
//                .setScale(0, RoundingMode.HALF_UP)
//                .floatValue();
//        avgEvaluation.setTotalLOC(totalLOCRounded);
//        if((avgEvaluation.getStatus() == null || !avgEvaluation.getStatus().equals(Constants.CouncilTeamStatus.REJECT))){
//            avgEvaluation.setStatus((numberAlreadyEvaluated == numberOfMembers - 1)
//                    ? Constants.CouncilTeamStatus.EVALUATED : Constants.CouncilTeamStatus.EVALUATING);
//            councilTeamRepository.updateStatusById(councilTeamId, avgEvaluation.getStatus());
//        }
    }

    private WorkEvaluation setWorkEvaluation(EvaluateRequirementRequest evalReq, Requirement requirement,
                                   Setting complexity, Setting quality, User student, Integer evaluatorId,
                                             Integer councilTeamId, Milestone milestone) {
        WorkEvaluation workEvaluation = checkExistWorkEvaluation(evalReq, milestone, evaluatorId, councilTeamId);
        workEvaluation.setRequirement(requirement);
        workEvaluation.setMilestone(milestone);
        workEvaluation.setStudent(student);
        workEvaluation.setComplexity(complexity);
        workEvaluation.setQuality(quality);
        workEvaluation.setComment(evalReq.getComment());
        workEvaluation.setGrade(evalReq.getGrade());

        return workEvaluation;
    }

    private WorkEvaluation checkExistWorkEvaluation(EvaluateRequirementRequest evalReq, Milestone milestone,
                                                    Integer evaluatorId, Integer councilTeamId) {
        WorkEvaluation workEvaluation;
        if(evaluatorId == null){
            workEvaluation = workEvaluationRepository
                    .findByReqIdAndIsUpdateEval(evalReq.getReqId(), milestone.getId());
        } else{
            workEvaluation = workEvaluationRepository
                    .findByEvaluatorIdAndCouncilTeamId(evalReq.getReqId(), evaluatorId, councilTeamId);
        }
        if(workEvaluation == null){
            workEvaluation = new WorkEvaluation();
            if(evaluatorId != null){
                workEvaluation.setEvaluator(new User());
                workEvaluation.getEvaluator().setId(evaluatorId);
                workEvaluation.setCouncilTeamId(councilTeamId);
            }
//            workEvaluation.setIsUpdateEval(evalReq.getIsUpdateEval());
        }
        return workEvaluation;
    }

    private User checkExistStudent(Requirement requirement) {
        if(requirement.getStudent() == null)
            throw new ConflictException("Chỉ những yêu cầu đã được giao mới được đánh giá");
        return requirement.getStudent();
    }

    private Setting checkExistSetting(Integer settingId, String type) {
        if(settingId == null)
            return null;
        Setting setting = (Setting)settingRepository.findSettingBySettingTypeAndSettingId(type, settingId);
        if(setting == null)
            throw new RecordNotFoundException(type);
        return setting;
    }

    private Requirement checkExistRequirement(Integer reqId) {
        return requirementRepository.findById(reqId)
                .orElseThrow(() -> new RecordNotFoundException("Yêu cầu"));
    }

    public Object searchReqEvalForGrandFinal(SearchEvalForGrandFinal request) {
        SearchWorkEvalResponse response = new SearchWorkEvalResponse();
        response.setWorkEvaluationResponses(new ArrayList<>());
        response.setComplexities(new ArrayList<>());
        response.setQualities(new ArrayList<>());
        User currentUser = commonService.getCurrentUser();
        if(request.getSessionId() == null || request.getTeamId() == null){
            return response;
        }
        Team team = teamRepository.findById(request.getTeamId()).orElseThrow(() -> new RecordNotFoundException("Nhóm"));
        Session session = sessionRepository.findById(request.getSessionId()).orElseThrow(() -> new RecordNotFoundException("Phiên chấm"));
        CouncilTeam councilTeam = councilTeamRepository.findByTeamIdAndSessionId(
                team.getId(),
                session.getId()
        );
        if(councilTeam == null){
            return response;
        }
        Classes classes = team.getClasses();
        Milestone milestone = team.getClasses().getMilestones().stream()
                .filter(item -> item.getEvaluationType().equals(Constants.TypeAssignments.GRAND_FINAL))
                .findFirst().orElse(null);
        if(milestone == null){
            return "Lớp học này không có giai đoạn đánh giá hội đồng";
        }
        if(currentUser.getRole().getId().equals(Constants.Role.STUDENT)){
            return getWorkEvalForStudentInGrandFinal(milestone, currentUser, request.getTeamId(), councilTeam);
        }
        List<SettingDTO> complexities = new ArrayList<>();
        List<SettingDTO> qualities = new ArrayList<>();

        if (classes.getSubject().getSubjectSettings() != null) {
            for (Setting setting : classes.getSubject().getSubjectSettings()) {
                SettingDTO settingDTO = ConvertUtils.convert(setting, SettingDTO.class);
                switch (setting.getSettingType()) {
                    case "Complexity" -> complexities.add(settingDTO);
                    case "Quality" -> qualities.add(settingDTO);
                }
            }
        }

        response.setComplexities(complexities);
        response.setQualities(qualities);

        //with 2nd round only get member rejected in previous round
        List<Requirement> requirements = new ArrayList<>();
        if(session.getSubjectSettingId() != null && session.getSemesterId() != null){
            Setting round = settingRepository.findById(session.getSubjectSettingId()).orElseThrow(() -> new RecordNotFoundException("Lần chấm"));
            Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", session.getSemesterId());
            if(semester == null){
                throw new RecordNotFoundException("Học kỳ");
            }
            Setting lastRound = null;
            if (round.getSubject() != null && round.getSubject().getSubjectSettings() != null) {
                List<Setting> subjectSettings = round.getSubject().getSubjectSettings().stream()
                        .filter(item -> item.getSettingType().equals(Constants.SettingType.ROUND))
                        .sorted(Comparator.comparing(Setting::getDisplayOrder))
                        .toList();
                for (int i = 0; i < subjectSettings.size(); i++) {
                    Setting item = subjectSettings.get(i);
                    if (item.getId().equals(round.getId())) {
                        if (i > 0) {
                            lastRound = subjectSettings.get(i - 1);
                        } else {
                            lastRound = item;
                        }
                        break;
                    }
                }
            }
            if(lastRound != null && !lastRound.getId().equals(round.getId()) && team.getTeamMembers() != null){
                List<Council> councils = councilRepository.findBySemesterIdAndRoundId(lastRound.getId(), semester.getId());
                List<Session> sessions = sessionRepository.findBySemesterIdAndRoundId(semester.getId(), lastRound.getId());
                List<Integer> councilIds = councils.stream().map(Council::getId).toList();
                List<Integer> sessionIds = sessions.stream().map(Session::getId).toList();
                CouncilTeam lastCouncilTeam = councilTeamRepository.findByTeamIdSessionIdAndCouncilId(
                        team.getId(), sessionIds, councilIds
                );
                List<Integer> memberIds = studentEvaluationRepository.getMembersRejectedOrEmptyStatus(
                        lastCouncilTeam.getId(),
                        milestone.getId(),
                        team.getTeamMembers().stream()
                                .map(item -> item.getMember().getId()).toList()
                );
                requirements = classes.getMilestones().stream()
                        .flatMap(item -> item.getRequirements().stream())
                        .filter(req -> {
                            if(req.getTeam() != null && req.getStudent() != null && request.getTeamId().equals(req.getTeam().getId())
                                && memberIds.contains(req.getStudent().getId())){
                                String status = req.getStatus();
                                boolean isEvaluated = status.equals("EVALUATED");
                                boolean isSubmitted = status.equals("SUBMITTED") || status.equals("SUBMIT LATE");

                                return isEvaluated || isSubmitted;
                            }
                            return false;
                        })
                        .toList();
                List<WorkEvaluationResponse> workEvaluationResponses = new ArrayList<>();
                if(requirements.size() > 0){
                    for (Requirement requirement : requirements) {
                        WorkEvaluationResponse workEvalResponse = new WorkEvaluationResponse();
                        setWorkEvalFromRequirement(requirement, workEvalResponse, currentUser.getId(), councilTeam.getId(), milestone);
                        workEvaluationResponses.add(workEvalResponse);
                    }
                }
                response.setWorkEvaluationResponses(workEvaluationResponses);
                return response;
            }
        }

        requirements = classes.getMilestones().stream()
                .flatMap(item -> item.getRequirements().stream())
                .filter(req -> {
                    if(req.getTeam() != null && request.getTeamId().equals(req.getTeam().getId())){
                        String status = req.getStatus();
//                        boolean isCurrentMilestone = req.getMilestone().getId().equals(1);
                        boolean isEvaluated = status.equals("EVALUATED");
                        boolean isSubmitted = status.equals("SUBMITTED") || status.equals("SUBMIT LATE");

                        return isEvaluated || isSubmitted;
                    }
                    return false;
                })
                .toList();

        List<WorkEvaluationResponse> workEvaluationResponses = new ArrayList<>();
        if(requirements.size() > 0){
            for (Requirement requirement : requirements) {
                WorkEvaluationResponse workEvalResponse = new WorkEvaluationResponse();
                setWorkEvalFromRequirement(requirement, workEvalResponse, currentUser.getId(), councilTeam.getId(), milestone);
                workEvaluationResponses.add(workEvalResponse);
            }
        }
        response.setWorkEvaluationResponses(workEvaluationResponses);
        return response;
    }

    private Object getWorkEvalForStudentInGrandFinal(Milestone milestone, User currentUser, Integer teamId,
                                                     CouncilTeam councilTeam) {
        SearchWorkEvalResponse response = new SearchWorkEvalResponse();
        response.setWorkEvaluationResponses(new ArrayList<>());
        response.setComplexities(new ArrayList<>());
        response.setQualities(new ArrayList<>());

        List<Requirement> requirements = milestone.getClasses().getMilestones().stream()
                .flatMap(item -> item.getRequirements().stream())
                .filter(req -> {
                    if(req.getTeam() != null && teamId.equals(req.getTeam().getId())
                        && req.getStudent() != null && req.getStudent().getId().equals(currentUser.getId())
                    ){
                        return req.getStatus().equals("EVALUATED");
                    }
                    return false;
                })
                .toList();
        List<WorkEvaluationResponse> workEvaluationResponses = new ArrayList<>();
        if(requirements.size() > 0){
            Integer numberOfMembers = councilTeam.getCouncil().getCouncilMembers().size();
            List<Integer> evaluatorIds = councilTeam.getCouncil().getCouncilMembers().stream()
                    .map(item->item.getMember().getId()).toList();
            List<WorkEvaluation> workEvaluations = workEvaluationRepository.findByCouncilTeamAndUserId(
                requirements.stream().map(Requirement::getId).toList(),
                evaluatorIds,
                milestone.getId(), councilTeam.getId()
            );
            HashMap<Integer, List<GradeEvaluator>> locMap = new HashMap<>();
            for (WorkEvaluation workEvaluation : workEvaluations) {
                Integer reqId = workEvaluation.getRequirement().getId();
                List<GradeEvaluator> existedLOC = locMap.get(reqId);
                GradeEvaluator gradeEvaluator = ConvertUtils.convert(workEvaluation.getEvaluator(), GradeEvaluator.class);
                gradeEvaluator.setGrade(workEvaluation.getGrade() == null ? 0f : workEvaluation.getGrade());
                gradeEvaluator.setComment(workEvaluation.getComment() == null ? "N/A" : workEvaluation.getComment());
                if(workEvaluation.getComplexity() != null){
                    gradeEvaluator.setComplexityId(workEvaluation.getComplexity().getId());
                    gradeEvaluator.setComplexityName(workEvaluation.getComplexity().getName());
                }
                if(workEvaluation.getQuality() != null){
                    gradeEvaluator.setQualityId(workEvaluation.getQuality().getId());
                    gradeEvaluator.setQualityName(workEvaluation.getQuality().getName());
                }
                if(existedLOC == null){
                    existedLOC = new ArrayList<>();
                }
                existedLOC.add(gradeEvaluator);
                locMap.put(reqId, existedLOC);
            }
            for (Requirement requirement : requirements) {
                List<GradeEvaluator> loc = locMap.get(requirement.getId());
                if(loc != null && !loc.isEmpty()){
                    WorkEvaluationResponse workEvalResponse = new WorkEvaluationResponse();
                    workEvalResponse.setId(requirement.getId());
                    workEvalResponse.setReqTitle(requirement.getReqTitle());
                    workEvalResponse.setStudentId(requirement.getStudent().getId());
                    workEvalResponse.setStudentFullname(requirement.getStudent().getFullname());
                    workEvalResponse.setStatus(requirement.getStatus());
                    workEvalResponse.setMilestoneId(requirement.getMilestone().getId());
                    workEvalResponse.setMilestoneTitle(requirement.getMilestone().getTitle());
                    workEvalResponse.setGradeEvaluatorList(loc);
                    workEvaluationResponses.add(workEvalResponse);
                }
            }
        }
        response.setWorkEvaluationResponses(workEvaluationResponses);
        return response;
    }
    @Transactional
    public Object evaluateReqForGrandFinal(EvaluateReqForGrandFinal request) {
        request.validateInput();
        if(request.getEvalRequirements().size() == 0)
            return "Không có dữ liệu để đánh giá";
        User evaluator = commonService.getCurrentUser();
        Team team = teamRepository.findById(request.getTeamId()).orElseThrow(() -> new RecordNotFoundException("Nhóm"));
        Session session = sessionRepository.findById(request.getSessionId()).orElseThrow(() -> new RecordNotFoundException("Phiên chấm"));
        CouncilTeam councilTeam = councilTeamRepository.findByTeamIdAndSessionId(
                team.getId(),
                session.getId()
        );
        if(councilTeam == null){
            return "Nhóm này chưa có hội đồng đánh giá";
        }
        List<WorkEvaluation> workEvaluations = new ArrayList<>();
        List<Requirement> requirements = new ArrayList<>();
        Milestone milestone = team.getClasses().getMilestones().stream()
                .filter(item -> item.getEvaluationType().equals(Constants.TypeAssignments.GRAND_FINAL))
                .findFirst().orElse(null);
        if(milestone == null){
            return "Lớp học này không có giai đoạn đánh giá hội đồng";
        }
        MilestoneCriteria criteria = milestone.getMilestoneCriteriaList().stream()
                .filter(MilestoneCriteria::getLocEvaluation)
                .findFirst().orElse(null);
        HashMap<Integer, User> emailSet = new HashMap<>();
        for (EvaluateRequirementRequest evalReq : request.getEvalRequirements()) {
            evalReq.validateInput();
            Requirement requirement = checkExistRequirement(evalReq.getReqId());
            Setting complexity = checkExistSetting(evalReq.getComplexityId(), "complexity");
            Setting quality = checkExistSetting(evalReq.getQualityId(), "quality");
            User student = checkExistStudent(requirement);
            workEvaluations.add(setWorkEvaluation(evalReq, requirement, complexity, quality, student,
                    evaluator.getId(), councilTeam.getId(), milestone));
            requirement.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(3));
            requirements.add(requirement);
            emailSet.putIfAbsent(student.getId(), student);
        }
        workEvaluationRepository.saveAll(workEvaluations);
        requirementRepository.saveAll(requirements);
        if(criteria != null){
            List<StudentEvaluation> studentEvaluations = new ArrayList<>();
            for (Integer userId : emailSet.keySet()) {
                Float loc = workEvaluationRepository.getTotalByUserIdAndMileIdInGrandFinal(
                        userId, milestone.getId(), councilTeam.getId(), evaluator.getId()
                );
                if (loc == null) {
                    loc = 0f;
                }
                float grade = Math.min(loc / milestone.getExpectedLoc() * 10, 10f);
                grade = Math.round(grade * 100) / 100.0f;
                BigDecimal gradeValue = BigDecimal.valueOf(grade);
                saveStudentEvaluation(loc, gradeValue.setScale(2, RoundingMode.HALF_UP).floatValue(), milestone,
                        criteria, emailSet.get(userId), studentEvaluations, evaluator.getId(), councilTeam.getId());
            }
            studentEvaluationRepository.saveAll(studentEvaluations);
            log.info("Student Eval: " + studentEvaluations.toString());
        }
        return "Đánh giá thành công";
    }

}
