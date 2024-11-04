package com.sep490.sep490.config.security_config.security;

import com.sep490.sep490.config.security_config.jwt.JwtAuthenticationEntryPoint;
import com.sep490.sep490.config.security_config.jwt.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        return http
                .csrf(csrf -> {
                    csrf.disable();
                })
                .cors(cors -> cors.disable())
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers("/error/**").permitAll();
                    auth.requestMatchers(AUTH_WHITELIST).permitAll();
                    auth.requestMatchers("/subjects/**").permitAll();
                    auth.requestMatchers("/user/**").permitAll();
                    auth.requestMatchers("/setting/**").permitAll();
                    auth.requestMatchers("/subject-setting/**").permitAll();
                    auth.requestMatchers("/evaluation-criteria/**").permitAll();
                    auth.requestMatchers("/assignment/**").permitAll();
                    auth.requestMatchers("/milestone/**").permitAll();
                    auth.requestMatchers("/class/**").permitAll();
                    auth.requestMatchers("/teams/**").permitAll();
                    auth.requestMatchers("/team-members/**").permitAll();
                    auth.requestMatchers("/milestone-criteria/**").permitAll();
                    auth.requestMatchers("/requirements/**").permitAll();
                    auth.requestMatchers("/evaluation/**").permitAll();
                    auth.requestMatchers("/submission/**").permitAll();
                    auth.requestMatchers("/councils/**").permitAll();
                    auth.requestMatchers("/sessions/**").permitAll();
                    auth.requestMatchers("/council-team/**").permitAll();
                    auth.requestMatchers("/dashboard/**").permitAll();


                })
                .exceptionHandling(e -> e.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    private static final String[] AUTH_WHITELIST = {
            "/api/v1/auth/**",
            "/v3/api-docs/**",
            "/v3/api-docs.yaml",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/auth/**"
    };
}

