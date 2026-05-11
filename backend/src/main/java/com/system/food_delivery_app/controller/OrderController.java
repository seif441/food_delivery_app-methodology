package com.system.food_delivery_app.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.system.food_delivery_app.model.Order;
import com.system.food_delivery_app.model.OrderStatus;
import com.system.food_delivery_app.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(originPatterns = "*", allowCredentials = "true") 
public class OrderController {

    @Autowired
    private OrderService orderService;
    
    @GetMapping("/statuses")
    public ResponseEntity<OrderStatus[]> getStatuses() {
        return ResponseEntity.ok(OrderStatus.values());
    }

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody Order order) {
        try {
            System.out.println("--- NEW ORDER REQUEST ---");
            if(order.getCustomer() != null) {
                System.out.println("Customer ID: " + order.getCustomer().getId());
            } else {
                System.err.println("WARNING: Customer object is NULL");
            }
            System.out.println("Items count: " + (order.getItems() != null ? order.getItems().size() : "0"));

            Order newOrder = orderService.placeOrder(order);
            return ResponseEntity.ok(newOrder);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error placing order: " + e.getMessage());
        }
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getOrdersByCustomer(@PathVariable Long customerId) {
        try {
            System.out.println("Fetching orders for Customer ID: " + customerId);
            List<Order> orders = orderService.getOrdersByCustomer(customerId);
            System.out.println("Found: " + orders.size() + " orders");
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching orders: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancelOrder(@PathVariable Long id) {
        try {
            orderService.cancelOrder(id);
            return ResponseEntity.ok("Order cancelled successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/prepared")
    public ResponseEntity<?> markOrderPrepared(@PathVariable Long id) {
        try {
            Order updatedOrder = orderService.staffMarkAsPrepared(id);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }
}