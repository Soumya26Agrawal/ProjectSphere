package com.cts.mfrp.project_sphere.service;


import com.cts.mfrp.project_sphere.dto.AuthRequest;
import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AuthenticationManager authenticationManager; // Injected here
    private final JwtService jwtService;
    private final UserRepository repository;

    public String login(AuthRequest request) {
        // This single line triggers all the inbuilt logic explained above
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // If we get here, the user is valid.
        User user = repository.findByEmail(request.getEmail()).orElseThrow();
        return jwtService.generateToken(user);
    }
}
