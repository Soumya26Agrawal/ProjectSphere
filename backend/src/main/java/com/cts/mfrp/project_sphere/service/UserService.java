package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.Enum.Role;
import com.cts.mfrp.project_sphere.dto.RegisterRequestDTO;
import com.cts.mfrp.project_sphere.dto.ManagedProjectDTO;
import com.cts.mfrp.project_sphere.dto.ProManagerResponseDTO;
import com.cts.mfrp.project_sphere.dto.TeamMemberResponseDTO;
import com.cts.mfrp.project_sphere.dto.UpdateUserRequestDTO;
import com.cts.mfrp.project_sphere.utils.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserUtil userUtil;
    public User register(RegisterRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .employeeId(request.getEmployeeId())// ENCRYPT THE PASSWORD
                .role(request.getRole())
                .isActive(request.getIsActive())
                .phoneNumber(request.getPhoneNumber())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();
        return userRepository.save(user);


    }

    // Full update (PUT)
    public User fullUpdateUser(Long id, User userDetails){
        User existingUser = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        existingUser.setFirstName(userDetails.getFirstName());
        existingUser.setLastName(userDetails.getLastName());
        existingUser.setEmail(userDetails.getEmail());
        existingUser.setPhoneNumber(userDetails.getPhoneNumber());
        existingUser.setRole(userDetails.getRole());
        
        return userRepository.save(existingUser);
    }

    // Partial update(PATCH)
    public User partialUpdateUser(Long id, User userDetails){
        User existingUser = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if(userDetails.getFirstName() != null){
            existingUser.setFirstName(userDetails.getFirstName());
        }
        if(userDetails.getLastName() != null){
            existingUser.setLastName(userDetails.getLastName());
        }
        if(userDetails.getEmail() != null){
            existingUser.setEmail(userDetails.getEmail());
        }
        if(userDetails.getPhoneNumber() != null){
            existingUser.setPhoneNumber(userDetails.getPhoneNumber());
        }
        if(userDetails.getRole() != null){
            existingUser.setRole(userDetails.getRole());
        }

        return userRepository.save(existingUser);
    }

    public void registerViaExcelUpload(MultipartFile file){
        try{
            List<User> users= userUtil.convertExcelToList(file.getInputStream());
            userRepository.saveAll(users);

        }
        catch(IOException e){
            e.printStackTrace();
        }

    }

    public List<TeamMemberResponseDTO> getAllTeamMembers() {
        List<User> developers = userRepository.findByRole(Role.DEVELOPER);
        return developers.stream().map(this::toTeamMemberDTO).toList();
    }

    public Page<TeamMemberResponseDTO> getAllTeamMembersPaged(Pageable pageable) {
        return userRepository.findByRole(Role.DEVELOPER, pageable)
                .map(this::toTeamMemberDTO);
    }

    public long countByRole(Role role) {
        return userRepository.findByRole(role).size();
    }

    public TeamMemberResponseDTO getUserDTO(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toTeamMemberDTO(u);
    }

    public TeamMemberResponseDTO updateUserFromDTO(Long id, UpdateUserRequestDTO req) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (req.getFirstName()   != null) u.setFirstName(req.getFirstName());
        if (req.getLastName()    != null) u.setLastName(req.getLastName());
        if (req.getEmail()       != null) u.setEmail(req.getEmail());
        if (req.getPhoneNumber() != null) u.setPhoneNumber(req.getPhoneNumber());
        if (req.getIsActive()    != null) u.setIsActive(req.getIsActive());
        return toTeamMemberDTO(userRepository.save(u));
    }

    private TeamMemberResponseDTO toTeamMemberDTO(User u) {
        return TeamMemberResponseDTO.builder()
                .userId(u.getUserId())
                .employeeId(u.getEmployeeId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .phoneNumber(u.getPhoneNumber())
                .role(u.getRole() != null ? u.getRole().name() : null)
                .isActive(u.getIsActive())
                .build();
    }

    public Page<ProManagerResponseDTO> getAllProjectManagersPaged(Pageable pageable) {
        return userRepository.findByRole(Role.PROJECT_MANAGER, pageable)
                .map(this::toProManagerDTO);
    }

    public void resetPasswordByEmail(String email, String newPassword) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("New password is required");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found for that email"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private ProManagerResponseDTO toProManagerDTO(User user) {
        return ProManagerResponseDTO.builder()
                .userId(user.getUserId())
                .employeeId(user.getEmployeeId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .managedProjects(user.getManagedProjects().stream()
                        .map(p -> ManagedProjectDTO.builder()
                                .projectId(p.getProjectId())
                                .projectName(p.getProjectName())
                                .status(p.getStatus().name())
                                .build())
                        .toList())
                .build();
    }

    public List<ProManagerResponseDTO> getAllProjectManagers() {
        List<User> managers= userRepository.findByRole(Role.PROJECT_MANAGER);
        return managers.stream().map(user-> ProManagerResponseDTO.builder()
                .userId(user.getUserId())
                .employeeId(user.getEmployeeId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .managedProjects(user.getManagedProjects().stream()
                        .map(p -> ManagedProjectDTO.builder()
                                .projectId(p.getProjectId())
                                .projectName(p.getProjectName())
                                .status(p.getStatus().name())
                                .build())
                        .toList())
                .build())
                .toList();
    }
}
