package com.sep490.sep490.dto.subject.response;

import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.dto.user.SubjectUserDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class SearchSubjectTeacherResponse extends SearchRequestDTO {
    private List<SubjectUserDTO> list;
    private String sortBy;
    private Long totalElements;
}
