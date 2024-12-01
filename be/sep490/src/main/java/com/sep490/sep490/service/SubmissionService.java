package com.sep490.sep490.service;


import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.dto.RequirementDTO;
import com.sep490.sep490.dto.SubmissionDTO;
import com.sep490.sep490.dto.requirement.request.SubmitRequirementRequest;
import com.sep490.sep490.dto.submission.request.SearchSubmissionRequest;
import com.sep490.sep490.dto.submission.response.SearchSubmissionResponse;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.mapper.SubmissionMapper;
import com.sep490.sep490.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@RequiredArgsConstructor
@Service
@Log4j2
public class SubmissionService{

    private final SubmissionRepository submissionRepository;
    private final MilestoneRepository milestoneRepository;
    private final TeamRepository teamRepository;
    private final SubmissionMapper submissionMapper;
    private final RequirementRepository requirementRepository;

    private final UpdateTrackingRepository updateTrackingRepository;
    private final WorkEvaluationRepository workEvaluationRepository;
    private final SettingRepository settingRepository;
    private final CommonService commonService;
    private final FirebaseStorageService firebaseStorageService;
    private final ClassesRepository classesRepository;
    private final TeamEvaluationRepository teamEvaluationRepository;

    public Object search(Object requestObject) {
        log.info("Search submission: ");
        var request = (SearchSubmissionRequest) requestObject;
        request.validateInput();
        SearchSubmissionResponse response = new SearchSubmissionResponse();
        response.setSubmissionDTOS(new ArrayList<>());
        if(request.getMilestoneId() == null && request.getTeamId() == null)
            return response;
        User user = commonService.getCurrentUser();
        List<Team> teams = new ArrayList<>();
        if(request.getMilestoneId() != null){
            teams = getLastTeams(request.getMilestoneId());
        }
        if(request.getIsSearchGrandFinal()){
            Team team = teamRepository.findById(request.getTeamId()).orElseThrow(() -> new RecordNotFoundException("Nhóm"));
            team.getClasses().getMilestones().stream().filter(item -> item.getEvaluationType().equals(Constants.TypeAssignments.GRAND_FINAL))
                            .findFirst().ifPresent(item ->  request.setMilestoneId(item.getId()));
            teams.add(team);
        }
        if(user.getRole().getId().equals(Constants.Role.STUDENT)){
            teams = teams.stream().filter(item -> item.getTeamMembers()
                    .stream().filter(member -> member.getMember().getId().equals(user.getId()))
                                    .toList().size() > 0
                    )
                    .toList();
            if(teams.size() == 0){
                return response;
            }
        } else{
           teams = teams.stream().filter(item -> request.getTeamId() == null || item.getId().equals(request.getTeamId())).toList();
        }
        Pageable pageable;
        if (request.getOrderBy().equals("DESC"))
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).descending());
        else
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).ascending());

        Page<Submission> submissions = submissionRepository.search(
                teams.stream().map(Team::getId).toList(),
                request.getMilestoneId(),
                pageable
        );
        User currentUser = commonService.getCurrentUser();
        List<SubmissionDTO> submissionDTOS = new ArrayList<>();
        if(currentUser.getRole().getId().equals(Constants.Role.STUDENT) && request.getTeamId() == null){
            return response;
        }
        for (Submission submission : submissions.getContent()) {
            var milestone = milestoneRepository.findById(submission.getMilestoneId()).orElseThrow(
                    () -> new RecordNotFoundException("Cột mốc")
            );
            var team = teamRepository.findById(submission.getTeamId()).orElseThrow(
                    () -> new RecordNotFoundException("Nhóm")
            );
//            var milestone = milestoneRepository.findById(submission.getMilestone().getId()).orElseThrow(
//                    () -> new RecordNotFoundException("Milestone")
//            );
//            var team = teamRepository.findById(submission.getTeam().getId()).orElseThrow(
//                    () -> new RecordNotFoundException("Team")
//            );
            List<Requirement> requirements = requirementRepository.findAllBySubmissionId(submission.getId());
            List<RequirementDTO> requirementDTOS = ConvertUtils.convertList(requirements, RequirementDTO.class);
            SubmissionDTO settingDTO = submissionMapper.convertSubmissionToSubmissionDTO(submission, team, milestone, requirementDTOS);
            submissionDTOS.add(settingDTO);
        }
        response.setSubmissionDTOS(submissionDTOS);
        response.setTotalElements(submissions.getTotalElements());
        response.setPageIndex(request.getPageIndex());
        response.setPageSize(request.getPageSize());
        response.setOrderBy(request.getOrderBy());
        response.setSortBy(request.getSortBy());

        return response;
    }

    private List<Team> getLastTeams(Integer milestoneId) {
        Milestone milestone = milestoneRepository.findById(milestoneId).orElseThrow(() -> new RecordNotFoundException("Cột mốc"));
        if(milestone != null){
            return milestone.getClasses().getTeams();
        }
        return new ArrayList<>();
    }


    @Transactional
    public Object submitWork(SubmitRequirementRequest request, MultipartFile file) {
//        request.validateInput(file);
        User currentUser = commonService.getCurrentUser();
        Team foundTeamByLeaderId = teamRepository.findByLeaderAndTeamId(currentUser.getId(), request.getTeamId());
        if (foundTeamByLeaderId == null){
            throw new ConflictException("Only leader can submit!");
        }
        String submitFile = "";
        if(file != null)
            submitFile = firebaseStorageService.uploadFile(file);

        List<Requirement> requirements = new ArrayList<>();
        Milestone foundMilestone = null;
        Submission finalSubmission = null;
        boolean isExistSubmit = false;

        for (int i = 0; i < request.getRequirementIds().size(); i++) {
            Requirement requirement = requirementRepository.findById(request.getRequirementIds().get(i))
                    .orElseThrow(() -> new RecordNotFoundException("Requirement"));
            Milestone milestone = requirement.getMilestone();
            foundMilestone = milestone;
            if (!milestone.getActive()){
                throw new ConflictException("Milestone " + milestone.getTitle() + " has been locked!");
            }
            Date currentDate = new Date();
            boolean isLate = milestone.getDueDate() != null && milestone.getDueDate().before(currentDate);
            requirement.setStatus(isLate ? "SUBMIT LATE" : Constants.RequirementStatus.REQUIREMENT_STATUSES.get(2));
            requirement.setStudent(new User());
            requirement.getStudent().setId(request.getAssigneeIds().get(i));

            Submission foundByTeamAndMilestone = submissionRepository.findByTeamIdAndMilestoneId(foundTeamByLeaderId.getId(), milestone.getId());
            if (foundByTeamAndMilestone == null){
                checkRequiredSubmit(request, submitFile, null, false);
                Submission newSubmission = new Submission();
                newSubmission.setTeamId(foundTeamByLeaderId.getId());
                newSubmission.setMilestoneId(milestone.getId());
                newSubmission.setSubmitLink(request.getLink());
                newSubmission.setSubmitFile(submitFile);
                newSubmission.setNote(request.getNote());
                newSubmission.setUpdatedBy(currentUser.getEmail());
                newSubmission.setUpdatedDate(new Date());

                TeamEvaluation foundTeamEvaluation = teamEvaluationRepository.findByTeamAndMilestone(foundTeamByLeaderId, milestone);
                if (foundTeamEvaluation == null){
                    newSubmission.setStatus(Constants.SubmitStatus.SUBMITTED);
                }
                else {
                    newSubmission.setStatus(Constants.SubmitStatus.EVALUATED);
                }
                submissionRepository.save(newSubmission);

                requirement.setSubmissionId(newSubmission.getId()); // Cập nhật submissionId vào requirement
                finalSubmission = newSubmission;
            }
            else {
                isExistSubmit = true;
                checkRequiredSubmit(request, submitFile, foundByTeamAndMilestone, true);
                foundByTeamAndMilestone.setSubmitLink(request.getLink());
                if(file != null)
                    foundByTeamAndMilestone.setSubmitFile(submitFile);
                foundByTeamAndMilestone.setNote(request.getNote());
                foundByTeamAndMilestone.setUpdatedBy(currentUser.getEmail());
                foundByTeamAndMilestone.setUpdatedDate(new Date());

                TeamEvaluation foundTeamEvaluation = teamEvaluationRepository.findByTeamAndMilestone(foundTeamByLeaderId, milestone);
                if (foundTeamEvaluation == null){
                    foundByTeamAndMilestone.setStatus(Constants.SubmitStatus.SUBMITTED);
                }
                else {
                    foundByTeamAndMilestone.setStatus(Constants.SubmitStatus.EVALUATED);
                }
                submissionRepository.save(foundByTeamAndMilestone);

                requirement.setSubmissionId(foundByTeamAndMilestone.getId()); // Cập nhật submissionId vào requirement
                finalSubmission = foundByTeamAndMilestone;
            }

            requirements.add(requirement);
        }

        if(isExistSubmit){
            requirementRepository.resetSubmitId(request.getRequirementIds(), finalSubmission.getId());
        }
        requirementRepository.saveAll(requirements);
        List<RequirementDTO> requirementDTOS = ConvertUtils.convertList(requirements, RequirementDTO.class);
        return submissionMapper.convertSubmissionToSubmissionDTO(finalSubmission, foundTeamByLeaderId, foundMilestone, requirementDTOS);
    }


    private void checkRequiredSubmit(SubmitRequirementRequest request, String submitFile, Submission submission, boolean isUpdate) {
        if(isUpdate){
            boolean isAlreadySubmitFile = submission.getSubmitFile() != null && !submission.getSubmitFile().isEmpty();
            if(!isAlreadySubmitFile
                    && ((request.getLink() == null || request.getLink().isEmpty()) && submitFile.isEmpty())){
                throw new ApiInputException("You need to submit file or link!");
            }
        }else{
            if((request.getLink() == null || request.getLink().isEmpty()) && submitFile.isEmpty()){
                throw new ApiInputException("You need to submit file or link!");
            }
        }
    }

    public Object get(Integer id) {
        return null;
    }
}
