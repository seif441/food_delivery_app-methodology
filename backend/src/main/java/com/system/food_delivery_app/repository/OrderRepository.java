package com.system.food_delivery_app.repository;

import com.system.food_delivery_app.model.Order;
import com.system.food_delivery_app.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerId(Long customerId);

    List<Order> findByDeliveryStaffIdAndStatus(Long deliveryStaffId, OrderStatus status);

      List<Order> findByStatus(OrderStatus status);
}