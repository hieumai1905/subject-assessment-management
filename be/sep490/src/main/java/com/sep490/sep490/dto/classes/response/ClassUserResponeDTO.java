package com.sep490.sep490.dto.classes.response;

import com.sep490.sep490.dto.ClassUserErrorDTO;
import com.sep490.sep490.dto.ClassUserSuccessDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClassUserResponeDTO {
    List<ClassUserSuccessDTO> classUserSuccess = new ArrayList<>();
    List<ClassUserErrorDTO> classUserError=new ArrayList<>();
    public void addSuccess(ClassUserSuccessDTO successDTO) {
        if (successDTO != null) {
            classUserSuccess.add(successDTO);
        }
    }

    public void addError(ClassUserErrorDTO errorDTO) {
        if (errorDTO != null) {
            classUserError.add(errorDTO);
        }
    }
}
