package com.sep490.sep490.dto.user.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class UpdateUserByAdminRequest {
    private Boolean active;
    private Integer roleId;
    private String note;

    public void validateInput(){
        ValidateUtils.checkIntegerInRange(roleId, "Role Id", 1, 4);
    }
}
