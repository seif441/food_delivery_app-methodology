package com.system.food_delivery_app.service;

import com.system.food_delivery_app.model.DeliveryStaff;
import com.system.food_delivery_app.model.Order;
import com.system.food_delivery_app.model.OrderStatus;
import com.system.food_delivery_app.repository.DeliveryStaffRepository;
import com.system.food_delivery_app.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DeliveryStaffService {

    @Autowired
    private DeliveryStaffRepository deliveryStaffRepository;

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderService orderService;

    public DeliveryStaff getDeliveryStaffById(Long id) {
        return deliveryStaffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery staff not found"));
    }

    public List<Order> viewAssignedOrders(Long deliveryStaffId) {
        getDeliveryStaffById(deliveryStaffId);
        return orderRepository.findByDeliveryStaffIdAndStatus(deliveryStaffId, OrderStatus.OUT_FOR_DELIVERY);
    }

    @Transactional
    public Order completeDelivery(Long deliveryStaffId, Long orderId) {
        DeliveryStaff driver = getDeliveryStaffById(deliveryStaffId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getDeliveryStaff() == null || !order.getDeliveryStaff().getId().equals(deliveryStaffId)) {
            throw new RuntimeException("Access Denied.");
        }

        if (order.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
            order.setStatus(OrderStatus.DELIVERED);

            driver.setAvailable(true);
            deliveryStaffRepository.save(driver);

            orderService.checkAndAssignWaitingOrders(driver);

            return orderRepository.save(order);
        } else {
            throw new RuntimeException("Order is not currently out for delivery.");
        }
    }

    public List<Order> getDeliveryHistory(Long deliveryStaffId) {
        getDeliveryStaffById(deliveryStaffId);
        return orderRepository.findByDeliveryStaffIdAndStatus(deliveryStaffId, OrderStatus.DELIVERED);
    }
    

    @Transactional
    public DeliveryStaff toggleAvailability(Long id) {
        DeliveryStaff driver = getDeliveryStaffById(id);
        boolean current = driver.getIsAvailable() != null && driver.getIsAvailable();
        driver.setAvailable(!current); 
        
        DeliveryStaff savedDriver = deliveryStaffRepository.save(driver);
        
        if (savedDriver.getIsAvailable()) {
            orderService.checkAndAssignWaitingOrders(savedDriver);
        }
        
        return savedDriver;
    }
}