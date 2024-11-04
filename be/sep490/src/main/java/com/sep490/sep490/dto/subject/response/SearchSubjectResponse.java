package com.sep490.sep490.dto.subject.response;

import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.dto.SubjectDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchSubjectResponse extends SearchRequestDTO {
    private List<SubjectDTO> subjects;
    private Long totalElements;
    private String sortBy;
}
