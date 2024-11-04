package com.sep490.sep490.mapper;

import com.sep490.sep490.dto.SubjectDTO;
import com.sep490.sep490.dto.UserDTO;
import com.sep490.sep490.entity.Subject;
import com.sep490.sep490.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Data
@AllArgsConstructor
@Component
public class SubjectMapper {
    private static final ModelMapper modelMapper = new ModelMapper();

    public Subject convertUpdateSubjectsDtoToSubject(SubjectDTO request, Subject oldSubject) {
        Subject response = modelMapper.map(request, Subject.class);
        response.setSubjectCode(oldSubject.getSubjectCode());
        response.setSubjectName(oldSubject.getSubjectName());
        response.setDescription(oldSubject.getDescription());
        return response;
    }
}
