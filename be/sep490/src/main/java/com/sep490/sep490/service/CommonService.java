package com.sep490.sep490.service;

import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.entity.User;
import com.sep490.sep490.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Log4j2
public class CommonService {
    private final UserRepository userRepository;

    public User getCurrentUser() {
        User userJwtPayload = getCurrentUserLogin();
        if (userJwtPayload.getId() == null) {
            throw new RecordNotFoundException("NOT FOUND");
        }

        return userJwtPayload;
    }

    private User getCurrentUserLogin() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        return extractPrincipal(securityContext.getAuthentication());
    }

    private User extractPrincipal(Authentication authentication) {
        if (authentication == null) {
            return null;
        } else if (authentication.getPrincipal() instanceof UserDetails) {
            System.out.println(authentication.getPrincipal());
            return userRepository.findByUsername(((UserDetails) authentication.getPrincipal()).getUsername());
        }
        return null;
    }
}
