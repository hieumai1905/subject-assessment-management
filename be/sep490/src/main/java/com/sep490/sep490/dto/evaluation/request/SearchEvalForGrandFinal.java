package com.sep490.sep490.dto.evaluation.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;

@Data
public class SearchEvalForGrandFinal {
    private Integer semesterId;
    private Integer roundId;
    private Integer teamId;
    private Integer sessionId;

}
