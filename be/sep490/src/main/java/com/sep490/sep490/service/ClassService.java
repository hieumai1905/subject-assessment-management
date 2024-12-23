package com.sep490.sep490.service;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.common.utils.GenerateString;
import com.sep490.sep490.config.security_config.security.PasswordEncoderImpl;
import com.sep490.sep490.dto.BaseDTO;
import com.sep490.sep490.dto.ClassUserErrorDTO;
import com.sep490.sep490.dto.ClassUserSuccessDTO;
import com.sep490.sep490.dto.ClassesDTO;
import com.sep490.sep490.dto.classes.request.*;
import com.sep490.sep490.dto.classes.response.ClassUserResponeDTO;
import com.sep490.sep490.dto.classes.response.SearchClassResponse;
import com.sep490.sep490.dto.classes.response.SearchClassResponseForGrandFinal;
import com.sep490.sep490.dto.classes.response.SearchClassUserResponse;
import com.sep490.sep490.dto.user.request.CreateUserRequest;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.mapper.ClassesMapper;
import com.sep490.sep490.repository.*;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@RequiredArgsConstructor
@Service
@Log4j2
public class ClassService implements BaseService<Classes, Integer> {
    private final ClassesRepository classesRepository;
    private final SettingRepository settingRepository;
    private final UserRepository userRepository;
    private final ClassesMapper classesMapper;
    private final PasswordEncoderImpl passwordEncoder;
    private final JavaMailSender mailSender;
    private final ClassesUserRepository classUserRepository;
    private final SubjectRepository subjectRepository;
    private final StudentEvaluationRepository studentEvaluationRepository;
    private final MilestoneService milestoneService;
    private final CommonService commonService;
    private final WorkEvaluationRepository workEvaluationRepository;
    private final UpdateTrackingRepository updateTrackingRepository;
    private final RequirementRepository requirementRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final SessionRepository sessionRepository;
    private final CouncilRepository councilRepository;
    private final CouncilTeamRepository councilTeamRepository;
    @Value("${myvalue.active-account.login-url}")
    private String sendToMail;
    @Override
    //trong ham create vs update
    public Object create(Object objectRequest) {
        log.info("create new class");
        var request = (ClassesDTO) objectRequest;
        request.validateInput();

        validateSemester(request.getSemesterId());
        validateTeacher(request.getSubjectId(), request.getTeacherId());
//        validateEvaluators(request.getListEvaluator(), request.getSubjectId(), request.getTeacherId());

        checkClassExistence(request.getClassCode(), request.getSemesterId(), request.getId());

        request.setId(null);
        var saveClass = ConvertUtils.convert(request, Classes.class);
        classesRepository.save(saveClass);

        milestoneService.cloneAssignmentToMilestone(saveClass);

        var response = ConvertUtils.convert(saveClass, ClassesDTO.class);
//        enrichResponse(response, request);

        return response;
    }

    @Override
    public Object update(Integer integer, Object objectRequest) {
        log.info("update class ");
        var checkClass = classesRepository.findById(integer).orElseThrow(
                () -> new RecordNotFoundException("Lớp học")
        );
        var request = (ClassesDTO) objectRequest;
        request.validateInput();

        validateSemester(request.getSemesterId());
        validateTeacher(request.getSubjectId(), request.getTeacherId());
//        validateEvaluators(request.getListEvaluator(), request.getSubjectId(), request.getTeacherId());

        checkClassExistence(request.getClassCode(), request.getSemesterId(), request.getId());

        var updateClass = classesMapper.convertUpdateClassDtoToClass(request, checkClass);
        classesRepository.save(updateClass);

        var response = ConvertUtils.convert(updateClass, ClassesDTO.class);
//        updateEvaluators(response, request);

        settingRepository.findById(response.getSemesterId()).ifPresent(setting -> {
            response.setSemesterName(setting.getName());
        });

        userRepository.findById(response.getTeacherId()).ifPresent(user -> {
            response.setTeacherName(user.getFullname());
        });

//        enrichEvaluators(response, request);

        subjectRepository.findById(response.getSubjectId()).ifPresent(subject -> {
            response.setSubjectName(subject.getSubjectName());
        });

        return response;
    }

    @Override
    public Object get(Integer integer) {
        var checkClass = classesRepository.findById(integer).orElseThrow(
                () -> new RecordNotFoundException("Lớp học")
        );
        var response = ConvertUtils.convert(checkClass, ClassesDTO.class);
        classesRepository.findById(response.getId()).ifPresent(classes1 -> {
            if (classes1.getSemester() != null) {
                response.setSemesterName(classes1.getSemester().getName());
            }
            if (classes1.getTeacher() != null) {
                response.setTeacherName(classes1.getTeacher().getFullname());
            }
            if (classes1.getSubject() != null) {
                response.setSubjectName(classes1.getSubject().getSubjectName());
            }
            getFinalEvaluator(classes1, response);
        });
        return response;
    }

    @Override
    public void delete(Integer integer) {
        var checkClass = classesRepository.findById(integer).orElseThrow(
                () -> new RecordNotFoundException("Lớp học")
        );
        classesRepository.delete(checkClass);
    }

    public ClassUserSuccessDTO addStudentToClass(ClassStudentRequest classStudentRequest)
            throws MessagingException, UnsupportedEncodingException {
        var request = classStudentRequest.getCreateUserRequest();
        var classId = classStudentRequest.getClassId();

        validateClassExistence(classId);
        validateEmailDomain(request.getEmail(),null);

        User user = userRepository.findFirstByEmail(request.getEmail());
        ClassUser classUser = new ClassUser();
        classUser.setClasses(classesRepository.findById(classId).get());
        classUser.setActive(true);
        classUser.setNote("");

        if (user != null) {
            validateExistingStudent(user, classUser.getClasses(),null);
            classUser.setUser(user);
        } else {
            user = createUser(request);
            classUser.setUser(user);
        }

        classUserRepository.save(classUser);
        return buildClassUserDTO(classUser);
    }

    @Transactional
    public ClassUserSuccessDTO deleteStudent(DeleteClassStudentDTO deleteClassStudentDTO) {
        deleteClassStudentDTO.validateInput();
        var request = classUserRepository.findByClassIdAndUserId(
                deleteClassStudentDTO.getClassId(),
                deleteClassStudentDTO.getStudentId());
        if (request != null) {
            //requirementRepository.removeAssigneeByClassUserId(request.getId());
            deleteStudentInReqAndEvaluations(deleteClassStudentDTO.getClassId(), deleteClassStudentDTO.getStudentId());
            classUserRepository.deleteByClassIdAndUserId(request.getClasses().getId(), request.getUser().getId());

            return ConvertUtils.convert(request, ClassUserSuccessDTO.class);
        } else {
            throw new ConflictException("Sinh viên không tồn tại trong lớp này");
        }
    }

    private void deleteStudentInReqAndEvaluations(Integer classId, Integer studentId){
        Classes classes = classesRepository.findById(classId).orElseThrow(() -> new RecordNotFoundException("Lớp học"));
        if(classes.getMilestones() != null && !classes.getMilestones().isEmpty()){
            List<TeamMember> teamMembers = classes.getMilestones().stream()
                    .flatMap(item -> item.getTeams().stream())
                    .flatMap(item -> item.getTeamMembers().stream())
                    .toList();
            if(!teamMembers.isEmpty()){
                for (TeamMember teamMember : teamMembers) {
                      if(teamMember.getMember().getId().equals(studentId)){
                          // TO DO: ko bt nên xóa hay ko??
                          studentEvaluationRepository.deleteByClassIdAndMemberId(
                                  teamMember.getTeam().getClasses().getId(),
                                  teamMember.getMember().getId()
                          );
                          updateTrackingRepository.deleteByTeamIdAndMemberId(teamMember.getTeam().getId(), teamMember.getMember().getId());
                          workEvaluationRepository.deleteByTeamIdAndMemberId(teamMember.getTeam().getId(), teamMember.getMember().getId());
                          requirementRepository.resetStudentInRequirements(teamMember.getTeam().getId(), teamMember.getMember().getId());
                          teamMemberRepository.deleteByTeamIdAndMemberId(teamMember.getTeam().getId(), teamMember.getMember().getId());
                      }
                }
            }
        }
    }

    @Transactional
    public ClassUserResponeDTO addListStudent(ClassListStudentRequest classListStudentRequest) throws MessagingException, UnsupportedEncodingException {
        ClassUserResponeDTO classUserResponeDTO=new ClassUserResponeDTO();
        classListStudentRequest.validateInput();
        Classes classes = validateClassExistence(classListStudentRequest.getClassId());
        if(classListStudentRequest.getIsDeleteOldStudent())
            deleteExistingStudentsInClass(classListStudentRequest.getClassId());

        List<ClassUserSuccessDTO> list = new ArrayList<>();
        for (CreateUserRequest request : classListStudentRequest.getList()) {
            ClassUser classUser = new ClassUser();
            classUser.setClasses(classes);
            classUser.setActive(true);
            classUser.setNote("");
            User user = userRepository.findByCode(request.getCode());
            if (user != null) {
                if (validateExistingStudent(user, classUser.getClasses(),classUserResponeDTO)){
                    classUser.setUser(user);
                    classUserRepository.save(classUser);
                    list.add(buildClassUserDTO(classUser));
                }
            } else {
                ClassUserErrorDTO temp= new ClassUserErrorDTO();
                temp.setCode(request.getCode());
                temp.setErrorDetails(Constants.ClassUser.STUDENT_VALID);
                classUserResponeDTO.addError(temp);
            }
        }
        classUserResponeDTO.setClassUserSuccess(list);
        return classUserResponeDTO;
    }

    private String sendEmailPass(String request, String password) throws MessagingException, UnsupportedEncodingException {
        User foundUser = userRepository.findByEmailAndActiveTrue(request);
        if (foundUser != null) {
            return sendEmailContent(foundUser, password);
        }
        throw new RecordNotFoundException("Sinh viên");
    }

    private String sendEmailContent(User user, String password) throws MessagingException, UnsupportedEncodingException {
        String toAddress = user.getEmail();
        String fromAddress = Constants.Mail.FROM_ADDRESS;
        String senderName = Constants.Mail.SENDER_NAME;
        String subject = Constants.Mail.PASSWORD_SUBJECT;
        StringBuilder content = new StringBuilder();
        content.append(Constants.Mail.DEAR);
        content.append(Constants.Mail.MAIN_CONTENT_LOGIN);
//        content.append(Constants.Link.LOGIN_LOCAL);
        content.append(sendToMail);
        content.append(Constants.Mail.PASSWORD);
        content.append(Constants.Mail.THANK_YOU);
        content.append(Constants.Mail.COMPANY);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom(fromAddress, senderName);
        helper.setTo(toAddress);
        helper.setSubject(subject);

        String contentResponse = content.toString();
        contentResponse = contentResponse.replace("[[name]]", user.getFullname()
        );
        contentResponse = contentResponse.replace("[[password]]", password);
        helper.setText(contentResponse, true);
        mailSender.send(message);
        return password;
    }

    @Override
    public Object search(Object object) {
        log.info("search Class: ");
        var request = (SearchClassRequest) object;
        SearchClassResponse response = new SearchClassResponse();
        User user = commonService.getCurrentUser();
        if(!user.getRole().getId().equals(Constants.Role.ADMIN) && (request.getSettingId() == null || request.getSubjectId() == null)){
            return response;
        }

        request.validateInput();
        Pageable pageable;
        if (request.getOrderBy().equals("DESC")) {
            pageable = PageRequest.of(request.getPageIndex() - 1
                    , request.getPageSize(), Sort.by(request.getSortBy()).descending());
        } else {
            pageable = PageRequest.of(request.getPageIndex() - 1
                    , request.getPageSize(), Sort.by(request.getSortBy()).ascending());
        }
        Page<Classes> classes = classesRepository.search(
                request.getSubjectId(),
                request.getTeacherId(),
                request.getSettingId(),
                request.getKeyWord(),
                request.getActive(),
                request.getIsCurrentClass(),
                user.getId(),
//                user.getRole().getId(),
                pageable);
        List<ClassesDTO> classesDTOS = new ArrayList<>();
        for (Classes c : classes.getContent()) {
            ClassesDTO classesDTO = ConvertUtils.convert(c, ClassesDTO.class);
            if(c.getTeacher() != null){
                classesDTO.setTeacherName(c.getTeacher().getFullname());
            }
            classesDTOS.add(classesDTO);
        }

        response.setClassesDTOS(classesDTOS);
        response.setTotalElements(classes.getTotalElements());
        response.setPageIndex(request.getPageIndex());
        response.setPageSize(request.getPageSize());
        response.setOrderBy(request.getOrderBy());
        response.setSortBy(request.getSortBy());
        return response;
    }

    private void getFinalEvaluator(Classes classes, ClassesDTO classesDTO) {
        if (classes.getClassesUsers() == null)
            return;
        List<CreateUserRequest> listEvaluator = new ArrayList<>();
        for (ClassUser classUser : classes.getClassesUsers()) {
            if (classUser.getUser().getRole().getId().equals(Constants.Role.TEACHER))
                listEvaluator.add(ConvertUtils.convert(classUser.getUser(), CreateUserRequest.class));
        }
    }

    public Object searchStudents(SearchClassStudentRequest request) {
        request.validateInput();
        Pageable pageable;
        if (request.getOrderBy().equals("DESC")) {
            pageable = PageRequest.of(request.getPageIndex() - 1
                    , request.getPageSize(), Sort.by(request.getSortBy()).descending());
        } else {
            pageable = PageRequest.of(request.getPageIndex() - 1
                    , request.getPageSize(), Sort.by(request.getSortBy()).ascending());
        }
        Page<ClassUser> classUsers = classUserRepository.search(
                request.getClassId(),
                request.getKeyWord(),
                pageable
        );
        SearchClassUserResponse response = new SearchClassUserResponse();

        List<ClassUserSuccessDTO> success= new ArrayList<>();
        for(ClassUser classUser : classUsers.getContent()){
            if(classUser!=null){
                ClassUserSuccessDTO classUserSuccessDTO = getClassUserSuccessDTO(classUser);
                success.add(classUserSuccessDTO);
            }
        }
        response.setClassUserSuccessDTOS(success);
        response.setTotalElements(classUsers.getTotalElements());
        response.setPageIndex(request.getPageIndex());
        response.setPageSize(request.getPageSize());
        response.setOrderBy(request.getOrderBy());
        response.setSortBy(request.getSortBy());
        return response;
    }

    private ClassUserSuccessDTO getClassUserSuccessDTO(ClassUser classUser) {
        ClassUserSuccessDTO classUserSuccessDTO = new ClassUserSuccessDTO();
        classUserSuccessDTO.setId(classUser.getId());
        classUserSuccessDTO.setCode(classUser.getUser().getCode());
        classUserSuccessDTO.setClassesId(classUser.getClasses().getId());
        classUserSuccessDTO.setClassCode(classUser.getClasses().getClassCode());
        classUserSuccessDTO.setUserId(classUser.getUser().getId());
        classUserSuccessDTO.setFullname(classUser.getUser().getFullname());
        classUserSuccessDTO.setEmail(classUser.getUser().getEmail());
        classUserSuccessDTO.setPhone(classUser.getUser().getMobile());
        classUserSuccessDTO.setNote(classUser.getNote());
        classUserSuccessDTO.setRole(classUser.getUser().getRole().getName());
        classUserSuccessDTO.setActive(classUser.getUser().getActive());
        return classUserSuccessDTO;
    }

    private Classes validateClassExistence(Integer classId) {
        return classesRepository.findById(classId).orElseThrow(
                () -> new ApiInputException("Lớp học không tồn tại!")
        );
    }

    private boolean validateEmailDomain(String email,ClassUserResponeDTO classUserResponeDTO) {
        List<String> emailDomains = settingRepository.findBySettingType(Constants.SettingType.EMAIL)
                .stream().map(Setting::getName).toList();
        String subEmailRequest = StringUtils.substringAfter(email, "@");
        if (!emailDomains.contains(subEmailRequest)) {
            if(classUserResponeDTO!=null){
                ClassUserErrorDTO temp= new ClassUserErrorDTO();
                temp.setEmail(email);
                temp.setErrorDetails(Constants.ClassUser.EMAIL_VALID);
                classUserResponeDTO.addError(temp);
                return false;
            }
            else {
                throw new ConflictException(Constants.ClassUser.EMAIL_VALID);
            }
        }
        return true;
    }

    private boolean validateExistingStudent(User user, Classes classEntity,ClassUserResponeDTO classUserResponeDTO) {
        var semesterId = classEntity.getSemester().getId();
        var subjectId = classEntity.getSubject().getId();

        if (!classesRepository.findByUserIdAndSemesterIdAndSubjectId(user.getId(), semesterId, subjectId).isEmpty()) {
           if(classUserResponeDTO!=null){
               ClassUserErrorDTO temp= new ClassUserErrorDTO();
               temp.setEmail(user.getCode());
               temp.setErrorDetails(Constants.ClassUser.STUDENT_CLASS_VALID);
               classUserResponeDTO.addError(temp);
               return false;
           }
        }
        if (!user.getRole().getId().equals(Constants.Role.STUDENT)) {
            if(classUserResponeDTO!=null){
                ClassUserErrorDTO temp= new ClassUserErrorDTO();
                temp.setEmail(user.getCode());
                temp.setErrorDetails(Constants.ClassUser.STUDENT_VALID);
                classUserResponeDTO.addError(temp);
                return false;
            }
        }
        return true;
    }

    private User createUser(CreateUserRequest request) throws MessagingException, UnsupportedEncodingException {
        var rawPassword = GenerateString.randomPassword();
        request.setId(null);

        User newUser = ConvertUtils.convert(request, User.class);
        var userRole = settingRepository.findById(Constants.Role.STUDENT).orElseThrow();
        newUser.setRole(userRole);
        newUser.setFullname(request.getFullname() != null ? request.getFullname() : "");
        newUser.setPassword(passwordEncoder.encode(rawPassword));
        newUser.setUsername(request.getEmail());
        newUser.setStatus(Constants.UserStatus.VERIFIED);
        userRepository.save(newUser);
        sendEmailPass(newUser.getEmail(), rawPassword);
        return newUser;
    }

    private ClassUserSuccessDTO buildClassUserDTO(ClassUser classUser) {
        var response = new ClassUserSuccessDTO();
        if(classUser.getUser() != null){
            response.setCode(classUser.getUser().getCode());
            response.setEmail(classUser.getUser().getEmail());
            response.setFullname(classUser.getUser().getFullname());
            response.setId(classUser.getUser().getId());
            response.setUserId(classUser.getUser().getId());
        }
        if(classUser.getClasses() != null){
            response.setClassCode(classUser.getClasses().getClassCode());
            response.setClassesId(classUser.getClasses().getId());
        }
//        classesRepository.findById(classUser.getClasses().getId()).ifPresent(classes -> {
//            response.setClassCode(classes.getClassCode());
//        });
//        userRepository.findById(classUser.getUser().getId()).ifPresent(user -> {
//            response.setFullname(user.getFullname());
//            response.setEmail(user.getEmail());
//            response.setPhone(user.getMobile());
//            response.setCode(user.getCode());
//        });
        return response;
    }
    private void deleteExistingStudentsInClass(Integer classId) {
        List<ClassUser> listExStudent = classUserRepository.findAllByClassId(classId);
        for (ClassUser classUser : listExStudent) {
            if (classUser.getUser().getRole().getId().equals(Constants.Role.STUDENT)) {
                classUserRepository.deleteByClassIdAndUserId(classId, classUser.getUser().getId());
            }
        }
    }
    private void validateSemester(Integer semesterId) {
        if (settingRepository.findSettingBySettingTypeAndSettingId("semester", semesterId) == null) {
            throw new ApiInputException("Học kỳ không tồn tại!");
        }
    }

    private void validateTeacher(Integer subjectId, Integer teacherId) {
        if (subjectRepository.checkSubjectTeacher(subjectId, "added", teacherId) == null) {
            throw new ApiInputException("Giáo viên không có trong môn học này!");
        }
    }

    private void validateEvaluators(List<CreateUserRequest> listEvaluator, Integer subjectId, Integer teacherId) {
        if (listEvaluator != null) {
            for (CreateUserRequest userRequest : listEvaluator) {
                if (userRequest.getId().equals(teacherId)) {
                    throw new ApiInputException("Giáo viên giảng dạy lớp này không thể được thêm vào danh sách giáo viên đánh giá.");
                }
                if (subjectRepository.checkSubjectTeacher(subjectId, "added", userRequest.getId()) == null) {
                    throw new ApiInputException("Danh sách giáo viên đánh giá bao gồm những giáo viên không giảng dạy môn học này!");
                }
            }
        }
    }

    private void checkClassExistence(String classCode, Integer semesterId, Integer classId) {
        var foundClass = classesRepository.findFirstByClassCodeAndSettingId(classCode, semesterId, classId);
        foundClass.ifPresent(classes -> {
            throw new NameAlreadyExistsException("Lớp học đã tồn tại.");
        });
    }

    public Object searchBySemesterId(SearchClassForGrandFinal request) {
        SearchClassResponseForGrandFinal response = new SearchClassResponseForGrandFinal();
        response.setClassList(new ArrayList<>());
        List<BaseDTO> classList = new ArrayList<>();
        if (request.getSemesterId() == null || request.getRoundId() == null) {
            return response;
        }

        User currentUser = commonService.getCurrentUser();
        Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId("semester", request.getSemesterId());
        if (semester == null) {
            throw new RecordNotFoundException("Không thể tìm thấy học kỳ được chỉ định.");
        }

        Setting round = (Setting) settingRepository.findSettingBySettingTypeAndSettingId("round", request.getRoundId());
        if (round == null) {
            throw new RecordNotFoundException("Không thể tìm thấy vòng được chỉ định.");
        }

        List<Council> councils = councilRepository.findBySemesterIdAndRoundId(round.getId(), semester.getId());
        List<Session> sessions = sessionRepository.findBySemesterIdAndRoundId(semester.getId(), round.getId());
        List<Integer> councilIds = councils.stream().map(Council::getId).toList();
        List<Integer> sessionIds = sessions.stream().map(Session::getId).toList();

        List<Classes> classes = councilTeamRepository.findSessionsAndCouncils(
                councilIds, sessionIds, request.getSessionId(),
                currentUser.getRole().getId().equals(Constants.Role.STUDENT),
                currentUser.getRole().getId().equals(Constants.Role.TEACHER),
                currentUser.getId()
        );

        if (classes != null) {
            for (Classes c : classes) {
                classList.add(new BaseDTO(c.getId(), c.getClassCode()));
            }
        }
        response.setClassList(classList);
        response.setCanEvaluate(currentUser.getRole().getId().equals(Constants.Role.TEACHER));
        return response;
    }

    public Object searchStudentsHasNoClass(SearchClassStudentRequest request) {
        request.validateInput();
        Classes classes = classesRepository.findById(request.getClassId()).orElseThrow(
                () -> new RecordNotFoundException("Lớp học không tồn tại")
        );
        Pageable pageable;
        if (request.getOrderBy().equals("DESC")) {
            pageable = PageRequest.of(request.getPageIndex() - 1
                    , request.getPageSize(), Sort.by(request.getSortBy()).descending());
        } else {
            pageable = PageRequest.of(request.getPageIndex() - 1
                    , request.getPageSize(), Sort.by(request.getSortBy()).ascending());
        }
        Page<User> classUsers = classUserRepository.searchStudentsHasNoClass(
                classes.getSubject().getId(),
                classes.getSemester().getId(),
                request.getYear(),
                pageable
        );
        SearchClassUserResponse response = new SearchClassUserResponse();

        List<ClassUserSuccessDTO> success= new ArrayList<>();
        for(User user : classUsers.getContent()){
            ClassUserSuccessDTO dto = new ClassUserSuccessDTO();
            dto.setId(dto.getId());
            dto.setEmail(user.getEmail());
            dto.setFullname(user.getFullname());
            dto.setCode(user.getCode());
            success.add(dto);
        }
        response.setClassUserSuccessDTOS(success);
        return response;
    }
}

