package com.sep490.sep490.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.io.Serializable;
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class HttpResponse<T> implements Serializable {
    private T data;
    private Integer statusCode;
    private String message;

    public HttpResponse(T data, Integer statusCode, String message) {
        this.data = data;
        this.statusCode = statusCode;
        this.message = message;
    }

    public static <T> HttpResponse<T> ok() {
        return new HttpResponse<>(null, HttpStatus.OK.value(), "success");
    }

    public static <T> HttpResponse<T> ok(T data) {
        return new HttpResponse<>(data, HttpStatus.OK.value(), "success");
    }

    public static <T> HttpResponse<T> created() {
        return new HttpResponse<>(null, HttpStatus.CREATED.value(), "created");
    }

    public static <T> HttpResponse<T> created(T data) {
        return new HttpResponse<>(data, HttpStatus.CREATED.value(), "created");
    }

    public static <T> HttpResponse<T> internalServerError() {
        return new HttpResponse<>(null, HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error");
    }

    public static <T> HttpResponse<T> error() {
        return new HttpResponse<>(null, HttpStatus.BAD_REQUEST.value(), "error");
    }

    public static <T> HttpResponse<T> error(Integer statusCode, String message) {
        return new HttpResponse<>(null, statusCode, message);
    }

    public static <T> HttpResponse<T> error(T data, Integer statusCode) {
        return new HttpResponse<>(data, statusCode, "error");
    }

    public static <T> HttpResponse<T> error(T data, int statusCode, String message) {
        return new HttpResponse<>(data, statusCode, message);
    }

    public static <T> HttpResponse<T> badRequest(T data) {
        return new HttpResponse<>(data, 400, "error");
    }

    //    public static <T> BaseResponse<T> badRequest(String message) {
    //        return new BaseResponse<>(null, 400, message);
    //    }

    public static <T> HttpResponse<T> badRequest(String message) {
        return new HttpResponse<>(null, 400, message);
    }

    public static <T> HttpResponse<T> internalServerError(T data) {
        return new HttpResponse<>(data, 500, "error");
    }

    public static <T> HttpResponse<T> internalServerError(String message) {
        return new HttpResponse<>(null, 500, message);
    }

    public static <T> HttpResponse<T> internalServerError(T data, String message) {
        return new HttpResponse<>(data, 500, message);
    }
}
