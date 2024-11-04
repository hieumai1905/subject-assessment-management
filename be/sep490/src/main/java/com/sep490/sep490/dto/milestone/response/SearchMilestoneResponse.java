package com.sep490.sep490.dto.milestone.response;

import com.sep490.sep490.dto.SearchRequestDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchMilestoneResponse extends SearchRequestDTO {
    private List<MilestoneResponse> milestoneResponses;
    private Long totalElements;
    private String sortBy;
}
