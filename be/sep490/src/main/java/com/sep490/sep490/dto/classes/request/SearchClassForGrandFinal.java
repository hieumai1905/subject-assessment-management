package com.sep490.sep490.dto.classes.request;

import lombok.Data;

@Data
public class SearchClassForGrandFinal {
    private Integer semesterId;
    private Integer sessionId;
    private Integer roundId;
    private Integer classId;
    private Integer subjectId;
}
