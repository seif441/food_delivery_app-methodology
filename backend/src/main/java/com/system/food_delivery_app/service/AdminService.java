package com.system.food_delivery_app.service;

import com.system.food_delivery_app.model.*;
import com.system.food_delivery_app.repository.*;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepo;
    private final ProductRepository productRepo;
    private final StaffRepository staffRepository;
    private static final String LOG_FILE_PATH = "system_activity_logs.txt";
    

    public AdminService(UserRepository userRepo, 
                        ProductRepository productRepo, 
                        StaffRepository staffRepository) {
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.staffRepository = staffRepository;
    }

    public User addStaff(User userData, Role role) {
        if ("DELIVERY_STAFF".equalsIgnoreCase(role.getRoleName()) || 
            "DELIVERY".equalsIgnoreCase(role.getRoleName())) {

            DeliveryStaff driver = new DeliveryStaff();
            driver.setName(userData.getName());
            driver.setEmail(userData.getEmail());
            driver.setPassword(userData.getPassword());
            driver.setPhoneNumber(userData.getPhoneNumber());
            driver.setRole(role);
            driver.setAvailable(false); // Explicitly set 0
            
            return userRepo.save(driver);

        } else {

            Staff staff = new Staff();
            staff.setName(userData.getName());
            staff.setEmail(userData.getEmail());
            staff.setPassword(userData.getPassword());
            staff.setPhoneNumber(userData.getPhoneNumber());
            staff.setRole(role);
            
            return staffRepository.save(staff);
        }
    }

    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    public User setRole(Long userId, Role role) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        return userRepo.save(user);
    }

    public void deleteAccount(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User id cannot be null");
        }
        if (!userRepo.existsById(userId)) {
             throw new RuntimeException("User not found");
        }
        userRepo.deleteById(userId);
    }


    public Product addMenuItem(Product product) {
        return productRepo.save(product);
    }

    public Product updateMenuItem(Long productId, Product updated) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        product.setName(updated.getName());
        product.setDescription(updated.getDescription());
        product.setPrice(updated.getPrice());
        product.setAvailable(updated.isAvailable());
        product.setImageUrl(updated.getImageUrl());
        
        if (updated.getCategory() != null) {
            product.setCategory(updated.getCategory());
        }
        
        return productRepo.save(product);
    }

    public void deleteMenuItem(Long productId) {
        productRepo.deleteById(productId);
    }

    public List<Product> viewMenu() {
        return productRepo.findAll();
    }

    public Product updatePrice(Long productId, double newPrice) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setPrice(newPrice);
        return productRepo.save(product);
    }

    public Product setAvailability(Long productId, boolean available) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setAvailable(available);
        return productRepo.save(product);
    }
    public List<Map<String, String>> getSystemLogs() {
        File file = new File(LOG_FILE_PATH);
        if (!file.exists()) {
            return Collections.emptyList();
        }

        List<Map<String, String>> logs = new ArrayList<>();
        Pattern pattern = Pattern.compile("^\\[(.*?)\\]\\s+(.*?)\\s+\\|\\s+(.*)$");

        try {
            List<String> lines = Files.readAllLines(Paths.get(LOG_FILE_PATH));

            Collections.reverse(lines); 

            for (String line : lines) {
                Matcher matcher = pattern.matcher(line);
                if (matcher.find()) {
                    Map<String, String> entry = new HashMap<>();
                    entry.put("timestamp", matcher.group(1));
                    entry.put("action", matcher.group(2).trim());
                    entry.put("details", matcher.group(3));
                    logs.add(entry);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return logs;
    }
}