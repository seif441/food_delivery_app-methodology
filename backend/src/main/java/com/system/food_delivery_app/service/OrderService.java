package com.system.food_delivery_app.service;

import com.system.food_delivery_app.model.Customer;
import com.system.food_delivery_app.model.DeliveryStaff;
import com.system.food_delivery_app.model.Order;
import com.system.food_delivery_app.model.OrderStatus;
import com.system.food_delivery_app.repository.DeliveryStaffRepository;
import com.system.food_delivery_app.repository.OrderRepository;
import com.system.food_delivery_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DeliveryStaffRepository deliveryStaffRepository;

    @Autowired
    private UserRepository userRepository;

    private static final double DELIVERY_FEE = 2.99;

    @Transactional
    public Order placeOrder(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new RuntimeException("Cannot place an empty order.");
        }
        
        if (order.getCustomer() == null || order.getCustomer().getId() == null) {
            throw new RuntimeException("Order must have a valid Customer ID.");
        }

        Customer fullCustomer = (Customer) userRepository.findById(order.getCustomer().getId())
                .orElseThrow(() -> new RuntimeException("Customer not found in database"));
        
        order.setCustomer(fullCustomer); 
        // --- FIX ENDS HERE ---

        for (var item : order.getItems()) {
            item.setOrder(order);
            item.setCart(null);
        }

        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        double itemsTotal = order.getItems().stream().mapToDouble(item -> item.getPrice()).sum();
        if (itemsTotal == 0) {
             itemsTotal = order.getItems().stream().mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity()).sum();
        }
        order.setTotalPrice(itemsTotal + DELIVERY_FEE);

        return orderRepository.save(order);
    }

    @Transactional
    public Order staffMarkAsPrepared(Long orderId) {
        Order order = getOrderById(orderId);
        
        if(order.getStatus() != OrderStatus.OUT_FOR_DELIVERY && order.getStatus() != OrderStatus.DELIVERED) {
            order.setStatus(OrderStatus.PREPARED);
            orderRepository.save(order);
            
            assignDriverAutomatically(order); 
        }
        return order;
    }

    public void assignDriverAutomatically(Order order) {
        Optional<DeliveryStaff> driverOpt = deliveryStaffRepository.findFirstByIsAvailableTrue();
        if (driverOpt.isPresent()) {
            assignOrderToSpecificDriver(order, driverOpt.get());
        } 
    }

    public void checkAndAssignWaitingOrders(DeliveryStaff driver) {
        List<Order> waitingOrders = orderRepository.findByStatus(OrderStatus.PREPARED);
        for(Order order : waitingOrders) {
            if(order.getDeliveryStaff() == null) {
                assignOrderToSpecificDriver(order, driver);
                break;
            }
        }
    }

    private void assignOrderToSpecificDriver(Order order, DeliveryStaff driver) {
        order.setDeliveryStaff(driver);
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        driver.setAvailable(false);
        
        deliveryStaffRepository.save(driver);
        orderRepository.save(order);
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = getOrderById(orderId);
        if (order.getStatus() == OrderStatus.PENDING) {
            orderRepository.delete(order); 
        } else {
            throw new RuntimeException("Cannot cancel order in progress.");
        }
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public Order updateStatus(Long orderId, OrderStatus status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        
        if (status == OrderStatus.DELIVERED) {
            if (order.getDeliveryStaff() != null) {
                DeliveryStaff driver = order.getDeliveryStaff();
                driver.setAvailable(true);
                deliveryStaffRepository.save(driver);
            }
        }
        return orderRepository.save(order);
    }
}