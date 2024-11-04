package com.sep490.sep490.dto.councils.response;

import com.sep490.sep490.dto.CouncilDTO;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.dto.SessionDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchCouncilResponse extends SearchRequestDTO {
    private List<CouncilDTO> councilDTOs;
    private Long totalElements;
    private String sortBy;
}
