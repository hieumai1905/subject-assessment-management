package com.sep490.sep490.dto.dashboard;

import lombok.Data;

import java.util.List;

@Data
public class DashboardManagerDTO {
    private int totalStudent;
    private int totalTeacher;
    private int totalUserActive;
    private List<UserDashboard> listActive;
    private int totalUserInactive;
    private List<UserDashboard> listInactive;
}
