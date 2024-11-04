package com.sep490.sep490.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserRole{
    private int roleId;
    private String roleName;
    private int totalUser;
}