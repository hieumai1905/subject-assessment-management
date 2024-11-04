package com.sep490.sep490.config.security_config.jwt;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.repository.SettingRepository;
import com.sep490.sep490.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
public class JwtUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SettingRepository roleRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        var authorities = roleRepository.findByIdAndSettingType(user.getRole().getId(), Constants.SettingType.ROLE);

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getEmail(),
                authorities.stream().map(
                        role -> new SimpleGrantedAuthority(role.getName()))
                        .toList()
        );
    }
}
