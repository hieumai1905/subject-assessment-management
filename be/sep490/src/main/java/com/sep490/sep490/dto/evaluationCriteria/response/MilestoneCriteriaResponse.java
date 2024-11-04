package com.sep490.sep490.dto.evaluationCriteria.response;

import com.sep490.sep490.dto.MilestoneCriteriaDTO;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Data
@RequiredArgsConstructor
public class MilestoneCriteriaResponse {
    private MilestoneCriteriaDTO parentCriteria;
    private List<MilestoneCriteriaDTO> childrenCriteria;
}
