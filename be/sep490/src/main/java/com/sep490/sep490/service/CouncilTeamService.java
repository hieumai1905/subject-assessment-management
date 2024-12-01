package com.sep490.sep490.service;

import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.*;
import com.sep490.sep490.dto.councilTeam.request.ImportCouncilTeam;
import com.sep490.sep490.dto.councilTeam.request.ImportCouncilTeamsRequest;
import com.sep490.sep490.dto.councilTeam.request.SearchCouncilTeamRequest;
import com.sep490.sep490.dto.councilTeam.request.UpdateCouncilTeamsRequest;
import com.sep490.sep490.dto.councilTeam.response.SearchCouncilTeamResponse;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@RequiredArgsConstructor
@Service
@Log4j2
public class CouncilTeamService {
    private final SessionRepository sessionRepository;
    private final SettingRepository settingRepository;
    private final CouncilRepository councilRepository;
    private final CouncilTeamRepository councilTeamRepository;
    private final ClassesRepository classesRepository;
    private final TeamRepository teamRepository;
    private final SubjectRepository subjectRepository;

    public Object search(SearchCouncilTeamRequest request) {
        request.validateInput();
        SearchCouncilTeamResponse response = new SearchCouncilTeamResponse();
        response.setCouncilDTOs(new ArrayList<>());
        response.setCouncilTeams(new ArrayList<>());
        response.setSessionDTOs(new ArrayList<>());
        if(request.getSemesterId() == null || request.getSubjectId() == null){
            return response;
        }
        Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", request.getSemesterId());
        if(semester == null){
            throw new RecordNotFoundException("Học kỳ");
        }
        Subject subject = subjectRepository.findById(request.getSubjectId()).orElseThrow(() -> new RecordNotFoundException("Môn học"));
        Setting round = (Setting) settingRepository.findSettingBySettingTypeAndSettingId("round", request.getRoundId());
        if(round == null){
            throw new RecordNotFoundException("Lần đánh giá");
        }
        List<Classes> classes = classesRepository.findBySemesterIdAndSubjectId(semester.getId(), subject.getId());
        classes = classes.stream().filter(item -> request.getClassId() == null
                || item.getId().equals(request.getClassId()))
                .toList();
        List<Team> teams = new ArrayList<>();
        if(!request.getIsSearchClass()){
            getLastTeams(classes, teams);
        }

        List<Council> sCouncils = councilRepository.findBySemesterIdAndRoundId(request.getRoundId(), request.getSemesterId());
        List<Session> sessions = sessionRepository.findBySemesterIdAndRoundId(request.getSemesterId(), request.getRoundId());
        List<CouncilTeam> councils = councilTeamRepository.search(
                sCouncils.stream().map(Council::getId).toList(),
                sessions.stream().map(Session::getId).toList(),
                classes.stream().map(Classes::getId).toList(),
                teams.stream().map(Team::getId).toList(),
                request.getIsSearchClass()
        );


        List<CouncilTeamDTO> councilTeamDTOs = new ArrayList<>();

        HashMap<Integer, CouncilTeam> councilTeamMap = new HashMap<>();
        for (CouncilTeam councilTeam : councils) {
            councilTeamMap.putIfAbsent(request.getIsSearchClass()
                    ? councilTeam.getClassId() : councilTeam.getTeamId(), councilTeam);
        }
        int totalElements = 0;
        if(request.getIsSearchClass()){
            totalElements = classes.size();
            classes = paginateList(classes, request.getPageIndex()-1, request.getPageSize());
            for (Classes sClass : classes) {
                CouncilTeam councilTeam = councilTeamMap.get(sClass.getId());
                if (councilTeam == null)
                    councilTeam = new CouncilTeam();
                CouncilTeamDTO dto = addCouncilTeamDTO(councilTeam, sClass, null, true);
                councilTeamDTOs.add(dto);
            }
        } else{
            totalElements = teams.size();
            teams = paginateList(teams.stream().filter(item -> request.getTeamId() == null
                    || request.getTeamId().equals(item.getId())
                ).toList(), request.getPageIndex()-1, request.getPageSize());

            for (Team team: teams) {
                CouncilTeam councilTeam = councilTeamMap.get(team.getId());
                if (councilTeam == null)
                    councilTeam = new CouncilTeam();
                CouncilTeamDTO dto = addCouncilTeamDTO(councilTeam, team.getClasses(), team, false);
                List<CouncilTeam> otherCouncilTeams = councilTeamRepository.findInOtherSessionsOrCouncils(
                    team.getId(),
                    sessions.stream().map(Session::getId).toList(),
                    sCouncils.stream().map(Council::getId).toList()
                );
                if(otherCouncilTeams != null && otherCouncilTeams.size() > 0){
                    dto.setOtherCouncilTeamDTOs(new ArrayList<>());
                    for (CouncilTeam ct : otherCouncilTeams) {
                        CouncilTeamDTO other = addCouncilTeamDTO(ct, team.getClasses(), team, false);
                        dto.getOtherCouncilTeamDTOs().add(other);
                    }
                }
                councilTeamDTOs.add(dto);
            }
        }
        List<BaseDTO> sessionDTOs = new ArrayList<>();
        for (Session session: sessions) {
            sessionDTOs.add(new BaseDTO(session.getId(), session.getName()));
        }
        List<CouncilDTO> councilDTOS = new ArrayList<>();
        for (Council council : sCouncils) {
            councilDTOS.add(convertToCouncilDTO(council));
        }
        response.setCouncilDTOs(councilDTOS);
        response.setSessionDTOs(sessionDTOs);
        response.setCouncilTeams(councilTeamDTOs);
        response.setTotalElements(totalElements);
        response.setPageIndex(request.getPageIndex());
        response.setPageSize(request.getPageSize());
        response.setOrderBy(request.getOrderBy());
        response.setSortBy(request.getSortBy());

        return response;
    }

    private CouncilDTO convertToCouncilDTO(Council council) {
        CouncilDTO councilDTO = new CouncilDTO();
        councilDTO.setId(council.getId());
        List<CouncilMemberDTO> councilMemberDTOS = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        if(council.getCouncilMembers() != null && council.getCouncilMembers().size() > 0){
            int size = council.getCouncilMembers().size(), count = 0;
            for (CouncilMember mem : council.getCouncilMembers()) {
                if (mem != null) {
                    CouncilMemberDTO memberDTO = ConvertUtils.convert(mem.getMember(), CouncilMemberDTO.class);
                    councilMemberDTOS.add(memberDTO);
                    if (count < 2) {
                        sb.append(memberDTO.getUsername());
                        if (count == 1 && size > 2) {
                            sb.append(" - ...");
                        } else if (count == 0) {
                            sb.append(" - ");
                        }
                    }
                    count++;
                }
            }
            if (count <= 2 && sb.length() > 0 && sb.charAt(sb.length() - 1) == ' ') {
                sb.delete(sb.length() - 3, sb.length());
            }
            councilDTO.setCouncilName(sb.toString());
        }
        councilDTO.setCouncilMembers(councilMemberDTOS);
        return councilDTO;
    }
    public static <T> List<T> paginateList(List<T> list, int pageIndex, int pageSize) {
        if(list == null)
            return new ArrayList<>();
        int fromIndex = pageIndex * pageSize;
        int toIndex = Math.min(fromIndex + pageSize, list.size());

        if (fromIndex > list.size()) {
            return new ArrayList<>();
        }

        return list.subList(fromIndex, toIndex);
    }


    private CouncilTeamDTO addCouncilTeamDTO(CouncilTeam councilTeam, Classes foundClass, Team team, boolean isSearchClass) {
        CouncilTeamDTO councilTeamDTO = new CouncilTeamDTO();
        councilTeamDTO.setId(councilTeam.getId());
        councilTeamDTO.setStatus(councilTeam.getStatus());
        if(team != null){
            councilTeamDTO.setTeamId(team.getId());
            councilTeamDTO.setTeamName(team.getTeamName());
            councilTeamDTO.setSize(team.getTeamMembers().size());
        }
        if(foundClass != null){
            councilTeamDTO.setClassId(foundClass.getId());
            councilTeamDTO.setClassCode(foundClass.getClassCode());
            councilTeamDTO.setTeacherId(foundClass.getTeacher().getId());
            councilTeamDTO.setEmail(foundClass.getTeacher().getEmail());
            councilTeamDTO.setUsername(foundClass.getTeacher().getUsername());
            if(isSearchClass)
                councilTeamDTO.setSize(foundClass.getClassesUsers()
                    .stream().filter(item ->
                            item.getUser().getRole().getId().equals(Constants.Role.STUDENT))
                    .toList().size());
        }
        if(councilTeam.getCouncil() != null){
            councilTeamDTO.setCouncilId(councilTeam.getCouncil().getId());
            councilTeamDTO.setCouncilName(getCouncilName(councilTeam.getCouncil()));
        }
        if(councilTeam.getSession() != null){
            councilTeamDTO.setSession(ConvertUtils.convert(councilTeam.getSession(), SessionDTO.class));
        }
        return councilTeamDTO;
    }

    @Transactional
    public Object update(UpdateCouncilTeamsRequest request) {
        request.validateInput();
        List<Classes> classes = new ArrayList<>();
        List<Team> teams = new ArrayList<>();
        Session session = checkExistedSession(request.getSessionId());
        checkValidSession(session);
        Council council = checkExistedCouncil(request.getCouncilId());
        Integer councilId = council != null ? council.getId() : null;
        Integer sessionId = session != null ? session.getId() : null;
        List<Council> councils = councilRepository.findBySemesterIdAndRoundId(request.getRoundId(), request.getSemesterId());
        List<Session> sessions = sessionRepository.findBySemesterIdAndRoundId(request.getSemesterId(), request.getRoundId());
        List<Integer> councilIds = councils.stream().map(Council::getId).toList();
        List<Integer> sessionIds = sessions.stream().map(Session::getId).toList();
        if(councilId == null && sessionId == null)
            return "Vui lòng chọn phiên đánh giá hoặc hội đồng";
        HashMap<Integer, String> messageMap = new HashMap<>();

        if(request.getIsAssignedForClass()){
            classes = classesRepository.findByIds(request.getIds());
            getLastTeams(classes, teams);
            for (Classes c : classes) {
                CouncilTeam councilTeam = councilTeamRepository.findByClassIdAndCouncilAndSession(
                        c.getId(),
                        councilIds,
                        sessionIds
                );
                checkTeacherIsInCouncil(c, councilId);
                if(councilTeam != null){
                    councilTeam.setCouncil(council != null ? council : councilTeam.getCouncil());
                    councilTeam.setSession(session != null ? session : councilTeam.getSession());
                } else{
                    councilTeam = new CouncilTeam();
                    councilTeam.setClassId(c.getId());
                    councilTeam.setCouncil(council);
                    councilTeam.setSession(session);
                }
                councilTeamRepository.save(councilTeam);
                if(councilTeam.getCouncil() != null && councilTeam.getSession() != null){
                    List<CouncilTeam> councilTeamList = councilTeamRepository.findInOtherClas(
                        councilTeam.getClassId(),
                        councilTeam.getCouncil().getId(),
                        councilTeam.getSession().getId()
                    );
                    if(councilTeamList != null && councilTeamList.size() > 0){
                        throw new ConflictException(getCouncilName(councilTeam.getCouncil()) +  " chỉ có thể đánh giá một lớp trong "
                                + councilTeam.getSession().getName());
                    }
                }
            }
            HashMap<Integer, List<Team>> classTeamMap = new HashMap<>();
            for (Team team : teams) {
                Integer classId = team.getClasses().getId();
                if (!classTeamMap.containsKey(classId)) {
                    List<Team> teamList = new ArrayList<>();
                    teamList.add(team);
                    classTeamMap.put(classId, teamList);
                } else {
                    List<Team> teamList = classTeamMap.get(classId);
                    if (teamList.size() < 6) {
                        teamList.add(team);
                    } else {
                        messageMap.putIfAbsent(classId, team.getClasses().getClassCode()
                                + " có nhiều hơn 6 nhóm. Vui lòng phân công đánh giá cho hội đồng khác dành cho các nhóm còn lại");
                    }
                }
            }
            for (Team team : classTeamMap.values().stream().flatMap(Collection::stream).toList()) {
                List<CouncilTeam> councilTeamList = councilTeamRepository.findByTeamId(team.getId());
                if(councilTeamList == null || councilTeamList.size() == 0){
                    CouncilTeam councilTeam = new CouncilTeam();
                    councilTeam.setClassId(team.getClasses().getId());
                    councilTeam.setTeamId(team.getId());
                    councilTeam.setCouncil(council);
                    councilTeam.setSession(session);
                    councilTeamRepository.save(councilTeam);
                }
            }
            if(!messageMap.isEmpty()){
                StringBuilder sb = new StringBuilder();
                for (String message : messageMap.values()) {
                    sb.append(message).append("\n\n");
                }
                return sb.toString();
            }
        }else{
            teams = teamRepository.findByIds(request.getIds());
            for (Team team : teams) {
                CouncilTeam councilTeam = councilTeamRepository.findByTeamIdSessionIdAndCouncilId(
                        team.getId(), sessionIds, councilIds
                );
                checkTeacherIsInCouncil(team.getClasses(), councilId);
                if(councilTeam != null){
                    councilTeam.setCouncil(council != null ? council : councilTeam.getCouncil());
                    councilTeam.setSession(session != null ? session : councilTeam.getSession());
                } else{
                    councilTeam = new CouncilTeam();
                    councilTeam.setClassId(team.getClasses().getId());
                    councilTeam.setTeamId(team.getId());
                    councilTeam.setCouncil(council);
                    councilTeam.setSession(session);
                }
                councilTeamRepository.save(councilTeam);
                if(councilTeam.getCouncil() != null && councilTeam.getSession() != null){
                    checkConditionToUpdateForTeam(team.getId(), councilTeam.getCouncil(), councilTeam.getSession(), councilTeam);
                }
            }
        }

        return "Phân công hội đồng thành công";
    }

    private void checkTeacherIsInCouncil(Classes c, Integer councilId) {
        if(councilId != null){
            Council council = councilRepository.findById(councilId).orElseThrow(() -> new RecordNotFoundException("Hội đồng"));
            if(c.getTeacher() != null && council.getCouncilMembers() != null){
                for (CouncilMember cm : council.getCouncilMembers()) {
                    if(cm.getMember().getId().equals(c.getTeacher().getId())){
                        throw new ConflictException("Thành viên trong hội đồng không được trùng với giáo viên của lớp");
                    }
                }
            }
        }
    }

    private void checkValidSession(Session session) {
        if(session != null){
            ValidateUtils.checkBeforeCurrentDate(session.getSessionDate(), "Phiên đánh giá");
        }
    }

    private void checkConditionToUpdateForTeam(Integer teamId, Council council, Session session, CouncilTeam councilTeam) {
        if(session != null && council != null){
            List<CouncilTeam> councilTeamList = councilTeamRepository
                    .findInOtherTeam(teamId, council.getId(), session.getId());
            if(councilTeamList != null && councilTeamList.size() == 6){
                throw new ConflictException(getCouncilName(council) + " chỉ có thể phân công 6 nhóm trong phiên " + session.getName());
            }
        } else if (session != null){
            List<CouncilTeam> councilTeamList = councilTeamRepository
                    .findInOtherTeam(teamId, null, session.getId());
            if(councilTeamList != null && councilTeamList.size() >= 6 && councilTeam != null && councilTeam.getCouncil() != null){
                int numberOfTeams = 0;
                for (CouncilTeam ct : councilTeamList) {
                    if(ct.getCouncil() != null && ct.getCouncil().getId().equals(councilTeam.getCouncil().getId())){
                        numberOfTeams++;
                        if(numberOfTeams > 6){
                            throw new ConflictException(getCouncilName(ct.getCouncil())
                                    + " chỉ có thể phân công 6 nhóm trong phiên " + session.getName());
                        }
                    }
                }
            }
        } else if (council != null) {
            List<CouncilTeam> councilTeamList = councilTeamRepository
                    .findInOtherTeam(teamId, council.getId(), null);
            if(councilTeamList != null && councilTeamList.size() >= 6 && councilTeam != null && councilTeam.getSession() != null){
                int numberOfTeams = 0;
                for (CouncilTeam ct : councilTeamList) {
                    if(ct.getSession() != null && ct.getSession().getId().equals(councilTeam.getSession().getId())){
                        numberOfTeams++;
                        if(numberOfTeams > 6){
                            throw new ConflictException(getCouncilName(ct.getCouncil())
                                    + " chỉ có thể phân công 6 nhóm trong phiên " + ct.getSession().getName());
                        }
                    }
                }
            }
        }
    }

    private void checkConditionToUpdate(Session session, Council council, Classes classes, CouncilTeam councilTeam) {
        if(session != null && council != null){
            List<CouncilTeam> councilTeamList = councilTeamRepository
                    .getNumberOfCouncilTeams(session.getId(), council.getId(), classes.getId());
            if(councilTeamList != null && councilTeamList.size() > 0){
                throw new ConflictException(getCouncilName(council) + " đã được phân công đánh giá lớp khác trong phiên " + session.getName());
            }
        } else if(session != null){
            List<CouncilTeam> councilTeamList = councilTeamRepository
                    .getNumberOfCouncilTeams(session.getId(), null, classes.getId());
            if(councilTeam != null && councilTeam.getCouncil() != null && councilTeamList != null && councilTeamList.size() > 0){
                for (CouncilTeam ct : councilTeamList) {
                    if(ct.getCouncil() != null && ct.getCouncil().getId().equals(councilTeam.getCouncil().getId())){
                        throw new ConflictException(getCouncilName(ct.getCouncil()) + " đã được phân công đánh giá lớp khác trong phiên " + session.getName());
                    }
                }
            }
        } else if (council != null) {
            List<CouncilTeam> councilTeamList = councilTeamRepository
                    .getNumberOfCouncilTeams(null, council.getId(), classes.getId());
            if(councilTeam != null && councilTeam.getSession() != null && councilTeamList != null && councilTeamList.size() > 0){
                for (CouncilTeam ct : councilTeamList) {
                    if(ct.getSession() != null && ct.getSession().getId().equals(councilTeam.getSession().getId())){
                        throw new ConflictException(getCouncilName(council) +  " đã được phân công đánh giá lớp khác trong phiên " +
                                ct.getSession().getName());
                    }
                }
            }
        }
    }

    private String getCouncilName(Council council){
        if(council.getCouncilMembers() != null && council.getCouncilMembers().size() > 0){
            int size = council.getCouncilMembers().size(), count = 0;
            StringBuilder sb = new StringBuilder();
            for (CouncilMember mem : council.getCouncilMembers()) {
                if (mem != null) {
                    if (count < 2) {
                        sb.append(mem.getMember().getUsername());
                        if (count == 1 && size > 2) {
                            sb.append(" - ...");
                        } else if (count == 0) {
                            sb.append(" - ");
                        }
                    }
                    count++;
                }
            }
            if (count <= 2 && sb.length() > 0 && sb.charAt(sb.length() - 1) == ' ') {
                sb.delete(sb.length() - 3, sb.length());
            }
            return sb.toString();
        }
        return "";
    }

    private void getLastTeams(List<Classes> classes, List<Team> teams) {
        for (Classes c : classes) {
            if(c.getTeams() != null && c.getTeams().size() > 0) {
                teams.addAll(c.getTeams());
            }
        }
    }

    private Council checkExistedCouncil(Integer councilId) {
        if(councilId != null){
            return councilRepository.findById(councilId).orElseThrow(() -> new RecordNotFoundException("Hội đồng"));
        }
        return null;
    }

    private Session checkExistedSession(Integer sessionId) {
        if(sessionId != null){
            return sessionRepository.findById(sessionId).orElseThrow(() -> new RecordNotFoundException("Phiên đánh giá"));
        }
        return null;
    }

    public Object searchClasses(Integer semesterId, Integer subjectId) {
        Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", semesterId);
        if(semester == null){
            throw new RecordNotFoundException("Học kỳ");
        }
        Subject subject = subjectRepository.findById(subjectId).orElseThrow(() -> new RecordNotFoundException("Môn học"));
        List<Classes> classes = classesRepository.findBySemesterIdAndSubjectId(semester.getId(), subject.getId());
        List<BaseDTO> responses = new ArrayList<>();
        for (Classes sClass : classes) {
            responses.add(new BaseDTO(sClass.getId(), sClass.getClassCode()));
        }
        return responses;
    }

    public Object searchTeams(Integer semesterId, Integer subjectId, Integer classId) {
        List<BaseDTO> responses = new ArrayList<>();
        if(semesterId == null || subjectId == null)
            return responses;
        Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", semesterId);
        if(semester == null){
            throw new RecordNotFoundException("Học kỳ");
        }
        Subject subject = subjectRepository.findById(subjectId).orElseThrow(() -> new RecordNotFoundException("Môn học"));
        List<Classes> classes = classesRepository.findBySemesterIdAndSubjectId(semester.getId(), subjectId);
        classes = classes.stream().filter(item -> classId == null || item.getId().equals(classId)).toList();
        List<Team> teams = new ArrayList<>();
        getLastTeams(classes, teams);
        for (Team team : teams) {
            responses.add(new BaseDTO(team.getId(), team.getTeamName()));
        }
        return responses;
    }
    @Transactional
    public Object importCouncilTeams(ImportCouncilTeamsRequest request) {
        request.validateInput();
        List<Team> teams = new ArrayList<>();
        List<CouncilTeam> councilTeams = new ArrayList<>();
        HashMap<Integer, String> messageMap = new HashMap<>();
        List<Council> councils = councilRepository.findBySemesterIdAndRoundId(request.getRoundId(), request.getSemesterId());
        List<Session> sessions = sessionRepository.findBySemesterIdAndRoundId(request.getSemesterId(), request.getRoundId());
        List<Integer> councilIds = councils.stream().map(Council::getId).toList();
        List<Integer> sessionIds = sessions.stream().map(Session::getId).toList();
        if(request.getIsAssignedForClass()){
            for (ImportCouncilTeam req : request.getImportedTeams()) {
                Classes c = classesRepository.findById(req.getId()).orElseThrow(() -> new RecordNotFoundException("Lớp học"));
                Session session = checkExistedSession(req.getSessionId());
                checkValidSession(session);
                Council council = checkExistedCouncil(req.getCouncilId());
                Integer councilId = council != null ? council.getId() : null;
                Integer sessionId = session != null ? session.getId() : null;
                if(councilId == null && sessionId == null)
                    continue;
                CouncilTeam councilTeam = councilTeamRepository.findByClassIdAndCouncilAndSession(
                        c.getId(),
                        councilIds,
                        sessionIds
                );
                checkTeacherIsInCouncil(c, councilId);
                checkConditionToUpdate(session, council, c, councilTeam);
                if(councilTeam != null){
                    councilTeam.setCouncil(council != null ? council : councilTeam.getCouncil());
                    councilTeam.setSession(session != null ? session : councilTeam.getSession());
                } else{
                    councilTeam = new CouncilTeam();
                    councilTeam.setClassId(c.getId());
                    councilTeam.setCouncil(council);
                    councilTeam.setSession(session);
                }
                getLastTeams(List.of(c), teams);
                HashMap<Integer, List<Team>> classTeamMap = new HashMap<>();
                for (Team team : teams) {
                    Integer classId = team.getClasses().getId();
                    if (!classTeamMap.containsKey(classId)) {
                        List<Team> teamList = new ArrayList<>();
                        teamList.add(team);
                        classTeamMap.put(classId, teamList);
                    } else {
                        List<Team> teamList = classTeamMap.get(classId);
                        if (teamList.size() < 6) {
                            teamList.add(team);
                        } else {
                            messageMap.putIfAbsent(classId, team.getClasses().getClassCode()
                                    + " có nhiều hơn 6 nhóm. Vui lòng phân công đánh giá cho hội đồng khác dành cho các nhóm còn lại");
                        }
                    }
                }
                for (Team team : classTeamMap.values().stream().flatMap(Collection::stream).toList()) {
                    List<CouncilTeam> councilTeamList = councilTeamRepository.findByTeamId(team.getId());
                    if(councilTeamList == null || councilTeamList.size() == 0){
                        CouncilTeam councilTeam2 = new CouncilTeam();
                        councilTeam2.setClassId(team.getClasses().getId());
                        councilTeam2.setTeamId(team.getId());
                        councilTeam2.setCouncil(council);
                        councilTeam2.setSession(session);
                        councilTeams.add(councilTeam2);
                    }
                }
                teams = new ArrayList<>();
                councilTeams.add(councilTeam);
            }
            councilTeamRepository.saveAll(councilTeams);
            if(!messageMap.isEmpty()){
                StringBuilder sb = new StringBuilder();
                for (String message : messageMap.values()) {
                    sb.append(message).append("\n\n");
                }
                return sb.toString();
            }
        }else{
            for (ImportCouncilTeam req : request.getImportedTeams()) {
                Session session = checkExistedSession(req.getSessionId());
                Council council = checkExistedCouncil(req.getCouncilId());
                Integer councilId = council != null ? council.getId() : null;
                Integer sessionId = session != null ? session.getId() : null;
                if(councilId == null && sessionId == null)
                    continue;
                Team team = teamRepository.findById(req.getId()).orElseThrow(() -> new RecordNotFoundException("Nhóm"));
                CouncilTeam councilTeam = councilTeamRepository.findByTeamIdSessionIdAndCouncilId(
                        team.getId(), sessionIds, councilIds
                );
                checkTeacherIsInCouncil(team.getClasses(), councilId);
                checkConditionToUpdateForTeam(team.getId(), council, session, councilTeam);
                if(councilTeam != null){
                    councilTeam.setCouncil(council != null ? council : councilTeam.getCouncil());
                    councilTeam.setSession(session != null ? session : councilTeam.getSession());
                } else{
                    councilTeam = new CouncilTeam();
                    councilTeam.setClassId(team.getClasses().getId());
                    councilTeam.setTeamId(team.getId());
                    councilTeam.setCouncil(council);
                    councilTeam.setSession(session);
                }
                councilTeamRepository.save(councilTeam);
            }
        }
        return "Nhập phân công hội đồng đánh giá thành công";
    }

    @Transactional
    public Object autoAssign(Integer semesterId, Integer roundId) {
        ValidateUtils.checkNullOrEmpty(semesterId, "Học kỳ");
        ValidateUtils.checkNullOrEmpty(roundId, "Lần đánh giá");
        Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", semesterId);
        if(semester == null){
            throw new RecordNotFoundException("Học kỳ");
        }
        Setting round = (Setting) settingRepository.findSettingBySettingTypeAndSettingId("round", roundId);
        if(round == null){
            throw new RecordNotFoundException("Lần đánh giá");
        }
        Subject subject = round.getSubject();
        List<Classes> classes = classesRepository.findBySemesterIdAndSubjectId(semesterId, subject.getId());
        List<Team> teams = classes.stream().flatMap(item -> item.getTeams().stream()).toList();
        List<Integer> teamIds = teams.stream().map(Team::getId).toList();
        List<Council> sCouncils = councilRepository.findBySemesterIdAndRoundId(roundId, semesterId);
        List<Session> sessions = sessionRepository.findBySemesterIdAndRoundId(semesterId, roundId);
        List<Integer> councilIds = sCouncils.stream().map(Council::getId).toList();
        List<Integer> sessionIds = sessions.stream().map(Session::getId).toList();
        List<CouncilTeam> councils = councilTeamRepository.search(
                councilIds, sessionIds,
                classes.stream().map(Classes::getId).toList(),
                teamIds, false
        );

        Map<Pair<Integer, Integer>, Long> assignmentCount = new HashMap<>();

        // Khởi tạo assignmentCount với các cặp hội đồng và phiên chấm hiện có trong councils
        for (CouncilTeam council : councils) {
            if(council.getCouncil() != null && council.getSession() != null){
                Pair<Integer, Integer> key = Pair.of(council.getCouncil().getId(), council.getSession().getId());
                assignmentCount.put(key, assignmentCount.getOrDefault(key, 0L) + 1);
            }
        }

        // Danh sách các nhóm cần phân công
        List<Team> unassignedTeams = new ArrayList<>();

        for (Team team : teams) {
            boolean isAssigned = councils.stream()
                    .anyMatch(council -> council.getTeamId().equals(team.getId())
                            && council.getCouncil() != null
                            && council.getSession() != null);

            if (!isAssigned) {
                unassignedTeams.add(team);
            }
        }

        // Phân công các nhóm chưa được phân công đầy đủ
        for (Team team : unassignedTeams) {
            boolean assigned = false;

            for (Council council : sCouncils) {
                for (Session session : sessions) {
                    Pair<Integer, Integer> key = Pair.of(council.getId(), session.getId());
                    long count = assignmentCount.getOrDefault(key, 0L);

                    if (count < 6) {
                        CouncilTeam councilTeam = councilTeamRepository.findByTeam(team.getId(), councilIds, sessionIds);
                        if(councilTeam == null)
                            councilTeam = new CouncilTeam();
                        councilTeam.setTeamId(team.getId());
                        councilTeam.setClassId(team.getClasses().getId());
                        councilTeam.setCouncil(council);
                        councilTeam.setSession(session);
                        councilTeamRepository.save(councilTeam);
                        // Cập nhật bộ đếm
                        assignmentCount.put(key, count + 1);
                        assigned = true;
                        break;
                    }
                }
                if (assigned) break;
            }
        }

        SearchCouncilTeamRequest request = new SearchCouncilTeamRequest();
        request.setSemesterId(semesterId);
        request.setSubjectId(subject.getId());
        request.setIsSearchClass(false);
        request.setPageSize(10);
        request.setRoundId(roundId);
        return search(request);
    }

    private HashMap<String, Integer> getCouncilSessionMap(List<Council> sCouncils, List<Session> sessions, List<CouncilTeam> councilTeams) {
        HashMap<String, Integer> councilSessionMap = new HashMap<>();
        for (Council council : sCouncils) {
            for (Session session : sessions) {
                StringBuilder key = new StringBuilder("c");
                key.append(council.getId()).append(",s").append(session.getId());
                councilSessionMap.putIfAbsent(key.toString(), 6);
            }
        }
        for (CouncilTeam councilTeam : councilTeams) {
            if(councilTeam.getCouncil() != null && councilTeam.getSession() != null){
                StringBuilder key = new StringBuilder("c");
                key.append(councilTeam.getCouncil().getId()).append(",s").append(councilTeam.getSession().getId());
                Integer num = councilSessionMap.get(key.toString());
                if(num != null && num > 1){
                    councilSessionMap.put(key.toString(), --num);
                }else if(num == 1){
                    councilSessionMap.remove(key.toString());
                }
            }
        }

        return councilSessionMap;
    }
}
