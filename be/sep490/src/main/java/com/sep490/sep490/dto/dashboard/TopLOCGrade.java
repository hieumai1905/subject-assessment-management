package com.sep490.sep490.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopLOCGrade {
    private Float totalLOC;
    private Long numberOfReqs;
    private String email;
    private String iter;
    private String classCode;
}
