package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.dto.ProManagerResponseDTO;
import com.cts.mfrp.project_sphere.service.UserService;
import com.cts.mfrp.project_sphere.utils.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    @Autowired
    private UserService userService;

    @GetMapping
    public String homePage(){
        return "Admin DashBoard";
    }

    @PostMapping("/upload")

    public ResponseEntity<?> uploadExcel(@RequestParam MultipartFile file){
        if(UserUtil.checkExcelFormat(file)){
            userService.save(file);
            return ResponseEntity.status(HttpStatus.OK).body("File uploaded successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Upload in correct excel format");
    }

    @GetMapping("/getProjectManagers")
    public ResponseEntity<List<ProManagerResponseDTO>> getAllProjectManagers() {
        List<ProManagerResponseDTO> projectManagers = userService.getAllProjectManagers();
        return ResponseEntity.status(HttpStatus.OK).body(projectManagers);
    }

}
