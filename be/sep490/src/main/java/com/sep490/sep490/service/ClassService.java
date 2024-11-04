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
        validateEvaluators(request.getListEvaluator(), request.getSubjectId(), request.getTeacherId());

        checkClassExistence(request.getClassCode(), request.getSemesterId(), request.getId());

        request.setId(null);
        var saveClass = ConvertUtils.convert(request, Classes.class);
        classesRepository.save(saveClass);

        milestoneService.cloneAssignmentToMilestone(saveClass);

        var response = ConvertUtils.convert(saveClass, ClassesDTO.class);
        enrichResponse(response, request);

        return response;
    }

    @Override
    public Object update(Integer integer, Object objectRequest) {
        log.info("update class ");
        var checkClass = classesRepository.findById(integer).orElseThrow(
                () -> new RecordNotFoundException("Class")
        );
        var request = (ClassesDTO) objectRequest;
        request.validateInput();

        validateSemester(request.getSemesterId());
        validateTeacher(request.getSubjectId(), request.getTeacherId());
        validateEvaluators(request.getListEvaluator(), request.getSubjectId(), request.getTeacherId());

        checkClassExistence(request.getClassCode(), request.getSemesterId(), request.getId());

        var updateClass = classesMapper.convertUpdateClassDtoToClass(request, checkClass);
        classesRepository.save(updateClass);

        var response = ConvertUtils.convert(updateClass, ClassesDTO.class);
        updateEvaluators(response, request);

        settingRepository.findById(response.getSemesterId()).ifPresent(setting -> {
            response.setSemesterName(setting.getName());
        });

        userRepository.findById(response.getTeacherId()).ifPresent(user -> {
            response.setTeacherName(user.getFullname());
        });

        enrichEvaluators(response, request);

        subjectRepository.findById(response.getSubjectId()).ifPresent(subject -> {
            response.setSubjectName(subject.getSubjectName());
        });

        return response;
    }

    @Override
    public Object get(Integer integer) {
        var checkClass = classesRepository.findById(integer).orElseThrow(
                () -> new RecordNotFoundException("Class")
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
                () -> new RecordNotFoundException("Class")
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
            throw new ConflictException("Student not learn in this class");
        }
    }

    private void deleteStudentInReqAndEvaluations(Integer classId, Integer studentId){
        Classes classes = classesRepository.findById(classId).orElseThrow(() -> new RecordNotFoundException("Class"));
        if(classes.getMilestones() != null && !classes.getMilestones().isEmpty()){
            List<TeamMember> teamMembers = classes.getMilestones().stream()
                    .flatMap(item -> item.getTeams().stream())
                    .flatMap(item -> item.getTeamMembers().stream())
                    .toList();
            if(!teamMembers.isEmpty()){
                for (TeamMember teamMember : teamMembers) {
                      if(teamMember.getMember().getId().equals(studentId)){
                          // TO DO: ko bt nên xóa hay ko??
                          studentEvaluationRepository.deleteByMilestoneIdAndMemberId(
                                  teamMember.getTeam().getMilestone().getId(),
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
        validateClassExistence(classListStudentRequest.getClassId());
        deleteExistingStudentsInClass(classListStudentRequest.getClassId());

        List<ClassUserSuccessDTO> list = new ArrayList<>();
        for (CreateUserRequest request : classListStudentRequest.getList()) {
            if(validateEmailDomain(request.getEmail(),classUserResponeDTO)){
                ClassUser classUser = new ClassUser();
                classUser.setClasses(classesRepository.findById(classListStudentRequest.getClassId()).get());
                classUser.setActive(true);
                classUser.setNote("");
                User user = userRepository.findFirstByEmail(request.getEmail());
                if (user != null) {
                    if (validateExistingStudent(user, classUser.getClasses(),classUserResponeDTO)){
                        classUser.setUser(user);
                        classUserRepository.save(classUser);
                        list.add(buildClassUserDTO(classUser));
                    }
                } else {
                    user = createUser(request);
                    classUser.setUser(user);
                    classUserRepository.save(classUser);
                    list.add(buildClassUserDTO(classUser));
                }
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
        throw new RecordNotFoundException("User");
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
        request.validateInput();
        User user = commonService.getCurrentUser();
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
        SearchClassResponse response = new SearchClassResponse();
        response.setClassesDTOS(
                ConvertUtils.convertList(classes.getContent(), ClassesDTO.class)
        );
        for (ClassesDTO classesDTO : response.getClassesDTOS()) {
            classesRepository.findById(classesDTO.getId()).ifPresent(classes1 -> {
                if (classes1.getSemester() != null) {
                    classesDTO.setSemesterName(classes1.getSemester().getName());
                }
                if (classes1.getTeacher() != null) {
                    classesDTO.setTeacherName(classes1.getTeacher().getFullname());
                }
                if (classes1.getSubject() != null) {
                    classesDTO.setSubjectName(classes1.getSubject().getSubjectName());
                }
                if(classes1.getClassesUsers() != null){
                    List<User> evaluators = classes1.getClassesUsers().stream()
                            .map(ClassUser::getUser)
                            .filter(itemUser -> itemUser.getRole().getId().equals(Constants.Role.TEACHER))
                            .toList();
                    classesDTO.setListEvaluator(ConvertUtils.convertList(evaluators, CreateUserRequest.class));
                }
            });
        }
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
        classesDTO.setListEvaluator(listEvaluator);
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
                request.getRoleId(),
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

    private void validateClassExistence(Integer classId) {
        classesRepository.findById(classId).orElseThrow(
                () -> new ApiInputException("classId not already exist!")
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
               temp.setEmail(user.getEmail());
               temp.setErrorDetails(Constants.ClassUser.STUDENT_CLASS_VALID);
               classUserResponeDTO.addError(temp);
               return false;
           }
           else {
               throw new ApiInputException(user.getEmail()+" " + Constants.ClassUser.STUDENT_CLASS_VALID);
           }
        }
        if (!user.getRole().getId().equals(Constants.Role.STUDENT)) {
            if(classUserResponeDTO!=null){
                ClassUserErrorDTO temp= new ClassUserErrorDTO();
                temp.setEmail(user.getEmail());
                temp.setErrorDetails(Constants.ClassUser.STUDENT_VALID);
                classUserResponeDTO.addError(temp);
                return false;
            }else {
                throw new ApiInputException(user.getEmail() + " " + Constants.ClassUser.STUDENT_VALID);
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
        var response = ConvertUtils.convert(classUser, ClassUserSuccessDTO.class);
        classesRepository.findById(classUser.getClasses().getId()).ifPresent(classes -> {
            response.setClassCode(classes.getClassCode());
        });
        userRepository.findById(classUser.getUser().getId()).ifPresent(user -> {
            response.setFullname(user.getFullname());
            response.setEmail(user.getEmail());
            response.setPhone(user.getMobile());
        });
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
            throw new ApiInputException("Semester not valid!");
        }
    }

    private void validateTeacher(Integer subjectId, Integer teacherId) {
        if (subjectRepository.checkSubjectTeacher(subjectId, "added", teacherId) == null) {
            throw new ApiInputException("Teacher do not teach this subject!");
        }
    }

    private void validateEvaluators(List<CreateUserRequest> listEvaluator, Integer subjectId, Integer teacherId) {
        if (listEvaluator != null) {
            for (CreateUserRequest userRequest : listEvaluator) {
                if (userRequest.getId().equals(teacherId)) {
                    throw new ApiInputException("The teacher who teaches this class cannot be added to the list of evaluation teachers");
                }
                if (subjectRepository.checkSubjectTeacher(subjectId, "added", userRequest.getId()) == null) {
                    throw new ApiInputException("The list of evaluated teachers includes teachers who do not teach this subject!");
                }
            }
        }
    }

    private void checkClassExistence(String classCode, Integer semesterId, Integer classId) {
        var foundClass = classesRepository.findFirstByClassCodeAndSettingId(classCode, semesterId, classId);
        foundClass.ifPresent(classes -> {
            throw new NameAlreadyExistsException("Class ");
        });
    }

    private void enrichResponse(ClassesDTO response, ClassesDTO request) {
        settingRepository.findById(response.getSemesterId()).ifPresent(setting -> {
            response.setSemesterName(setting.getName());
        });

        if (request.getListEvaluator() != null) {
            for (CreateUserRequest createUserRequest : request.getListEvaluator()) {
                ClassUser classUser = new ClassUser();
                classUser.setActive(true);
                classUser.setNote("");
                classUser.setClasses(classesRepository.findById(response.getId()).get());
                classUser.setUser(userRepository.findById(createUserRequest.getId()).get());
                classUserRepository.save(classUser);
            }
        }

        userRepository.findById(response.getTeacherId()).ifPresent(user -> {
            response.setTeacherName(user.getFullname());
        });

        if (request.getListEvaluator() != null) {
            List<CreateUserRequest> list = new ArrayList<>();
            for (CreateUserRequest userRequest : request.getListEvaluator()) {
                userRepository.findById(userRequest.getId()).ifPresent(user -> {
                    userRequest.setRoleId(user.getRole().getId());
                    userRequest.setFullname(user.getFullname());
                    userRequest.setGender(user.getGender());
                    userRequest.setEmail(user.getEmail());
                });
                list.add(userRequest);
            }
            response.setListEvaluator(list);
        }

        subjectRepository.findById(response.getSubjectId()).ifPresent(subject -> {
            response.setSubjectName(subject.getSubjectName());
        });
    }
    private void updateEvaluators(ClassesDTO response, ClassesDTO request) {
        if (request.getListEvaluator() != null) {
            var list = classUserRepository.findAllByClassIdAndRole(response.getId(), Constants.Role.TEACHER);
            if (!list.isEmpty()) {
                classUserRepository.deleteAll(list);
            }
            for (CreateUserRequest createUserRequest : request.getListEvaluator()) {
                ClassUser classUser = new ClassUser();
                classUser.setActive(true);
                classUser.setNote("");
                classUser.setClasses(classesRepository.findById(response.getId()).get());
                classUser.setUser(userRepository.findById(createUserRequest.getId()).get());
                classUserRepository.save(classUser);
            }
        }
}
    private void enrichEvaluators(ClassesDTO response, ClassesDTO request) {
        var list = classUserRepository.findAllByClassIdAndRole(response.getId(), Constants.Role.TEACHER);
        if (!list.isEmpty()) {
            List<CreateUserRequest> listUser = new ArrayList<>();
            for (CreateUserRequest userRequest : request.getListEvaluator()) {
                userRepository.findById(userRequest.getId()).ifPresent(user -> {
                    userRequest.setRoleId(user.getRole().getId());
                    userRequest.setFullname(user.getFullname());
                    userRequest.setGender(user.getGender());
                    userRequest.setEmail(user.getEmail());
                });
                listUser.add(userRequest);
            }
            response.setListEvaluator(listUser);
        }
    }

    public Object searchBySemesterId(SearchClassForGrandFinal request) {
        SearchClassResponseForGrandFinal response = new SearchClassResponseForGrandFinal();
        response.setClassList(new ArrayList<>());
        List<BaseDTO> classList = new ArrayList<>();
        if(request.getSemesterId() == null || request.getRoundId() == null){
            return response;
        }
        User currentUser = commonService.getCurrentUser();
        Setting semester = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "semester", request.getSemesterId());
        if(semester == null){
            throw new RecordNotFoundException("Semester");
        }
        Setting round = (Setting) settingRepository.findSettingBySettingTypeAndSettingId( "round", request.getRoundId());
        if(round == null){
            throw new RecordNotFoundException("Round");
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
        if(classes != null){
            for (Classes c : classes) {
                classList.add(new BaseDTO(c.getId(), c.getClassCode()));
            }
        }
        response.setClassList(classList);
        response.setCanEvaluate(currentUser.getRole().getId().equals(Constants.Role.TEACHER));
        return response;
    }
}

