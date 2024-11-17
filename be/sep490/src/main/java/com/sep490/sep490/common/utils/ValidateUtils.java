package com.sep490.sep490.common.utils;

import com.sep490.sep490.common.exception.ApiInputException;

import java.text.ParseException;
import java.util.Date;
import java.util.List;

public class ValidateUtils {
    public static void checkNullOrEmpty(Object value, String fieldName) {
        if (value == null) {
            throw new ApiInputException(fieldName + " là bắt buộc!");
        }

        if (value instanceof String strValue) {
            if (strValue.trim().isEmpty()) {
                throw new ApiInputException(fieldName + " không được để trống!");
            }
        }

        if (value instanceof List<?> listValue) {
            if (listValue.isEmpty()) {
                throw new ApiInputException(fieldName + " không được là danh sách trống!");
            }
        }
    }

    // nếu trường đấy có thể null thì để min = 0, max = giới hạn trong database
    public static String checkLength(String value, String fieldName, Integer min, Integer max) {
        if (value == null)
            return null;
        value = value.trim();
        if (value.length() < min || value.length() > max)
            throw new ApiInputException("Độ dài của " + fieldName.toLowerCase() + " phải nằm trong khoảng từ " + min + " đến " + max + " ký tự!");

        return value;
    }

    public static void checkIntegerInRange(Integer value, String fieldName, Integer min, Integer max) {
        if (value == null)
            return;
        if (min != null && max != null && (value < min || value > max))
            throw new ApiInputException(fieldName + " phải nằm trong khoảng từ " + min + " đến " + max + "!");

        if (min != null && value < min)
            throw new ApiInputException(fieldName + " phải >= " + min + "!");

        if (max != null && value > max)
            throw new ApiInputException(fieldName + " phải <= " + max + "!");
    }

    public static void checkValidRangeOfDate(Date start, Date end, String fieldNameOfStartDate, String fieldNameOfEndDate) {
        if (start == null || end == null)
            return;
        if (start.after(end))
            throw new ApiInputException(fieldNameOfStartDate + " phải trước " + fieldNameOfEndDate + "!");
    }

    public static void checkBeforeCurrentDate(Date date, String fieldName) {
        if (date == null) {
            return;
        }
        Date currentDate = new Date();
        if (date.before(currentDate)) {
            throw new ApiInputException(fieldName + " không được trước ngày hiện tại.");
        }
    }

    public static <T> T checkExistedInList(List<T> list, T value, String fieldName, T defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        boolean isExisted = false;
        for (T item : list) {
            if (item.equals(value)) {
                isExisted = true;
                break;
            }
        }
        if (!isExisted) {
            throw new ApiInputException(fieldName + " phải là một mục trong " + list.toString());
        }
        return value;
    }
}
