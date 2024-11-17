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
    private String code;
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
        ValidateUtils.checkNullOrEmpty(email, "Email");
        email = ValidateUtils.checkLength(email, "Email", Constants.LengthCheck.MIN, Constants.LengthCheck.MAX);
        ValidateUtils.checkNullOrEmpty(fullname, "Tên");
        fullname = ValidateUtils.checkLength(fullname, "Tên", Constants.LengthCheck.MIN, Constants.LengthCheck.MAX);
        mobile = ValidateUtils.checkLength(mobile, "Số điện thoại", 0, Constants.LengthCheck.MAX);
        avatar_url = ValidateUtils.checkLength(avatar_url, "Tên tệp", 0, 50);
        note = ValidateUtils.checkLength(note, "Ghi chú", 0, 750);
    }


}
