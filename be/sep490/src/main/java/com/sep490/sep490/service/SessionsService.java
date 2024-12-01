package com.sep490.sep490.service;


import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.dto.SessionDTO;
import com.sep490.sep490.dto.SettingDTO;
import com.sep490.sep490.dto.sessions.request.SearchSessionRequest;
import com.sep490.sep490.dto.sessions.response.SearchSessionResponse;
import com.sep490.sep490.dto.setting.request.SearchSettingRequest;
import com.sep490.sep490.dto.setting.response.SearchSettingResponse;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.mapper.SettingMapper;
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
@RequiredArgsConstructor
@Service
@Log4j2
public class SessionsService  {
    private final SessionRepository sessionRepository;
    private final SettingRepository settingRepository;
    private final CouncilRepository councilRepository;
    private final CouncilTeamRepository councilTeamRepository;
    private final CommonService commonService;
    private final TeamRepository teamRepository;
    private final SubjectRepository subjectRepository;
    public Object create(SessionDTO request) {
        request.validateInput(false);
        Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", request.getSemesterId());
        if(semester == null){
            throw new RecordNotFoundException("Học kỳ");
        }
        Setting round = (Setting) settingRepository.findSettingBySettingTypeAndSettingId("round", request.getSubjectSettingId());
        if(round == null){
            throw new RecordNotFoundException("Lần đánh giá");
        }
        checkValidNumberOfSessions(semester, round, false);
        Subject subject = subjectRepository.findById(request.getSubjectId()).orElseThrow(() -> new RecordNotFoundException("Môn học"));
        Session existByName = sessionRepository.checkExistByName(request.getName(), request.getSemesterId(),
                null, subject.getSubjectSettings().stream()
                        .filter(item -> item.getSettingType().equals(Constants.SettingType.ROUND))
                        .map(Setting::getId)
                        .toList()
        );
        if(existByName != null){
            throw new NameAlreadyExistsException("Phiên đánh giá");
        }
        Session session = ConvertUtils.convert(request, Session.class);
//        setBaseSession(request, session);
        sessionRepository.save(session);
        return setBaseSessionDTO(session, semester, round);
    }

    private SessionDTO setBaseSessionDTO(Session session, Setting semester, Setting round) {
        SessionDTO sessionDTO = ConvertUtils.convert(session, SessionDTO.class);
        if(semester != null){
            sessionDTO.setSemesterName(semester.getName());
        }
        if(round != null){
            sessionDTO.setSubjectSettingName(round.getName());
        }
        sessionDTO.setCanDelete(!councilTeamRepository.isExistedBySessionId(sessionDTO.getId()));
        return sessionDTO;
    }

    private void setBaseSession(SessionDTO request, Session session) {
        session.setName(request.getName());
        session.setNote(request.getNote());
        session.setSessionDate(request.getSessionDate());
        session.setSemesterId(request.getSemesterId());
        session.setTime(request.getTime());
        session.setSubjectSettingId(request.getSubjectSettingId());
    }

    public Object search(SearchSessionRequest request) {
        request.validateInput();
        Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", request.getSemesterId());
        if(semester == null){
            throw new RecordNotFoundException("Học kỳ");
        }
        Setting round = (Setting) settingRepository.findSettingBySettingTypeAndSettingId("round", request.getSettingId());
        if(round == null){
            throw new RecordNotFoundException("Lần đánh giá");
        }
        Pageable pageable;
        if (request.getOrderBy().equals("DESC"))
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).descending());
        else
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).ascending());

        Page<Session> settings = sessionRepository.search(
                request.getSettingId(),
                request.getSemesterId(),
                pageable
        );

        SearchSessionResponse response = new SearchSessionResponse();
        response.setSessionDTOs(ConvertUtils.convertList(settings.getContent(), SessionDTO.class));
        for (SessionDTO sessionDTO : response.getSessionDTOs()) {
            sessionDTO.setSemesterName(semester.getName());
            sessionDTO.setSubjectSettingName(round.getName());
            sessionDTO.setCanDelete(!councilTeamRepository.isExistedBySessionId(sessionDTO.getId()));
        }
        response.setTotalElements(settings.getTotalElements());
        response.setPageIndex(request.getPageIndex());
        response.setPageSize(request.getPageSize());
        response.setOrderBy(request.getOrderBy());
        response.setSortBy(request.getSortBy());

        return response;
    }

    public Object update(Integer id, SessionDTO request) {
        request.validateInput(true);
        Session foundSession = sessionRepository.findById(id).orElseThrow(() -> new RecordNotFoundException("Phiên đánh giá"));
        Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", request.getSemesterId());
        if(semester == null){
            throw new RecordNotFoundException("Học kỳ");
        }
        Setting round = (Setting) settingRepository.findSettingBySettingTypeAndSettingId("round", request.getSubjectSettingId());
        if(round == null){
            throw new RecordNotFoundException("Lần đánh giá");
        }
        checkValidNumberOfSessions(semester, round, foundSession.getSubjectSettingId().equals(round.getId()));
        Subject subject = subjectRepository.findById(request.getSubjectId()).orElseThrow(() -> new RecordNotFoundException("Môn học"));
        Session existByName = sessionRepository.checkExistByName(request.getName(), request.getSemesterId(),
                id, subject.getSubjectSettings().stream()
                        .filter(item -> item.getSettingType().equals(Constants.SettingType.ROUND))
                        .map(Setting::getId)
                        .toList()
        );
        if(existByName != null){
            throw new NameAlreadyExistsException("Phiên đánh giá");
        }
        setBaseSession(request, foundSession);
        sessionRepository.save(foundSession);
        return setBaseSessionDTO(foundSession, semester, round);
    }

    private void checkValidNumberOfSessions(Setting semester, Setting round, Boolean isUpdate) {
        List<Session> sessions = sessionRepository.findBySemesterIdAndRoundId(semester.getId(), round.getId());
        int numberOfSessionsCanAdd = 1;
        try{
            numberOfSessionsCanAdd = Integer.parseInt(round.getExtValue());
        }catch (NumberFormatException ignored){
        }
        if(!isUpdate)
            numberOfSessionsCanAdd--;
        if(sessions.size() > numberOfSessionsCanAdd)
            throw new ConflictException("Số phiên đánh giá trong " + semester.getName()
                    + " - " + round.getName() + " phải <=" + ++numberOfSessionsCanAdd);
    }

    @Transactional
    public void delete(Integer id) {
        Session foundSession = sessionRepository.findById(id).orElseThrow(() -> new RecordNotFoundException("Phiên đánh giá"));
        sessionRepository.deleteBySessionId(id);
    }

    public Object searchForGrandFinal(SearchSessionRequest request) {
//        request.validateInput();
        SearchSessionResponse response = new SearchSessionResponse();
        response.setSessionDTOs(new ArrayList<>());
        if (request.getSemesterId() == null || request.getSettingId() == null)
            return response;
        User user = commonService.getCurrentUser();
        Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", request.getSemesterId());
        if(semester == null){
            throw new RecordNotFoundException("Học kỳ");
        }
        Setting round = (Setting) settingRepository.findSettingBySettingTypeAndSettingId("round", request.getSettingId());
        if(round == null){
            throw new RecordNotFoundException("Lần đánh giá");
        }
        List<Session> sessions = sessionRepository.findBySemesterIdAndRoundId(semester.getId(), round.getId());
        if(user.getRole().getId().equals(Constants.Role.STUDENT)){
            sessions = sessions.stream()
                    .flatMap(item -> item.getCouncilTeams().stream())
                    .filter(item -> {
                        Integer teamId = item.getTeamId();
                        if (teamId == null) {
                            return false;
                        }
                        Team team = teamRepository.findById(teamId).orElse(null);
                        if (team == null || team.getTeamMembers() == null) {
                            return false;
                        }
                        return team.getTeamMembers().stream()
                                .anyMatch(teamMember -> teamMember.getMember().getId().equals(user.getId()));
                    })
                    .map(CouncilTeam::getSession)
                    .toList();
        } else if(user.getRole().getId().equals(Constants.Role.TEACHER)){
            sessions = sessions.stream()
                    .flatMap(item -> item.getCouncilTeams().stream())
                    .filter(item -> {
                        if (item.getCouncil() == null || item.getCouncil().getCouncilMembers() == null) {
                            return false;
                        }
                        return item.getCouncil().getCouncilMembers().stream()
                                .anyMatch(councilMember -> councilMember.getMember().getId().equals(user.getId()));
                    })
                    .map(CouncilTeam::getSession)
                    .toList();
        }

        response.setSessionDTOs(ConvertUtils.convertList(sessions, SessionDTO.class));
        return response;
    }
}
