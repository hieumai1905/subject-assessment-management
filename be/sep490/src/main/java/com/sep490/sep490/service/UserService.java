package com.sep490.sep490.service;


import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.exception.UnauthorizedException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ConvertUtils;
import com.sep490.sep490.common.utils.FileUtils;
import com.sep490.sep490.common.utils.GenerateString;
import com.sep490.sep490.config.security_config.jwt.JwtUserDetailsService;
import com.sep490.sep490.config.security_config.jwt.JwtUtil;
import com.sep490.sep490.config.security_config.security.PasswordEncoderImpl;
import com.sep490.sep490.dto.UserDTO;
import com.sep490.sep490.dto.user.response.CheckPassForgotResponse;
import com.sep490.sep490.dto.user.response.ForgotPassResponse;
import com.sep490.sep490.dto.user.response.LoginResponse;
import com.sep490.sep490.dto.user.request.*;
import com.sep490.sep490.dto.user.response.SearchUserResponse;
import com.sep490.sep490.entity.Setting;
import com.sep490.sep490.entity.User;
import com.sep490.sep490.mapper.UserMapper;
import com.sep490.sep490.repository.SettingRepository;
import com.sep490.sep490.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.UnsupportedEncodingException;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RequiredArgsConstructor
@Service
@Log4j2
public class UserService implements BaseService<User, Integer> {

    private final UserRepository userRepository;
    private final SettingRepository settingRepository;
    private final JwtUtil jwtUtil;
    private final JwtUserDetailsService jwtUserDetailsService;
    private final PasswordEncoderImpl passwordEncoder;
    private final UserMapper userMapper;
    private final JavaMailSender mailSender;
    private final FirebaseStorageService firebaseStorageService;
    private final ImgurService imgurService;
    @Value("${myvalue.active-account.send-to-mail}")
    private String sendToMail;
    @Value("${myvalue.active-account.login-url}")
    private String loginUrl;

    @Override
    public Object create(Object objectRequest) {
        log.info("Creating user: ");
        var request = (UserDTO) objectRequest;
        // Check email domain
        log.info("Check email domain: ");
        List<String> emailDomains = settingRepository.findBySettingType(Constants.SettingType.EMAIL).stream().map(Setting::getName).toList();
        var subEmailRequest = StringUtils.substringAfter(request.getEmail(), "@");
        if (!emailDomains.contains(subEmailRequest)){
            throw new ConflictException("Tên miền email không phù hợp");
        }
        // Find user by username
//        var foundUserByUsername = userRepository.findByUsername(request.getUsername());
//        if (foundUserByUsername != null) {
//            throw new NameAlreadyExistsException("Username");
//        }
        // Find user by email
        var foundUserByEmail = userRepository.findFirstByEmail(request.getEmail());
        if (foundUserByEmail != null) {
            throw new NameAlreadyExistsException("Email");
        }
        // Validate password
        if (request.getPassword().length() < 8) {
            throw new ConflictException("Độ dài mật khẩu phải >= 8 ký tự");
        }
        request.setId(null);
        // Map and save user
        var saveUser = ConvertUtils.convert(request, User.class);
        var userRole = settingRepository.findById(request.getRoleId()).orElseThrow();
        saveUser.setRole(userRole);
        saveUser.setPassword(passwordEncoder.encode(request.getPassword()));
        saveUser.setActive(false);
        userRepository.save(saveUser);
        return ConvertUtils.convert(saveUser, UserDTO.class);
    }

    @Transactional
    public Object register(Object objectRequest) throws MessagingException, UnsupportedEncodingException {
        log.info("Creating user: ");
        var request = (UserRegisterRequest) objectRequest;
        // Check email domain
        log.info("Check email domain: ");
        List<String> emailDomains = settingRepository.findBySettingType(Constants.SettingType.EMAIL).stream().map(Setting::getName).toList();
        var subEmailRequest = StringUtils.substringAfter(request.getEmail(), "@");
        if (!emailDomains.contains(subEmailRequest)){
            throw new ConflictException("Email domain doesn't match!");
        }
        // Find user by email
        var foundUserByEmail = userRepository.findFirstByEmail(request.getEmail());
        if (foundUserByEmail != null) {
            throw new NameAlreadyExistsException("Email");
        }
        // Validate password
        if (request.getPassword().length() < 8) {
            throw new ConflictException("Length of password must be >= 8!");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())){
            throw new ConflictException("Confirm password doesn't match!");
        }
        // Map and save user
        var userRole = settingRepository.findById(4).orElseThrow();
        var saveUser = userMapper.convertUserRegisterRequestToUser(request, userRole);
        saveUser.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(saveUser);
        sendActiveAccount(saveUser);
        return ConvertUtils.convert(saveUser, UserDTO.class);
    }

    public UserDTO newPassAfterForgot(NewPassAfterForgot request){
        var foundUserByEmail = userRepository.findFirstByEmail(request.getEmail());
        if (foundUserByEmail == null) {
            throw new RecordNotFoundException("Email");
        }
        if (!request.getPass().equals(request.getConfirmPass())){
            throw new ConflictException("Confirm Password doesn't match!");
        }
        foundUserByEmail.setPassword(passwordEncoder.encode(request.getPass()));
        userRepository.save(foundUserByEmail);
        return ConvertUtils.convert(foundUserByEmail, UserDTO.class);
    }

    public User activeAccount(String email){
        var foundUserByEmail = userRepository.findFirstByEmail(email);
        if (foundUserByEmail == null) {
            throw new RecordNotFoundException("Email");
        }
        foundUserByEmail.setActive(true);
        foundUserByEmail.setStatus(Constants.UserStatus.VERIFIED);
        userRepository.save(foundUserByEmail);
        return foundUserByEmail;
    }

    public UserDTO createByAdmin(CreateUserRequest request) throws MessagingException, UnsupportedEncodingException {
        log.info("Creating user by admin: ");
        // Check email domain
        log.info("Check email domain: ");
        List<String> emailDomains = settingRepository.findBySettingType(Constants.SettingType.EMAIL).stream().map(Setting::getName).toList();
        var subEmailRequest = StringUtils.substringAfter(request.getEmail(), "@");
        if (!emailDomains.contains(subEmailRequest)){
            throw new ConflictException("Tên miền email không hợp lệ");
        }
        // Find user by email
        var foundUserByEmail = userRepository.findFirstByEmail(request.getEmail());
        if (foundUserByEmail != null) {
            throw new NameAlreadyExistsException("Email");
        }
        // Validate password
        var rawPassword = GenerateString.randomPassword();

        request.setId(null);
        // Map and save user
        var userRole = settingRepository.findById(request.getRoleId()).orElseThrow();
        var saveUser = userMapper.convertCrateUserRequestToUser(request, userRole);
        saveUser.setPassword(passwordEncoder.encode(rawPassword));
        saveUser.setCode(userRole.getId().equals(Constants.Role.STUDENT) ? generateCode() : "");
        userRepository.save(saveUser);
//        sendEmailPass(saveUser.getEmail(), rawPassword);
        return ConvertUtils.convert(saveUser, UserDTO.class);
    }

    public String generateCode() {
        LocalDate currentDate = LocalDate.now();

        // Lấy tháng và năm hiện tại
        int month = currentDate.getMonthValue();
        int year = currentDate.getYear();

        // Chuyển đổi tháng thành mã hai ký tự
        String monthCode;
        switch (month) {
            case 1:  monthCode = "JA"; break;
            case 2:  monthCode = "FE"; break;
            case 3:  monthCode = "MR"; break;
            case 4:  monthCode = "AP"; break;
            case 5:  monthCode = "MY"; break;
            case 6:  monthCode = "JN"; break;
            case 7:  monthCode = "JL"; break;
            case 8:  monthCode = "AU"; break;
            case 9:  monthCode = "SE"; break;
            case 10: monthCode = "OC"; break;
            case 11: monthCode = "NO"; break;
            case 12: monthCode = "DE"; break;
            default: throw new IllegalStateException("Invalid month value: " + month);
        }

        // Lấy hai chữ số cuối của năm hiện tại
        String yearCode = String.valueOf(year).substring(2);

        // Tìm mã sinh viên cuối cùng với cùng tháng và năm trong DB
        Optional<String> latestCode = userRepository.findLatestCodeByMonthAndYear(monthCode, yearCode);

        // Nếu có mã, lấy 4 chữ số cuối, tăng lên 1, và định dạng thành 4 chữ số
        int newSerialNumber = latestCode.map(code -> Integer.parseInt(code.substring(4)) + 1).orElse(1);
        String serialNumber = String.format("%04d", newSerialNumber);

        // Tạo mã sinh viên
        return monthCode + yearCode + serialNumber;
    }

    public CheckPassForgotResponse checkInputCodeForgotPass(CheckPassForgotRequest request) {
        log.info("Check code forgot: ");
        var foundUserByEmail = userRepository.findFirstByEmail(request.getEmail());
        if (foundUserByEmail == null) {
            throw new RecordNotFoundException("Email");
        }
        log.info("match pass: " + passwordEncoder.matches(request.getInputCode(), request.getSentCode()));
        if (!passwordEncoder.matches(request.getInputCode(), request.getSentCode())) {
            throw new ConflictException("Code doesn't match!");
        }
        return new CheckPassForgotResponse(foundUserByEmail.getEmail(), true);
    }

    public ForgotPassResponse sendCodeForgotPass(SendEmailCodeRequest request) throws MessagingException, UnsupportedEncodingException {
        log.info("Send mail when forgot pass: ");
        var foundUserByEmail = userRepository.findFirstByEmail(request.getEmail());
        if (foundUserByEmail == null) {
            throw new RecordNotFoundException("Email");
        }
        var rawCode = GenerateString.randomCode(6);
        var encode = passwordEncoder.encode(rawCode);
        sendCodeContent(foundUserByEmail, rawCode);
        var response = new ForgotPassResponse();
        response.setCode(encode);
        response.setEmail(request.getEmail());
        log.info("match pass: " + passwordEncoder.matches(rawCode, encode));
        return response;
    }

    @Override
    @Transactional
    public Object update(Integer id, Object objectRequest) {
        // Check current user
        log.info("Update user with id: " + id);
        var currentUser = getCurrentUser();
        if (!(Objects.equals(currentUser.getId(), id))) {
            throw new UnauthorizedException("Permission denied!");
        }
        var request = (UserDTO) objectRequest;
        request.validateInput();
        // Handle logic
        var foundUser = userRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("User"));
        var updateUser = userMapper.convertUpdateUserDtoToUser(request, foundUser);
        userRepository.save(updateUser);
        return ConvertUtils.convert(updateUser, UserDTO.class);
    }

    @Transactional
    public Object updateUser(Integer id, Object objectRequest, MultipartFile file) {
        // Check current user
        log.info("Update user with id: " + id);
//        var currentUser = getCurrentUser();
//        if (!(Objects.equals(currentUser.getId(), id))) {
//            throw new UnauthorizedException("Permission denied!");
//        }
        var request = (UserDTO) objectRequest;
        request.validateInput();
        // Handle logic
        var foundUser = userRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Người dùng"));
        var foundUserExitedByEmail = userRepository.findExitedEmailForUpdateUser(
                id, request.getEmail()
        );
        if (foundUserExitedByEmail != null){
            throw new NameAlreadyExistsException("Email");
        }
        request.setAvatar_url(file != null ? imgurService.uploadImageToImgur(file) : foundUser.getAvatar_url());
        var updateUser = userMapper.convertUpdateUserDtoToUser(request, foundUser);
        userRepository.save(updateUser);
        return ConvertUtils.convert(updateUser, UserDTO.class);
    }

    @Transactional
    public Object updateForAdmin(Integer id, Object objectRequest) {
        // Check current user
        log.info("Update user by admin with id: " + id);
        var request = (UpdateUserByAdminRequest) objectRequest;
        request.validateInput();
        // Handle logic
        var foundUser = userRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("User"));
        var foundRole = settingRepository.findById(request.getRoleId()).orElseThrow(
                () -> new RecordNotFoundException("Role"));
        var updateUser = userMapper.convertUpdateUserByAdminRequestToUser(request, foundUser, foundRole);
        userRepository.save(updateUser);
        return ConvertUtils.convert(updateUser, UserDTO.class);
    }

    @Override
    public Object get(Integer id) {
        var foundUser = userRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("Người dùng"));
//        var role = settingRepository.findById(foundUser.getId()).orElseThrow(
//                () -> new RecordNotFoundException("Role"));
        return ConvertUtils.convert(foundUser, UserDTO.class);
    }

    @Override
    public void delete(Integer integer) {

    }

    // TODO: 6/5/2024 Get list of users by role (Assign to ToanNK)
    public List<UserDTO> getUserByRoleId(Integer id){
        var foundUser = userRepository.findUserByRoleId(id);
        if(foundUser == null){
            throw new RecordNotFoundException("Id");
        }
        return ConvertUtils.convertList(foundUser, UserDTO.class);
    }

    @Override
    public Object search(Object objectRequest) {
        log.info("search user: ");
        var request = (SearchUserRequest) objectRequest;
        request.validateInput();

        Pageable pageable;
        if (request.getOrderBy().equals("DESC"))
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).descending());
        else
            pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize(), Sort.by(request.getSortBy()).ascending());

        Page<User> users = userRepository.search(
                request.getKeyWord(),
                request.getRoleName(),
                request.getStatus(),
                request.getActive(),
                request.getIsIncludeManager(),
                pageable
        );

        SearchUserResponse response = new SearchUserResponse();
        response.setUsers(ConvertUtils.convertList(users.getContent(), UserDTO.class));
        response.setTotalElements(users.getTotalElements());
        response.setPageIndex(request.getPageIndex());
        response.setPageSize(request.getPageSize());
        response.setOrderBy(request.getOrderBy());
        response.setSortBy(request.getSortBy());

        return response;
    }

    public LoginResponse loginByUsernamePass(LoginRequest request) {
        log.info("Request to login");
        User foundUser = userRepository.findByUsername(request.getUsername());
        if (foundUser == null){
            throw new UnauthorizedException("Tài khoản hoặc mật khẩu không chính xác");
        }
        Hibernate.initialize(foundUser.getRole());
        if (foundUser.getStatus().equals(Constants.UserStatus.UNDEFINED)){
            throw new UnauthorizedException("Tài khoản của bạn chưa được xác nhận");
        }
        if (!foundUser.getActive()){
            throw new UnauthorizedException("Tài khoản của bạn đã bị khóa");
        }
        UserDetails userDetails = jwtUserDetailsService.loadUserByUsername(foundUser.getUsername());
        String passRequest = request.getPassword();

        if (!passwordEncoder.matches(passRequest, foundUser.getPassword())) {
            throw new UnauthorizedException("Tài khoản hoặc mật khẩu không chính xác");
        }

        LoginResponse response = new LoginResponse();
        var role = settingRepository.findById(foundUser.getRole().getId()).orElseThrow();
        response.setUser(ConvertUtils.convert(foundUser, UserDTO.class));
        response.setToken(jwtUtil.generateToken(userDetails));
        response.setRole(role.getName());
        return response;
    }

    public User getCurrentUser() {
        User userJwtPayload = getCurrentUserLogin();
        if (userJwtPayload.getId() == null) {
            throw new RecordNotFoundException("NOT FOUND");
        }

        return userJwtPayload;
    }

    public UserDTO changeAvatar(Integer id, MultipartFile file) {
        // Check current user
        log.info("Change pass user with id: " + id);
        var currentUser = getCurrentUser();
        if (!(Objects.equals(currentUser.getId(), id))) {
            throw new UnauthorizedException("Permission denied!");
        }
        // Handle logic
        var foundUser = userRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("User"));
        String submitFile = "";
        if(file != null)
            submitFile = firebaseStorageService.uploadFile(file);
        foundUser.setAvatar_url(submitFile);
        userRepository.save(foundUser);
        return ConvertUtils.convert(foundUser, UserDTO.class);
    }

    public UserDTO changePassword(Integer id, ChangePassRequest request) {
        // Check current user
        log.info("Change pass user with id: " + id);
        var currentUser = getCurrentUser();
        if (!(Objects.equals(currentUser.getId(), id))) {
            throw new UnauthorizedException("Permission denied!");
        }
        if (request.getNewPass().length() < 8){
            throw new ConflictException("Length of password must be >= 8 characters!");
        }
        if (!request.getNewPass().equals(request.getConfirmPass())){
            throw new ConflictException("Confirm password doesn't match");
        }
        // Handle logic
        var foundUser = userRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("User"));
        if (!passwordEncoder.matches(request.getOldPass(), foundUser.getPassword())) {
            throw new UnauthorizedException("Old password is incorrect!");
        }
        foundUser.setPassword(passwordEncoder.encode(request.getNewPass()));
        userRepository.save(foundUser);
        return ConvertUtils.convert(foundUser, UserDTO.class);
    }

    public UserDTO resetPassword(Integer id) throws MessagingException, UnsupportedEncodingException {
        // Check current user
        log.info("Reset password user with id: " + id);
        var foundUser = userRepository.findById(id).orElseThrow(
                () -> new RecordNotFoundException("User"));
//        var resetPass = GenerateString.randomPassword();
        var resetPass = "88888888";
        sendEmailPass(foundUser.getEmail(), resetPass);
        foundUser.setPassword(passwordEncoder.encode(resetPass));
        userRepository.save(foundUser);
        return ConvertUtils.convert(foundUser, UserDTO.class);
    }

    public List<UserDTO> getAll() {
        List<User> allUser = userRepository.findAll();
        return ConvertUtils.convertList(allUser, UserDTO.class);
    }

    public Object loginByGoogle(LoginGoogleRequest request) throws MessagingException, UnsupportedEncodingException {
        log.info("Request to login by google");
        // Check email domain
        List<String> emailDomains = settingRepository.findBySettingType(Constants.SettingType.EMAIL).stream().map(Setting::getName).toList();
        var subEmailRequest = StringUtils.substringAfter(request.getEmail(), "@");
        if (!emailDomains.contains(subEmailRequest)){
            throw new ConflictException("Email domain doesn't match!");
        }
        // If user don't have account in the system
        User foundUser = userRepository.findFirstByEmail(request.getEmail());
        if (foundUser == null){
//            Setting role = settingRepository.findById(Constants.Role.STUDENT).orElseThrow();
            // Register for user
//            if (request.getEmail().contains(Constants.EmailDomain.TEACHER)){
//                role = settingRepository.findById(Constants.Role.TEACHER).orElseThrow();
//            }
//            foundUser = userMapper.convertRegisterUserByGGToUser(request, role);
//            userRepository.save(foundUser);
//            sendActiveAccount(foundUser);
//            LoginResponse response = new LoginResponse();
//            response.setUser(ConvertUtils.convert(foundUser, UserDTO.class));
//            UserDetails userDetails = jwtUserDetailsService.loadUserByUsername(foundUser.getUsername());
//            response.setToken(jwtUtil.generateToken(userDetails));
//            response.setRole(role.getName());
//            return response;
            return false;

        }
        Hibernate.initialize(foundUser.getRole());
        if (foundUser.getStatus().equals(Constants.UserStatus.UNDEFINED)){
            throw new UnauthorizedException("Your account has not been verified!");
        }
//        if (foundUser.getStatus().equals(Constants.UserStatus.INACTIVE)){
//            throw new UnauthorizedException("Your account has been locked!");
//        }
        if (!foundUser.getActive()){
            throw new UnauthorizedException("Your account has been locked!");
        }
        UserDetails userDetails = jwtUserDetailsService.loadUserByUsername(foundUser.getUsername());
        LoginResponse response = new LoginResponse();
        var role = settingRepository.findById(foundUser.getRole().getId()).orElseThrow();
        response.setUser(ConvertUtils.convert(foundUser, UserDTO.class));
        response.setToken(jwtUtil.generateToken(userDetails));
        response.setRole(role.getName());
        return response;
    }

    public String sendEmailPass(String request, String password) throws MessagingException, UnsupportedEncodingException {
        User foundUser = userRepository.findByEmailAndActiveTrue(request);
        if (foundUser != null) {
            return sendEmailContent(foundUser, password);
        }
        throw new RecordNotFoundException("User");
    }

    public User getCurrentUserLogin() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        return extractPrincipal(securityContext.getAuthentication());
    }

    public User extractPrincipal(Authentication authentication) {
        if (authentication == null) {
            return null;
        } else if (authentication.getPrincipal() instanceof UserDetails) {
            System.out.println(authentication.getPrincipal());
            return userRepository.findByUsername(((UserDetails) authentication.getPrincipal()).getUsername());
        }
        return null;
    }

    private String sendCodeContent(User user, String code) throws MessagingException, UnsupportedEncodingException {
        String toAddress = user.getEmail();
        String fromAddress = Constants.Mail.FROM_ADDRESS;
        String senderName = Constants.Mail.SENDER_NAME;
        String subject = Constants.Mail.PASSWORD_SUBJECT;
        StringBuilder content = new StringBuilder();
        content.append(Constants.Mail.DEAR);
        content.append(Constants.Mail.MAIN_CONTENT_CODE);
        content.append(Constants.Mail.CODE);
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
        contentResponse = contentResponse.replace("[[code]]", code);
        helper.setText(contentResponse, true);
        mailSender.send(message);
        return code;
    }

    private String sendActiveAccount(User user) throws MessagingException, UnsupportedEncodingException {
        String toAddress = user.getEmail();
        String fromAddress = Constants.Mail.FROM_ADDRESS;
        String senderName = Constants.Mail.SENDER_NAME;
        String subject = Constants.Mail.ACTIVE_ACCOUNT;
        StringBuilder content = new StringBuilder();
        content.append(Constants.Mail.DEAR);
        // Thêm nút reset password
        content.append("<a href='");
        content.append(sendToMail + user.getEmail());
//        content.append("http://chunchun.io.vn:8080/auth/active-account?email=" + user.getEmail());
        content.append("' style='display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #ff0000; text-decoration: none;'>Active Account</a><br><br>");
//        content.append(Constants.Mail.CODE);
        content.append(Constants.Mail.THANK_YOU);
        content.append(Constants.Mail.COMPANY);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom(fromAddress, senderName);
        helper.setTo(toAddress);
        helper.setSubject(subject);

        String contentResponse = content.toString();
        contentResponse = contentResponse.replace("[[name]]", user.getFullname());
//        contentResponse = contentResponse.replace("[[code]]", code);
        helper.setText(contentResponse, true);
        mailSender.send(message);
        return "Sent active account";
    }

    private String sendEmailContent(User user, String password) throws MessagingException, UnsupportedEncodingException {
        String toAddress = user.getEmail();
        String fromAddress = Constants.Mail.FROM_ADDRESS;
        String senderName = Constants.Mail.SENDER_NAME;
        String subject = Constants.Mail.PASSWORD_SUBJECT;
        StringBuilder content = new StringBuilder();
        content.append(Constants.Mail.DEAR);
        content.append(Constants.Mail.MAIN_CONTENT_LOGIN);
        content.append(loginUrl);
//        content.append(Constants.Link.LOGIN_LOCAL);
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
}
