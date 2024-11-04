package com.sep490.sep490.dto.studentEvaluation.response;

import com.sep490.sep490.common.utils.Constants;
import jakarta.persistence.Column;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class TeamResponse {
    private Integer id;
    private String teamName;
    private String topicName;
    private String note;
    private Boolean isLeader;
}
