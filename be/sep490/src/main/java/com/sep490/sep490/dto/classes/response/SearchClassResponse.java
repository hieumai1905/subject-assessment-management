package com.sep490.sep490.dto.classes.response;

import com.sep490.sep490.dto.ClassesDTO;
import com.sep490.sep490.dto.SearchRequestDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
@EqualsAndHashCode(callSuper = true)
@Data
public class SearchClassResponse extends SearchRequestDTO {
    List<ClassesDTO> classesDTOS;
    private Long totalElements;
    private String sortBy;
}
