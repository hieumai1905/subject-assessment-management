package com.sep490.sep490.mapper;

import com.sep490.sep490.dto.EvaluationCriteriaDTO;
import com.sep490.sep490.dto.studentEvaluation.response.*;
import com.sep490.sep490.entity.EvaluationCriteria;
import com.sep490.sep490.entity.Team;
import com.sep490.sep490.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@AllArgsConstructor
@Component
public class StudentEvaluationMapper {
    private static final ModelMapper modelMapper = new ModelMapper();

//    public StudentEvaluationResponse convertToStudentEvaluationResponse(
//            User student, Team team, List<Integer> teamLeads) {
//        StudentEvaluationResponse response = new StudentEvaluationResponse();
//        // map to student response
//        StudentResponse studentResponse = new StudentResponse();
//        studentResponse.setId(student.getId());
//        studentResponse.setFullname(student.getFullname());
//
//        // map to team response
//        TeamResponse teamResponse = new TeamResponse();
//        teamResponse.setId(team.getId());
//        teamResponse.setTeamName(team.getTeamName());
//        teamResponse.setTopicName(team.getTopicName());
//        teamResponse.setNote(team.getNote());
//        if (teamLeads.contains(student.getId())){
//            teamResponse.setIsLeader(true);
//        }
//        teamResponse.setIsLeader(false);
//
////        response.setTeam(teamResponse);
////        response.setStudent(studentResponse);
//
//        return response;
//    }
}
