package com.sep490.sep490.mapper;

import com.sep490.sep490.dto.milestone.request.MilestoneRequest;
import com.sep490.sep490.dto.milestone.request.UpdateMilestoneRequest;
import com.sep490.sep490.entity.Assignment;
import com.sep490.sep490.entity.Classes;
import com.sep490.sep490.entity.Milestone;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Data
@AllArgsConstructor
@Component
public class MilestoneMapper {
    private static final ModelMapper modelMapper = new ModelMapper();
    public Milestone convertMilestoneRequestToMilestone(Assignment assignment,
                                                        Classes classes,
                                                        MilestoneRequest request){
        Milestone response = new Milestone();
        response.setTitle(assignment.getAssignmentTitle());
//        response.setAssignment(assignment);
        response.setClasses(classes);
        response.setStartDate(request.getStartDate());
        response.setDueDate(request.getDueDate());
        response.setNote(request.getNote());
        response.setActive(true);
        return response;
    }

    public Milestone convertUpdateMilestoneRequestToMilestone(UpdateMilestoneRequest request,
                                                              Milestone response){
        response.setTitle(request.getTitle());
        response.setStartDate(request.getStartDate());
        response.setDueDate(request.getDueDate());
        response.setNote(request.getNote());
        return response;
    }

}
