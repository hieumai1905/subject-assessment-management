package com.sep490.sep490.service;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.RequirementDTO;
import com.sep490.sep490.dto.UpdateTrackingDTO;
import com.sep490.sep490.dto.requirement.request.*;
import com.sep490.sep490.dto.requirement.response.SearchRequirementResponse;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.service.*;
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
    private final FileIoService fileIoService;
    private final ImgurService imgurService;
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
        Classes classes = classesRepository.findById(request.getClassId()).orElseThrow(
                () -> new RecordNotFoundException("Lớp học")
        );
        if(classes.getTeams() != null){
            classes.getTeams().stream().flatMap(item -> item.getTeamMembers().stream())
                    .forEach(member -> {
                        if(member.getMember().getId().equals(user.getId())){
                            request.setTeamId(member.getTeam().getId());
                        }
                    });
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
                throw new NameAlreadyExistsException(request.getReqTitle() + " trong " + team.getTeamName());
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
                    .orElseThrow(() -> new RecordNotFoundException("Yêu cầu"));
            if(requirement.getStudent() != null
                    && user.getRole().getId().equals(Constants.Role.STUDENT)
                    && !requirement.getStudent().getId().equals(user.getId()))
                throw new ConflictException("Bạn không thể thay đổi yêu cầu của người khác");
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
                    throw new NameAlreadyExistsException(request.getReqTitle() + " trong " + requirement.getTeam().getTeamName());
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
                throw new ConflictException(String.format("Học sinh có id %d không tồn tại trong %s",
                        request.getStudentId(), requirement.getTeam().getTeamName()));
            }
        }
    }

    public Setting checkExistComplexity(Integer complexityId) {
        if(complexityId == null)
            return null;
        Setting complexity = (Setting)settingRepository.findSettingBySettingTypeAndSettingId("complexity", complexityId);
        if(complexity == null)
            throw new RecordNotFoundException("Độ khó");
        return complexity;
    }

    private Milestone checkExistMilestone(Integer milestoneId) {
        return milestoneRepository.findById(milestoneId).orElseThrow(
                () -> new RecordNotFoundException("Giai đoạn")
        );
    }

    private List<Team> checkExistTeams(List<Integer> teamIds, Milestone milestone) {
        List<Team> teams = new ArrayList<>();
        for (Integer teamId : teamIds) {
            Team team = (teamRepository.findById(teamId).orElseThrow(() -> new RecordNotFoundException("Nhóm")));
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

    @Transactional
    public Object submitWork(SubmitRequirementRequest request, MultipartFile file) {
        request.validateInput(file, true);
        User currentUser = commonService.getCurrentUser();
        Team foundTeamByLeaderId = teamRepository.findByLeaderAndTeamId(currentUser.getId(), request.getTeamId());
        if (foundTeamByLeaderId == null){
            throw new ConflictException("Chỉ có nhóm trưởng được nộp bài");
        }
        Milestone milestone = milestoneRepository.findById(request.getMilestoneId()).orElseThrow(() -> new RecordNotFoundException("Giai đoạn"));
        if (!milestone.getActive() && !milestone.getEvaluationType().equals(Constants.TypeAssignments.GRAND_FINAL)){
            throw new ConflictException("Giai đoạn " + milestone.getTitle() + " đang bị khóa");
        }
        String submitFile = "";
        if(file != null) {
            submitFile = fileIoService.uploadFileToBin(file);
            ValidateUtils.checkLength(submitFile, "Tên tệp", 0, 750);
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
                    .orElseThrow(() -> new RecordNotFoundException("Yêu cầu"));
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
        return "Nộp bài thành công";
    }

    private void submitWorkForGrandFinal(Submission submission, Milestone milestone, Team team, boolean isLate) {
        List<Requirement> cloneRequirementList = requirementRepository.findAllBySubmissionId(submission.getId());

        milestone.getClasses().getMilestones().stream()
                .filter(item -> item.getEvaluationType().equals(Constants.TypeAssignments.FINAL))
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
                throw new ApiInputException("Bạn phải nộp đường dẫn hoặc tệp bài làm");
            }
        }else{
            if((request.getLink() == null || request.getLink().equals("")) && submitFile.equals("")){
                throw new ApiInputException("Bạn phải nộp đường dẫn hoặc tệp bài làm");
            }
        }
    }

    public Object getByClass(SearchReqByClass request) {
        request.validateInput();
        Classes classes = classesRepository.findById(request.getClassId())
                .orElseThrow(() -> new RecordNotFoundException("Lớp học"));
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
                    .orElseThrow(() -> new RecordNotFoundException("Yêu cầu"));
            if(requirement.getStatus().equals(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(3))){
                throw new ConflictException("Không thể chuyển yêu cầu đã đánh giá");
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
                        throw new NameAlreadyExistsException(newRequirement.getReqTitle() + " trong " + team.getTeamName());
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
        ValidateUtils.checkNullOrEmpty(request.getRequirementDTOs(), "Yêu cầu");
        List<Requirement> requirements = new ArrayList<>();
        for (RequirementDTO reqDTO : request.getRequirementDTOs()) {
            reqDTO.validateInput(true);
            ValidateUtils.checkNullOrEmpty(reqDTO.getMilestoneId(), "Giai đoạn");
            Milestone milestone = checkExistMilestone(reqDTO.getMilestoneId());
            Requirement existedByTitle = requirementRepository
                    .checkExistedByTitleInMilestone(milestone.getId(), reqDTO.getReqTitle().toLowerCase());
            if(existedByTitle != null){
                throw new NameAlreadyExistsException(reqDTO.getReqTitle() + " trong " + milestone.getTitle());
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
        Requirement requirement = requirementRepository.findById(id).orElseThrow(() -> new RecordNotFoundException("Yêu cầu"));
        User user = commonService.getCurrentUser();
        if(user.getRole().getId().equals(Constants.Role.STUDENT) && requirement.getTeam() != null
                && requirement.getTeam().getTeamMembers() != null){
            TeamMember teamMember = requirement.getTeam().getTeamMembers().stream()
                    .filter(item -> item.getMember().getId().equals(user.getId()))
                    .findFirst().orElseThrow(() -> new ConflictException("Yêu cầu không tồn tại trong nhóm của bạn"));
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
        Milestone milestone = milestoneRepository.findById(request.getMilestoneId()).orElseThrow(() -> new RecordNotFoundException("Giai đoạn"));
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
        Requirement requirement = requirementRepository.findById(reqId).orElseThrow(() -> new RecordNotFoundException("Yêu cầu"));
        User currentUser = commonService.getCurrentUser();
        if(!currentUser.getRole().getId().equals(Constants.Role.STUDENT)){
            throw new ConflictException("Chỉ có học sinh có thể cập nhật");
        }
        if(requirement.getStudent() != null && !requirement.getStudent().getId().equals(currentUser.getId())){
            throw new ConflictException("Bạn không thể cập nhật yêu cầu của người khác");
        }
       UpdateTracking updateTracking;
        if(request.getId() == null){
            updateTracking = new UpdateTracking();
        } else{
            updateTracking = updateTrackingRepository.findById(request.getId()).orElseThrow(() -> new RecordNotFoundException("Cập nhật thay đổi"));
            if(request.getAction() != null && request.getAction().equals("delete")){
                updateTrackingRepository.deleteByUpdateId(request.getId());
                return "Xóa thành công";
            }
        }
        ValidateUtils.checkNullOrEmpty(request.getNote(), "Chi tiết");
        String note = ValidateUtils.checkLength(request.getNote(), "Chi tiết", 1, 750);
        updateTracking.setStudent(currentUser);
        updateTracking.setRequirement(requirement);
        updateTracking.setNote(note);
        updateTrackingRepository.save(updateTracking);
        return ConvertUtils.convert(updateTracking, UpdateTrackingDTO.class);
    }
}