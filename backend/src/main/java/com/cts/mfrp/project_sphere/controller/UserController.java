package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.dto.LoginRequestDTO;
import com.cts.mfrp.project_sphere.dto.LoginResponseDTO;
import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.service.AuthenticationService;
import com.cts.mfrp.project_sphere.service.UserService;
import com.cts.mfrp.project_sphere.utils.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthenticationService authService;
    private final UserUtil userUtil;



    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            userService.resetPasswordByEmail(body.get("email"), body.get("newPassword"));
            return ResponseEntity.ok("Password updated successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to reset password");
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



    @PostMapping("/upload")
    public ResponseEntity<?> registerViaExcelUpload(@RequestParam MultipartFile file){
        if(userUtil.checkExcelFormat(file)){
            userService.registerViaExcelUpload(file);
            return ResponseEntity.status(HttpStatus.OK).body("File uploaded successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Upload in correct excel format");
    }


}