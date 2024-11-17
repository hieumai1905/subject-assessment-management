package com.sep490.sep490.dto.assignment.request;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.*;

import java.util.Objects;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentRequest {
    private  Integer id;
    private  String title;
    private  Integer expectedLoc;
    private  Integer evalWeight;
    private  Integer displayOrder;
    private String evaluationType;
    private  String note;
    private Boolean active;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(title, "Tiêu đề");
        title = ValidateUtils.checkLength(title, "Tiêu đề", 1, 255);

        note = ValidateUtils.checkLength(note, "Ghi chú", 0, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
//        ValidateUtils.checkNullOrEmpty(expectedLoc, "Expected Loc");
//        ValidateUtils.checkIntegerInRange(expectedLoc, "Assignment expected loc", 1, Integer.MAX_VALUE);

        ValidateUtils.checkNullOrEmpty(evalWeight, "Tỷ trọng");
        ValidateUtils.checkNullOrEmpty(evaluationType, "Loại đánh giá");
        if(!Objects.equals(evaluationType, Constants.TypeAssignments.NORMAL)
                && !Objects.equals(evaluationType, Constants.TypeAssignments.FINAL)
                && !Objects.equals(evaluationType, Constants.TypeAssignments.GRAND_FINAL)){
            throw new ApiInputException("Loại đánh giá cần phải là một trong ba giá trị: Thông thường, Cuối kỳ, Hội đồng");
        }
        ValidateUtils.checkIntegerInRange(evalWeight, "Tỷ trọng", 1, 100);
        ValidateUtils.checkIntegerInRange(displayOrder, "Thứ tự xuất hiện", 1, Integer.MAX_VALUE);
    }
}
