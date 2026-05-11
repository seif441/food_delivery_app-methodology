package com.system.food_delivery_app.controller;

import com.system.food_delivery_app.model.Order;
import com.system.food_delivery_app.model.Staff;
import com.system.food_delivery_app.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(originPatterns = "*", allowCredentials = "true") 
public class StaffController {

    @Autowired
    private StaffService staffService;

    @GetMapping("/{staffId}")
    public ResponseEntity<?> getStaffProfile(@PathVariable Long staffId) {
        try {
            Staff staff = staffService.getStaffById(staffId);
            return ResponseEntity.ok(staff);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{staffId}/orders")
    public ResponseEntity<?> viewAllOrders() {
        try {
            List<Order> orders = staffService.viewAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{staffId}/orders/{orderId}/prepare")
    public ResponseEntity<?> prepareOrder(@PathVariable Long staffId, @PathVariable Long orderId) {
        try {
            Order order = staffService.prepareOrder(staffId, orderId);
            return ResponseEntity.ok(Map.of("message", "Order marked as preparing", "order", order));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{staffId}/orders/{orderId}/out-for-delivery")
    public ResponseEntity<?> markOutForDelivery(@PathVariable Long orderId) {
        try {
            Order order = staffService.markOutForDelivery(orderId);
            return ResponseEntity.ok(Map.of("message", "Order marked ready and driver assignment started.", "order", order));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}