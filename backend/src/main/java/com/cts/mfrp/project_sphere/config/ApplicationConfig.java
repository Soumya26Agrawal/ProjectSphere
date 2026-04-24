package com.cts.mfrp.project_sphere.config;


import com.cts.mfrp.project_sphere.Enum.Role;
import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.repository.UserRepository;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {
    private final UserRepository repository;

    @Bean
    public UserDetailsService userDetailsService() {

        return username -> repository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }



    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 1. Allow your Angular dev server
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));

        // 2. Allow standard HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // 3. Allow necessary headers (Authorization is crucial for JWT)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));

        // 4. Allow the browser to send cookies or auth headers
        configuration.setAllowCredentials(true);

        // 5. Expose headers if Angular needs to read specific response headers
        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply to all API paths
        return source;
    }

    @Bean
    public CommandLineRunner bootstrapAdmin(UserRepository repo, PasswordEncoder encoder) {
        return args -> {
            String email = "admin@projectsphere.com";
            if (repo.findByEmail(email).isEmpty()) {
                repo.save(User.builder()
                        .email(email)
                        .password(encoder.encode("admin123"))
                        .firstName("System")
                        .lastName("Admin")
                        .employeeId(1000L)
                        .phoneNumber(9999999999L)
                        .role(Role.ADMIN)
                        .isActive(true)
                        .build());
            }
        };
    }

    @Bean
    public CommandLineRunner bootstrapPm(UserRepository repo, PasswordEncoder encoder) {
        return args -> {
            String email = "pm@projectsphere.com";
            if (repo.findByEmail(email).isEmpty()) {
                repo.save(User.builder()
                        .email(email)
                        .password(encoder.encode("pm123"))
                        .firstName("Default")
                        .lastName("Manager")
                        .employeeId(1001L)
                        .phoneNumber(9999999998L)
                        .role(Role.PROJECT_MANAGER)
                        .isActive(true)
                        .build());
            }
        };
    }

    @Bean
    public CommandLineRunner bootstrapDev(UserRepository repo, PasswordEncoder encoder) {
        return args -> {
            String email = "dev@projectsphere.com";
            if (repo.findByEmail(email).isEmpty()) {
                repo.save(User.builder()
                        .email(email)
                        .password(encoder.encode("dev123"))
                        .firstName("Default")
                        .lastName("Developer")
                        .employeeId(1002L)
                        .phoneNumber(9999999997L)
                        .role(Role.DEVELOPER)
                        .isActive(true)
                        .build());
            }
        };
    }

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("My Custom API")
                        .description("Detailed description of my Spring Boot service")
                        .version("v1.0.0"))
//                        .license(new License().name("Apache 2.0").url("http://springdoc.org")))
                .externalDocs(new ExternalDocumentation()
                        .description("Full Documentation")
                        .url("https://example.com/docs"));
    }
}
