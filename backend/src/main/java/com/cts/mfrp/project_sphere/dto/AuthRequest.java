package com.cts.mfrp.project_sphere.dto;

//import jakarta.validation.constraints.Email;
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {

//    @NotBlank(message = "Email is required")
//    @Email(message = "Email should be valid")
    private String email;

//    @NotBlank(message = "Password is required")
//    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    // Optional: Add other fields if your User entity needs them
    // private String firstName;
    // private String lastName;
}

//@Valid Annotation in Controller
//
//<dependency>
//    <groupId>org.springframework.boot</groupId>
//    <artifactId>spring-boot-starter-validation</artifactId>
//</dependency>