package com.sep490.sep490.service;

import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.dto.CouncilDTO;
import com.sep490.sep490.dto.CouncilMemberDTO;
import com.sep490.sep490.dto.CouncilTeamDTO;
import com.sep490.sep490.dto.SessionDTO;
import com.sep490.sep490.dto.councils.request.SearchCouncilRequest;
import com.sep490.sep490.dto.councils.response.SearchCouncilResponse;
import com.sep490.sep490.dto.sessions.request.SearchSessionRequest;
import com.sep490.sep490.dto.sessions.response.SearchSessionResponse;
import com.sep490.sep490.entity.*;
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
public class CouncilService {
    private final SessionRepository sessionRepository;
    private final SettingRepository settingRepository;
    private final CouncilRepository councilRepository;
    private final CouncilTeamRepository councilTeamRepository;
    private final UserRepository userRepository;
    public Object create(CouncilDTO request) {
        request.validateInput();
        Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", request.getSemesterId());
        if(semester == null){
            throw new RecordNotFoundException("Semester");
        }
        Setting round = (Setting) settingRepository.findSettingBySettingTypeAndSettingId("round", request.getSubjectSettingId());
        if(round == null){
            throw new RecordNotFoundException("Round");
        }
        Council council = new Council();
        setBaseCouncil(request, council);
        councilRepository.save(council);
        return convertToCouncilDTO(council, semester, round);
    }

    private CouncilDTO convertToCouncilDTO(Council council, Setting semester, Setting round) {
        CouncilDTO councilDTO = new CouncilDTO();
        councilDTO.setId(council.getId());
        councilDTO.setCanDelete(!councilTeamRepository.isExistedByCouncilId(council.getId()));
        if(semester != null){
            councilDTO.setSemesterId(semester.getId());
            councilDTO.setSemesterName(semester.getName());
        }
        if(round != null){
            councilDTO.setSubjectSettingId(round.getId());
            councilDTO.setSubjectSettingName(round.getName());
        }
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

    private void setBaseCouncil(CouncilDTO request, Council council) {
        council.setSemesterId(request.getSemesterId());
        council.setSubjectSettingId(request.getSubjectSettingId());
        List<CouncilMember> councilMemberList = new ArrayList<>();
        for (CouncilMemberDTO mem : request.getCouncilMembers()) {
            CouncilMember councilMember = new CouncilMember();
            User user = userRepository.findById(mem.getId()).orElseThrow(() -> new RecordNotFoundException("Teacher"));
            councilMember.setCouncil(council);
            councilMember.setMember(user);
            councilMemberList.add(councilMember);
        }
        council.setCouncilMembers(councilMemberList);
    }

    public Object search(SearchCouncilRequest request) {
        request.validateInput();
        Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", request.getSemesterId());
        if(semester == null){
            throw new RecordNotFoundException("Semester");
        }
        Setting round = (Setting) settingRepository.findSettingBySettingTypeAndSettingId("round", request.getSettingId());
        if(round == null){
            throw new RecordNotFoundException("Round");
        }
        Pageable pageable;
        if (request.getOrderBy().equals("DESC"))
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).descending());
        else
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).ascending());

        Page<Council> councils = councilRepository.search(
                request.getSettingId(),
                request.getSemesterId(),
                pageable
        );
        List<CouncilMemberDTO> teachers = new ArrayList<>();
        if(round.getSubject() != null && round.getSubject().getTeachers() != null){
            teachers = ConvertUtils.convertList(round.getSubject().getTeachers(), CouncilMemberDTO.class);
        }
        SearchCouncilResponse response = new SearchCouncilResponse();
        List<CouncilDTO> councilDTOS = new ArrayList<>();
        for (Council council : councils.getContent()) {
            councilDTOS.add(convertToCouncilDTO(council, semester, round));
            removeTeachers(teachers, council);
        }
        if (teachers.size() > 0){
            CouncilDTO wishList = new CouncilDTO();
            wishList.setSubjectSettingId(round.getId());
            wishList.setSemesterId(semester.getId());
            wishList.setCouncilName("Wish List");
            wishList.setSemesterName(semester.getName());
            wishList.setSubjectSettingName(round.getName());
            wishList.setCouncilMembers(teachers);
            councilDTOS.add(0, wishList);
        }
        response.setCouncilDTOs(councilDTOS);
        response.setTotalElements(councils.getTotalElements());
        response.setPageIndex(request.getPageIndex());
        response.setPageSize(request.getPageSize());
        response.setOrderBy(request.getOrderBy());
        response.setSortBy(request.getSortBy());

        return response;
    }

    private void removeTeachers(List<CouncilMemberDTO> teachers, Council council) {
        if (council.getCouncilMembers() != null) {
            for (CouncilMember countedMember : council.getCouncilMembers()) {
                teachers.removeIf(teacher -> teacher.getId().equals(countedMember.getMember().getId()));
            }
        }
    }

    @Transactional
    public Object update(Integer id, CouncilDTO request) {
        request.validateInput();
        Council foundCouncil = councilRepository.findById(id).orElseThrow(() -> new RecordNotFoundException("Council"));
        Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", request.getSemesterId());
        if(semester == null){
            throw new RecordNotFoundException("Semester");
        }
        Setting round = (Setting) settingRepository.findSettingBySettingTypeAndSettingId("round", request.getSubjectSettingId());
        if(round == null){
            throw new RecordNotFoundException("Round");
        }
        councilRepository.removeMemberById(id);
        setBaseCouncil(request, foundCouncil);
        councilRepository.save(foundCouncil);
        return convertToCouncilDTO(foundCouncil, semester, round);
    }
    @Transactional
    public void delete(Integer id) {
        Council foundCouncil = councilRepository.findById(id).orElseThrow(() -> new RecordNotFoundException("Council"));
        councilRepository.deleteMemberById(id);
        councilRepository.deleteByCouncilId(id);
    }
}
