package com.sep490.sep490.mapper;

import com.sep490.sep490.dto.ClassesDTO;
import com.sep490.sep490.entity.Classes;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Data
@AllArgsConstructor
@Component
public class ClassesMapper {
    private static final ModelMapper modelMapper = new ModelMapper();
    public Classes convertUpdateClassDtoToClass(ClassesDTO request, Classes oldClasses){
        Classes response=modelMapper.map(request,Classes.class);
        response.setId(oldClasses.getId());
        return  response;
    }
}
