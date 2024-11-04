package com.sep490.sep490.common.utils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class Constants {
    public static class Role {
        public static final Integer ADMIN = 1;
        public static final Integer MANAGER = 2;
        public static final Integer TEACHER = 3;
        public static final Integer STUDENT = 4;
        public static final String ROLE_ADMIN = "ADMIN";
        public static final String ROLE_MANAGER = "MANAGER";
        public static final String ROLE_TEACHER = "TEACHER";
        public static final String ROLE_STUDENT = "STUDENT";
    }

    public static class ClassRole {
        public static final Integer LEADER = 5;
        public static final Integer MEMBER = 6;
    }

    public static class SettingType {
        public static final String EMAIL = "Email";
        public static final String SEMESTER = "Semester";
        public static final String ROLE = "Role";
        public static final String SUBJECT = "Subject";
        public static final String COMPLEXITY = "Complexity";
        public static final String QUALITY = "Quality";
        public static final String ROUND = "Round";
    }

    public static class Password {
        public static final String PASSWORD_RESET = "88888888";
    }

    public static class DefaultValuePage {
        public static final Integer PAGE_INDEX = 1;
        public static final Integer PAGE_SIZE = 5;
        public static final String SORT_BY = "id";
    }

    public static class Mail {
        public static final String FROM_ADDRESS = "trungab2305@gmail.com";
        public static final String SENDER_NAME = "SWP Evaluation System";
        public static final String PASSWORD_SUBJECT = "Send your password";
        public static final String CODE_SUBJECT = "Send your code";
        public static final String ACTIVE_ACCOUNT = "Send email to active account";
        public static final String DEAR = "Dear [[name]],<br>";
        public static final String MAIN_CONTENT_LOGIN = "Please click the link below to login to system:<br>";
        public static final String MAIN_CONTENT_CODE = "Your code here:<br>";
        public static final String MAIN_ACTIVE_ACCOUNT = "You must be active account at here:<br>";
        public static final String CODE = "<p style=\"font-weight: bold;\">[[code]]</p>";
        public static final String PASSWORD = "<p style=\"font-weight: bold;\">[[password]]</p>";
        public static final String THANK_YOU = "Thank you,<br>";
        public static final String COMPANY = "SWP Evaluation System";
    }

    public static class Link {
        public static final String LOGIN_AWS = "http://chunchun.io.vn/auth-login";
        public static final String LOGIN_LOCAL = "http://localhost:8080/auth-login";
    }

    public static class UserStatus {
//        public static final String ACTIVE = "active";
        public static final String INACTIVE = "inactive";
        public static final String UNDEFINED = "undefined";
        public static final String VERIFIED = "verified";
    }

    public static class WeightRange {
        public static final Integer MIN = 1;
        public static final Integer MAX = 100;
    }

    public static class LengthCheck {
        public static final Integer MIN = 1;
        public static final Integer MAX = 255;
    }

    public static class DefaultValueEntity {
        public static final int DESCRIPTION_LENGTH = 750;
        public static final int MIN_LENGTH = 0;
    }

    public static class WhitelistCors {
        public static final String ALLOWED_ORIGIN_1 = "http://chunchun.io.vn:3000";
        public static final String ALLOWED_ORIGIN_2 = "http://localhost:3000";
        public static final String ALLOWED_ORIGIN_3 = "http://chunchun.io.vn";
        public static final String ALLOWED_ORIGIN_4 = "http://3.0.147.220:3000";
        public static final String ALLOWED_ORIGIN_5 = "https://ses.io.vn";
        public static final String ALLOWED_ORIGIN_6 = "https://api.ses.io.vn";

    }

    public static class RequirementStatus {
        public static final List<String> REQUIREMENT_STATUSES = List.of("TO DO", "DOING", "SUBMITTED", "EVALUATED", "WAITING FOR APPROVAL");
    }

    public static class TypeAssignments {
        public static final String NORMAL = "Normal";
        public static final String FINAL = "Final";
        public static final String GRAND_FINAL = "Grand Final";
    }

    public static class CouncilTeamStatus {
        public static final String EVALUATED = "Evaluated";
        public static final String EVALUATING = "Evaluating";
        public static final String REJECT = "Reject";
    }

    public static class SubmitType {
        public static final String LINK = "Link";
        public static final String FILE = "File";
    }

    public static class SubmitStatus {
        public static final String SUBMITTED = "Submitted";
        public static final String EVALUATED = "Evaluated";
    }
    public static class ClassUser{
        public static final String EMAIL_VALID="EMAIL DOMAIN DOESN'T MATCH";
        public static final String STUDENT_CLASS_VALID="ALREADY LEARNED THIS SUBJECT";
        public static final String STUDENT_VALID="NOT A STUDENT ACCOUNT";
    }

    public static class EmailDomain{
        public static final String TEACHER="fe.edu.vn";
    }
}
