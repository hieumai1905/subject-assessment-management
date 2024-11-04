package com.sep490.sep490.dto.submission.response;

import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.dto.SettingDTO;
import com.sep490.sep490.dto.SubmissionDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchSubmissionResponse extends SearchRequestDTO {
    private List<SubmissionDTO> submissionDTOS;
    private Long totalElements;
    private String sortBy;
}
