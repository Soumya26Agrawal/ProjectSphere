package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.dto.LoginRequestDTO;
import com.cts.mfrp.project_sphere.dto.LoginResponseDTO;
import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository repository;

    public LoginResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = repository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtService.generateToken(user);

        return LoginResponseDTO.builder()
                .message("Login successful")
                .token(token)
                .userId(user.getUserId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }
}
