package com.cts.mfrp.project_sphere.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.repository.UserRepository;

@Service
public class UserService {
    
    @Autowired
    UserRepository userRepository;

    public User createUser(User user){
        if (userRepository.existsByEmployeeId(user.getEmployeeId())) {
            throw new IllegalArgumentException("Employee ID already exists");
        }
        return userRepository.save(user);
    }

    public User updateUser(User userDetails){
        User existingUser = userRepository.findById(userDetails.getUserId()).orElseThrow(() -> new IllegalArgumentException("User not found"));

        if(userDetails.getFirstName() != null){
            existingUser.setFirstName(userDetails.getFirstname());
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

        return userRepository.save(existingUser);
    }

}
