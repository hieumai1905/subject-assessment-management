package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.entity.CouncilTeam;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionDTO {
    private Integer id;
    private Integer roundNum;
    private Integer semesterId;
    private Integer subjectId;
    private String semesterName;
    private Integer subjectSettingId;
    private String subjectSettingName;
    private String name;
    private Date sessionDate;
    private Boolean time;
    private String note;
    private Boolean canDelete;

    public void validateInput(boolean isUpdate){
        ValidateUtils.checkNullOrEmpty(semesterId, "Học kỳ");
        ValidateUtils.checkNullOrEmpty(subjectSettingId, "Lần đánh giá");
        ValidateUtils.checkNullOrEmpty(subjectId, "Môn học");
        if(!isUpdate){
            ValidateUtils.checkBeforeCurrentDate( sessionDate, "Ngày đánh giá");
        }
        note = ValidateUtils.checkLength(note, "Ghi chú", 0, 750);
    }
}
