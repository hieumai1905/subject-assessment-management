package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class UserDTO {
    private Integer id;
    private String username;
    private String fullname;
    private String gender;
    private String email;
    private String mobile;
    private String password;
    private String avatar_url;
    private String note;
    private String status;
    private Boolean active;
    private Integer roleId;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(username, "User name");
        username = ValidateUtils.checkLength(username, "User name", Constants.LengthCheck.MIN, Constants.LengthCheck.MAX);
        ValidateUtils.checkNullOrEmpty(fullname, "Full name");
        fullname = ValidateUtils.checkLength(fullname, "Full name", Constants.LengthCheck.MIN, Constants.LengthCheck.MAX);
        ValidateUtils.checkNullOrEmpty(mobile, "Phone number");
        mobile = ValidateUtils.checkLength(mobile, "Phone number", Constants.LengthCheck.MIN, Constants.LengthCheck.MAX);
    }


}
