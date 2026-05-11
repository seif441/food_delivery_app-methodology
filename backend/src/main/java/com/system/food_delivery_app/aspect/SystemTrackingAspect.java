package com.system.food_delivery_app.aspect;

import com.system.food_delivery_app.model.Order;
import com.system.food_delivery_app.model.User;
import com.system.food_delivery_app.service.TrackingService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class SystemTrackingAspect {

    private final TrackingService trackingService;

    @Autowired
    public SystemTrackingAspect(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @AfterReturning(pointcut = "execution(* com.system.food_delivery_app.service.UserService.loginUser(..))", returning = "user")
    public void logUserLogin(User user) {
        String role = (user.getRole() != null) ? user.getRole().getRoleName() : "UNKNOWN";
        trackingService.logEvent("LOGIN", "User: " + user.getName() + " | Role: " + role + " | Action: Logged In");
    }

    @AfterReturning(pointcut = "execution(* com.system.food_delivery_app.service.OrderService.placeOrder(..))", returning = "order")
    public void logOrderPlacement(Order order) {
        String customerName = (order.getCustomer() != null) ? order.getCustomer().getName() : "Unknown";
        trackingService.logEvent("ORDER_PLACED", 
            "Order ID: " + order.getId() + " placed by " + customerName + " | Total: $" + order.getTotalPrice());
    }

    @AfterReturning(pointcut = "execution(* com.system.food_delivery_app.service.StaffService.prepareOrder(..))", returning = "order")
    public void logOrderPreparationStart(Order order) {
        trackingService.logEvent("KITCHEN_START", 
            "Order ID: " + order.getId() + " is now being prepared by Kitchen Staff.");
    }

    @AfterReturning(pointcut = "execution(* com.system.food_delivery_app.service.OrderService.staffMarkAsPrepared(..))", returning = "order")
    public void logKitchenFinishAndDriverAssignment(Order order) {
        trackingService.logEvent("KITCHEN_READY", "Order ID: " + order.getId() + " is prepared.");

        if (order.getDeliveryStaff() != null) {
            trackingService.logEvent("DRIVER_ASSIGNED", 
                "Order ID: " + order.getId() + " assigned to Driver: " + order.getDeliveryStaff().getName());
        } else {
            trackingService.logEvent("DRIVER_BUSY", 
                "Order ID: " + order.getId() + " is waiting. No drivers available.");
        }
    }

    @AfterReturning(pointcut = "execution(* com.system.food_delivery_app.service.DeliveryStaffService.completeDelivery(..))", returning = "order")
    public void logDeliveryCompletion(Order order) {
        String driverName = (order.getDeliveryStaff() != null) ? order.getDeliveryStaff().getName() : "Unknown";
        trackingService.logEvent("ORDER_DELIVERED", 
            "Order ID: " + order.getId() + " delivered successfully by " + driverName);
    }

    @AfterReturning(pointcut = "execution(* com.system.food_delivery_app.service.OrderService.cancelOrder(..)) && args(orderId)")
    public void logOrderCancellation(Long orderId) {
        trackingService.logEvent("ORDER_CANCELLED", 
            "Order ID: " + orderId + " was cancelled by the customer.");
    }
}