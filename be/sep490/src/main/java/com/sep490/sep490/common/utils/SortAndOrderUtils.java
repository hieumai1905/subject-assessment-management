package com.sep490.sep490.common.utils;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.lang.reflect.Field;

public class SortAndOrderUtils {
    public static <T> String validateSort(String sortBy, String defaultKey, Field[] fields) {
        if (sortBy != null)
            for (Field field : fields)
                if (field.getName().equalsIgnoreCase(sortBy))
                    return field.getName();

        return defaultKey;
    }

    public static <T> String validateSort(String sortBy, String defaultKey, Field[] fields, String[] otherFields) {
        if (sortBy != null) {
            if (fields != null)
                for (Field field : fields)
                    if (field.getName().equalsIgnoreCase(sortBy))
                        return field.getName();

            if (otherFields != null)
                for (String field : otherFields)
                    if (field.equalsIgnoreCase(sortBy))
                        return field;
        }
        return defaultKey;
    }

    public static String validateOrder(String orderBy) {
        if (orderBy != null && orderBy.equalsIgnoreCase("asc"))
            return "ASC";
        return "DESC";
    }

    public static Pageable createPageable(Integer pageIndex, Integer pageSize, String sortBy, Integer orderBy) {
        if (orderBy == 0)
            return PageRequest.of(pageIndex, pageSize,
                    Sort.by(sortBy).descending());
        else
            return PageRequest.of(pageIndex, pageSize,
                    Sort.by(sortBy).ascending());
    }
}
