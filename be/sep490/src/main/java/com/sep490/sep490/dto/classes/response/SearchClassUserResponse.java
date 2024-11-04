package com.sep490.sep490.dto.classes.response;

import com.sep490.sep490.dto.ClassUserSuccessDTO;
import com.sep490.sep490.dto.SearchRequestDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
@EqualsAndHashCode(callSuper = true)
@Data
public class SearchClassUserResponse extends SearchRequestDTO {
    List<ClassUserSuccessDTO> classUserSuccessDTOS;
    private Long totalElements;
    private String sortBy;
}
