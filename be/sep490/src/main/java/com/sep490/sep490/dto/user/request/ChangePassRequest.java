package com.sep490.sep490.dto.user.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChangePassRequest {
    private String oldPass;
    private String newPass;
    private String confirmPass;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(oldPass, "Mật khẩu");
        ValidateUtils.checkNullOrEmpty(newPass, "Mật khẩu");
    }
}
