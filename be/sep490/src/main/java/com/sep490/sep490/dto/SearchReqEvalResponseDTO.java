package com.sep490.sep490.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class SearchReqEvalResponseDTO {
    private Integer classId;
    private String className;
    private Integer teamId;
    private String teamName;
    private Integer studentId;
    private String studentName;
    private Integer milestoneId;
    private String milestoneTitle;
    private Integer requirementId;
    private String title;
    private Integer parentReqId;
    private String titleParentReqId;
    private String statusReq;
    private Float grade;
    private Integer complexityId;
    private String complexity;
    private Integer qualityId;
    private String quality;


}
