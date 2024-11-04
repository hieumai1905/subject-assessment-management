package com.sep490.sep490.dto.classes.response;

import com.sep490.sep490.dto.BaseDTO;
import lombok.Data;

import java.util.List;

@Data
public class SearchClassResponseForGrandFinal {
    private List<BaseDTO> classList;
    private Boolean canEvaluate;
}
