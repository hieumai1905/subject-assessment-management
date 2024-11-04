package com.sep490.sep490.dto.sessions.response;

import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.dto.SessionDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchSessionResponse extends SearchRequestDTO {
    private List<SessionDTO> sessionDTOs;
    private Long totalElements;
    private String sortBy;
}
