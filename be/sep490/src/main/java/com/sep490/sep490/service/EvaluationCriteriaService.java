package com.sep490.sep490.service;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.dto.EvaluationCriteriaDTO;
import com.sep490.sep490.dto.SettingDTO;
import com.sep490.sep490.dto.evaluationCriteria.request.EvaluationCriteriaRequest;
import com.sep490.sep490.dto.evaluationCriteria.request.SearchEvaluationCriteriaRequest;
import com.sep490.sep490.dto.setting.request.SearchSettingRequest;
import com.sep490.sep490.dto.setting.response.SearchEvaluationCriteriaResponse;
import com.sep490.sep490.dto.setting.response.SearchSettingResponse;
import com.sep490.sep490.entity.Assignment;
import com.sep490.sep490.entity.EvaluationCriteria;
import com.sep490.sep490.entity.Setting;
import com.sep490.sep490.mapper.AssignmentMapper;
import com.sep490.sep490.mapper.EvaluationCriteriaMapper;
import com.sep490.sep490.repository.AssignmentRepository;
import com.sep490.sep490.repository.EvaluationCriteriaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Log4j2
public class EvaluationCriteriaService implements BaseService<EvaluationCriteria, Integer> {

    private final EvaluationCriteriaRepository evaluationCriteriaRepository;
    private final AssignmentRepository assignmentsRepository;

    @Transactional
    public Object updateEvaluationCriteria(Object objectRequest) {
        log.info("Create or Update evaluation criteria");
        var request = (EvaluationCriteriaRequest) objectRequest;
        request.validateInput();

        var findAssignment = assignmentsRepository.findById(request.getAssignmentId()).orElseThrow(
                () -> new RecordNotFoundException("Assignment")
        );

        List<EvaluationCriteria> evaluationCriteriaList = new ArrayList<>();
        // Kiểm tra và chuyển đổi evaluation criteria từ request
        checkAndConvertEvaluationCriteria(request.getListEvaluationCriteria(), evaluationCriteriaList);

        var existEvaluationCriteria = evaluationCriteriaRepository.findByAssignmentId(request.getAssignmentId());
        if (existEvaluationCriteria != null) {
            // Xóa các evaluation criteria cũ
            evaluationCriteriaRepository.deleteByAssignmentId(request.getAssignmentId());
        }

        // Gán assignment cho từng evaluation criteria
        evaluationCriteriaList.forEach(criteria -> {
            criteria.setId(null);
            criteria.setAssignment(findAssignment);
        });

        // Lưu danh sách evaluation criteria vào cơ sở dữ liệu
        evaluationCriteriaRepository.saveAll(evaluationCriteriaList);
        return ConvertUtils.convertList(evaluationCriteriaList, EvaluationCriteriaDTO.class);
    }


    @Override
    public Object create(Object objectRequest) {
        return null;
    }

    private void checkAndConvertEvaluationCriteria
            (List<EvaluationCriteriaDTO> criteriaDTOs, List<EvaluationCriteria> evaluationCriteriaList) {
        Set<String> criteriaNames = new HashSet<>();
        int totalCriteriaWeight = 0;

        for (EvaluationCriteriaDTO criteriaDTO : criteriaDTOs) {
            String criteriaName = criteriaDTO.getCriteriaName().toLowerCase();
            if (criteriaNames.contains(criteriaName)) {
                throw new ApiInputException("Duplicate evaluation criteria name: " + criteriaName);
            }
            criteriaNames.add(criteriaName);

            // Chuyển đổi DTO thành entity và thêm vào danh sách evaluation criteria
            EvaluationCriteria criteria = ConvertUtils.convert(criteriaDTO, EvaluationCriteria.class);
            evaluationCriteriaList.add(criteria);

            totalCriteriaWeight += criteria.getEvalWeight();
        }

        if (totalCriteriaWeight != 100) {
            throw new ApiInputException("Total evaluation criteria weight must be 100%");
        }
    }

/*    @Transactional
    public Object updateEvaluationCriteria(Object objectRequest) {
        log.info("Update evaluation criteria");
        var request = (EvaluationCriteriaRequest) objectRequest;
        request.validateInput();

        var findAssignment = assignmentsRepository.findById(request.getAssignmentId()).orElseThrow(
                () -> new RecordNotFoundException("Assignment")
        );

        var existEvaluationCriteria = evaluationCriteriaRepository.findByAssignmentId(request.getAssignmentId());
        if (existEvaluationCriteria != null){
            // Xóa các evaluation criteria cũ
            evaluationCriteriaRepository.deleteByAssignmentId(request.getAssignmentId());
        }

        List<EvaluationCriteria> evaluationCriteriaList = new ArrayList<>();

        // Kiểm tra và chuyển đổi evaluation criteria từ request
        checkAndConvertEvaluationCriteria(request.getListEvaluationCriteria(), evaluationCriteriaList);

        // Gán assignment cho từng evaluation criteria
        evaluationCriteriaList.forEach(criteria -> criteria.setAssignment(findAssignment));

        // Lưu danh sách evaluation criteria vào cơ sở dữ liệu
        evaluationCriteriaRepository.saveAll(evaluationCriteriaList);
        return ConvertUtils.convertList(evaluationCriteriaList, EvaluationCriteriaDTO.class);
    }*/

    @Override
    public Object update(Integer integer, Object request) {
        return null;
    }


    @Override
    public Object get(Integer id) {
        var foundEvaluationCriteria = evaluationCriteriaRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Evaluation Criteria"));
        return ConvertUtils.convert(foundEvaluationCriteria, EvaluationCriteriaDTO.class);
    }

    @Override
    public void delete(Integer integer) {

    }

    @Override
    public Object search(Object objectRequest) {
        log.info("search setting: ");
        var request = (SearchEvaluationCriteriaRequest) objectRequest;
        request.validateInput();

        Pageable pageable;
        if (request.getOrderBy().equals("DESC"))
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).descending());
        else
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).ascending());

        Page<EvaluationCriteria> settings = evaluationCriteriaRepository.search(
                request.getCriteriaName(),
                request.getAssignmentId(),
                request.getMinEvalWeight(),
                request.getMaxEvalWeight(),
                request.getActive(),
                pageable
        );

        SearchEvaluationCriteriaResponse response = new SearchEvaluationCriteriaResponse();
        response.setEvaluationCriteriaDTOS(ConvertUtils.convertList(settings.getContent(), EvaluationCriteriaDTO.class));
        response.setTotalElements(settings.getTotalElements());
        response.setPageIndex(request.getPageIndex());
        response.setPageSize(request.getPageSize());
        response.setOrderBy(request.getOrderBy());
        response.setSortBy(request.getSortBy());

        return response;
    }
}
