package com.sep490.sep490.common.utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.sep490.sep490.common.exception.ConflictException;
import org.modelmapper.ModelMapper;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class ConvertUtils {
    private static Gson gson = new GsonBuilder().registerTypeAdapter(Date.class, new GsonUTCDateAdapter()).create();

    public static <T> T convert(Object source, Class<T> dstClass) {
        if (source == null)
            return null;
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration().setAmbiguityIgnored(true);
        return modelMapper.map(source, dstClass);
    }

    public static <T> T jsonToObject(String jsonValue, Class<T> dstClass) {
        if (jsonValue == null || jsonValue.trim().isEmpty())
            return null;
        try {
            return gson.fromJson(jsonValue, dstClass);
        } catch (Exception e) {
            return null;
        }
    }

    public static <T> List<T> convertList(List<?> sourceList, Class<T> dstClass) {
        if (sourceList == null) {
            return null;
        }

        List<T> outList = new ArrayList<>();
        for (Object object : sourceList) {
            outList.add(convert(object, dstClass));
        }

        return outList;
    }

    public static <T> List<T> convertList(String jsonString, Class<T> dstClass) {
        List<T> sourceList = new Gson().fromJson(jsonString, new TypeToken<T>() {
        }.getType());

        List<T> outList = new ArrayList<>();
        for (Object object : sourceList) {
            outList.add(convert(object, dstClass));
        }

        return outList;
    }

    public static <T> T[] stringToArray(String str, String separator, Class<T> clazz) {
        if (str == null || separator == null) {
            return (T[]) new Object[0];
        }

        String[] parts = str.split(separator);
        List<T> result = new ArrayList<>();

        for (String part : parts) {
            if ("null".equalsIgnoreCase(part.trim())) {
                result.add(null);
            } else {
                try {
                    if (clazz.equals(Integer.class)) {
                        result.add(clazz.cast(Integer.parseInt(part.trim())));
                    } else if (clazz.equals(Float.class)) {
                        result.add(clazz.cast(Float.parseFloat(part.trim())));
                    } else if (clazz.equals(String.class)) {
                        result.add(clazz.cast(part.trim()));
                    } else {
                        throw new ConflictException("Unsupported class type");
                    }
                } catch (NumberFormatException e) {
                    result.add(null);
                }
            }
        }

        return result.toArray((T[]) java.lang.reflect.Array.newInstance(clazz, result.size()));
    }

    public static <T> T[] jsonToObjectList(String str, String separator, Class<T> baseDTOClass) {
        if (str == null || str.isBlank())
            return null;

        String[] jsonValues = str.split(separator);
        T[] objects = (T[]) java.lang.reflect.Array.newInstance(baseDTOClass, jsonValues.length);

        for (int i = 0; i < jsonValues.length; i++) {
            objects[i] = jsonToObject(jsonValues[i], baseDTOClass);
        }

        return objects;
    }

}
