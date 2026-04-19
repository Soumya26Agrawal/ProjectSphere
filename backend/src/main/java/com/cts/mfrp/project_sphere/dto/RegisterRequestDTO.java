package com.cts.mfrp.project_sphere.dto;

//import jakarta.validation.constraints.Email;
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.Size;
import com.cts.mfrp.project_sphere.Enum.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDTO {
    private Long employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private String password; // Often excluded in "Get" responses for security
    private Long phoneNumber;
    private Role role;
    private Boolean isActive;
}
//@Valid Annotation in Controller
//
//<dependency>
//    <groupId>org.springframework.boot</groupId>
//    <artifactId>spring-boot-starter-validation</artifactId>
//</dependency>