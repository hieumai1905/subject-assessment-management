package com.sep490.sep490.dto.evaluationCriteria.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.MilestoneCriteriaDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMilestoneCriteriaRequest {
    private Integer parentCriteriaId;
    private List<MilestoneCriteriaRequest> milestoneCriterias;
}
