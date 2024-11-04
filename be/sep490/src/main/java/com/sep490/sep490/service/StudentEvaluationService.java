package com.sep490.sep490.service;


import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.dto.BaseEvaluationDTO;
import com.sep490.sep490.dto.EvaluationResultDTO;
import com.sep490.sep490.dto.councilTeam.request.UpdateCouncilTeamStatus;
import com.sep490.sep490.dto.evaluation.request.EvaluateStudentForGrandFinal;
import com.sep490.sep490.dto.evaluation.request.SearchEvalForGrandFinal;
import com.sep490.sep490.dto.evaluation.response.FinalEvaluationResult;
import com.sep490.sep490.dto.evaluation.response.GradeEvaluator;
import com.sep490.sep490.dto.studentEvaluation.request.StudentEvalRequest;
import com.sep490.sep490.dto.studentEvaluation.request.StudentEvalSearchRequest;
import com.sep490.sep490.dto.studentEvaluation.response.StudentEvaluationResponse;
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
public class StudentEvaluationService{
    private final ClassesRepository classesRepository;
    private final CustomWorkEvaluationRepository customWorkEvaluationRepository;
    private final MilestoneRepository milestoneRepository;
    private final TeamEvaluationRepository teamEvaluationRepository;
    private final StudentEvaluationRepository studentEvaluationRepository;
    private final CustomStudentEvaluationRepository customStudentEvaluationRepository;
    private final CommonService commonService;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final SettingRepository settingRepository;
    private final CouncilTeamRepository councilTeamRepository;
    private final SessionRepository sessionRepository;
    private final CouncilRepository councilRepository;

//    public Object searchStudentEval(StudentEvalSearchRequest request) {
//        request.validateInput();
//        List<Object[]> rawResults = customStudentEvaluationRepository.searchEval(
//                    request.getClassId(),
//                    request.getTeamId(),
//                    request.getMilestoneId());
//        HashMap<String, Float> studentLocMap = new HashMap<>();
//        List<Object[]> totalLocs = customWorkEvaluationRepository.getTotalLocByMilestone(request.getMilestoneId());
//        for (Object[] result : totalLocs) {
//            studentLocMap.putIfAbsent((String)result[1], (Float) result[2]);
//        }
//        List<EvaluationResultDTO> results = new ArrayList<>();
//        Integer teamId = -1;
//        for (Object[] result : rawResults) {
//            EvaluationResultDTO dto = setEvaluationResultDTO(result, studentLocMap);
//            if(dto.getTeam() != null && dto.getTeam().getId() != null
//                    && !dto.getTeam().getId().equals(teamId) && dto.getEmail() != null){
//                addTeamEvaluation(results, dto);
//                teamId = dto.getTeam().getId();
//            }
//            results.add(dto);
//        }
//
//        return results;
//
//    }

    public Object searchStudentEval(StudentEvalSearchRequest request) {
//        request.validateInput();
        List<EvaluationResultDTO> results = new ArrayList<>();
        if(request.getClassId() == null || request.getMilestoneId() == null || request.getTeamId() == null){
            return results;
        }
//        List<Object[]> rawResults = customStudentEvaluationRepository.searchEval(
//                request.getClassId(),
//                request.getTeamId(),
//                request.getMilestoneId());
        HashMap<String, Float> studentLocMap = new HashMap<>();
//        List<Object[]> totalLocs = customWorkEvaluationRepository.getTotalLocByMilestone(request.getMilestoneId());
//        for (Object[] result : totalLocs) {
//            studentLocMap.putIfAbsent((String)result[1], (Float) result[2]);
//        }
        Classes classes = classesRepository.findById(request.getClassId())
                .orElseThrow(() -> new RecordNotFoundException("Class"));
        List<Milestone> milestones = classes.getMilestones();
        Milestone milestone = milestones.stream()
                .filter(item -> item.getId().equals(request.getMilestoneId()))
                .findFirst()
                .orElseThrow(() -> new RecordNotFoundException("Milestone"));
        Team team = milestones.stream().flatMap(item -> item.getTeams().stream())
                .filter(item -> item.getId().equals(request.getTeamId()))
                .findFirst().orElseThrow(() -> new RecordNotFoundException("Team"));
        addTeamEval(team, milestone, results, null, null);
        List<StudentEvaluation> studentEvaluations = milestone.getStudentEvaluations();
        HashMap<String, EvaluationResultDTO> gradeCommentMap = new HashMap<>();

        if(studentEvaluations != null && studentEvaluations.size() > 0){
            for (StudentEvaluation studentEvaluation : studentEvaluations) {
                EvaluationResultDTO evalResult = new EvaluationResultDTO(
                        studentEvaluation.getEvalGrade(),
                        studentEvaluation.getComment()
                );
                if(studentEvaluation.getCriteria() == null){
                    studentLocMap.putIfAbsent(studentEvaluation.getUser().getEmail(), studentEvaluation.getTotalLOC());
                    gradeCommentMap.putIfAbsent(studentEvaluation.getUser().getId() + "m", evalResult);
                }else{
                    gradeCommentMap.putIfAbsent(studentEvaluation.getUser().getId() +
                            "c" + studentEvaluation.getCriteria().getId(), evalResult);
                }
            }
        }
        setMembersEval(team, gradeCommentMap, milestone, results, studentLocMap);
//        Integer teamId = -1;
//        for (Object[] result : rawResults) {
//            EvaluationResultDTO dto = setEvaluationResultDTO(result, studentLocMap);
//            if(dto.getTeam() != null && dto.getTeam().getId() != null
//                    && !dto.getTeam().getId().equals(teamId) && dto.getEmail() != null){
//                addTeamEvaluation(results, dto);
//                teamId = dto.getTeam().getId();
//            }
//            results.add(dto);
//        }

        return results;

    }

    private void setMembersEval(Team team, HashMap<String, EvaluationResultDTO> gradeCommentMap,
                Milestone milestone, List<EvaluationResultDTO> results, HashMap<String, Float> studentLocMap) {
        if(team.getTeamMembers() != null && team.getTeamMembers().size() > 0){
            for (TeamMember teamMember : team.getTeamMembers()) {
                EvaluationResultDTO studentEval = setStudentEval(teamMember, milestone, results, studentLocMap);
                EvaluationResultDTO gradeComment = gradeCommentMap.get(teamMember.getMember().getId()+"m");
                if(gradeComment != null){
                    studentEval.setEvalGrade(gradeComment.getEvalGrade());
                    studentEval.setComment(gradeComment.getComment());
                }
                if(milestone.getMilestoneCriteriaList() != null && milestone.getMilestoneCriteriaList().size() > 0){
                    BaseEvaluationDTO[] criteriaArr = new BaseEvaluationDTO[milestone.getMilestoneCriteriaList().size()];
                    Float[] gradeArr = new Float[milestone.getMilestoneCriteriaList().size()];
                    String[] commentArr = new String[milestone.getMilestoneCriteriaList().size()];
                    for (int i = 0; i < milestone.getMilestoneCriteriaList().size(); i++) {
                        MilestoneCriteria criteria = milestone.getMilestoneCriteriaList().get(i);
                        EvaluationResultDTO criteriaEval = gradeCommentMap.get(teamMember.getMember().getId()+"c"+criteria.getId());
                        criteriaArr[i] = setCriteriaInfo(criteria);
                        if(criteriaEval != null){
                            gradeArr[i] = criteriaEval.getEvalGrade();
                            commentArr[i] = criteriaEval.getComment();
                        }else{
                            gradeArr[i] = null;
                            commentArr[i] = null;
                        }
                    }
                    studentEval.setCriteriaNames(criteriaArr);
                    studentEval.setEvalGrades(gradeArr);
                    studentEval.setComments(commentArr);
                }
                results.add(studentEval);
            }
        }
    }

    private EvaluationResultDTO setStudentEval(TeamMember teamMember, Milestone milestone, List<EvaluationResultDTO> results,
                                HashMap<String, Float> studentLocMap) {
        EvaluationResultDTO studentEval = new EvaluationResultDTO();
        studentEval.setEmail(teamMember.getMember().getEmail());
        studentEval.setFullname(teamMember.getMember().getFullname());
        convertTeamAndMileToDTO(teamMember.getTeam(), milestone, studentEval);
        studentEval.setTotalLoc(studentLocMap.get(studentEval.getEmail()));
        return studentEval;
    }

    private void addTeamEval(Team team, Milestone milestone, List<EvaluationResultDTO> results, Integer evaluatorId, Integer councilTeamId) {
        EvaluationResultDTO teamEval = new EvaluationResultDTO();
        convertTeamAndMileToDTO(team, milestone, teamEval);
        TeamEvaluation teamEvaluation = checkExistTeamEval(teamEval, null, evaluatorId, councilTeamId);
        if(teamEvaluation != null){
            teamEval.setComment(teamEvaluation.getComment());
            teamEval.setEvalGrade(teamEvaluation.getEvalGrade());
        }
        if(milestone.getMilestoneCriteriaList() != null && milestone.getMilestoneCriteriaList().size() > 0){
            BaseEvaluationDTO[] criteriaArr = new BaseEvaluationDTO[milestone.getMilestoneCriteriaList().size()];
            Float[] gradeArr = new Float[milestone.getMilestoneCriteriaList().size()];
            String[] commentArr = new String[milestone.getMilestoneCriteriaList().size()];
            for (int i = 0; i < milestone.getMilestoneCriteriaList().size(); i++) {
                MilestoneCriteria criteria = milestone.getMilestoneCriteriaList().get(i);
                TeamEvaluation teamEvaluationByCriteria = checkExistTeamEval(teamEval, criteria.getId(), evaluatorId, councilTeamId);
                criteriaArr[i] = setCriteriaInfo(criteria);
                if(teamEvaluationByCriteria != null){
                    gradeArr[i] = teamEvaluationByCriteria.getEvalGrade();
                    commentArr[i] = teamEvaluationByCriteria.getComment();
                }else{
                    gradeArr[i] = null;
                    commentArr[i] = null;
                }
            }
            teamEval.setCriteriaNames(criteriaArr);
            teamEval.setEvalGrades(gradeArr);
            teamEval.setComments(commentArr);
        }
        results.add(teamEval);
    }

    private void convertTeamAndMileToDTO(Team team, Milestone milestone, EvaluationResultDTO teamEval) {
        teamEval.setTeam(new BaseEvaluationDTO());
        teamEval.getTeam().setId(team.getId());
        teamEval.getTeam().setName(team.getTeamName());
        teamEval.setMilestone(new BaseEvaluationDTO());
        teamEval.getMilestone().setId(milestone.getId());
        teamEval.getMilestone().setName(milestone.getTitle());
        teamEval.getMilestone().setWeight(milestone.getEvalWeight());
        teamEval.getMilestone().setDisplayOrder(milestone.getDisplayOrder());
        teamEval.getMilestone().setTypeEvaluator(milestone.getTypeEvaluator());
        teamEval.getMilestone().setExpectedLoc(milestone.getExpectedLoc());
    }

    private BaseEvaluationDTO setCriteriaInfo(MilestoneCriteria criteria) {
        BaseEvaluationDTO criteriaDTO = new BaseEvaluationDTO();
        criteriaDTO.setId(criteria.getId());
        criteriaDTO.setName(criteria.getCriteriaName());
        criteriaDTO.setLocEvaluation(criteria.getLocEvaluation());
        criteriaDTO.setWeight(criteria.getEvalWeight());
        return criteriaDTO;
    }

//    private void addTeamEvaluation(List<EvaluationResultDTO> results, EvaluationResultDTO dto) {
//        EvaluationResultDTO teamEvalDTO = new EvaluationResultDTO();
//        teamEvalDTO.setMilestone(dto.getMilestone());
//        teamEvalDTO.setTeam(dto.getTeam());
//        TeamEvaluation teamEvaluation = checkExistTeamEval(dto, null);
//        if(teamEvaluation != null){
//            teamEvalDTO.setComment(teamEvaluation.getComment());
//            teamEvalDTO.setEvalGrade(teamEvaluation.getEvalGrade());
//        }
//        if(dto.getCriteriaNames() != null && dto.getCriteriaNames().length > 0){
//            BaseEvaluationDTO[] criteriaArr = new BaseEvaluationDTO[dto.getCriteriaNames().length];
//            Float[] gradeArr = new Float[dto.getCriteriaNames().length];
//            String[] commentArr = new String[dto.getCriteriaNames().length];
//            for (int i = 0; i < dto.getCriteriaNames().length; i++) {
//                TeamEvaluation teamEvaluationByCriteria = checkExistTeamEval(dto,
//                        dto.getCriteriaNames()[i].getId());
//                criteriaArr[i] = dto.getCriteriaNames()[i];
//                if(teamEvaluationByCriteria != null){
//                    gradeArr[i] = teamEvaluationByCriteria.getEvalGrade();
//                    commentArr[i] = teamEvaluationByCriteria.getComment();
//                }else{
//                    gradeArr[i] = null;
//                    commentArr[i] = null;
//                }
//            }
//            teamEvalDTO.setCriteriaNames(criteriaArr);
//            teamEvalDTO.setEvalGrades(gradeArr);
//            teamEvalDTO.setComments(commentArr);
//        }
//        results.add(teamEvalDTO);
//    }

    private TeamEvaluation checkExistTeamEval(EvaluationResultDTO dto, Integer criteriaId, Integer evaluatorId, Integer councilTeamId) {
        return teamEvaluationRepository.search(
                dto.getMilestone().getId(),
                dto.getTeam().getId(),
                criteriaId, evaluatorId, councilTeamId
        );
    }

    private EvaluationResultDTO setEvaluationResultDTO(Object[] result, HashMap<String, Float> studentLocMap) {
        EvaluationResultDTO dto = new EvaluationResultDTO();
        dto.setFullname((String) result[0]);
        dto.setEmail((String) result[1]);
        dto.setTeam(new BaseEvaluationDTO((Integer) result[2], (String) result[3]));
        dto.setMilestone(ConvertUtils.jsonToObject((String) result[4], BaseEvaluationDTO.class));
        dto.setTotalLoc(studentLocMap.get(dto.getEmail()));
        dto.setEvalGrade((Float) result[5]);
        dto.setComment((String) result[6]);
        dto.setCriteriaNames(ConvertUtils.jsonToObjectList((String) result[7], "\\|", BaseEvaluationDTO.class));
        dto.setEvalGrades(ConvertUtils.stringToArray((String)result[8], "\\|", Float.class));
        dto.setComments(ConvertUtils.stringToArray((String)result[9], "\\|", String.class));
        return dto;
    }
    @Transactional
    public Object evaluateStudent(List<StudentEvalRequest> request) {
        if(request == null || request.isEmpty())
            return "No data to evaluate!";
        List<StudentEvaluation> studentEvaluations = new ArrayList<>();
        List<TeamEvaluation> teamEvaluations = new ArrayList<>();
        for (StudentEvalRequest req : request) {
            req.validateInput(false);
            Milestone milestone = checkExistMilestone(req.getMilestoneId());
            MilestoneCriteria criteria = checkExistMilestoneCriteria(req.getCriteriaId(), milestone);
            Team team = checkExistTeam(req.getTeamId(), milestone);
            User user = checkExistUser(req.getEmail(), milestone);
            if(user != null)
                saveStudentEvaluation(req, milestone, criteria, user, null, null, studentEvaluations);
            if(team != null)
                saveTeamEvaluation(req, milestone, criteria, team, null, null, teamEvaluations);
        }
        studentEvaluationRepository.saveAll(studentEvaluations);
        teamEvaluationRepository.saveAll(teamEvaluations);
        return "Evaluate successfully!";
    }

    private void saveTeamEvaluation(StudentEvalRequest req, Milestone milestone,MilestoneCriteria criteria,
                                    Team team, User evaluator, Integer councilTeamId, List<TeamEvaluation> teamEvaluations) {
        Integer evaluatorId = null;
        if(evaluator != null){
            evaluatorId = evaluator.getId();
        }
        TeamEvaluation teamEvaluation = teamEvaluationRepository.search(
                milestone.getId(), req.getTeamId(), req.getCriteriaId(), evaluatorId, councilTeamId
        );
        if (teamEvaluation == null) {
            teamEvaluation = new TeamEvaluation();
            teamEvaluation.setMilestone(milestone);
            teamEvaluation.setTeam(team);
            teamEvaluation.setCriteria(criteria);
            if(evaluator != null){
                teamEvaluation.setEvaluator(evaluator);
                teamEvaluation.setCouncilTeamId(councilTeamId);
            }
        }
        teamEvaluation.setComment(req.getComment());
        teamEvaluation.setEvalGrade(req.getEvalGrade());
        teamEvaluations.add(teamEvaluation);
    }

    private void saveStudentEvaluation(StudentEvalRequest req, Milestone milestone, MilestoneCriteria criteria,
                                       User user, User evaluator, Integer councilTeamId, List<StudentEvaluation> studentEvaluations) {
        Integer evaluatorId = null;
        if(evaluator != null){
            evaluatorId = evaluator.getId();
        }
        Optional<StudentEvaluation> studentEvaluation;
        if(evaluatorId == null){
            studentEvaluation = studentEvaluationRepository.findStudentEvaluation(
                    milestone.getId(),
                    req.getCriteriaId(),
                    user.getId()
            );
        } else{
            studentEvaluation = studentEvaluationRepository.findStudentEvaluationInGrandFinal(
                    milestone.getId(),
                    req.getCriteriaId(),
                    user.getId(),
                    evaluatorId,
                    councilTeamId
            );
            //calculate again avg eval
            addAvgEvaluation(milestone, criteria, req, user, evaluatorId, councilTeamId, studentEvaluation, studentEvaluations);
        }

        //save by evaluator in council or teacher in class eval
        if(studentEvaluation.isPresent()){
            studentEvaluation.get().setComment(req.getComment());
            studentEvaluation.get().setEvalGrade(req.getEvalGrade());
            studentEvaluations.add(studentEvaluation.get());
        }else{
            StudentEvaluation newStudentEvaluation = new StudentEvaluation();
            newStudentEvaluation.setMilestone(milestone);
            newStudentEvaluation.setCriteria(criteria);
            newStudentEvaluation.setUser(user);
            newStudentEvaluation.setEvalGrade(req.getEvalGrade());
            newStudentEvaluation.setComment(req.getComment());
            if(evaluator != null){
                newStudentEvaluation.setEvaluator(evaluator);
                newStudentEvaluation.setCouncilTeamId(councilTeamId);
            }
            if(criteria == null)
                newStudentEvaluation.setTotalLOC(0f);
            studentEvaluations.add(newStudentEvaluation);
        }
    }

    private void addAvgEvaluation(Milestone milestone, MilestoneCriteria criteria, StudentEvalRequest req, User user,
                                  Integer evaluatorId, Integer councilTeamId, Optional<StudentEvaluation> studentEvaluation,
                                  List<StudentEvaluation> studentEvaluations) {
        Integer numberOfMembers = councilRepository.findCouncilMemberCountByCouncilTeamId(councilTeamId);
        List<StudentEvaluation> councilEvals = studentEvaluationRepository.findEvalByCouncilTeam(
                user.getId(),
                councilTeamId,
                evaluatorId,
                req.getCriteriaId()
        );
        StudentEvaluation avgEvaluation = null;
        float totalGrade = 0f, totalLOC = 0f;
//                Float grade = 0f;
        if(req.getEvalGrade() != null)
            totalGrade += req.getEvalGrade();
        if(studentEvaluation.isPresent() && req.getCriteriaId() == null){
            totalLOC += studentEvaluation.get().getTotalLOC();
        }
        int numberAlreadyEvaluated = 0;
        for (StudentEvaluation councilEval : councilEvals) {
            if(councilEval.getEvaluator() == null){
                avgEvaluation = councilEval;
            } else {
                totalGrade += (councilEval.getEvalGrade() == null) ? 0f : councilEval.getEvalGrade();
                if(req.getCriteriaId() == null)
                    totalLOC += councilEval.getTotalLOC();
                numberAlreadyEvaluated++;
            }
        }
        if(avgEvaluation == null){
            avgEvaluation = new StudentEvaluation();
            avgEvaluation.setMilestone(milestone);
            if(req.getCriteriaId() != null){
                avgEvaluation.setCriteria(new MilestoneCriteria());
                avgEvaluation.getCriteria().setId(req.getCriteriaId());
            }
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
        avgEvaluation.setTotalLOC(totalLOCRounded);
        if((avgEvaluation.getStatus() == null || !avgEvaluation.getStatus().equals(Constants.CouncilTeamStatus.REJECT))
            && req.getCriteriaId() == null){
            avgEvaluation.setStatus((numberAlreadyEvaluated == numberOfMembers - 1)
                    ? Constants.CouncilTeamStatus.EVALUATED : Constants.CouncilTeamStatus.EVALUATING);
            councilTeamRepository.updateStatusById(councilTeamId, avgEvaluation.getStatus());
        }
        studentEvaluations.add(avgEvaluation);
    }

    private MilestoneCriteria checkExistMilestoneCriteria(Integer criteriaId, Milestone milestone) {
        if(criteriaId == null)
            return null;
        if(milestone.getMilestoneCriteriaList() != null){
            for (MilestoneCriteria criteria : milestone.getMilestoneCriteriaList()) {
                if(criteria.getId().equals(criteriaId))
                    return criteria;
            }
        }
        throw new RecordNotFoundException("Criteria");
    }

    private User checkExistUser(String email, Milestone milestone) {
        if(email == null)
            return null;
        return userRepository.findFirstByEmail(email);
//        if(milestone.getTeams() != null){
//            List<TeamMember> teamMembers = milestone.getTeams().stream()
//                    .flatMap(team -> Optional.ofNullable(team.getTeamMembers()).stream().flatMap(Collection::stream))
//                    .toList();
//            for (TeamMember teamMember : teamMembers) {
//                if(teamMember.getMember().getEmail().equals(email))
//                    return teamMember.getMember();
//            }
//        }
//        throw new RecordNotFoundException("User");
    }

    private Team checkExistTeam(Integer teamId, Milestone milestone) {
        if(teamId == null)
            return null;
        return teamRepository.findById(teamId).orElseThrow(() -> new RecordNotFoundException("Team"));
//        if(milestone.getTeams() != null){
//            for (Team team : milestone.getTeams()) {
//                if(team.getId().equals(teamId))
//                    return team;
//            }
//        }
//        throw new RecordNotFoundException("Team");
    }

    private Milestone checkExistMilestone(Integer milestoneId) {
        return milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RecordNotFoundException("Milestone"));
    }

    public Object searchByClass(Integer classId) {
        Classes classes = classesRepository.findById(classId).orElseThrow(() -> new RecordNotFoundException("Class"));
        User user = commonService.getCurrentUser();
        if(user.getRole().getId().equals(Constants.Role.STUDENT)){
            return getClassStudentEvaluation(user, classes);
        }
        List<EvaluationResultDTO> results = new ArrayList<>();
        List<Milestone> milestones = classes.getMilestones().stream()
                .filter(item -> !item.getTypeEvaluator().equals(Constants.TypeAssignments.GRAND_FINAL))
                .sorted(Comparator.comparing(Milestone::getDisplayOrder))
                .toList();
        HashMap<String, EvaluationResultDTO> gradeCommentMap = new HashMap<>();
        HashMap<String, String> commentCriteriaMap = new HashMap<>();
        List<StudentEvaluation> studentEvaluations = milestones.stream()
                .flatMap(item -> item.getStudentEvaluations().stream())
                .toList();
        List<ClassUser> students = classes.getClassesUsers().stream()
                .filter(item -> item.getUser().getRole().getId().equals(Constants.Role.STUDENT))
                .toList();
        if(studentEvaluations.size() > 0){
            for (StudentEvaluation studentEval : studentEvaluations) {
                String key = studentEval.getUser().getId() + "m" + studentEval.getMilestone().getId();

                if (studentEval.getCriteria() == null) {
                    gradeCommentMap.putIfAbsent(key,
                            new EvaluationResultDTO(studentEval.getEvalGrade(),
                                    studentEval.getComment())
                    );
                } else if(studentEval.getComment() != null && studentEval.getComment().length() > 0){
                    StringBuilder comment = new StringBuilder();
                    if (commentCriteriaMap.get(key) != null) {
                        comment.append(commentCriteriaMap.get(key));
                    }
                    comment.append(studentEval.getCriteria().getCriteriaName()).append(": ");
                    comment.append(studentEval.getComment()).append("\n\n");
                    commentCriteriaMap.put(key, comment.toString());
                }
            }

        }

        for (ClassUser student : students) {
            EvaluationResultDTO dto = new EvaluationResultDTO();
            dto.setFullname(student.getUser().getFullname());
            dto.setEmail(student.getUser().getUsername());
            BaseEvaluationDTO[] milestoneArr = new BaseEvaluationDTO[milestones.size()];
            Float[] evalGrades = new Float[milestones.size()];
            String[] comments = new String[milestones.size()];
            for (int i = 0; i < milestones.size(); i++) {
                String key = student.getUser().getId() + "m" + milestones.get(i).getId();
                milestoneArr[i] = setMilestoneInfo(milestones.get(i));
                EvaluationResultDTO gradeComment = gradeCommentMap.get(key);
                String comment = commentCriteriaMap.get(key);
                if (gradeComment != null) {
                    evalGrades[i] = gradeComment.getEvalGrade();
                    if (gradeComment.getComment() != null && !gradeComment.getComment().isEmpty()) {
                        StringBuilder combinedComment = new StringBuilder();
                        combinedComment.append(milestones.get(i).getTitle()).append(": ").append(gradeComment.getComment());
                        if (comment != null && !comment.isEmpty()) {
                            combinedComment.append("\n\n").append(comment);
                        }
                        comments[i] = combinedComment.toString();
                    } else {
                        comments[i] = comment;
                    }
                } else {
                    evalGrades[i] = null;
                    comments[i] = comment;
                }
            }
            dto.setMilestones(milestoneArr);
            dto.setEvalGrades(evalGrades);
            dto.setComments(comments);
            results.add(dto);
        }

//        List<Object[]> rawResults = customStudentEvaluationRepository.searchStudentEvaluationByMilestone(classId);
//        for (Object[] result : rawResults) {
//            if(result[0] == null)
//                continue;
//            EvaluationResultDTO dto = new EvaluationResultDTO();
//            dto.setFullname((String)result[0]);
//            dto.setEmail((String) result[1]);
//            dto.setMilestones(ConvertUtils.jsonToObjectList((String) result[2], "\\|", BaseEvaluationDTO.class));
//            dto.setEvalGrades(ConvertUtils.stringToArray((String)result[3], "\\|", Float.class));
//            dto.setComments(ConvertUtils.stringToArray((String)result[4], "\\|", String.class));
//            results.add(dto);
//        }

        return results;
    }

    private BaseEvaluationDTO setMilestoneInfo(Milestone milestone) {
        BaseEvaluationDTO dto = new BaseEvaluationDTO();
        dto.setId(milestone.getId());
        dto.setName(milestone.getTitle());
        dto.setWeight(milestone.getEvalWeight());
        dto.setDisplayOrder(milestone.getDisplayOrder());
        dto.setTypeEvaluator(milestone.getTypeEvaluator());
        dto.setExpectedLoc(milestone.getExpectedLoc());
        return dto;
    }

    private Object getClassStudentEvaluation(User user, Classes classes) {
        List<StudentEvaluationResponse> responses = new ArrayList<>();
        List<Milestone> milestones = classes.getMilestones();

        if (milestones != null && milestones.size() > 0) {
            float total = 0;
            boolean isPass = true;
//            Milestone grandFinal = null;

            StudentEvaluationResponse finalResult = new StudentEvaluationResponse();
            finalResult.setId(-1);
            finalResult.setTitle("Final Result");
            finalResult.setWeight(100);
//            Optional<Milestone> mile = milestones.stream()
//                    .filter(m -> Constants.TypeAssignments.GRAND_FINAL.equals(m.getTypeEvaluator()))
//                    .findFirst();
            milestones = milestones.stream()
//                    .filter(m -> !Constants.TypeAssignments.GRAND_FINAL.equals(m.getTypeEvaluator()))
                    .sorted(Comparator.comparingInt(Milestone::getDisplayOrder))
                    .toList();

//            if (mile.isPresent()) {
//                grandFinal = mile.get();
//            }
//            HashMap<String, Float> studentLOCMap = new HashMap<>();
            for (Milestone milestone : milestones) {
                StudentEvaluationResponse studentEval = processMilestone(milestone, user);
                if (studentEval.getEvalGrade() != null && studentEval.getEvalGrade() > 0) {
                    total += studentEval.getEvalGrade() * studentEval.getWeight() / 100;
                } else {
                    isPass = false;
                }
                responses.add(studentEval);
            }
            BigDecimal rounded = new BigDecimal(total).setScale(2, RoundingMode.HALF_UP);
            finalResult.setEvalGrade(rounded.floatValue());
            finalResult.setStatus((isPass && total >= 5) ? "Pass" : "Not Pass");
            responses.add(finalResult);
        }

        return responses;
    }

    private StudentEvaluationResponse processMilestone(Milestone milestone, User user) {
        StudentEvaluationResponse studentEval = new StudentEvaluationResponse();
        studentEval.setId(milestone.getId());
        studentEval.setTitle(milestone.getTitle());
        studentEval.setWeight(milestone.getEvalWeight());

        HashMap<Integer, StudentEvaluationResponse> criteriaEvalMap = new HashMap<>();

        if (milestone.getStudentEvaluations() != null) {
            boolean isGrandFinal = milestone.getTypeEvaluator().equals(Constants.TypeAssignments.GRAND_FINAL);
            List<StudentEvaluation> studentEvaluations = milestone.getStudentEvaluations().stream()
                    .filter(item -> item.getEvaluator() == null
                        && (!isGrandFinal || item.getStatus() == null || !item.getStatus().equals(Constants.CouncilTeamStatus.REJECT)))
                    .toList();

            for (StudentEvaluation studentEvaluation : studentEvaluations) {
                if (studentEvaluation.getUser().getId().equals(user.getId())) {
                    if (studentEvaluation.getCriteria() == null) {
                        studentEval.setTotalLOC(studentEvaluation.getTotalLOC());
                        studentEval.setEvalGrade(studentEvaluation.getEvalGrade());
                        studentEval.setComment(studentEvaluation.getComment());
                        if(isGrandFinal && studentEvaluation.getCouncilTeamId() != null){
                            CouncilTeam councilTeam = councilTeamRepository.findById(studentEvaluation.getCouncilTeamId()).orElse(null);
                            if(councilTeam != null && councilTeam.getSession() != null){
                                studentEval.setSessionId(councilTeam.getSession().getId());
                                studentEval.setTeamId(councilTeam.getTeamId());
                            }
                        }
                    } else {
                        StudentEvaluationResponse studentCriteriaEval = new StudentEvaluationResponse();
                        studentCriteriaEval.setId(studentEvaluation.getCriteria().getId());
                        studentCriteriaEval.setTitle(studentEvaluation.getCriteria().getCriteriaName());
                        studentCriteriaEval.setWeight(studentEvaluation.getCriteria().getEvalWeight());
                        studentCriteriaEval.setEvalGrade(studentEvaluation.getEvalGrade());
                        studentCriteriaEval.setComment(studentEvaluation.getComment());
                        criteriaEvalMap.put(studentEvaluation.getCriteria().getId(), studentCriteriaEval);
                    }
                }
            }
        }

        if (milestone.getMilestoneCriteriaList() != null) {
            for (MilestoneCriteria milestoneCriteria : milestone.getMilestoneCriteriaList()) {
                if (criteriaEvalMap.get(milestoneCriteria.getId()) == null) {
                    StudentEvaluationResponse studentCriteriaEval = new StudentEvaluationResponse();
                    studentCriteriaEval.setId(milestoneCriteria.getId());
                    studentCriteriaEval.setTitle(milestoneCriteria.getCriteriaName());
                    studentCriteriaEval.setWeight(milestoneCriteria.getEvalWeight());
                    criteriaEvalMap.put(milestoneCriteria.getId(), studentCriteriaEval);
                }
            }
        }

        studentEval.setCriteriaList(criteriaEvalMap.values().stream().toList());
        return studentEval;
    }


//    private Object getClassStudentEvaluation(User user, Classes classes) {
//        List<StudentEvaluationResponse> responses = new ArrayList<>();
//        List<Milestone> milestones = classes.getMilestones();
//        if(milestones != null && milestones.size() > 0) {
//            float total = 0;
//            boolean isPass = true;
//            StudentEvaluationResponse finalResult = new StudentEvaluationResponse();
//            finalResult.setId(-1);
//            finalResult.setTitle("Final Result");
//            finalResult.setWeight(100);
//            Milestone grandFinal = null;
//            Optional<Milestone> mile = milestones.stream()
//                    .filter(m -> Constants.TypeAssignments.GRAND_FINAL.equals(m.getTypeEvaluator()))
//                    .findFirst();
//            milestones = milestones.stream()
//                    .filter(m -> !Constants.TypeAssignments.GRAND_FINAL.equals(m.getTypeEvaluator()))
//                    .sorted(Comparator.comparingInt(Milestone::getDisplayOrder))
//                    .toList();
//            if (mile.isPresent()) {
//                grandFinal = mile.get();
//            }
////            milestones = milestones.stream().sorted(Comparator.comparingInt(Milestone::getDisplayOrder)).toList();
//            HashMap<String, Float> studentLOCMap = new HashMap<>();
////            setStudentLOCMap(user, milestones, studentLOCMap);
//            for (Milestone milestone : milestones) {
//                StudentEvaluationResponse studentEval = new StudentEvaluationResponse();
//                studentEval.setId(milestone.getId());
//                studentEval.setTitle(milestone.getTitle());
//                studentEval.setWeight(milestone.getEvalWeight());
//                //studentEval.setTotalLOC(studentLOCMap.get(milestone.getId()+user.getEmail()));
//                HashMap<Integer, StudentEvaluationResponse> criteriaEvalMap = new HashMap<>();
//                if(milestone.getStudentEvaluations() != null){
//                    List<StudentEvaluation> studentEvaluations = milestone.getStudentEvaluations().stream()
//                            .filter(item -> item.getEvaluator() == null).toList();
//                    for (StudentEvaluation studentEvaluation : studentEvaluations) {
//                        if(studentEvaluation.getUser().getId().equals(user.getId())){
//                            if(studentEvaluation.getCriteria() == null){
//                                studentEval.setTotalLOC(studentEvaluation.getTotalLOC());
//                                studentEval.setEvalGrade(studentEvaluation.getEvalGrade());
//                                studentEval.setComment(studentEvaluation.getComment());
//                            } else{
//                                StudentEvaluationResponse studentCriteriaEval = new StudentEvaluationResponse();
//                                studentCriteriaEval.setId(studentEvaluation.getCriteria().getId());
//                                studentCriteriaEval.setTitle(studentEvaluation.getCriteria().getCriteriaName());
//                                studentCriteriaEval.setWeight(studentEvaluation.getCriteria().getEvalWeight());
//                                studentCriteriaEval.setEvalGrade(studentEvaluation.getEvalGrade());
//                                studentCriteriaEval.setComment(studentEvaluation.getComment());
//                                criteriaEvalMap.put(studentEvaluation.getCriteria().getId(), studentCriteriaEval);
//                            }
//                        }
//                    }
//                }
//                if(milestone.getMilestoneCriteriaList() != null){
//                    for (MilestoneCriteria milestoneCriteria : milestone.getMilestoneCriteriaList()) {
//                        if(criteriaEvalMap.get(milestoneCriteria.getId()) == null){
//                            StudentEvaluationResponse studentCriteriaEval = new StudentEvaluationResponse();
//                            studentCriteriaEval.setId(milestoneCriteria.getId());
//                            studentCriteriaEval.setTitle(milestoneCriteria.getCriteriaName());
//                            studentCriteriaEval.setWeight(milestoneCriteria.getEvalWeight());
//                            criteriaEvalMap.put(milestoneCriteria.getId(), studentCriteriaEval);
//                        }
//                    }
//                }
//                if (studentEval.getEvalGrade() != null && studentEval.getEvalGrade() > 0) {
//                    total += studentEval.getEvalGrade() * studentEval.getWeight() / 100;
//                } else {
//                    isPass = false;
//                }
//                studentEval.setCriteriaList(criteriaEvalMap.values().stream().toList());
//                responses.add(studentEval);
//            }
//            BigDecimal rounded = new BigDecimal(total).setScale(2, RoundingMode.HALF_UP);
//            finalResult.setEvalGrade(rounded.floatValue());
//            finalResult.setStatus((isPass && total >= 5) ? "Pass" : "Not Pass");
//            responses.add(finalResult);
//        }
//        return responses;
//    }

    private void setStudentLOCMap(User user, List<Milestone> milestones, HashMap<String, Float> studentLOCMap) {
        List<Object[]> totalLocs = customWorkEvaluationRepository
                .getTotalLocByMilestoneAndStudent(
                        milestones.stream().map(Milestone::getId).toList(),
                        user.getId()
                );
        for (Object[] result : totalLocs) {
            if(result[0] != null && result[1] != null){
                String key = result[0] + (String) result[1];
                studentLOCMap.putIfAbsent(key, (Float) result[2]);
            }
        }
    }

    public Object searchStudentEvalForGrandFinal(SearchEvalForGrandFinal request) {
        List<EvaluationResultDTO> results = new ArrayList<>();
        User currentUser = commonService.getCurrentUser();
        if(request.getSessionId() == null || request.getTeamId() == null){
            return results;
        }
        Team team = teamRepository.findById(request.getTeamId()).orElseThrow(() -> new RecordNotFoundException("Team"));
        Session session = sessionRepository.findById(request.getSessionId()).orElseThrow(() -> new RecordNotFoundException("Session"));
        CouncilTeam councilTeam = councilTeamRepository.findByTeamIdAndSessionId(
            team.getId(),
            session.getId()
        );
        if(councilTeam == null){
            return results;
        }
        HashMap<String, Float> studentLocMap = new HashMap<>();
        Milestone milestone = team.getClasses().getMilestones().stream()
                .filter(item -> item.getTypeEvaluator().equals(Constants.TypeAssignments.GRAND_FINAL))
                .findFirst().orElse(null);
        if(milestone == null)
            return "This class don't have grand final milestone";
        addTeamEval(team, milestone, results, currentUser.getId(), councilTeam.getId());
        List<StudentEvaluation> studentEvaluations = milestone.getStudentEvaluations();
        HashMap<String, EvaluationResultDTO> gradeCommentMap = new HashMap<>();

        if(studentEvaluations != null && studentEvaluations.size() > 0){
            studentEvaluations = studentEvaluations.stream()
                    .filter(item -> item.getCouncilTeamId() != null && item.getCouncilTeamId().equals(councilTeam.getId())
                        && item.getEvaluator() != null
                        && item.getEvaluator().getId().equals(currentUser.getId())
                    )
                    .toList();
            for (StudentEvaluation studentEvaluation : studentEvaluations) {
                EvaluationResultDTO evalResult = new EvaluationResultDTO(
                        studentEvaluation.getEvalGrade(),
                        studentEvaluation.getComment()
                );
                if(studentEvaluation.getCriteria() == null){
                    studentLocMap.putIfAbsent(studentEvaluation.getUser().getEmail(), studentEvaluation.getTotalLOC());
                    gradeCommentMap.putIfAbsent(studentEvaluation.getUser().getId() + "m", evalResult);
                }else{
                    gradeCommentMap.putIfAbsent(studentEvaluation.getUser().getId() +
                            "c" + studentEvaluation.getCriteria().getId(), evalResult);
                }
            }
        }

        //with 2nd round only get member rejected in previous round
        if(session.getSubjectSettingId() != null && session.getSemesterId() != null){
            Setting round = settingRepository.findById(session.getSubjectSettingId()).orElseThrow(() -> new RecordNotFoundException("Round"));
            Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", session.getSemesterId());
            if(semester == null){
                throw new RecordNotFoundException("Semester");
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
                List<TeamMember> teamMembers = new ArrayList<>();
                for (TeamMember teamMember : team.getTeamMembers()) {
                    if(memberIds.contains(teamMember.getMember().getId())){
                        teamMembers.add(teamMember);
                    }
                }
                team.setTeamMembers(teamMembers);
            }
        }

        setMembersEval(team, gradeCommentMap, milestone, results, studentLocMap);

        return results;
    }

    @Transactional
    public Object evaluateStudentForGrandFinal(EvaluateStudentForGrandFinal request) {
        if(request == null || request.getStudentEvals().isEmpty())
            return "No data to evaluate!";
        User evaluator = commonService.getCurrentUser();
        Team fTeam = teamRepository.findById(request.getTeamId()).orElseThrow(() -> new RecordNotFoundException("Team"));
        Session session = sessionRepository.findById(request.getSessionId()).orElseThrow(() -> new RecordNotFoundException("Session"));
        CouncilTeam councilTeam = councilTeamRepository.findByTeamIdAndSessionId(
                fTeam.getId(),
                session.getId()
        );
        if(councilTeam == null){
            throw new ConflictException("This team don't have a council team to conduct evaluations!");
        }
        Milestone milestone = fTeam.getClasses().getMilestones().stream()
                .filter(item -> item.getTypeEvaluator().equals(Constants.TypeAssignments.GRAND_FINAL))
                .findFirst().orElse(null);
        if(milestone == null){
            return "This class don't have grand final milestone!";
        }
        HashMap<Integer, MilestoneCriteria> criteriaHashMap = new HashMap<>();
        List<StudentEvaluation> studentEvaluations = new ArrayList<>();
        List<TeamEvaluation> teamEvaluations = new ArrayList<>();
        for (MilestoneCriteria mc : milestone.getMilestoneCriteriaList()) {
            criteriaHashMap.putIfAbsent(mc.getId(), mc);
        }
        for (StudentEvalRequest req : request.getStudentEvals()) {
            req.validateInput(true);
//            Milestone milestone = checkExistMilestone(req.getMilestoneId());
//            MilestoneCriteria criteria = checkExistMilestoneCriteria(req.getCriteriaId(), milestone);
            MilestoneCriteria criteria = null;
            if(req.getCriteriaId() != null){
                criteria = criteriaHashMap.get(req.getCriteriaId());
            }
            Team team = checkExistTeam(req.getTeamId(), milestone);
            User student = checkExistUser(req.getEmail(), milestone);
            if(student != null)
                saveStudentEvaluation(req, milestone, criteria, student, evaluator, councilTeam.getId(), studentEvaluations);
            if(team != null)
                saveTeamEvaluation(req, milestone, criteria, team, evaluator, councilTeam.getId(), teamEvaluations);
        }
        studentEvaluationRepository.saveAll(studentEvaluations);
        teamEvaluationRepository.saveAll(teamEvaluations);
        return "Evaluate successfully!";
    }

    public Object searchTotalEvalForGrandFinal(SearchEvalForGrandFinal request) {
            List<FinalEvaluationResult> response = new ArrayList<>();
            User currentUser = commonService.getCurrentUser();
            if(request.getTeamId() == null || request.getSemesterId() == null || request.getRoundId() == null){
                return response;
            }
            Team team = teamRepository.findById(request.getTeamId()).orElseThrow(() -> new RecordNotFoundException("Team"));
            List<Session> sessions = new ArrayList<>();
            if(request.getSemesterId() != null && request.getRoundId() != null){
                Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", request.getSemesterId());
                if(semester == null){
                    throw new RecordNotFoundException("Semester");
                }
                Setting round = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "round", request.getRoundId());
                if(round == null){
                    throw new RecordNotFoundException("Round");
                }
                sessions = sessionRepository.findBySemesterIdAndRoundId(semester.getId(), round.getId());
            }
            CouncilTeam councilTeam = councilTeamRepository.findByTeamIdAndSessionIds(
                    team.getId(),
                    sessions.stream().map(Session::getId).toList()
            );
            Milestone milestone = team.getClasses().getMilestones().stream()
                    .filter(item -> item.getTypeEvaluator().equals(Constants.TypeAssignments.GRAND_FINAL))
                    .findFirst().orElse(null);
            if(councilTeam == null || councilTeam.getCouncil() == null || team.getTeamMembers().isEmpty() || milestone == null){
                return response;
            }
            for (TeamMember teamMember : team.getTeamMembers()) {
                List<StudentEvaluation> studentEvaluations = studentEvaluationRepository.findByStudentIdAndCouncilTeam(
                        teamMember.getMember().getId(),
                        milestone.getId(),
                        councilTeam.getId()
                );
                setTotalStudentEval(response, studentEvaluations, teamMember, councilTeam, milestone);
            }
            return response;
        }

    private void setTotalStudentEval(List<FinalEvaluationResult> response, List<StudentEvaluation> studentEvaluations,
                                     TeamMember teamMember, CouncilTeam councilTeam, Milestone milestone) {
        FinalEvaluationResult dto = new FinalEvaluationResult();
        dto.setCouncilTeamId(councilTeam.getId());
        dto.setMilestoneId(milestone.getId());
        dto.setStudentId(teamMember.getMember().getId());
        dto.setFullname(teamMember.getMember().getFullname());
        dto.setEmail(teamMember.getMember().getEmail());
        dto.setUsername(teamMember.getMember().getUsername());
        dto.setClassId(teamMember.getTeam().getClasses().getId());
        dto.setClassCode(teamMember.getTeam().getClasses().getClassCode());
        dto.setTeamName(teamMember.getTeam().getTeamName());
        dto.setTeamId(teamMember.getTeam().getId());
        if(councilTeam.getSession() != null){
            dto.setSessionId(councilTeam.getSession().getId());
            dto.setSessionName(councilTeam.getSession().getName());
        }
        List<GradeEvaluator> gradeEvaluators = new ArrayList<>();
        if(!studentEvaluations.isEmpty()){
            HashMap<Integer, GradeEvaluator> gradeEvaluatorsMap = new HashMap<>();
            for (StudentEvaluation studentEvaluation : studentEvaluations) {
                if(studentEvaluation.getEvaluator() != null){
                    GradeEvaluator gradeEvaluator = ConvertUtils.convert(studentEvaluation.getEvaluator(), GradeEvaluator.class);
                    gradeEvaluator.setGrade(studentEvaluation.getEvalGrade());
                    gradeEvaluatorsMap.putIfAbsent(studentEvaluation.getEvaluator().getId(), gradeEvaluator);
                } else {
                    String status = (studentEvaluation.getStatus() == null || studentEvaluation.getStatus().equals(""))
                            ? Constants.CouncilTeamStatus.EVALUATING : studentEvaluation.getStatus();
                    dto.setAvgGrade(studentEvaluation.getEvalGrade());
                    dto.setStatus(status);
                    dto.setId(studentEvaluation.getId());
                }
            }
            for (CouncilMember councilMember : councilTeam.getCouncil().getCouncilMembers()) {
                GradeEvaluator gradeEvaluator = gradeEvaluatorsMap.get(councilMember.getMember().getId());
                if(gradeEvaluator == null){
                    gradeEvaluator = ConvertUtils.convert(councilMember.getMember(), GradeEvaluator.class);
                }
                gradeEvaluators.add(gradeEvaluator);
            }

        }
        dto.setGradeEvaluators(gradeEvaluators);
        response.add(dto);
    }
    @Transactional
    public Object updateStatus(UpdateCouncilTeamStatus request) {
        request.validateInput();
        CouncilTeam councilTeam = councilTeamRepository.findById(request.getCouncilTeamId()).orElseThrow(() -> new RecordNotFoundException("Council Team"));
        councilTeam.setStatus(request.getStatus());
        List<StudentEvaluation> studentEvaluations = new ArrayList<>();
        Milestone milestone = milestoneRepository.findById(request.getMilestoneId()).orElseThrow(() -> new RecordNotFoundException("Milestone"));
        List<MilestoneCriteria> milestoneCriteria = milestone.getMilestoneCriteriaList();
        for (Integer studentId : request.getStudentIds()) {
            List<StudentEvaluation> studentEvals = studentEvaluationRepository.findByStudentIdAndCouncilTeamWithoutEvaluator(
                    studentId,
                    request.getMilestoneId(),
                    request.getCouncilTeamId()
            );
            if(studentEvals == null || studentEvals.isEmpty() || (milestoneCriteria != null
                    && milestoneCriteria.size() + 1 != studentEvals.size())){
                StudentEvaluation studentEvaluation = new StudentEvaluation();
                studentEvaluation.setMilestone(new Milestone());
                studentEvaluation.getMilestone().setId(milestone.getId());
                studentEvaluation.setUser(new User());
                studentEvaluation.getUser().setId(studentId);
                studentEvaluation.setCouncilTeamId(request.getCouncilTeamId());
                studentEvaluation.setStatus(request.getStatus());
                studentEvaluations.add(studentEvaluation);
                if(milestoneCriteria != null){
                    for (MilestoneCriteria criteria : milestoneCriteria) {
                        StudentEvaluation criteriaEval = studentEvaluationRepository.findCriteriaEval(
                                studentId,
                                criteria.getId(),
                                request.getCouncilTeamId()
                        );
                        if(criteriaEval == null){
                            criteriaEval = new StudentEvaluation();
                            criteriaEval.setMilestone(new Milestone());
                            criteriaEval.getMilestone().setId(milestone.getId());
                            criteriaEval.setUser(new User());
                            criteriaEval.getUser().setId(studentId);
                            criteriaEval.setCouncilTeamId(request.getCouncilTeamId());
//                            studentEvaluation.setStatus(request.getStatus());
//                            studentEvaluations.add(studentEvaluation);
                        }
                        criteriaEval.setStatus(request.getStatus());
                        studentEvaluations.add(criteriaEval);
                    }
                }
            } else {
                for (StudentEvaluation studentEvaluation : studentEvals) {
                    studentEvaluation.setStatus(request.getStatus());
                    studentEvaluations.add(studentEvaluation);
                }
            }
        }
        councilTeamRepository.save(councilTeam);
        studentEvaluationRepository.saveAll(studentEvaluations);
        return "Update successfully";
    }
}
