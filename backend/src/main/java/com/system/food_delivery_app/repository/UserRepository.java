package com.system.food_delivery_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.system.food_delivery_app.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
