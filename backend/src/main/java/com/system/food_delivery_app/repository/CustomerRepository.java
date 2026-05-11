package com.system.food_delivery_app.repository;

import com.system.food_delivery_app.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByEmail(String email);
    
    boolean existsByEmail(String email);
}