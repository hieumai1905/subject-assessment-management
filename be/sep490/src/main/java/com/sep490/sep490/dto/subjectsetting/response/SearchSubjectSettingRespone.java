package com.sep490.sep490.dto.subjectsetting.response;

import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.dto.SettingDTO;
import com.sep490.sep490.dto.SubjectSettingDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
@EqualsAndHashCode(callSuper = true)
@Data
public class SearchSubjectSettingRespone extends SearchRequestDTO {
    private List<SubjectSettingDTO> settingDTOS;
    private Long totalElements;
    private String sortBy;
}
