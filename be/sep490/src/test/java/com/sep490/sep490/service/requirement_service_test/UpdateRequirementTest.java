package com.sep490.sep490.service.requirement_service_test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.dto.requirement.request.UpdateRequirementRequest;
import com.sep490.sep490.entity.Requirement;
import com.sep490.sep490.entity.Setting;
import com.sep490.sep490.entity.Team;
import com.sep490.sep490.entity.User;
import com.sep490.sep490.repository.RequirementRepository;
import com.sep490.sep490.repository.SettingRepository;
import com.sep490.sep490.repository.UpdateTrackingRepository;
import com.sep490.sep490.repository.WorkEvaluationRepository;
import com.sep490.sep490.service.CommonService;
import com.sep490.sep490.service.RequirementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class UpdateRequirementTest {

    @Mock
    private RequirementRepository requirementRepository;

    @Mock
    private CommonService commonService;

    @Mock
    private SettingRepository settingRepository;

    @Mock
    private WorkEvaluationRepository workEvaluationRepository;

    @Mock
    private UpdateTrackingRepository updateTrackingRepository;

    @InjectMocks
    private RequirementService requirementService;

    private User mockUser;
    private UpdateRequirementRequest mockRequest;
    private Setting mockComplexity;
    private Requirement mockRequirement;

    @BeforeEach
    public void setUp() {
        mockUser = new User();
        mockUser.setRole(new Setting());
        mockUser.getRole().setId(Constants.Role.STUDENT);
        mockUser.setId(1);

        mockRequest = new UpdateRequirementRequest();
        mockRequest.setRequirementIds(Arrays.asList(1, 2));
        mockRequest.setReqTitle("New Title");
        mockRequest.setComplexityId(1);

        mockComplexity = new Setting();

        mockRequirement = new Requirement();
        mockRequirement.setId(1);
        mockRequirement.setStudent(mockUser);
    }

    @Test
    public void testUpdate_Success() {
        when(commonService.getCurrentUser()).thenReturn(mockUser);
        when(settingRepository.findSettingBySettingTypeAndSettingId("complexity", 1)).thenReturn(mockComplexity);
        when(requirementRepository.findById(1)).thenReturn(Optional.of(mockRequirement));
        when(requirementRepository.findById(2)).thenReturn(Optional.of(mockRequirement));

        Object result = requirementService.update(mockRequest);

        assertNotNull(result);
        verify(requirementRepository, times(1)).saveAll(anyList());
    }

    @Test
    public void testUpdate_RequirementNotFound() {
        when(commonService.getCurrentUser()).thenReturn(mockUser);
        when(settingRepository.findSettingBySettingTypeAndSettingId("complexity", 1)).thenReturn(mockComplexity);
        when(requirementRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(RecordNotFoundException.class, () -> requirementService.update(mockRequest));
    }

    @Test
    public void testUpdate_StudentConflict() {
        Requirement conflictingRequirement = new Requirement();
        conflictingRequirement.setId(1);
        conflictingRequirement.setStudent(new User());
        conflictingRequirement.getStudent().setId(3);
        conflictingRequirement.setTeam(new Team());

        when(commonService.getCurrentUser()).thenReturn(mockUser);
        when(settingRepository.findSettingBySettingTypeAndSettingId("complexity", 1)).thenReturn(mockComplexity);
        when(requirementRepository.findById(1)).thenReturn(Optional.of(conflictingRequirement));

        assertThrows(ConflictException.class, () -> requirementService.update(mockRequest));
    }

    @Test
    public void testUpdate_TitleAlreadyExists() {
        when(commonService.getCurrentUser()).thenReturn(mockUser);

        Requirement existingRequirement = new Requirement();
        existingRequirement.setId(1);
        existingRequirement.setReqTitle("Existing Title");
        existingRequirement.setTeam(new Team());
        existingRequirement.getTeam().setId(1);
        existingRequirement.getTeam().setTeamName("Team A");

        Requirement conflictingRequirement = new Requirement();
        conflictingRequirement.setId(2);
        conflictingRequirement.setTeam(existingRequirement.getTeam());

        lenient().when(requirementRepository.findById(1)).thenReturn(Optional.of(existingRequirement));
        lenient().when(requirementRepository.findById(2)).thenReturn(Optional.of(conflictingRequirement));
        lenient().when(settingRepository.findSettingBySettingTypeAndSettingId("complexity", 1)).thenReturn(mockComplexity);

        doReturn(existingRequirement).when(requirementRepository)
                .checkExistedByTitle(anyInt(), eq(1), eq("Existing Title"));

        mockRequest.setRequirementIds(Arrays.asList(1, 2));
        mockRequest.setReqTitle("Existing Title");

        assertThrows(NameAlreadyExistsException.class, () -> requirementService.update(mockRequest));
    }

}
