package com.sep490.sep490.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@AllArgsConstructor
@NoArgsConstructor
@Data
public class DashboardAdminDTO {
    private int totalUser;
    private int totalClass;
    List<StudentClass> studentClasses;
    List<UserRole> userRoles;

}

