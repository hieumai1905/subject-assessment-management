package com.sep490.sep490.dto.dashboard;

import lombok.Data;

@Data
public class OngoingPassFail {
    private Boolean isPassed;
    private Integer numberOfStudent;
    private Integer percentage;

    public OngoingPassFail(boolean isPassed, int numberOfStudent, int percentage) {
        this.isPassed = isPassed;
        this.numberOfStudent = numberOfStudent;
        this.percentage = percentage;
    }
}
