package com.sep490.sep490.common.exception;

import com.sep490.sep490.dto.HttpResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;


@ControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CustomExceptionHandler extends ResponseEntityExceptionHandler {
    @ExceptionHandler(Exception.class)
    public final ResponseEntity<Object> handleAllExceptions(Exception ex, WebRequest request) {
        ex.printStackTrace();
        logger.error(ex.getMessage());
//        return buildResponseEntity(HttpResponse.error(ex.getLocalizedMessage(), HttpStatus.BAD_REQUEST.value()), HttpStatus.OK);
        return buildResponseEntity(HttpResponse.internalServerError(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(RecordNotFoundException.class)
    public final ResponseEntity<Object> handleUserNotFoundException(RecordNotFoundException ex, WebRequest request) {
        ex.printStackTrace();
        logger.error(ex.getMessage());
        String message = ex.getLocalizedMessage();
        return buildResponseEntity(HttpResponse.error(message, HttpStatus.BAD_REQUEST.value()), HttpStatus.OK);
    }


    @ExceptionHandler(ConflictException.class)
    public final ResponseEntity<Object> handleConflictException(ConflictException ex, WebRequest request) {
        ex.printStackTrace();
        logger.error(ex.getMessage());
        String message = ex.getLocalizedMessage();
        return buildResponseEntity(HttpResponse.error(message, HttpStatus.CONFLICT.value()), HttpStatus.OK);
    }

    @ExceptionHandler(ApiInputException.class)
    public final ResponseEntity<Object> handleApiInputException(ApiInputException ex, WebRequest request) {
        ex.printStackTrace();
        logger.error(ex.getMessage());
        String message = ex.getLocalizedMessage();
        return buildResponseEntity(HttpResponse.error(message, HttpStatus.CONFLICT.value()), HttpStatus.OK);
    }

    @ExceptionHandler(NameAlreadyExistsException.class)
    public final ResponseEntity<Object> handleNameAlreadyExistsException(NameAlreadyExistsException ex, WebRequest request) {
        ex.printStackTrace();
        logger.error(ex.getMessage());
        String message = ex.getLocalizedMessage();
        return buildResponseEntity(HttpResponse.error(message, HttpStatus.CONFLICT.value()), HttpStatus.OK);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public final ResponseEntity<Object> handleUnauthorizedException(UnauthorizedException ex, WebRequest request) {
        ex.printStackTrace();
        logger.error(ex.getMessage());
        String message = ex.getLocalizedMessage();
        return buildResponseEntity(HttpResponse.error(message, HttpStatus.CONFLICT.value()), HttpStatus.OK);
    }


    private ResponseEntity<Object> buildResponseEntity(HttpResponse<Object> baseResponse, HttpStatus status) {
        return new ResponseEntity<>(baseResponse, status);
    }
}
