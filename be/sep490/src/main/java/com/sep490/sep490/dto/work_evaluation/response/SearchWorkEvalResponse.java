package com.sep490.sep490.dto.work_evaluation.response;

import com.sep490.sep490.dto.BaseDTO;
import com.sep490.sep490.dto.SettingDTO;
import lombok.Data;

import java.util.List;

@Data
public class SearchWorkEvalResponse {
    private List<SettingDTO> complexities;
    private List<SettingDTO> qualities;
    private List<WorkEvaluationResponse> workEvaluationResponses;
}
