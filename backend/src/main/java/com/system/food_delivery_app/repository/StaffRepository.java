package com.system.food_delivery_app.repository;

import com.system.food_delivery_app.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {

}