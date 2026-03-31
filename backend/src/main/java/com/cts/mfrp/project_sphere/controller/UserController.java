package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.dto.AuthRequest;
import com.cts.mfrp.project_sphere.dto.LoginResponse;
import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.service.AuthenticationService;
import com.cts.mfrp.project_sphere.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<String> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/create")
    public ResponseEntity<?> createProfile(@RequestBody User user){
        if(user.getEmployeeId() == null || user.getRole() == null){
            return ResponseEntity.badRequest().body("Employee ID and Role are required");
        }
        try {
            User savedUser = service.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
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