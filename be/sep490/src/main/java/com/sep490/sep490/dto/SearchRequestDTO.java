package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.entity.Setting;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class SearchRequestDTO {
    private Integer pageIndex;
    private Integer pageSize;
    private String orderBy;

    public void validateInput(){
        if(pageIndex == null || pageIndex < 1)
            pageIndex = Constants.DefaultValuePage.PAGE_INDEX;

        if(pageSize == null || pageSize <= 0)
            pageSize = Constants.DefaultValuePage.PAGE_SIZE;

        orderBy = SortAndOrderUtils.validateOrder(orderBy);
    }
}
