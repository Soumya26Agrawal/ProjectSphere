package com.cts.mfrp.project_sphere.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.repository.UserRepository;

@Service
public class UserService {
    
    @Autowired
    UserRepository userRepository;

    //create user(POST)
    public User createUser(User user){
        if (userRepository.existsByEmployeeId(user.getEmployeeId())) {
            throw new IllegalArgumentException("Employee ID already exists");
        }
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

    // Deactivate User
    public User deactivateUser(Long id) {
        User existingUser = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        existingUser.setIsActive(false);
        return userRepository.save(existingUser);
    }

    // Delete User
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found");
        }
        userRepository.deleteById(id);
    }
}
