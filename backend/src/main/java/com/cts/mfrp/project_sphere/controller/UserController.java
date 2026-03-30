package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.dto.AuthRequest;
import com.cts.mfrp.project_sphere.service.AuthenticationService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.service.UserService;


@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;
    private final AuthenticationService authService;
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AuthRequest request, HttpServletResponse response) {
        // 2. Create the HttpOnly Cookie
        String token = authService.login(request);
//        ResponseCookie cookie = ResponseCookie.from("token", token)
//                .httpOnly(true)       // JS cannot read this (XSS protection)
//                .secure(false)        // Set to true in production for HTTPS
//                .path("/")            // Available for all API routes
//                .maxAge(600)          // 10 minutes (matches your JWT)
//                .sameSite("Lax")      // Essential for modern browser security
//                .build();
//
//        // 3. Set the cookie in the response header
//        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok("Login successful"+token);

    }

    @PostMapping("/create")
    public ResponseEntity<?> createProfile(@RequestBody User user){
        if(user.getEmployeeId() == null || user.getRole() == null){
            return ResponseEntity.badRequest().body("Employee ID and Role are required");
        }

        user.setIsActive(true);

        try {
            User savedUser = service.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // <-- This will print the actual error to your terminal
            return ResponseEntity.internalServerError().body("An error occurred while creating the user profile: " + e.getMessage());
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> fullUpdateProfile(@PathVariable Long userId, @RequestBody User userDetails){
        if(userDetails == null){
            return ResponseEntity.badRequest().body("Need details to update");
        }
        try{
            User updatedUser = service.fullUpdateUser(userId, userDetails);
            return ResponseEntity.status(HttpStatus.OK).body(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while updating the user profile");
        }
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<?> partialUpdateProfile(@PathVariable Long userId, @RequestBody User userDetails){
        if(userDetails == null){
            return ResponseEntity.badRequest().body("Need details to update");
        }
        try{
            User updatedUser = service.partialUpdateUser(userId, userDetails);
            return ResponseEntity.status(HttpStatus.OK).body(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while updating the user profile");
        }
    }

    @PatchMapping("/deactivate/{userId}")
    public ResponseEntity<?> deactivateProfile(@PathVariable Long userId){
        try{
            User deactivatedUser = service.deactivateUser(userId);
            return ResponseEntity.status(HttpStatus.OK).body(deactivatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while deactivating the user profile");
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteProfile(@PathVariable Long userId){
        try{
            service.deleteUser(userId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while deleting the user profile");
        }
    }

}

