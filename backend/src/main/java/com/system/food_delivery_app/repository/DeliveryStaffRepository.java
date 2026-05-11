package com.system.food_delivery_app.repository;

import com.system.food_delivery_app.model.DeliveryStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryStaffRepository extends JpaRepository<DeliveryStaff, Long> {

    Optional<DeliveryStaff> findFirstByIsAvailableTrue();

    Optional<DeliveryStaff> findByEmail(String email);

    @Query("SELECT d FROM DeliveryStaff d")
    List<DeliveryStaff> findAllDeliveryStaff();
}