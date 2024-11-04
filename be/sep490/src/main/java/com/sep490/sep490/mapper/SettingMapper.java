package com.sep490.sep490.mapper;

import com.sep490.sep490.dto.SettingDTO;
import com.sep490.sep490.dto.UserDTO;
import com.sep490.sep490.entity.Setting;
import com.sep490.sep490.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Data
@AllArgsConstructor
@Component
public class SettingMapper {
    private static final ModelMapper modelMapper = new ModelMapper();

    public Setting convertUpdateSettingDtoToSetting(SettingDTO request, Setting oldSetting) {
        Setting response = modelMapper.map(request, Setting.class);
        response.setId(oldSetting.getId());
        return response;
    }
}
