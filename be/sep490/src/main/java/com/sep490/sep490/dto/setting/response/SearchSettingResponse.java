package com.sep490.sep490.dto.setting.response;

import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.dto.SettingDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchSettingResponse extends SearchRequestDTO {
    private List<SettingDTO> settingDTOS;
    private Long totalElements;
    private String sortBy;
}
