package com.sep490.sep490.service;

import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.dto.team_member.request.UpdateTeamMemberRequest;
import com.sep490.sep490.dto.user.request.CreateUserRequest;
import com.sep490.sep490.entity.ClassUser;
import com.sep490.sep490.entity.Team;
import com.sep490.sep490.entity.TeamMember;
import com.sep490.sep490.entity.User;
import com.sep490.sep490.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
@Log4j2
public class TeamMemberService{

    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final RequirementRepository requirementRepository;
    private final WorkEvaluationRepository workEvaluationRepository;
    private final StudentEvaluationRepository studentEvaluationRepository;
    private final UpdateTrackingRepository updateTrackingRepository;
    @Transactional
    public void updateTeamMember(UpdateTeamMemberRequest request){
        request.validateInput();
        TeamMember teamMember = teamMemberRepository.findByTeamIdAndMemberId(request.getOldTeamId(), request.getMemberId());
        if(request.getOldTeamId() != null && request.getNewTeamId() == null){
            if(teamMember == null)
                throw new RecordNotFoundException("Team member");
            deleteStudentInReqAndEvaluations(teamMember);
            teamMemberRepository.deleteByTeamIdAndMemberId(teamMember.getTeam().getId(), teamMember.getMember().getId());
        }else{
            Team team = teamRepository.findById(request.getNewTeamId()).orElseThrow(
                    () -> new RecordNotFoundException("Team")
            );
            isExistInClass(team, request);
            if(request.getOldTeamId() == null)
                teamMember = new TeamMember();
            else
                deleteStudentInReqAndEvaluations(teamMember);
            teamMember.setMember(new User());
            teamMember.getMember().setId(request.getMemberId());
            teamMember.setTeam(team);
            teamMemberRepository.save(teamMember);
        }
    }

    private void deleteStudentInReqAndEvaluations(TeamMember teamMember){
        studentEvaluationRepository.deleteByMilestoneIdAndMemberId(
                teamMember.getTeam().getMilestone().getId(),
                teamMember.getMember().getId()
        );
        updateTrackingRepository.deleteByTeamIdAndMemberId(teamMember.getTeam().getId(), teamMember.getMember().getId());
        workEvaluationRepository.deleteByTeamIdAndMemberId(teamMember.getTeam().getId(), teamMember.getMember().getId());
        requirementRepository.resetStudentInRequirements(teamMember.getTeam().getId(), teamMember.getMember().getId());
    }

    private void isExistInClass(Team team, UpdateTeamMemberRequest request) {
        boolean isExistInClass = false;
        for (ClassUser classUser : team.getClasses().getClassesUsers()) {
            if(classUser.getUser().getId().equals(request.getMemberId())){
                isExistInClass = true;
                break;
            }
        }
        if(!isExistInClass)
            throw new ConflictException("The member is not in the class's new team!");
    }

    public List<CreateUserRequest> getMembers(Integer teamId) {
        Team team = teamRepository.findById(teamId).orElseThrow(
                () -> new RecordNotFoundException("Team")
        );
        List<CreateUserRequest> members = new ArrayList<>();
        if(team.getTeamMembers() != null){
            for (TeamMember teamMember : team.getTeamMembers()) {
                CreateUserRequest member = new CreateUserRequest();
                member.setId(teamMember.getMember().getId());
                member.setFullname(teamMember.getMember().getFullname());
                member.setEmail(teamMember.getMember().getEmail());
                members.add(member);
            }
        }
        return members;
    }
}
