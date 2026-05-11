
package com.system.food_delivery_app.controller;

import com.system.food_delivery_app.model.User;
import com.system.food_delivery_app.service.UserRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user-roles")
public class UserRoleController {
    @Autowired
    private UserRoleService userRoleService;

    @PostMapping("/assign")
    public ResponseEntity<User> assignRole(
            @RequestParam Long userId,
            @RequestParam String roleName) {
        return ResponseEntity.ok(userRoleService.assignRoleToUser(userId, roleName));
    }
}