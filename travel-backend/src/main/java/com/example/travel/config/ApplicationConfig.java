package com.example.travel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;
import javax.sql.DataSource;

import java.util.logging.Logger;

/**
 * Application configuration beans
 */
@Configuration
public class ApplicationConfig {

    @Bean
    public Logger applicationLogger() {
        return Logger.getLogger("TravelApplication");
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    /**
     * Development profile specific configurations
     */
    @Configuration
    @Profile("dev")
    static class DevelopmentConfig {
        // Development specific beans can be added here
    }

    /**
     * Production profile specific configurations
     */
    @Configuration
    @Profile("prod")
    static class ProductionConfig {
        // Production specific beans can be added here
    }
}
