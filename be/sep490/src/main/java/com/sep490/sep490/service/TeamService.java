package com.sep490.sep490.service;

import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.BaseDTO;
import com.sep490.sep490.dto.TeamDTO;
import com.sep490.sep490.dto.UserDTO;
import com.sep490.sep490.dto.classes.request.SearchClassForGrandFinal;
import com.sep490.sep490.dto.classes.response.SearchClassResponseForGrandFinal;
import com.sep490.sep490.dto.team.ImportTeamListRequest;
import com.sep490.sep490.dto.team.ImportTeamRequest;
import com.sep490.sep490.dto.team.request.SearchTeamRequest;
import com.sep490.sep490.dto.team.response.ProgressOfTeam;
import com.sep490.sep490.dto.team.response.SearchTeamResponse;
import com.sep490.sep490.dto.user.request.CreateUserRequest;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Log4j2
public class TeamService implements BaseService<Milestone, Integer>{
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final MilestoneRepository milestoneRepository;
    private final WorkEvaluationRepository workEvaluationRepository;
    private final UpdateTrackingRepository updateTrackingRepository;
    private final StudentEvaluationRepository studentEvaluationRepository;
    private final RequirementRepository requirementRepository;
    private final TeamEvaluationRepository teamEvaluationRepository;
    private final CommonService commonService;
    private final SettingRepository settingRepository;
    private final ClassesRepository classesRepository;
    private final SessionRepository sessionRepository;
    private final CouncilRepository councilRepository;
    private final CouncilTeamRepository councilTeamRepository;
    @Override
    public Object create(Object requestObject) {
        log.info("create team:");
        var request = (TeamDTO) requestObject;
        request.validateInput();
//        Milestone milestone = checkExistMilestone(request.getMilestoneId());
        Classes classes = checkExistClass(request.getClassId());
        Team findByName = teamRepository.findByTeamName(request.getTeamName(), request.getClassId());
        if(findByName != null)
            throw new NameAlreadyExistsException("Tên nhóm");
        Team saveTeam = new Team();
        setBaseTeam(null, saveTeam, request, classes);
        List<TeamMember> teamMembers = new ArrayList<>();
        for (CreateUserRequest member : request.getMembers()) {
            TeamMember teamMember = new TeamMember();
            teamMember.setTeam(saveTeam);
            teamMember.setMember(new User());
            teamMember.getMember().setId(member.getId());
            teamMembers.add(teamMember);
        }
        teamRepository.save(saveTeam);
        teamMemberRepository.saveAll(teamMembers);
        return ConvertUtils.convert(saveTeam, TeamDTO.class);
    }

    private void setBaseTeam(Integer id, Team baseTeam, TeamDTO request, Classes classes) {
        if(id != null)
            baseTeam.setId(id);
        baseTeam.setTeamName(request.getTeamName());
        baseTeam.setTopicName(request.getTopicName());
        baseTeam.setNote(request.getNote());
        baseTeam.setActive(false);
        baseTeam.setClasses(classes);
    }

    private Milestone checkExistMilestone(Integer milestoneId) {
        return milestoneRepository.findById(milestoneId).orElseThrow(
                () -> new RecordNotFoundException("Giai đoạn")
        );
    }

    private Classes checkExistClass(Integer classId) {
        return classesRepository.findById(classId).orElseThrow(
                () -> new RecordNotFoundException("Lớp học")
        );
    }

    @Override
    public Object update(Integer id, Object requestObject) {
        log.info("update team id: " + id);
        TeamDTO request = (TeamDTO) requestObject;
        request.validateInput();
        Team saveTeam = teamRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Nhóm")
        );
//        Milestone milestone = checkExistMilestone(request.getMilestoneId());
        Classes classes = checkExistClass(request.getClassId());
        Team findByName = teamRepository.findByTeamNameAndOtherId(request.getTeamName(), id, request.getClassId());
        if(findByName != null)
            throw new NameAlreadyExistsException("Tên nhóm");
        setBaseTeam(id, saveTeam, request, classes);
        teamRepository.save(saveTeam);
        return ConvertUtils.convert(saveTeam, TeamDTO.class);
    }

    @Override
    public Object get(Integer integer) {
        return null;
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        log.info("delete team id: " + id);
        Team team = teamRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Tên nhóm")
        );
        deleteTeamContraints(team, team.getClasses());
        requirementRepository.deleteByTeamId(team.getId(), null);
        teamMemberRepository.deleteByTeamId(team.getId());
        teamRepository.deleteByTeamId(team.getId());
    }

    @Override
    public Object search(Object requestObject) {
        log.info("Search team: ");
        var request = (SearchTeamRequest) requestObject;
        request.validateInput();
        if(request.getClassId() == null){
            SearchTeamResponse response = new SearchTeamResponse();
            response.setTeamDTOs(new ArrayList<>());
            return response;
        }
        var classes = classesRepository.findById(request.getClassId()).orElseThrow(
                () -> new RecordNotFoundException("Lớp học")
        );
        boolean isCurrentMilestone = true;
        List<User> students = new ArrayList<>(classes.getClassesUsers().stream()
                .map(ClassUser::getUser)
                .filter(user -> user.getRole().getId().equals(Constants.Role.STUDENT)).toList());
        List<Team> teams = teamRepository.search(
                request.getClassId(),
                request.getTeamName(),
                request.getTopicName()
        );
        SearchTeamResponse response = new SearchTeamResponse();
        List<TeamDTO> teamDTOs = new ArrayList<>();
        List<CreateUserRequest> userDTOs = null;
        for (Team team : teams) {
            TeamDTO teamDTO = ConvertUtils.convert(team, TeamDTO.class);
            if(team.getLeader() != null) {
                teamDTO.setLeaderId(team.getLeader().getId());
                teamDTO.setLeaderCode(team.getLeader().getCode());
            }
            userDTOs = new ArrayList<>();
            if(team.getTeamMembers() != null){
                for (TeamMember teamMember : team.getTeamMembers()) {
                    CreateUserRequest userDTO = new CreateUserRequest();
                    userDTO.setCode(teamMember.getMember().getCode());
                    userDTO.setEmail(teamMember.getMember().getEmail());
                    userDTO.setFullname(teamMember.getMember().getFullname());
                    userDTO.setId(teamMember.getMember().getId());
                    userDTOs.add(userDTO);
                    removeMemberFromList(students, teamMember.getMember().getId());
                }
            }
//            teamDTO.setActive(isCurrentMilestone && team.getActive());
            teamDTO.setActive(team.getActive());
            teamDTO.setTeamOfCurrentMilestone(isCurrentMilestone);
            teamDTO.setMembers(userDTOs);
            teamDTOs.add(teamDTO);
        }
        setWishList(students, teamDTOs);
        response.setTeamDTOs(teamDTOs);
        return response;
    }

    private void setWishList(List<User> students, List<TeamDTO> teamDTOs) {
        if(students.size() > 0){
            TeamDTO wishList = new TeamDTO();
            wishList.setTeamName("Wish List");
            List<CreateUserRequest> userDTOs = new ArrayList<>();
            for (User user : students) {
                CreateUserRequest userDTO = new CreateUserRequest();
                userDTO.setCode(user.getCode());
                userDTO.setEmail(user.getEmail());
                userDTO.setFullname(user.getFullname());
                userDTO.setId(user.getId());
                userDTOs.add(userDTO);
            }
            wishList.setMembers(userDTOs);
            teamDTOs.add(0, wishList);
        }
    }

    private void removeMemberFromList(List<User> students, Integer studentId) {
        int index = 0;
        for (User student : students) {
            if(student.getId().equals(studentId)){
                break;
            }
            index++;
        }
        if(index < students.size())
            students.remove(index);
    }

    public Object getTeamsProgressionByMilestone(Integer milestoneId) {
        log.info("Get teams progression by milestone: " + milestoneId);
        var milestone = milestoneRepository.findById(milestoneId).orElseThrow(
                () -> new RecordNotFoundException("Giai đoạn")
        );
        List<ProgressOfTeam> progressOfTeams = new ArrayList<>();
        if(milestone.getClasses().getTeams() != null){
            for (Team team : milestone.getClasses().getTeams()) {
                ProgressOfTeam progressOfTeam = new ProgressOfTeam();
                progressOfTeam.setId(team.getId());
                progressOfTeam.setTeamName(team.getTeamName());
                if(milestone.getRequirements() != null){
                    List<Requirement> requirements = milestone.getRequirements().stream()
                            .filter(item -> item.getTeam() != null && item.getTeam().getId().equals(team.getId()))
                            .toList();
                    int toDo = 0, doing = 0, waiting = 0, submitted = 0, evaluated = 0;
                    for (Requirement requirement : requirements) {
                        if(requirement.getStatus().equals(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(0)))
                            toDo++;
                        else if(requirement.getStatus().equals(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(1)))
                            doing++;
                        else if(requirement.getStatus().equals(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(2))
                            || requirement.getStatus().equals("SUBMIT LATE"))
                            submitted++;
                        else if(requirement.getStatus().equals(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(3)))
                            evaluated++;
                        else if(requirement.getStatus().equals(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(4)))
                            waiting++;
                    }
                    int totalReqs = requirements.size();
                    float progressToDo = Math.round((float) toDo / totalReqs * 100.0);
                    float progressDoing = Math.round((float) doing / totalReqs * 100.0);
//                    float progressWaiting = Math.round((float) waiting / totalReqs * 100.0);
                    float progressSubmitted = Math.round((float) submitted / totalReqs * 100.0);
                    float progressEvaluated = Math.round((float) evaluated / totalReqs * 100.0);
                    progressOfTeam.setCompletionProgress(List.of(progressToDo, progressDoing,
                            progressSubmitted, progressEvaluated));
                }
                progressOfTeams.add(progressOfTeam);
            }
        }
        return progressOfTeams;
    }

    @Transactional
    public Object importTeams(ImportTeamListRequest request) {
        log.info("import teams with milestoneId: " + request.getClassId());
        request.validateInput();
//        Milestone milestone = milestoneRepository.findById(request.getMilestoneId()).orElseThrow(
//                () -> new RecordNotFoundException("Milestone")
//        );
        Classes classes = checkExistClass(request.getClassId());
        HashMap<String, User> studentIds = new HashMap<>();
        if(classes.getClassesUsers() != null){
            classes.getClassesUsers().stream()
                    .filter(item -> item.getUser().getRole().getId().equals(Constants.Role.STUDENT))
                    .forEach(item -> {
                        studentIds.putIfAbsent(item.getUser().getCode(), item.getUser());
                    });
        }

        deleteContraints(classes);
        List<Team> teams = new ArrayList<>();
        for (ImportTeamRequest teamRequest : request.getTeams()) {
            Team team = new Team();
            team.setTeamName(teamRequest.getTeamName());
            team.setTopicName(teamRequest.getTopicName());
            team.setActive(false);
            team.setClasses(classes);
//            team.setMilestone(milestone);
            setTeamLeader(team, teamRequest.getLeaderId(), studentIds);
            setTeamMembers(team, teamRequest.getMemberCodes(), studentIds);
            teams.add(team);
        }
        classes.setTeams(teams);
        classesRepository.save(classes);
        SearchTeamRequest searchRequest = new SearchTeamRequest();
        searchRequest.setClassId(classes.getId());
        return search(searchRequest);
    }

    public void deleteContraints(Classes classes) {
        for (Team team : classes.getTeams()) {
            // update: delete include evaluation of req and student and team.
            deleteTeamContraints(team, classes);
            // end-----
            requirementRepository.deleteByTeamId(team.getId(), null);
            teamMemberRepository.deleteByTeamId(team.getId());
        }
        teamRepository.deleteByClassId(classes.getId());
    }

    private void deleteTeamContraints(Team team, Classes classes) {
        if(team.getTeamMembers() != null && team.getTeamMembers().size() > 0){
            for (TeamMember teamMember : team.getTeamMembers()) {
                studentEvaluationRepository.deleteByClassIdAndMemberId(
                        classes.getId(),
                        teamMember.getMember().getId()
                );
            }
        }
        if(team.getRequirements() != null && team.getRequirements().size() > 0){
            List<Integer> reqIds = team.getRequirements().stream()
                    .map(Requirement::getId).toList();
            updateTrackingRepository.deleteByReqIds(reqIds);
            workEvaluationRepository.deleteByReqIds(reqIds);
        }
        teamEvaluationRepository.deleteByTeamId(team.getId());
    }

    private void setTeamMembers(Team team, List<String> memberCodes, HashMap<String, User> studentIds) {
        team.setTeamMembers(new ArrayList<>());
        if(memberCodes != null){
            for (String memberId : memberCodes) {
                if(!studentIds.containsKey(memberId)){
                    throw new ConflictException("Thành viên có mã " + memberId + " không phải là học sinh trong lớp này");
                }
                TeamMember teamMember = new TeamMember();
                teamMember.setActive(true);
                teamMember.setTeam(team);
                teamMember.setMember(studentIds.get(memberId));
                team.getTeamMembers().add(teamMember);
            }
        }
    }

    private void setTeamLeader(Team team, String leaderId, HashMap<String, User> studentIds) {
        if(leaderId != null){
            if(!studentIds.containsKey(leaderId)){
                throw new ConflictException("Nhóm trưởng " + leaderId + " không phải là học sinh trong lớp này");
            }
            team.setLeader(studentIds.get(leaderId));
        }
    }

    public void updateTeamLeader(Integer teamId, String leaderId) {
        ValidateUtils.checkNullOrEmpty(teamId, "Nhóm");
        ValidateUtils.checkNullOrEmpty(leaderId, "Mã trưởng nhóm");
        Team team = teamRepository.findById(teamId).orElseThrow(
                () -> new RecordNotFoundException("Nhóm")
        );
        User user = commonService.getCurrentUser();
        if(team.getLeader() != null &&
                !user.getId().equals(team.getLeader().getId())
                && user.getRole().getId().equals(Constants.Role.STUDENT)){
            throw new ConflictException("Chỉ trưởng nhóm được cập nhật");
        }
        boolean isMemberInTeam = false;
        for (TeamMember teamMember : team.getTeamMembers()) {
            if(teamMember.getMember().getCode().equals(leaderId)){
                isMemberInTeam = true;
                team.setLeader(teamMember.getMember());
                break;
            }
        }
        if(!isMemberInTeam)
            throw new ConflictException("Trưởng nhóm không phải là thành viên trong nhóm");
        teamRepository.save(team);
    }
//    @Transactional
//    public Object cloneTeamsInOtherMilestone(Integer milestoneId, Integer cloneMilestoneId) {
//        log.info("clone teams in milestoneId: " + cloneMilestoneId + " to milestone " + milestoneId);
//        ValidateUtils.checkNullOrEmpty(milestoneId, "Milestone id");
//        ValidateUtils.checkNullOrEmpty(cloneMilestoneId, "Clone milestone id");
//        var milestone = milestoneRepository.findById(milestoneId).orElseThrow(
//                () -> new RecordNotFoundException("Milestone")
//        );
//        var cloneMilestone = milestoneRepository.findById(cloneMilestoneId).orElseThrow(
//                () -> new RecordNotFoundException("Clone milestone")
//        );
//        checkConditionToClone(milestone, cloneMilestone);
//        deleteContraints(milestone);
//        List<Team> teams = new ArrayList<>();
//        for (Team team : cloneMilestone.getTeams()) {
//            Team newTeam = cloneTeam(team, milestone);
//            teams.add(newTeam);
//        }
//        milestone.setTeams(teams);
//        milestoneRepository.save(milestone);
//
//        SearchTeamRequest searchRequest = new SearchTeamRequest();
//        searchRequest.setMilestoneId(milestone.getId());
//        return search(searchRequest);
//    }

    private Team cloneTeam(Team team, Milestone milestone) {
        Team newTeam = new Team();
        newTeam.setTeamName(team.getTeamName());
        newTeam.setTopicName(team.getTopicName());
        newTeam.setNote(team.getNote());
        newTeam.setActive(false);
        newTeam.setMilestone(milestone);
        newTeam.setClasses(milestone.getClasses());
        if(team.getLeader() != null){
            newTeam.setLeader(new User());
            newTeam.getLeader().setId(team.getLeader().getId());
        }
        if(team.getClasses() != null){
            newTeam.setClasses(new Classes());
            newTeam.getClasses().setId(team.getClasses().getId());
        }
        List<TeamMember> teamMembers = new ArrayList<>();
        for (TeamMember teamMember : team.getTeamMembers()) {
            TeamMember member = new TeamMember();
            member.setTeam(newTeam);
            member.setMember(teamMember.getMember());
            member.setActive(teamMember.getActive());
            teamMembers.add(member);
        }
        newTeam.setTeamMembers(teamMembers);
        return newTeam;
    }

    private void checkConditionToClone(Milestone milestone, Milestone cloneMilestone) {
        if(!milestone.getClasses().getId().equals(cloneMilestone.getClasses().getId())) {
            throw new ConflictException("The clone milestone is not in the same milestone's class!");
        }
        if(cloneMilestone.getTeams() == null || cloneMilestone.getTeams().size() == 0){
            throw new ConflictException("The clone milestone have no team to clone!");
        }
    }
    @Transactional
    public void closeUpdate(Integer milestoneId) {
        Milestone milestone = checkExistMilestone(milestoneId);
        int numberOfMembers = milestone.getTeams().stream()
                .flatMap(item -> item.getTeamMembers().stream())
                .toList().size();
        int numberOfStudents = milestone.getClasses().getClassesUsers().stream()
                .filter(item -> item.getUser().getRole().getId().equals(Constants.Role.STUDENT))
                .toList().size();
        if(numberOfMembers < numberOfStudents){
            throw new ConflictException("Vui lòng thêm những học sinh trong danh sách chờ vào các nhóm");
        }
        if(milestone.getTeams() != null && milestone.getTeams().size() > 0){
            List<Team> teams = new ArrayList<>();
            for (Team team : milestone.getTeams()) {
                team.setActive(true);
                teams.add(team);
            }
            teamRepository.saveAll(teams);
        }
    }
    @Transactional
    public Object resetTeams(Integer milestoneId) {
        Milestone milestone = checkExistMilestone(milestoneId);
        if(milestone.getTeams() != null && milestone.getTeams().size() > 0){
            for (Team team : milestone.getTeams()) {
                deleteTeamContraints(team, team.getClasses());
                requirementRepository.deleteByTeamId(team.getId(), null);
                teamMemberRepository.deleteByTeamId(team.getId());
                teamRepository.deleteByTeamId(team.getId());
            }
        }
//        SearchTeamRequest searchRequest = new SearchTeamRequest();
//        searchRequest.setMilestoneId(milestoneId);
//        return search(searchRequest);
        return "Làm mới nhóm thành công!";
    }

    public Object searchForGrandFinal(SearchClassForGrandFinal request) {
        SearchClassResponseForGrandFinal response = new SearchClassResponseForGrandFinal();
        response.setClassList(new ArrayList<>());
        List<BaseDTO> teams = new ArrayList<>();
        if(request.getClassId() == null){
            return response;
        }
        User currentUser = commonService.getCurrentUser();
        Classes classes = classesRepository.findById(request.getClassId()).orElseThrow(() -> new RecordNotFoundException("Lớp học"));
        List<Session> sessions = new ArrayList<>();
        if(request.getSemesterId() != null && request.getRoundId() != null){
            Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", request.getSemesterId());
            if(semester == null){
                throw new RecordNotFoundException("Học kỳ");
            }
            Setting round = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "round", request.getRoundId());
            if(round == null){
                throw new RecordNotFoundException("Lần chấm");
            }
            sessions = sessionRepository.findBySemesterIdAndRoundId(semester.getId(), round.getId());
        }
        if(request.getSessionId() != null){
            Session session = sessionRepository.findById(request.getSessionId()).orElseThrow(() -> new RecordNotFoundException("Phiên chấm"));
            sessions.add(session);
        }
//        List<Council> councils = councilRepository.findBySemesterIdAndRoundId(round.getId(), semester.getId());
        List<CouncilTeam> councilTeamList = councilTeamRepository.findBySessionAndCouncilsAndClasses(
            sessions.stream().map(Session::getId).toList(),
            classes.getId(),
            currentUser.getId(),
            currentUser.getRole().getId().equals(Constants.Role.TEACHER),
            currentUser.getRole().getId().equals(Constants.Role.STUDENT)
        );

        for (CouncilTeam councilTeam : councilTeamList) {
            if(councilTeam.getTeamId() != null){
                teamRepository.findById(councilTeam.getTeamId()).ifPresent(team
                        -> teams.add(new BaseDTO(team.getId(), team.getTeamName())));
            }
        }
        response.setClassList(teams);
        response.setCanEvaluate(currentUser.getRole().getId().equals(Constants.Role.TEACHER));
        return response;
    }
}
