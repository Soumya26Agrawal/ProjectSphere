package com.cts.mfrp.project_sphere.controller;

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
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.util.StringUtils;

import com.cts.mfrp.project_sphere.dto.LoginRequest;
import com.cts.mfrp.project_sphere.dto.LoginResponse;
import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.service.UserService;


@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    UserService userService;

    @PostMapping("/create")
    public ResponseEntity<?> createProfile(@RequestBody User user){
        if(user.getEmployeeId() == null || user.getRole() == null){
            return ResponseEntity.badRequest().body("Employee ID and Role are required");
        }

        user.setIsActive(true);

        try {
            User savedUser = userService.createUser(user);
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
            User updatedUser = userService.fullUpdateUser(userId, userDetails);
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
            User updatedUser = userService.partialUpdateUser(userId, userDetails);
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
            User deactivatedUser = userService.deactivateUser(userId);
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
            userService.deleteUser(userId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while deleting the user profile");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        if (loginRequest == null || !StringUtils.hasText(loginRequest.getEmail()) || !StringUtils.hasText(loginRequest.getPassword())) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        try {
            User user = userService.login(loginRequest.getEmail().trim());
            LoginResponse response = LoginResponse.builder()
                .message("Login successful")
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while logging in");
        }
    }

}

