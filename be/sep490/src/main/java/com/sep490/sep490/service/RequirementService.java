package com.sep490.sep490.service;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.RequirementDTO;
import com.sep490.sep490.dto.SubmissionDTO;
import com.sep490.sep490.dto.UpdateTrackingDTO;
import com.sep490.sep490.dto.requirement.request.*;
import com.sep490.sep490.dto.requirement.response.SearchRequirementResponse;
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
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Log4j2
public class RequirementService{
    private final RequirementRepository requirementRepository;
    private final UpdateTrackingRepository updateTrackingRepository;
    private final WorkEvaluationRepository workEvaluationRepository;
    private final MilestoneRepository milestoneRepository;
    private final TeamRepository teamRepository;
    private final SettingRepository settingRepository;
    private final CommonService commonService;
    private final FirebaseStorageService firebaseStorageService;
    private final ClassesRepository classesRepository;
    private final TeamEvaluationRepository teamEvaluationRepository;
    private final SubmissionRepository submissionRepository;
    private final SubmissionMapper submissionMapper;
    private final UserRepository userRepository;

    public Object searchRequirements(SearchRequirementRequest request){
        log.info("search requirements:");
        request.validateInput();
        User user = commonService.getCurrentUser();
        if(request.getIsCurrentRequirements() && request.getMilestoneId() != null){
            getCurrentTeamId(request, user);
        }
        Pageable pageable;
        if (request.getOrderBy().equals("DESC"))
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).descending());
        else
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).ascending());

        Page<Requirement> requirements = requirementRepository.search(
                request.getTitle(),
                request.getStatus(),
                request.getComplexityId(),
                request.getUserId(),
                request.getTeamId(),
                request.getMilestoneId(),
//                request.getIsCurrentRequirements(),
//                user.getId(),
                pageable
        );
        List<RequirementDTO> requirementDTOs = ConvertUtils.convertList(requirements.getContent(), RequirementDTO.class);

        SearchRequirementResponse response = new SearchRequirementResponse();
        response.setRequirementDTOs(requirementDTOs);
        response.setTotalElements(requirements.getTotalElements());
        response.setSortBy(request.getSortBy());
        response.setPageSize(request.getPageSize());
        response.setPageIndex(request.getPageIndex());
        response.setOrderBy(request.getOrderBy());

        return response;
    }

    private void getCurrentTeamId(SearchRequirementRequest request, User user) {
        Milestone milestone = checkExistMilestone(request.getMilestoneId());
        if (milestone.getTeams() != null) {
//            milestone.getTeams().stream()
//                    .filter(team -> team.getTeamMembers() != null)
//                    .flatMap(team -> team.getTeamMembers().stream())
//                    .filter(teamMember -> teamMember.getMember().getId().equals(user.getId()))
//                    .findFirst()
//                    .ifPresent(teamMember -> request.setTeamId(teamMember.getTeam().getId()));
            List<Milestone> milestones = milestone.getClasses().getMilestones().stream()
                    .sorted(Comparator.comparing(Milestone::getDisplayOrder))
                    .toList();
            if(milestones.size() > 1){
                int lastMilestoneId = milestones.get(0).getId(), index = -1;
                for (int i = 1; i < milestones.size(); i++) {
                    if(milestone.getId().equals(milestones.get(i).getId())){
                        index = i-1;
                        break;
                    }
                }
                while (index >= 0){
                    if(milestones.get(index).getTeams() != null && milestones.get(index).getTeams().size() > 0){
                        lastMilestoneId = milestones.get(index).getId();
                        break;
                    }
                    index--;
                }
                List<Team> teams = teamRepository.findByMilestoneId(lastMilestoneId);
                teams.stream().flatMap(item -> item.getTeamMembers().stream())
                        .filter(teamMember -> teamMember.getMember().getId().equals(user.getId()))
                        .findFirst()
                        .ifPresent(teamMember -> request.setTeamId(teamMember.getTeam().getId()));
            }
        }
    }

    public List<RequirementDTO> create(RequirementDTO request, Milestone milestone,
                                       List<Team> teams, boolean isNeedValidate) {
        log.info("create requirement for teams:");
        if(isNeedValidate)
            request.validateInput(false);
        if(milestone == null)
            milestone = checkExistMilestone(request.getMilestoneId());
        if(teams == null)
            teams = checkExistTeams(request.getTeamIds(), milestone);
        Setting complexity = checkExistComplexity(request.getComplexityId());
        List<Requirement> requirements = new ArrayList<>();
        for (Team team : teams) {
            Requirement existedByTitle = requirementRepository.checkExistedByTitle(null, team.getId(), request.getReqTitle());
            if(existedByTitle != null)
                throw new NameAlreadyExistsException(request.getReqTitle() + " in " + team.getTeamName());
            Requirement requirement = setBaseRequirement(request);
            requirement.setMilestone(milestone);
            requirement.setTeam(team);
            requirement.setComplexity(complexity);
            requirements.add(requirement);
        }
        requirementRepository.saveAll(requirements);
        return ConvertUtils.convertList(requirements, RequirementDTO.class);
    }
    @Transactional
    public Object update(UpdateRequirementRequest request) {
        log.info("update requirement:");
        request.validateInput();
        User user = commonService.getCurrentUser();
        Setting complexity = checkExistComplexity(request.getComplexityId());
        List<Requirement> requirements = new ArrayList<>();
        for (Integer requirementId : request.getRequirementIds()) {
            Requirement requirement = requirementRepository.findById(requirementId)
                    .orElseThrow(() -> new RecordNotFoundException("Requirement"));
            if(requirement.getStudent() != null
                    && user.getRole().getId().equals(Constants.Role.STUDENT)
                    && !requirement.getStudent().getId().equals(user.getId()))
                throw new ConflictException("You can't modify another member's requirements!");
            setUpdateRequirement(requirement, request, complexity);
            requirements.add(requirement);
        }
        requirementRepository.saveAll(requirements);
        return ConvertUtils.convertList(requirements, RequirementDTO.class);
    }
    @Transactional
    public Object addRequirements(AddRequirementList request){
        request.validateInput();
        Milestone milestone = checkExistMilestone(request.getMilestoneId());
        List<Team> teams = checkExistTeams(request.getTeamIds(), milestone);
        deleteRequirementsByTeamIds(teams, milestone.getId());
        List<RequirementDTO> response = new ArrayList<>();
        for (RequirementDTO requirementDTO : request.getRequirementDTOs()) {
            response.addAll(create(requirementDTO, milestone, teams, false));
        }
        return response;
    }
    @Transactional
    public void deleteByIds(List<Integer> ids){
        if(ids == null || ids.isEmpty())
            return;
        updateTrackingRepository.deleteByReqIds(ids);
        workEvaluationRepository.deleteByReqIds(ids);
        requirementRepository.deleteAllByIds(ids);
    }

    private void deleteRequirementsByTeamIds(List<Team> teams, Integer milestoneId) {
        for (Team team : teams) {
            if(team.getRequirements() != null && !team.getRequirements().isEmpty()){
                List<Integer> reqIds = team.getRequirements().stream()
                        .filter(item -> item.getMilestone().getId().equals(milestoneId)
                            && !item.getStatus().equals(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(3))
                        )
                        .map(Requirement::getId).toList();
                updateTrackingRepository.deleteByReqIds(reqIds);
                workEvaluationRepository.deleteByReqIds(reqIds);
                requirementRepository.deleteAllByIds(reqIds);
            }
//            requirementRepository.deleteByTeamId(team.getId(), milestoneId);
        }
    }

    private void setUpdateRequirement(Requirement requirement, UpdateRequirementRequest request, Setting complexity) {
        if(request.getReqTitle() != null && request.getReqTitle().length() > 0) {
            if(requirement.getTeam() != null){
                Requirement existedByTitle = requirementRepository
                        .checkExistedByTitle(requirement.getId(), requirement.getTeam().getId(), request.getReqTitle());
                if(existedByTitle != null)
                    throw new NameAlreadyExistsException(request.getReqTitle() + " in " + requirement.getTeam().getTeamName());
            }
            requirement.setReqTitle(request.getReqTitle());
        }
        if(request.getNote() != null && request.getNote().length() > 0) {
            requirement.setNote(request.getNote());
        }
        if(request.getStatus() != null)
            requirement.setStatus(request.getStatus());
        if(complexity != null)
            requirement.setComplexity(complexity);
        if(request.getStudentId() != null){
            if(requirement.getStudent() != null && requirement.getStudent().getId().equals(request.getStudentId())){
                return;
            }
            if(request.getStudentId().equals(-1)){
                workEvaluationRepository.deleteByReqIds(List.of(requirement.getId()));
                updateTrackingRepository.deleteByReqIds(List.of(requirement.getId()));
                requirement.setStudent(null);
                return;
            }
            if(requirement.getTeam().getTeamMembers() != null){
                List<TeamMember> teamMembers = requirement.getTeam().getTeamMembers();
                for (TeamMember teamMember : teamMembers) {
                    if(teamMember.getMember().getId().equals(request.getStudentId())){
                        workEvaluationRepository.deleteByReqIds(List.of(requirement.getId()));
                        updateTrackingRepository.deleteByReqIds(List.of(requirement.getId()));
                        requirement.setStudent(teamMember.getMember());
                        return;
                    }
                }
                throw new ConflictException(String.format("The student with id %d is not in the team %s",
                        request.getStudentId(), requirement.getTeam().getTeamName()));
            }
        }
    }

    public Setting checkExistComplexity(Integer complexityId) {
        if(complexityId == null)
            return null;
        Setting complexity = (Setting)settingRepository.findSettingBySettingTypeAndSettingId("complexity", complexityId);
        if(complexity == null)
            throw new RecordNotFoundException("Complexity");
        return complexity;
    }

    private Milestone checkExistMilestone(Integer milestoneId) {
        return milestoneRepository.findById(milestoneId).orElseThrow(
                () -> new RecordNotFoundException("Milestone")
        );
    }

    private List<Team> checkExistTeams(List<Integer> teamIds, Milestone milestone) {
        List<Team> teams = new ArrayList<>();
        for (Integer teamId : teamIds) {
            Team team = (teamRepository.findById(teamId).orElseThrow(() -> new RecordNotFoundException("Team")));
//            if(!team.getMilestone().getId().equals(milestone.getId()))
//                throw new ConflictException(String.format("The %s doesn't exist in %s",
//                        team.getTeamName(), milestone.getTitle()));
            teams.add(team);
        }
        return teams;
    }

    private Requirement setBaseRequirement(RequirementDTO request) {
        User user = commonService.getCurrentUser();
        Requirement requirement = new Requirement();
        requirement.setReqTitle(request.getReqTitle());
        requirement.setNote(request.getNote());
        requirement.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(0));
//        requirement.setStatus(user.getRole().getId().equals(Constants.Role.STUDENT) ?
//                Constants.RequirementStatus.REQUIREMENT_STATUSES.get(4)
//                : Constants.RequirementStatus.REQUIREMENT_STATUSES.get(0));
        return requirement;
    }
//    @Transactional
//    public Object submitWork(SubmitRequirementRequest request, MultipartFile file) {
//        request.validateInput(file);
//        String submission = request.getLink();
//        if(request.getSubmitType().equals("file")){
//            submission = firebaseStorageService.uploadFile(file);
//        }
//        User currentUser = commonService.getCurrentUser();
//        List<Requirement> requirements = new ArrayList<>();
//        for (Integer requirementId : request.getRequirementIds()) {
//            Requirement requirement = requirementRepository.findById(requirementId)
//                    .orElseThrow(() -> new RecordNotFoundException("Requirement"));
//            if(requirement.getStatus().equals(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(4))){
//                throw new ConflictException("You can't submit work waiting for approval requirements!");
//            }
//            User user = requirement.getStudent();
//            if(user == null){
//                throw new ConflictException("You only can submit assigned requirement!");
//            }else if(currentUser.getRole().getId().equals(Constants.Role.STUDENT)
//                && !currentUser.getId().equals(user.getId())){
//                throw new ConflictException("You can't submit work for another member's requirements!");
//            }
//            if (requirement.getWorkEvaluations().isEmpty()){
//                Milestone milestone = requirement.getMilestone();
//                Date currentDate = new Date();
//                boolean isLate = milestone.getDueDate() != null && milestone.getDueDate().before(currentDate);
//                requirement.setSubmitType(request.getSubmitType());
//                requirement.setSubmission(submission);
//                requirement.setNote(request.getNote());
//                requirement.setStatus(isLate ? "SUBMIT LATE" : Constants.RequirementStatus.REQUIREMENT_STATUSES.get(2));
//                requirement.setStudent(user);
//            }
//            else {
//                UpdateTracking updateTracking = new UpdateTracking();
//                updateTracking.setRequirement(requirement);
//                updateTracking.setSubmitType(request.getSubmitType());
//                updateTracking.setStudent(user);
//                updateTracking.setSubmission(submission);
//                updateTracking.setNote(request.getNote());
//                if(requirement.getUpdateTrackings() == null)
//                    requirement.setUpdateTrackings(new ArrayList<>());
//                requirement.getUpdateTrackings().add(updateTracking);
//            }
//
//            requirements.add(requirement);
//        }
//        requirementRepository.saveAll(requirements);
//        return ConvertUtils.convertList(requirements, RequirementDTO.class);
//    }
//

    @Transactional
    public Object submitWork(SubmitRequirementRequest request, MultipartFile file) {
        request.validateInput(file, true);
        User currentUser = commonService.getCurrentUser();
        Team foundTeamByLeaderId = teamRepository.findByLeaderAndTeamId(currentUser.getId(), request.getTeamId());
        if (foundTeamByLeaderId == null){
            throw new ConflictException("Only leader can submit!");
        }
        Milestone milestone = milestoneRepository.findById(request.getMilestoneId()).orElseThrow(() -> new RecordNotFoundException("Milestone"));
        if (!milestone.getActive() && !milestone.getTypeEvaluator().equals(Constants.TypeAssignments.GRAND_FINAL)){
            throw new ConflictException("Milestone " + milestone.getTitle() + " has been locked!");
        }
        String submitFile = "";
        if(file != null) {
            submitFile = firebaseStorageService.uploadFile(file);
            ValidateUtils.checkLength(submitFile, "File name", 0, 750);
        }
        List<Requirement> requirements = new ArrayList<>();
        boolean isExistSubmit = false;
        Date currentDate = new Date();
        boolean isLate = milestone.getDueDate() != null && milestone.getDueDate().before(currentDate);

        List<Integer> existingRequirementIds = new ArrayList<>();
        Submission foundByTeamAndMilestone = submissionRepository.findByTeamIdAndMilestoneId(foundTeamByLeaderId.getId(), milestone.getId());
        if (foundByTeamAndMilestone == null){
            checkRequiredSubmit(request, submitFile, null, false);
            foundByTeamAndMilestone = new Submission();
            foundByTeamAndMilestone.setTeamId(foundTeamByLeaderId.getId());
            foundByTeamAndMilestone.setMilestoneId(milestone.getId());
            foundByTeamAndMilestone.setSubmitLink(request.getLink());
            foundByTeamAndMilestone.setSubmitFile(submitFile);
            foundByTeamAndMilestone.setNote(request.getNote());
            foundByTeamAndMilestone.setUpdatedBy(currentUser.getEmail());
            foundByTeamAndMilestone.setUpdatedDate(currentDate);
            foundByTeamAndMilestone.setStatus(Constants.SubmitStatus.SUBMITTED);
            submissionRepository.save(foundByTeamAndMilestone);
        } else{
            checkRequiredSubmit(request, submitFile, foundByTeamAndMilestone, true);
            foundByTeamAndMilestone.setSubmitLink(request.getLink());
            if(file != null)
                foundByTeamAndMilestone.setSubmitFile(submitFile);
            foundByTeamAndMilestone.setNote(request.getNote());
            foundByTeamAndMilestone.setUpdatedBy(currentUser.getEmail());
            foundByTeamAndMilestone.setUpdatedDate(currentDate);
            foundByTeamAndMilestone.setStatus(Constants.SubmitStatus.SUBMITTED);
            submissionRepository.save(foundByTeamAndMilestone);
            isExistSubmit = true;
        }
//        if(milestone.getTypeEvaluator().equals(Constants.TypeAssignments.GRAND_FINAL)){
//            submitWorkForGrandFinal(foundByTeamAndMilestone, milestone, foundTeamByLeaderId, isLate);
//            return "Submit successfully!";
//        }
        for (int i = 0; i < request.getRequirementIds().size(); i++) {
            Requirement requirement = requirementRepository.findById(request.getRequirementIds().get(i))
                    .orElseThrow(() -> new RecordNotFoundException("Requirement"));
            if(!requirement.getStatus().equals(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(3))){
                requirement.setStatus(isLate ? "SUBMIT LATE" : Constants.RequirementStatus.REQUIREMENT_STATUSES.get(2));
            }
            requirement.setStudent(new User());
            requirement.getStudent().setId(request.getAssigneeIds().get(i));
            requirement.setSubmissionId(foundByTeamAndMilestone.getId());
            requirements.add(requirement);
            existingRequirementIds.add(requirement.getId());
        }

        if (isExistSubmit) {
            List<Requirement> oldRequirements = requirementRepository.findAllBySubmissionId(foundByTeamAndMilestone.getId());
            for (Requirement oldRequirement : oldRequirements) {
                if (!existingRequirementIds.contains(oldRequirement.getId())) {
                    oldRequirement.setSubmissionId(null);
                    oldRequirement.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(1));
                    requirements.add(oldRequirement);
                }
            }
        }
        requirementRepository.saveAll(requirements);
        return "Submit successfully!";
    }

    private void submitWorkForGrandFinal(Submission submission, Milestone milestone, Team team, boolean isLate) {
        List<Requirement> cloneRequirementList = requirementRepository.findAllBySubmissionId(submission.getId());

        milestone.getClasses().getMilestones().stream()
                .filter(item -> item.getTypeEvaluator().equals(Constants.TypeAssignments.FINAL))
                .flatMap(item -> item.getRequirements().stream())
                .forEach(req -> {
                    if (req.getTeam() != null && team.getId().equals(req.getTeam().getId())
                        && req.getStudent() != null &&
                            !req.getStatus().equals(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(4))) {
                        Requirement clonedReq = new Requirement();
                        clonedReq.setNote(req.getNote());
                        clonedReq.setStudent(req.getStudent());
                        clonedReq.setId(null);
                        clonedReq.setMilestone(milestone);
                        clonedReq.setTeam(req.getTeam());
                        clonedReq.setComplexity(req.getComplexity());
                        clonedReq.setReqTitle(req.getReqTitle());
                        clonedReq.setStatus(isLate ? "SUBMIT LATE" : Constants.RequirementStatus.REQUIREMENT_STATUSES.get(2));
                        if(!isExistedByTitle(req.getReqTitle(), cloneRequirementList)){
                            cloneRequirementList.add(clonedReq);
                        }
                    }
                });
    }

    private boolean isExistedByTitle(String reqTitle, List<Requirement> cloneRequirementList) {
        for (Requirement requirement : cloneRequirementList) {
            if(reqTitle.equals(requirement.getReqTitle())){
                return true;
            }
        }
        return false;
    }


    private void checkRequiredSubmit(SubmitRequirementRequest request, String submitFile, Submission submission, boolean isUpdate) {
        if(isUpdate){
            boolean isAlreadySubmitFile = submission.getSubmitFile() != null && !submission.getSubmitFile().equals("");
            if(!isAlreadySubmitFile
                    && ((request.getLink() == null || request.getLink().equals("")) && submitFile.equals(""))){
                throw new ApiInputException("You need to submit file or link!");
            }
        }else{
            if((request.getLink() == null || request.getLink().equals("")) && submitFile.equals("")){
                throw new ApiInputException("You need to submit file or link!");
            }
        }
    }

    public Object getByClass(SearchReqByClass request) {
        request.validateInput();
        Classes classes = classesRepository.findById(request.getClassId())
                .orElseThrow(() -> new RecordNotFoundException("Class"));
        List<Integer> milestoneIds = classes.getMilestones().stream()
                .map(Milestone::getId)
                .filter(id -> request.getMilestoneId() == null || id.equals(request.getMilestoneId()))
                .toList();

        Pageable pageable;
        if (request.getOrderBy().equals("DESC"))
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).descending());
        else
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).ascending());

        Page<Requirement> requirements = requirementRepository.searchByClass(
                milestoneIds,
                request.getTeamId(),
                request.getTitle(),
                pageable
        );
        SearchRequirementResponse response = new SearchRequirementResponse();
        List<RequirementDTO> requirementDTOs = new ArrayList<>();
        for (Requirement req : requirements.getContent()) {
            RequirementDTO requirementDTO = ConvertUtils.convert(req, RequirementDTO.class);
            requirementDTO.setMilestoneId(req.getMilestone().getId());
            requirementDTO.setMilestoneTitle(req.getMilestone().getTitle());
            requirementDTOs.add(requirementDTO);
        }
        response.setRequirementDTOs(requirementDTOs);
        response.setTotalElements(requirements.getTotalElements());
        response.setSortBy(request.getSortBy());
        response.setPageSize(request.getPageSize());
        response.setPageIndex(request.getPageIndex());
        response.setOrderBy(request.getOrderBy());

        return response;
    }
    @Transactional
    public Object moveRequirements(MoveRequirementRequest request) {
        request.validateInput();
        Milestone milestone = checkExistMilestone(request.getMilestoneId());
        List<Team> teams = new ArrayList<>();
        if(request.getTeamIds() != null && !request.getTeamIds().isEmpty()) {
            teams = checkExistTeams(request.getTeamIds(), milestone);
        }
        List<Requirement> requirements = new ArrayList<>();
        List<Integer> deleteRequirementIds = new ArrayList<>();
        for (Integer reqId : request.getRequirementIds()) {
            Requirement requirement = requirementRepository.findById(reqId)
                    .orElseThrow(() -> new RecordNotFoundException("Requirement"));
            if(requirement.getStatus().equals(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(3))){
                throw new ConflictException("Can not move evaluated requirement!");
            }
            if(!requirement.getMilestone().getId().equals(milestone.getId())){
                // Check xem tồn tại req này trong mile khác chưa?
//                Requirement existedByTitleInMilestone = requirementRepository
//                        .checkExistedByTitleInMilestone(milestone.getId(), requirement.getReqTitle().toLowerCase());
//                if(existedByTitleInMilestone != null){
//                    throw new NameAlreadyExistsException(requirement.getReqTitle() + " in " + milestone.getTitle());
//                }
                // Khi move req thì cần phải xoá req trong mile cũ
                deleteRequirementIds.add(requirement.getId());
                //requirements.add(setNewBaseRequirement(requirement, null, milestone));
                for (Team team : teams) {
                    // milestone mới cần chuyển req vào
                    Requirement newRequirement = setNewBaseRequirement(requirement, team, milestone);
                    Requirement existedByTitle = requirementRepository
                            .checkExistedByTitleAndMileId(milestone.getId(), team.getId(),
                                    newRequirement.getReqTitle().toLowerCase());
                    if(existedByTitle != null)
                        throw new NameAlreadyExistsException(newRequirement.getReqTitle() + " in " + team.getTeamName());
                    requirements.add(newRequirement);
                }
            }
        }
        requirementRepository.deleteAllByIds(deleteRequirementIds);
        requirementRepository.saveAll(requirements);
        return convertToDTOs(requirements);
    }

    private Requirement setNewBaseRequirement(Requirement requirement, Team team, Milestone milestone) {
        Requirement newRequirement = new Requirement();
        newRequirement.setMilestone(milestone);
        newRequirement.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(0));
        newRequirement.setReqTitle(requirement.getReqTitle());
        newRequirement.setTeam(team);
        if(requirement.getStudent() != null && team.getTeamMembers() != null){
            for (TeamMember teamMember : team.getTeamMembers()) {
                if(requirement.getStudent().getId().equals(teamMember.getMember().getId())){
                    newRequirement.setStudent(requirement.getStudent());
                    break;
                }
            }
        }
        newRequirement.setComplexity(requirement.getComplexity());
        newRequirement.setNote(requirement.getNote());
        return newRequirement;
    }

    @Transactional
    public Object importRequirementsToClass(AddRequirementList request) {
        ValidateUtils.checkNullOrEmpty(request.getRequirementDTOs(), "Requirements");
        List<Requirement> requirements = new ArrayList<>();
        for (RequirementDTO reqDTO : request.getRequirementDTOs()) {
            reqDTO.validateInput(true);
            ValidateUtils.checkNullOrEmpty(reqDTO.getMilestoneId(), "Milestone id");
            Milestone milestone = checkExistMilestone(reqDTO.getMilestoneId());
            Requirement existedByTitle = requirementRepository
                    .checkExistedByTitleInMilestone(milestone.getId(), reqDTO.getReqTitle().toLowerCase());
            if(existedByTitle != null){
                throw new NameAlreadyExistsException(reqDTO.getReqTitle() + " in " + milestone.getTitle());
            }
            Requirement requirement = new Requirement();
            requirement.setMilestone(milestone);
            requirement.setReqTitle(reqDTO.getReqTitle());
            requirement.setStatus(reqDTO.getStatus());
            requirement.setNote(reqDTO.getNote());
            requirements.add(requirement);
        }
        requirementRepository.saveAll(requirements);
        return convertToDTOs(requirements);
    }

    private Object convertToDTOs(List<Requirement> requirements) {
        List<RequirementDTO> requirementDTOs = new ArrayList<>();
        for (Requirement req : requirements) {
            RequirementDTO requirementDTO = ConvertUtils.convert(req, RequirementDTO.class);
            requirementDTO.setMilestoneId(req.getMilestone().getId());
            requirementDTO.setMilestoneTitle(req.getMilestone().getTitle());
            requirementDTOs.add(requirementDTO);
        }
        return requirementDTOs;
    }

    // Get all By SubmissionId
    public List<RequirementDTO> getAllBySubmissionId(Integer submissionId){
        List<Requirement> requirements = requirementRepository.findAllBySubmissionId(submissionId);
        return ConvertUtils.convertList(requirements, RequirementDTO.class);
    }

    public Object get(Integer id) {
        Requirement requirement = requirementRepository.findById(id).orElseThrow(() -> new RecordNotFoundException("Requirement"));
        User user = commonService.getCurrentUser();
        if(user.getRole().getId().equals(Constants.Role.STUDENT) && requirement.getTeam() != null
                && requirement.getTeam().getTeamMembers() != null){
            TeamMember teamMember = requirement.getTeam().getTeamMembers().stream()
                    .filter(item -> item.getMember().getId().equals(user.getId()))
                    .findFirst().orElseThrow(() -> new ConflictException("The requirement is not existed in your team!"));
        }
        RequirementDTO requirementDTO = ConvertUtils.convert(requirement, RequirementDTO.class);
        if(requirementDTO != null && requirementDTO.getUpdateTrackings() != null){
            requirementDTO.setUpdateTrackings(requirementDTO.getUpdateTrackings().stream()
                    .sorted(Comparator.comparing(UpdateTrackingDTO::getUpdatedDate).reversed())
                    .toList()
            );
        }
        return requirementDTO;
    }

    public Object searchForSubmission(SearchRequirementRequest request) {
        SearchRequirementResponse response = new SearchRequirementResponse();
        response.setRequirementDTOs(new ArrayList<>());
        if(request.getMilestoneId() == null || request.getTeamId() == null){
            return response;
        }
        User user = commonService.getCurrentUser();
        getCurrentTeamId(request, user);
        Milestone milestone = milestoneRepository.findById(request.getMilestoneId()).orElseThrow(() -> new RecordNotFoundException("Milestone"));
//        if(milestone.getTypeEvaluator().equals(Constants.TypeAssignments.GRAND_FINAL)){
//            milestone = milestone.getClasses().getMilestones().stream()
//                    .filter(item -> item.getTypeEvaluator().equals(Constants.TypeAssignments.FINAL))
//                    .findFirst().orElse(null);
//            if(milestone == null){
//                return response;
//            }
//        }
        List<Requirement> requirements = milestone.getRequirements().stream()
                .filter(req -> {
                    if(req.getTeam() != null && request.getTeamId() != null && (request.getTeamId().equals(req.getTeam().getId()))){
                        return !req.getStatus().equals(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(4));
                    }
                    return false;
                })
                .toList();
        List<RequirementDTO> requirementDTOs = ConvertUtils.convertList(requirements, RequirementDTO.class);
        response.setRequirementDTOs(requirementDTOs);
        return response;
    }

    @Transactional
    public Object updateTracking(Integer reqId, UpdateTrackingDTO request) {
        Requirement requirement = requirementRepository.findById(reqId).orElseThrow(() -> new RecordNotFoundException("Requirement"));
        User currentUser = commonService.getCurrentUser();
        if(!currentUser.getRole().getId().equals(Constants.Role.STUDENT)){
            throw new ConflictException("Only student can submit update tracking!");
        }
        if(requirement.getStudent() != null && !requirement.getStudent().getId().equals(currentUser.getId())){
            throw new ConflictException("You can't submit update tracking of other student!");
        }
       UpdateTracking updateTracking;
        if(request.getId() == null){
            updateTracking = new UpdateTracking();
        } else{
            updateTracking = updateTrackingRepository.findById(request.getId()).orElseThrow(() -> new RecordNotFoundException("Update tracking"));
            if(request.getAction() != null && request.getAction().equals("delete")){
                updateTrackingRepository.deleteByUpdateId(request.getId());
                return "Delete successfully";
            }
        }
        ValidateUtils.checkNullOrEmpty(request.getNote(), "Detail");
        String note = ValidateUtils.checkLength(request.getNote(), "Detail", 1, 750);
        updateTracking.setStudent(currentUser);
        updateTracking.setRequirement(requirement);
        updateTracking.setNote(note);
        updateTrackingRepository.save(updateTracking);
        return ConvertUtils.convert(updateTracking, UpdateTrackingDTO.class);
    }
}