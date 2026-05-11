package com.system.food_delivery_app.config;

import com.system.food_delivery_app.model.Admin;
import com.system.food_delivery_app.model.Role;
import com.system.food_delivery_app.repository.UserRepository;
import com.system.food_delivery_app.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public DataSeeder(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    
    @Override
    public void run(String... args) throws Exception {
        createRoleIfNotFound("ADMIN");
        createRoleIfNotFound("CUSTOMER");
        createRoleIfNotFound("STAFF");
        createRoleIfNotFound("DELIVERY_STAFF");

        if (userRepository.findByEmail("admin@crave.com").isEmpty()) {
            Admin admin = new Admin();
            admin.setName("System Administrator");
            admin.setEmail("admin@crave.com");
            admin.setPassword("admin123"); 
            admin.setPhoneNumber("000-000-0000");
            
            Role adminRole = roleRepository.findByRoleName("ADMIN").orElse(null);
            admin.setRole(adminRole);

            userRepository.save(admin);
            System.out.println(" DataSeeder: Default Admin Created (admin@crave.com)");
        }
    }

    private void createRoleIfNotFound(String roleName) {
        if (roleRepository.findByRoleName(roleName).isEmpty()) {
            Role role = new Role();
            role.setRoleName(roleName);
            roleRepository.save(role);
        }
    }
}
