package com.sep490.sep490.service;


import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.dto.SettingDTO;
import com.sep490.sep490.dto.UserDTO;
import com.sep490.sep490.dto.setting.request.SearchSettingRequest;
import com.sep490.sep490.dto.setting.response.SearchSettingResponse;
import com.sep490.sep490.entity.Setting;
import com.sep490.sep490.mapper.SettingMapper;
import com.sep490.sep490.repository.SettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
@Log4j2
public class SettingService implements BaseService<Setting, Integer> {

    private final SettingRepository settingRepository;
    private final SettingMapper settingMapper;

    @Override
    public Object create(Object objectRequest) {
        log.info("Create setting: ");
        var request = (SettingDTO) objectRequest;
        request.validateInput();

        var foundSetting = settingRepository.findByNameAndSettingType(request.getName().toLowerCase(),
                request.getSettingType(), request.getSubjectId());
        if (foundSetting != null) {
            throw new NameAlreadyExistsException("Tên cài đặt");
        }
        request.setId(null);
        var saveSetting = ConvertUtils.convert(request, Setting.class);
        settingRepository.save(saveSetting);
        return ConvertUtils.convert(saveSetting, SettingDTO.class);
    }

    @Override
    public Object update(Integer id, Object objectRequest) {
        log.info("Update setting with id: " + id);
        var request = (SettingDTO) objectRequest;
        request.validateInput();

        var foundSetting = settingRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Cài đặt"));

        var findByNameAndSettingTypeWithOtherId = settingRepository
                .findByNameAndSettingTypeWithOtherId(id, request.getName().toLowerCase(),
                        request.getSettingType(), request.getSubjectId());
        if(findByNameAndSettingTypeWithOtherId != null)
            throw new NameAlreadyExistsException("Tên cài đặt");

        var updateSetting = settingMapper.convertUpdateSettingDtoToSetting(request, foundSetting);
        updateSetting.setId(id);

        settingRepository.save(updateSetting);

        return ConvertUtils.convert(updateSetting, SettingDTO.class);
    }

    @Override
    public Object get(Integer id) {
        var foundSetting = settingRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Cài đặt"));
        return ConvertUtils.convert(foundSetting, SettingDTO.class);
    }

    @Override
    public void delete(Integer id) {
        var foundSetting = settingRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Cài đặt"));
        settingRepository.delete(foundSetting);
    }

    @Override
    public Object search(Object objectRequest) {
        log.info("search setting: ");
        var request = (SearchSettingRequest) objectRequest;
        request.validateInput();

        Pageable pageable;
        if (request.getOrderBy().equals("DESC"))
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).descending());
        else
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).ascending());

        Page<Setting> settings = settingRepository.search(
                request.getName(),
                request.getType(),
                request.getActive(),
                request.getSubjectId(),
                request.getIsSubjectSetting(),
                pageable
        );

        SearchSettingResponse response = new SearchSettingResponse();
        response.setSettingDTOS(ConvertUtils.convertList(settings.getContent(), SettingDTO.class));
        response.setTotalElements(settings.getTotalElements());
        response.setPageIndex(request.getPageIndex());
        response.setPageSize(request.getPageSize());
        response.setOrderBy(request.getOrderBy());
        response.setSortBy(request.getSortBy());

        return response;
    }

    public List<SettingDTO> getSemester(String semester) {
        var foundSetting = settingRepository.findSettingBySettingType(semester);
        if(foundSetting == null){
            throw new RecordNotFoundException("Học kỳ");
        }
        return ConvertUtils.convertList(foundSetting, SettingDTO.class);
    }

}
