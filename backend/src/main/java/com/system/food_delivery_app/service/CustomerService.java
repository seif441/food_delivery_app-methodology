package com.system.food_delivery_app.service;

import com.system.food_delivery_app.model.Customer;
import com.system.food_delivery_app.model.Order;
import com.system.food_delivery_app.model.Product;
import com.system.food_delivery_app.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepo;
    private final ProductService productService;
    private final OrderService orderService;

    public CustomerService(CustomerRepository customerRepo,
                           ProductService productService,
                           OrderService orderService) {
        this.customerRepo = customerRepo;
        this.productService = productService;
        this.orderService = orderService;
    }


    public List<Product> viewMenu() {
        return productService.getAllProducts();
    }


    public Order createOrder(Long customerId, List<Long> productIds) {
        Customer customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return null; 
    }

    public Order viewOrderStatus(Long orderId) {
        return orderService.getOrderById(orderId);
    }
}