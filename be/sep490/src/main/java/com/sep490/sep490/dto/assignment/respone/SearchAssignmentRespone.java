package com.sep490.sep490.dto.assignment.respone;

import com.sep490.sep490.dto.AssignmentDTO;
import com.sep490.sep490.dto.SearchRequestDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;
@EqualsAndHashCode(callSuper = true)
@Data
public class SearchAssignmentRespone extends SearchRequestDTO {
    private List<AssignmentDTO> assignmentDTOS;
    private Long totalElements;
    private String sortBy;
}
