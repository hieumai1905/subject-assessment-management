package com.sep490.sep490.dto.requirement.response;

import com.sep490.sep490.dto.RequirementDTO;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.dto.TeamDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchRequirementResponse extends SearchRequestDTO {
    private List<RequirementDTO> requirementDTOs;
    private String sortBy;
    private Long totalElements;
}
