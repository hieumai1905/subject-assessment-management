package com.sep490.sep490.dto.user.response;

import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.dto.UserDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchUserResponse extends SearchRequestDTO {
    private List<UserDTO> users;
    private Long totalElements;
    private String sortBy;
}
