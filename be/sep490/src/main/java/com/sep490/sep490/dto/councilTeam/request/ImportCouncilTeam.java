package com.sep490.sep490.dto.councilTeam.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;

import java.util.List;

@Data
public class ImportCouncilTeam {
    private Integer id;
    private Integer councilId;
    private Integer sessionId;
    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(id, "Lớp học/Nhóm");
    }
}
