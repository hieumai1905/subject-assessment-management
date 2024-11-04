package com.sep490.sep490.service;

import com.sep490.sep490.dto.SettingDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public interface BaseService<T, ID> {
    @Transactional
    Object create(Object request);

    @Transactional
    Object update(ID id, Object request);

    @Transactional
    Object get(ID id);

    @Transactional
    void delete(ID id);

    Object search(Object request);
}
