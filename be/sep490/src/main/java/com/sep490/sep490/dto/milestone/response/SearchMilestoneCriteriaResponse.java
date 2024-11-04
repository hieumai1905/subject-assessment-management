package com.sep490.sep490.dto.milestone.response;

import com.sep490.sep490.dto.MilestoneCriteriaDTO;
import com.sep490.sep490.dto.SearchRequestDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchMilestoneCriteriaResponse extends SearchRequestDTO {
    private List<MilestoneCriteriaDTO> milestoneCriterias;
    private Long totalElements;
    private String sortBy;
}
