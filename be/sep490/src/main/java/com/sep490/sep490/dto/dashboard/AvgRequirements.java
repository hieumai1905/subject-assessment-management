package com.sep490.sep490.dto.dashboard;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
public class AvgRequirements {
    private String iteration;
    private Map<String, BigDecimal> complexityAverages;
}
