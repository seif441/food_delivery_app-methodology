package com.system.food_delivery_app.service;

import com.system.food_delivery_app.model.Role;
import com.system.food_delivery_app.model.User;
import com.system.food_delivery_app.repository.RoleRepository;
import com.system.food_delivery_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserRoleService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    public User assignRoleToUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        user.setRole(role);
        return userRepository.save(user);
    }
}