package com.sep490.sep490.dto.team.response;

import lombok.Data;

import java.util.List;

@Data
public class ProgressOfTeam {
    private Integer id;
    private String teamName;
    private List<Float> completionProgress;
}
