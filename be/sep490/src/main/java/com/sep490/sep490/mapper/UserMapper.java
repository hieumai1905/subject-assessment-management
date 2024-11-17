package com.sep490.sep490.mapper;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.dto.UserDTO;
import com.sep490.sep490.dto.user.request.CreateUserRequest;
import com.sep490.sep490.dto.user.request.LoginGoogleRequest;
import com.sep490.sep490.dto.user.request.UpdateUserByAdminRequest;
import com.sep490.sep490.dto.user.request.UserRegisterRequest;
import com.sep490.sep490.entity.Setting;
import com.sep490.sep490.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Data
@AllArgsConstructor
@Component
public class UserMapper {
    private static final ModelMapper modelMapper = new ModelMapper();

    public User convertUpdateUserDtoToUser(UserDTO request, User oldUser) {
        oldUser.setFullname(request.getFullname());
        oldUser.setGender(request.getGender());
        oldUser.setEmail(request.getEmail());
        oldUser.setMobile(request.getMobile());
        oldUser.setAvatar_url(request.getAvatar_url());
        oldUser.setUsername(oldUser.getUsername());
        oldUser.setId(oldUser.getId());
        oldUser.setNote(oldUser.getNote());
        return oldUser;
    }

    public User convertUpdateUserByAdminRequestToUser(UpdateUserByAdminRequest request,
                                                      User oldUser,
                                                      Setting role) {
        oldUser.setRole(role);
        oldUser.setNote(request.getNote());
        oldUser.setActive(request.getActive());
        return oldUser;
    }

    public User convertRegisterUserByGGToUser(LoginGoogleRequest request, Setting role) {
        User response = new User();
        response.setUsername(request.getEmail());
        response.setFullname(request.getName());
        response.setEmail(request.getEmail());
        response.setAvatar_url(request.getPicture());
        response.setStatus(Constants.UserStatus.UNDEFINED);
        response.setRole(role);
        return response;
    }
    public User convertUserRegisterRequestToUser(UserRegisterRequest request, Setting role) {
        User response = new User();
        response.setEmail(request.getEmail());
        response.setActive(true);
        response.setFullname(request.getFullname());
        response.setUsername(request.getEmail());
        response.setStatus(Constants.UserStatus.UNDEFINED);
        response.setRole(role);
        return response;
    }

    public User convertCrateUserRequestToUser(CreateUserRequest request, Setting role) {
        User response = new User();
        response.setEmail(request.getEmail());
        response.setActive(true);
        response.setFullname(request.getFullname());
        response.setUsername(request.getEmail());
        response.setStatus(Constants.UserStatus.VERIFIED);
        response.setRole(role);
        response.setGender(request.getGender());
        response.setNote(request.getNote());
        return response;
    }
}
