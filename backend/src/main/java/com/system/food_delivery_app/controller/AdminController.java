package com.system.food_delivery_app.controller;

import com.system.food_delivery_app.model.Product;
import com.system.food_delivery_app.model.Role;
import com.system.food_delivery_app.model.Staff;
import com.system.food_delivery_app.model.User;
import com.system.food_delivery_app.service.AdminService;
import com.system.food_delivery_app.repository.RoleRepository;
import com.system.food_delivery_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    private final AdminService service;

    @Autowired
    private RoleRepository roleRepository; 

    @Autowired
    private UserRepository userRepository; 

    public AdminController(AdminService service) {
        this.service = service;
    }


    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/staff")
    public ResponseEntity<List<Staff>> getAllStaff() {
        return ResponseEntity.ok(service.getAllStaff());
    }

    @PostMapping("/staff")
    public ResponseEntity<?> addStaff(@RequestBody User userData, @RequestParam String roleName) {
        Optional<Role> roleOpt = roleRepository.findAll().stream()
                .filter(r -> r.getRoleName().equalsIgnoreCase(roleName)) 
                .findFirst();

        if (roleOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Role '" + roleName + "' does not exist.");
        }

        return ResponseEntity.ok(service.addStaff(userData, roleOpt.get()));
    }

    @PutMapping("/role/{userId}")
    public ResponseEntity<User> setRole(@PathVariable Long userId, @RequestParam Role role) {
        return ResponseEntity.ok(service.setRole(userId, role));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long userId) {
        java.util.Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getRole() != null && "ADMIN".equalsIgnoreCase(user.getRole().getRoleName())) {
                return ResponseEntity.badRequest().body("Cannot delete an ADMIN account.");
            }
        }

        service.deleteAccount(userId);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/menu")
    public ResponseEntity<List<Product>> viewMenu() {
        return ResponseEntity.ok(service.viewMenu());
    }

    @PostMapping("/menu")
    public ResponseEntity<Product> addMenuItem(@RequestBody Product product) {
        return ResponseEntity.ok(service.addMenuItem(product));
    }

    @PutMapping("/menu/{productId}")
    public ResponseEntity<Product> updateMenuItem(@PathVariable Long productId, @RequestBody Product updated) {
        return ResponseEntity.ok(service.updateMenuItem(productId, updated));
    }

    @DeleteMapping("/menu/{productId}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long productId) {
        service.deleteMenuItem(productId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/products/{productId}/price")
    public ResponseEntity<Product> updatePrice(@PathVariable Long productId, @RequestParam double newPrice) {
        return ResponseEntity.ok(service.updatePrice(productId, newPrice));
    }

    @PutMapping("/products/{productId}/availability")
    public ResponseEntity<Product> setAvailability(@PathVariable Long productId, @RequestParam boolean available) {
        return ResponseEntity.ok(service.setAvailability(productId, available));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<Map<String, String>>> getSystemLogs() {
        return ResponseEntity.ok(service.getSystemLogs());
    }
}