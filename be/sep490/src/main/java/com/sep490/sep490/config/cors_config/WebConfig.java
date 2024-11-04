package com.sep490.sep490.config.cors_config;

import com.sep490.sep490.common.utils.Constants;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        Constants.WhitelistCors.ALLOWED_ORIGIN_1,
                        Constants.WhitelistCors.ALLOWED_ORIGIN_2,
                        Constants.WhitelistCors.ALLOWED_ORIGIN_3,
                        Constants.WhitelistCors.ALLOWED_ORIGIN_4,
                        Constants.WhitelistCors.ALLOWED_ORIGIN_5,
                        Constants.WhitelistCors.ALLOWED_ORIGIN_6)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
